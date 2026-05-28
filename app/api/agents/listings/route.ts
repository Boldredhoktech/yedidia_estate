// app/api/agents/listings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

const listingSchema = z.object({
    subscriptionId:  z.string().uuid(),
    agentId:         z.string(),
    type:            z.enum(['parcelle', 'maison_vente', 'maison_location', 'airbnb']),
    title:           z.string().min(5).max(200),
    description:     z.string().max(5000).nullable().optional(),
    city:            z.string().min(2).max(100),
    neighborhood:    z.string().min(2).max(100),
    price:           z.number().positive(),
    price_label:     z.string().max(50).nullable().optional(),
    area_m2:         z.number().positive().nullable().optional(),
    area_hectares:   z.number().positive().nullable().optional(),
    bedrooms:        z.number().int().min(0).nullable().optional(),
    bathrooms:       z.number().int().min(0).nullable().optional(),
    mediaUrls:       z.array(z.string().url()).min(1),
    mediaType:       z.enum(['photo', 'video']),
})

// ─────────────────────────────────────────────
// POST /api/agents/listings
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        // ── Auth check ──
        const session = await getSession()
        if (!session || !['agent_immobilier', 'agent_validator', 'superadmin']
            .includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = listingSchema.safeParse(body)

        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? 'Invalid data.'
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        const data = parsed.data

        // ── Verify subscription belongs to agent and has credits ──
        const { data: sub, error: subErr } = await supabaseAdmin
            .from('subscriptions')
            .select('id, pubs_remaining, expires_at, status')
            .eq('id',       data.subscriptionId)
            .eq('agent_id', data.agentId)
            .eq('status',   'active')
            .single()

        if (subErr || !sub) {
            return NextResponse.json(
                { error: 'No active subscription found.' },
                { status: 403 }
            )
        }

        if (sub.pubs_remaining <= 0) {
            return NextResponse.json(
                { error: 'No publication credits remaining.' },
                { status: 403 }
            )
        }

        // ── Create listing ──
        const { data: listing, error: listErr } = await supabaseAdmin
            .from('listings')
            .insert({
                agent_id:        data.agentId,
                subscription_id: data.subscriptionId,
                type:            data.type,
                title:           data.title,
                description:     data.description ?? null,
                city:            data.city,
                neighborhood:    data.neighborhood,
                price:           data.price,
                price_label:     data.price_label ?? null,
                area_m2:         data.area_m2     ?? null,
                area_hectares:   data.area_hectares ?? null,
                bedrooms:        data.bedrooms    ?? null,
                bathrooms:       data.bathrooms   ?? null,
                status:          'pending',
            })
            .select('id')
            .single()

        if (listErr || !listing) {
            console.error('[listings/route] DB error:', listErr)
            return NextResponse.json(
                { error: 'Failed to create listing. Please try again.' },
                { status: 500 }
            )
        }

        // ── Insert media records ──
        const mediaRecords = data.mediaUrls.map((url, idx) => ({
            listing_id:    listing.id,
            type:          data.mediaType,
            storage_url:   url,
            display_order: idx,
        }))

        const { error: mediaErr } = await supabaseAdmin
            .from('listing_media')
            .insert(mediaRecords)

        if (mediaErr) {
            console.error('[listings/route] Media insert error:', mediaErr)
            // Don't fail — listing is created, media can be fixed by validator
        }

        return NextResponse.json({ ok: true, listingId: listing.id }, { status: 201 })

    } catch (err) {
        console.error('[listings/route] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}