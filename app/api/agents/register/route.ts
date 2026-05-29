// app/api/agents/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { hashPassword }              from '@/lib/auth'
import { z }                         from 'zod'

const registerSchema = z.object({
    full_name:      z.string().min(2, 'Full name must be at least 2 characters.').max(150),
    email:          z.string().email('Please enter a valid email address.'),
    password:       z.string().min(8, 'Password must be at least 8 characters.'),
    phone_call:     z.string().max(30).optional().nullable(),
    phone_whatsapp: z.string().max(30).optional().nullable(),
})

export async function POST(req: NextRequest) {
    try {
        const body   = await req.json()
        const parsed = registerSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid data.' },
                { status: 400 }
            )
        }

        const { password, ...rest } = parsed.data

        // ── Check email uniqueness ──
        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', rest.email.toLowerCase().trim())
            .maybeSingle()

        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            )
        }

        // ── Create agent account (pending — requires validator activation) ──
        const passwordHash = await hashPassword(password)

        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                ...rest,
                email:         rest.email.toLowerCase().trim(),
                role:          'agent_immobilier',
                status:        'pending',
                password_hash: passwordHash,
            })

        if (error) {
            console.error('[agents/register]', error)
            return NextResponse.json(
                { error: 'Registration failed. Please try again.' },
                { status: 500 }
            )
        }

        return NextResponse.json({ ok: true }, { status: 201 })

    } catch (err) {
        console.error('[agents/register] unexpected:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}
