// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { loginUser }                 from '@/lib/auth'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

const loginSchema = z.object({
    email:        z.string().min(1, 'Email is required.'),
    password:     z.string().min(1, 'Password is required.'),
    expectedRole: z.enum([
        'superadmin',
        'agent_validator',
        'agent_immobilier',
        'comptable',
    ]).optional(),
})

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body   = await req.json()
        const parsed = loginSchema.safeParse(body)

        if (!parsed.success) {
            const msg = parsed.error.errors[0]?.message ?? 'Invalid request.'
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        const { email, password, expectedRole } = parsed.data

        // ── Attempt login ──
        const result = await loginUser(email, password)

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 401 })
        }

        // ── Role gate — ensure user is accessing the right portal ──
        if (expectedRole && result.session.role !== expectedRole) {
            // Special case: superadmin can access all portals
            if (result.session.role !== 'superadmin') {
                return NextResponse.json(
                    { error: 'You do not have access to this portal.' },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json({
            ok:   true,
            role: result.session.role,
        })

    } catch (err) {
        console.error('[auth/login/route] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}