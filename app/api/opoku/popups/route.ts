// app/api/opoku/popups/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

const createSchema = z.object({
    title:         z.string().max(150).optional().nullable(),
    image_url:     z.string().url('Please enter a valid image URL.'),
    link_url:      z.string().url().optional().nullable(),
    display_from:  z.string().optional().nullable(),
    display_until: z.string().optional().nullable(),
    is_active:     z.boolean().default(false),
})

const updateSchema = createSchema.partial().extend({
    id: z.string().uuid(),
})

// ── GET — all popups ──
export async function GET() {
    try {
        const session = await getSession()
        if (!session || !['superadmin', 'agent_validator'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('popups')
            .select(`
        id, title, image_url, link_url,
        is_active, display_from, display_until, created_at,
        users!created_by ( full_name )
      `)
            .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: 'Failed to fetch.' }, { status: 500 })

        const popups = (data ?? []).map((row: any) => ({
            ...row,
            created_by_name: row.users?.full_name ?? '—',
        }))

        return NextResponse.json({ popups })
    } catch (err) {
        console.error('[opoku/popups GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ── POST — create popup ──
export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = createSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message ?? 'Invalid data.' },
                { status: 400 }
            )
        }

        const { data: popup, error } = await supabaseAdmin
            .from('popups')
            .insert({ ...parsed.data, created_by: session.userId })
            .select('id, title, image_url, link_url, is_active, display_from, display_until, created_at')
            .single()

        if (error || !popup) return NextResponse.json({ error: 'Failed to create.' }, { status: 500 })

        return NextResponse.json({ ok: true, popup }, { status: 201 })
    } catch (err) {
        console.error('[opoku/popups POST]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ── PATCH — update popup ──
export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = updateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0]?.message ?? 'Invalid data.' },
                { status: 400 }
            )
        }

        const { id, ...updates } = parsed.data

        // If activating this popup, deactivate all others first
        if (updates.is_active === true) {
            await supabaseAdmin
                .from('popups')
                .update({ is_active: false })
                .neq('id', id)
        }

        const { error } = await supabaseAdmin
            .from('popups')
            .update(updates)
            .eq('id', id)

        if (error) return NextResponse.json({ error: 'Failed to update.' }, { status: 500 })

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('[opoku/popups PATCH]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ── DELETE — remove popup ──
export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await req.json()
        if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

        const { error } = await supabaseAdmin.from('popups').delete().eq('id', id)
        if (error) return NextResponse.json({ error: 'Failed to delete.' }, { status: 500 })

        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('[opoku/popups DELETE]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}