// app/api/opoku/users/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession, hashPassword }  from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const createSchema = z.object({
    full_name:      z.string().min(2).max(150),
    email:          z.string().email(),
    password:       z.string().min(8, 'Password must be at least 8 characters.'),
    role:           z.enum(['agent_validator', 'comptable']),
    phone_call:     z.string().max(30).optional().nullable(),
    phone_whatsapp: z.string().max(30).optional().nullable(),
})

const updateSchema = z.object({
    id:             z.string().uuid(),
    full_name:      z.string().min(2).max(150).optional(),
    email:          z.string().email().optional(),
    password:       z.string().min(8).optional(),
    phone_call:     z.string().max(30).nullable().optional(),
    phone_whatsapp: z.string().max(30).nullable().optional(),
    status:         z.enum(['active', 'blocked']).optional(),
})

// ─────────────────────────────────────────────
// GET — list all non-agent users
// ─────────────────────────────────────────────

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { data, error } = await supabaseAdmin
            .from('users')
            .select(`
        id, role, full_name, email, phone_call,
        phone_whatsapp, status, created_at, last_login_at
      `)
            .in('role', ['agent_validator', 'comptable'])
            .order('role')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 })
        }

        return NextResponse.json({ users: data ?? [] })

    } catch (err) {
        console.error('[opoku/users GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// POST — create validator or comptable
// ─────────────────────────────────────────────

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

        const { password, ...rest } = parsed.data

        // Check email uniqueness
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', rest.email)
            .maybeSingle()

        if (existing) {
            return NextResponse.json(
                { error: 'A user with this email already exists.' },
                { status: 409 }
            )
        }

        const passwordHash = await hashPassword(password)

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                ...rest,
                password_hash: passwordHash,
                status:        'active',
                created_by:    session.userId,
            })
            .select('id, role, full_name, email, phone_call, phone_whatsapp, status, created_at')
            .single()

        if (error || !user) {
            console.error('[opoku/users POST]', error)
            return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true, user }, { status: 201 })

    } catch (err) {
        console.error('[opoku/users POST]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// PATCH — update user
// ─────────────────────────────────────────────

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

        const { id, password, ...updates } = parsed.data
        const finalUpdates: Record<string, unknown> = { ...updates }

        // Hash new password if provided
        if (password) {
            finalUpdates.password_hash = await hashPassword(password)
        }

        // Handle block timestamp
        if (updates.status === 'blocked') {
            finalUpdates.blocked_at = new Date().toISOString()
            finalUpdates.blocked_by = session.userId
        } else if (updates.status === 'active') {
            finalUpdates.blocked_at = null
            finalUpdates.blocked_by = null
        }

        if (Object.keys(finalUpdates).length === 0) {
            return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('users')
            .update(finalUpdates)
            .eq('id', id)
            .in('role', ['agent_validator', 'comptable']) // safety: can't edit agents/superadmin

        if (error) {
            return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[opoku/users PATCH]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// DELETE — remove user
// ─────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'superadmin') {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
        }

        // Safety: cannot delete superadmin or agent_immobilier accounts
        const { data: target } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', id)
            .single()

        if (!target || !['agent_validator', 'comptable'].includes(target.role)) {
            return NextResponse.json(
                { error: 'This account cannot be deleted.' },
                { status: 403 }
            )
        }

        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id)

        if (error) {
            return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[opoku/users DELETE]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}