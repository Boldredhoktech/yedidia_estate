// app/api/agents/profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────

const updateInfoSchema = z.object({
    action:         z.literal('update_info'),
    full_name:      z.string().min(2).max(150),
    phone_call:     z.string().max(30).nullable().optional(),
    phone_whatsapp: z.string().max(30).nullable().optional(),
})

const changePasswordSchema = z.object({
    action:           z.literal('change_password'),
    current_password: z.string().min(1),
    new_password:     z.string().min(8, 'Password must be at least 8 characters.'),
})

const bodySchema = z.discriminatedUnion('action', [
    updateInfoSchema,
    changePasswordSchema,
])

// ─────────────────────────────────────────────
// PATCH /api/agents/profile
// ─────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    try {
        // ── Auth ──
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = bodySchema.safeParse(body)

        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? 'Invalid request.'
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        const data = parsed.data

        // ─────────────────────────────────────────
        // ACTION: update_info
        // ─────────────────────────────────────────

        if (data.action === 'update_info') {
            const { error } = await supabaseAdmin
                .from('users')
                .update({
                    full_name:      data.full_name,
                    phone_call:     data.phone_call     ?? null,
                    phone_whatsapp: data.phone_whatsapp ?? null,
                })
                .eq('id', session.userId)

            if (error) {
                console.error('[profile/route] Update info error:', error)
                return NextResponse.json(
                    { error: 'Failed to update profile. Please try again.' },
                    { status: 500 }
                )
            }

            return NextResponse.json({ ok: true })
        }

        // ─────────────────────────────────────────
        // ACTION: change_password
        // ─────────────────────────────────────────

        if (data.action === 'change_password') {

            // SuperAdmin uses .env credentials — no DB password change
            if (session.role === 'superadmin') {
                return NextResponse.json(
                    { error: 'SuperAdmin password must be changed in the environment config.' },
                    { status: 400 }
                )
            }

            // Fetch current password hash
            const { data: user, error: fetchErr } = await supabaseAdmin
                .from('users')
                .select('password_hash')
                .eq('id', session.userId)
                .single()

            if (fetchErr || !user) {
                return NextResponse.json({ error: 'User not found.' }, { status: 404 })
            }

            // Verify current password
            const isValid = await verifyPassword(data.current_password, user.password_hash)
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect.' },
                    { status: 401 }
                )
            }

            // Hash new password
            const newHash = await hashPassword(data.new_password)

            // Update in DB
            const { error: updateErr } = await supabaseAdmin
                .from('users')
                .update({ password_hash: newHash })
                .eq('id', session.userId)

            if (updateErr) {
                console.error('[profile/route] Password update error:', updateErr)
                return NextResponse.json(
                    { error: 'Failed to update password. Please try again.' },
                    { status: 500 }
                )
            }

            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

    } catch (err) {
        console.error('[profile/route] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}