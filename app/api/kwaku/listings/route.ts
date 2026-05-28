// app/api/kwaku/listings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// GET /api/kwaku/listings?id=xxx
// Search listing by ID
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const id = req.nextUrl.searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter.' }, { status: 400 })
        }

        const { data, error } = await supabaseAdmin
            .from('listings')
            .select(`
        id, title, type, status, city, neighborhood,
        price, created_at, published_at, expires_at,
        users!agent_id ( id, full_name, email ),
        listing_media ( id )
      `)
            .eq('id', id)
            .single()

        if (error || !data) {
            return NextResponse.json({ listing: null }, { status: 404 })
        }

        const row = data as any
        const listing = {
            id:           row.id,
            title:        row.title,
            type:         row.type,
            status:       row.status,
            city:         row.city,
            neighborhood: row.neighborhood,
            price:        row.price,
            created_at:   row.created_at,
            published_at: row.published_at,
            expires_at:   row.expires_at,
            agent: {
                id:        row.users?.id        ?? '',
                full_name: row.users?.full_name ?? 'Unknown',
                email:     row.users?.email     ?? '',
            },
            media_count: (row.listing_media ?? []).length,
        }

        return NextResponse.json({ listing })

    } catch (err) {
        console.error('[kwaku/listings GET] Error:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// PATCH /api/kwaku/listings
// Validate or archive a listing
// ─────────────────────────────────────────────

const patchSchema = z.discriminatedUnion('action', [
    z.object({
        action:    z.literal('validate'),
        listingId: z.string().uuid(),
    }),
    z.object({
        action:    z.literal('archive'),
        listingId: z.string().uuid(),
    }),
])

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = patchSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message ?? 'Invalid request.' },
                { status: 400 }
            )
        }

        const data = parsed.data

        // ── Fetch listing ──
        const { data: listing, error: fetchErr } = await supabaseAdmin
            .from('listings')
            .select('id, status, agent_id, subscription_id')
            .eq('id', data.listingId)
            .single()

        if (fetchErr || !listing) {
            return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
        }

        // ─────────────────────────────────────────
        // VALIDATE
        // ─────────────────────────────────────────
        if (data.action === 'validate') {
            if (listing.status !== 'pending') {
                return NextResponse.json(
                    { error: 'Only pending listings can be validated.' },
                    { status: 400 }
                )
            }

            // Get subscription pub_duration_days to calculate expiry
            let expiresAt: string | null = null
            if (listing.subscription_id) {
                const { data: sub } = await supabaseAdmin
                    .from('subscriptions')
                    .select('formulas(pub_duration_days)')
                    .eq('id', listing.subscription_id)
                    .single()

                const days = (sub?.formulas as any)?.pub_duration_days ?? 60
                expiresAt  = new Date(
                    Date.now() + days * 24 * 60 * 60 * 1000
                ).toISOString()
            }

            await supabaseAdmin
                .from('listings')
                .update({
                    status:          'active',
                    published_at:    new Date().toISOString(),
                    expires_at:      expiresAt,
                    validated_by:    session.userId,
                    validated_at:    new Date().toISOString(),
                })
                .eq('id', data.listingId)

            return NextResponse.json({ ok: true })
        }

        // ─────────────────────────────────────────
        // ARCHIVE
        // ─────────────────────────────────────────
        if (data.action === 'archive') {
            await supabaseAdmin
                .from('listings')
                .update({
                    status:      'archived',
                    archived_at: new Date().toISOString(),
                })
                .eq('id', data.listingId)

            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

    } catch (err) {
        console.error('[kwaku/listings PATCH] Error:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}