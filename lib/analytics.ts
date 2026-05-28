// lib/analytics.ts

import { supabaseAdmin } from '@/lib/db'

// ─────────────────────────────────────────────
// HASH IP
// SHA-256 via Web Crypto API (Edge Runtime safe).
// Only the first 32 hex chars are stored — irreversible.
// ─────────────────────────────────────────────

async function hashIp(ip: string): Promise<string> {
    const encoded    = new TextEncoder().encode(ip)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const hashArray  = Array.from(new Uint8Array(hashBuffer))
    const hashHex    = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex.slice(0, 32)
}

// ─────────────────────────────────────────────
// GEO LOOKUP — ipinfo.io
// Returns empty strings on any failure.
// ─────────────────────────────────────────────

interface GeoResult {
    country: string
    region:  string
    city:    string
}

async function getGeo(ip: string): Promise<GeoResult> {
    const empty: GeoResult = { country: '', region: '', city: '' }

    // Skip local / loopback addresses and missing token
    if (
        !process.env.IPINFO_TOKEN ||
        ip === 'unknown'          ||
        ip === '::1'              ||
        ip.startsWith('127.')     ||
        ip.startsWith('192.168.') ||
        ip.startsWith('10.')
    ) {
        return empty
    }

    try {
        const res = await fetch(
            `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`,
            { cache: 'no-store' }
        )
        if (!res.ok) return empty

        const data = await res.json()
        return {
            country: data.country ?? '',
            region:  data.region  ?? '',
            city:    data.city    ?? '',
        }
    } catch {
        return empty
    }
}

// ─────────────────────────────────────────────
// TRACK VISIT
// Called from middleware for public GET pages.
// - Hashes the visitor IP (privacy-safe)
// - Fetches geo from ipinfo.io
// - Inserts one row in analytics_events
// Never throws — analytics errors must not block navigation.
// ─────────────────────────────────────────────

export async function trackVisit(req: Request): Promise<void> {
    try {
        const url       = new URL(req.url)
        const pageUrl   = url.pathname + (url.search || '')
        const referrer  = req.headers.get('referer')    ?? ''
        const userAgent = req.headers.get('user-agent') ?? ''

        // Extract real IP
        const forwarded = req.headers.get('x-forwarded-for')
        const ip        = forwarded?.split(',')[0]?.trim()
                       ?? req.headers.get('x-real-ip')
                       ?? 'unknown'

        // Hash IP and resolve geo in parallel
        const [ipHash, geo] = await Promise.all([
            hashIp(ip),
            getGeo(ip),
        ])

        await supabaseAdmin.from('analytics_events').insert({
            ip_hash:    ipHash,
            country:    geo.country  || null,
            region:     geo.region   || null,
            city:       geo.city     || null,
            page_url:   pageUrl,
            referrer:   referrer     || null,
            user_agent: userAgent    || null,
        })

    } catch {
        // Silent — never propagate analytics errors to the visitor
    }
}
