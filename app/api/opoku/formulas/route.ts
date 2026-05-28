// app/api/opoku/formulas/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// GET — all formulas including FREE
// ─────────────────────────────────────────────

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('formulas')
            .select('*')
            .order('pub_count', { ascending: true })

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch formulas.' }, { status: 500 })
        }

        return NextResponse.json({ formulas: data ?? [] })

    } catch (err) {
        console.error('[opoku/formulas GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// PATCH — update formula price and active state
// ─────────────────────────────────────────────

const updateSchema = z.object({
    id:        z.string().uuid(),
    price_ghs: z.number().min(0, 'Price must be 0 or greater.').optional(),
    is_active: z.boolean().optional(),
})

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

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('formulas')
            .update({ ...updates, updated_by: session.userId })
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: 'Failed to update formula.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[opoku/formulas PATCH]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}