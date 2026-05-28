// app/api/kwaku/legal-partners/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const createSchema = z.object({
    name:    z.string().min(2).max(200),
    type:    z.enum(['notaire', 'avocat', 'huissier']),
    city:    z.string().min(2).max(100),
    phone:   z.string().max(30).optional().nullable(),
    email:   z.string().email().optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    notes:   z.string().max(1000).optional().nullable(),
})

const updateSchema = createSchema.partial().extend({
    id:        z.string().uuid(),
    is_active: z.boolean().optional(),
})

// ─────────────────────────────────────────────
// GET — list all legal partners
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('legal_partners')
            .select(`
        id, name, type, city, phone, email,
        address, notes, is_active, created_at,
        users!added_by ( full_name )
      `)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch partners.' }, { status: 500 })
        }

        const partners = (data ?? []).map((row: any) => ({
            ...row,
            added_by_name: row.users?.full_name ?? '—',
        }))

        return NextResponse.json({ partners })

    } catch (err) {
        console.error('[legal-partners GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// POST — create legal partner
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = createSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid data.' },
                { status: 400 }
            )
        }

        const { data: partner, error } = await supabaseAdmin
            .from('legal_partners')
            .insert({
                ...parsed.data,
                added_by:  session.userId,
                is_active: true,
            })
            .select('id, name, type, city, phone, email, address, notes, is_active, created_at')
            .single()

        if (error || !partner) {
            console.error('[legal-partners POST]', error)
            return NextResponse.json({ error: 'Failed to create partner.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true, partner }, { status: 201 })

    } catch (err) {
        console.error('[legal-partners POST]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// PATCH — update or toggle legal partner
// ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = updateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid data.' },
                { status: 400 }
            )
        }

        const { id, ...updates } = parsed.data

        const { error } = await supabaseAdmin
            .from('legal_partners')
            .update(updates)
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: 'Failed to update partner.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[legal-partners PATCH]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// DELETE — remove legal partner
// ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('legal_partners')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: 'Failed to delete partner.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[legal-partners DELETE]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}