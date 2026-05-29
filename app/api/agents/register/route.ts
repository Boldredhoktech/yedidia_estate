// app/api/agents/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { hashPassword }              from '@/lib/auth'
import { sendMail }                  from '@/lib/mailer'
import { siteConfig }                from '@/config/siteconfig'
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
        const email          = rest.email.toLowerCase().trim()
        const phoneCall      = rest.phone_call?.trim()      || null
        const phoneWhatsapp  = rest.phone_whatsapp?.trim()  || null

        // ── Build duplicate check: email + phones ──
        const orConditions: string[] = [`email.eq.${email}`]
        if (phoneCall)     orConditions.push(`phone_call.eq.${phoneCall}`)
        if (phoneWhatsapp) orConditions.push(`phone_whatsapp.eq.${phoneWhatsapp}`)

        const { data: existing } = await supabaseAdmin
            .from('users')
            .select('email, phone_call, phone_whatsapp')
            .eq('role', 'agent_immobilier')
            .or(orConditions.join(','))
            .limit(1)
            .maybeSingle()

        if (existing) {
            // Tell the user which identifier is already linked
            if (existing.email === email) {
                return NextResponse.json(
                    { error: 'This email address is already linked to an existing account. Please contact support at ' + siteConfig.contact.emailSupport },
                    { status: 409 }
                )
            }
            if (phoneCall && existing.phone_call === phoneCall) {
                return NextResponse.json(
                    { error: 'This call number is already linked to an existing account. Please contact support at ' + siteConfig.contact.emailSupport },
                    { status: 409 }
                )
            }
            if (phoneWhatsapp && existing.phone_whatsapp === phoneWhatsapp) {
                return NextResponse.json(
                    { error: 'This WhatsApp number is already linked to an existing account. Please contact support at ' + siteConfig.contact.emailSupport },
                    { status: 409 }
                )
            }
        }

        // ── Create agent account (pending — requires validator activation) ──
        const passwordHash = await hashPassword(password)

        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                full_name:      rest.full_name,
                email,
                phone_call:     phoneCall,
                phone_whatsapp: phoneWhatsapp,
                role:           'agent_immobilier',
                status:         'pending',
                password_hash:  passwordHash,
            })

        if (error) {
            console.error('[agents/register]', error)
            return NextResponse.json(
                { error: 'Registration failed. Please try again.' },
                { status: 500 }
            )
        }

        // ── Notify validators (fire and forget) ──
        notifyValidators(rest.full_name, email).catch(() => {})

        return NextResponse.json({ ok: true }, { status: 201 })

    } catch (err) {
        console.error('[agents/register] unexpected:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// Notify all active validators of a new pending agent
// ─────────────────────────────────────────────

async function notifyValidators(agentName: string, agentEmail: string) {
    const { data: validators } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('role', 'agent_validator')
        .eq('status', 'active')

    if (!validators?.length) return

    const validatorEmails = validators.map(v => v.email)

    await sendMail({
        to:      validatorEmails,
        subject: `🔔 New Agent Registration — ${agentName}`,
        html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
                <div style="background:#e23d76;padding:24px 32px;border-radius:12px 12px 0 0">
                    <h2 style="color:#fff;margin:0;font-size:18px">
                        🇬🇭 Yedidia Estate — New Agent Pending Validation
                    </h2>
                </div>
                <div style="background:#fff;padding:24px 32px;border:1px solid #e5e7eb;
                            border-top:none;border-radius:0 0 12px 12px">
                    <p style="color:#374151;font-size:15px;margin:0 0 16px">
                        A new real estate agent has registered and is waiting for account validation.
                    </p>
                    <table style="width:100%;font-size:14px;border-collapse:collapse">
                        <tr>
                            <td style="padding:8px 0;color:#6b7280;width:40%">Name</td>
                            <td style="padding:8px 0;color:#111827;font-weight:600">${agentName}</td>
                        </tr>
                        <tr>
                            <td style="padding:8px 0;color:#6b7280">Email</td>
                            <td style="padding:8px 0;color:#111827">${agentEmail}</td>
                        </tr>
                    </table>
                    <div style="margin-top:24px">
                        <a href="${siteConfig.url}/kwaku/agents"
                           style="background:#e23d76;color:#fff;padding:12px 24px;
                                  border-radius:8px;text-decoration:none;font-weight:700;
                                  font-size:14px;display:inline-block">
                            Review in Validator Portal →
                        </a>
                    </div>
                </div>
            </div>
        `,
    })
}
