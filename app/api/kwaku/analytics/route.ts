// app/api/kwaku/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'

// ─────────────────────────────────────────────
// GET /api/kwaku/analytics
// Query params: from, to (ISO date strings)
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { searchParams } = req.nextUrl
        const fromParam = searchParams.get('from')
        const toParam   = searchParams.get('to')

        // Default: last 30 days
        const toDate   = toParam   ? new Date(toParam)   : new Date()
        const fromDate = fromParam ? new Date(fromParam)  : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

        // Ensure end of day for toDate
        toDate.setHours(23, 59, 59, 999)

        const fromISO = fromDate.toISOString()
        const toISO   = toDate.toISOString()

        // ── Total visits in range ──
        const { count: totalVisits } = await supabaseAdmin
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('visited_at', fromISO)
            .lte('visited_at', toISO)

        // ── Visits by day ──
        const { data: rawEvents } = await supabaseAdmin
            .from('analytics_events')
            .select('visited_at, country, city, region')
            .gte('visited_at', fromISO)
            .lte('visited_at', toISO)
            .order('visited_at', { ascending: true })

        const events = rawEvents ?? []

        // ── Aggregate by day ──
        const byDay: Record<string, number> = {}
        for (const e of events) {
            const day = e.visited_at.slice(0, 10) // YYYY-MM-DD
            byDay[day] = (byDay[day] ?? 0) + 1
        }

        const dailySeries = Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }))

        // ── Aggregate by country ──
        const byCountry: Record<string, number> = {}
        for (const e of events) {
            const key = e.country ?? 'Unknown'
            byCountry[key] = (byCountry[key] ?? 0) + 1
        }

        const topCountries = Object.entries(byCountry)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([country, count]) => ({ country, count }))

        // ── Aggregate by city ──
        const byCity: Record<string, number> = {}
        for (const e of events) {
            if (!e.city) continue
            const key = `${e.city}${e.country ? `, ${e.country}` : ''}`
            byCity[key] = (byCity[key] ?? 0) + 1
        }

        const topCities = Object.entries(byCity)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([city, count]) => ({ city, count }))

        // ── Unique IP hashes (approximate unique visitors) ──
        const uniqueHashes = new Set(
            events.filter(e => e.country).map(e => e.country + e.city)
        )

        // ── Previous period for comparison ──
        const rangeDays  = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
        const prevTo     = new Date(fromDate.getTime() - 1)
        const prevFrom   = new Date(prevTo.getTime() - rangeDays * 24 * 60 * 60 * 1000)

        const { count: prevTotal } = await supabaseAdmin
            .from('analytics_events')
            .select('*', { count: 'exact', head: true })
            .gte('visited_at', prevFrom.toISOString())
            .lte('visited_at', prevTo.toISOString())

        const growth = prevTotal && prevTotal > 0
            ? Math.round(((totalVisits ?? 0) - prevTotal) / prevTotal * 100)
            : null

        return NextResponse.json({
            totalVisits:    totalVisits ?? 0,
            uniqueEstimate: uniqueHashes.size,
            growth,
            dailySeries,
            topCountries,
            topCities,
            range: {
                from: fromISO,
                to:   toISO,
                days: rangeDays,
            },
        })

    } catch (err) {
        console.error('[kwaku/analytics] Error:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}