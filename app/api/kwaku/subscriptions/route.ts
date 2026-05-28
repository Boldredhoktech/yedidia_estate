// app/api/kwaku/subscriptions/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { sendPaymentReceipt }        from '@/lib/mailer'
import { z }                         from 'zod'
import { format }                    from 'date-fns'

// ─────────────────────────────────────────────
// GET — search agents OR recent manual activations
// ?q=xxx  → search active agents by name or email
// (no q)  → return last 20 manual payments
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const q = req.nextUrl.searchParams.get('q')?.trim()

        // ── Agent search ──
        if (q) {
            if (q.length < 2) {
                return NextResponse.json({ agents: [] })
            }

            const { data, error } = await supabaseAdmin
                .from('users')
                .select('id, full_name, email, phone_call, phone_whatsapp, status')
                .eq('role', 'agent_immobilier')
                .eq('status', 'active')
                .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
                .order('full_name')
                .limit(8)

            if (error) return NextResponse.json({ error: 'Search failed.' }, { status: 500 })
            return NextResponse.json({ agents: data ?? [] })
        }

        // ── Recent manual activations ──
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
                id,
                amount,
                currency,
                status,
                notes,
                created_at,
                agent:users!agent_id ( full_name, email ),
                formula:formulas!formula_id ( formula_key, name )
            `)
            .eq('method', 'manual')
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) return NextResponse.json({ error: 'Failed to load history.' }, { status: 500 })
        return NextResponse.json({ history: data ?? [] })

    } catch (err) {
        console.error('[kwaku/subscriptions/GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}

// ─────────────────────────────────────────────
// POST — activate a manual subscription
// ─────────────────────────────────────────────

const activateSchema = z.object({
    agentId:         z.string().uuid(),
    formulaId:       z.string().uuid(),
    amountConfirmed: z.number().min(0),
    notes:           z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = activateSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
                { status: 400 }
            )
        }

        const { agentId, formulaId, amountConfirmed, notes } = parsed.data

        // ── Verify agent ──
        const { data: agent } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, role, status')
            .eq('id', agentId)
            .single()

        if (!agent || agent.role !== 'agent_immobilier') {
            return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
        }
        if (agent.status !== 'active') {
            return NextResponse.json(
                { error: 'Agent account is not active. Activate the account first.' },
                { status: 400 }
            )
        }

        // ── Guard: no duplicate active subscription ──
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('agent_id', agentId)
            .eq('status', 'active')
            .maybeSingle()

        if (existingSub) {
            return NextResponse.json(
                { error: 'This agent already has an active subscription.' },
                { status: 400 }
            )
        }

        // ── Get formula ──
        const { data: formula } = await supabaseAdmin
            .from('formulas')
            .select('id, name, formula_key, pub_count, pub_duration_days, validity_days, price_ghs, is_active')
            .eq('id', formulaId)
            .single()

        if (!formula || !formula.is_active) {
            return NextResponse.json({ error: 'Formula not found or inactive.' }, { status: 404 })
        }

        // ── Create subscription ──
        const now       = new Date()
        const expiresAt = new Date(now.getTime() + formula.validity_days * 24 * 60 * 60 * 1000)

        const { data: subscription, error: subErr } = await supabaseAdmin
            .from('subscriptions')
            .insert({
                agent_id:       agentId,
                formula_id:     formulaId,
                status:         'active',
                pubs_remaining: formula.pub_count,
                purchased_at:   now.toISOString(),
                expires_at:     expiresAt.toISOString(),
                activated_by:   session.userId,
            })
            .select('id')
            .single()

        if (subErr || !subscription) {
            console.error('[kwaku/subscriptions/POST] subscription error:', subErr)
            return NextResponse.json({ error: 'Failed to create subscription.' }, { status: 500 })
        }

        // ── Create payment record ──
        const reference = `MANUAL-${subscription.id.slice(0, 8).toUpperCase()}`

        const { data: payment } = await supabaseAdmin
            .from('payments')
            .insert({
                agent_id:        agentId,
                formula_id:      formulaId,
                subscription_id: subscription.id,
                amount:          amountConfirmed,
                currency:        'GHS',
                status:          'success',
                method:          'manual',
                validated_by:    session.userId,
                validated_at:    now.toISOString(),
                notes:           notes ?? null,
            })
            .select('id')
            .single()

        // ── Send receipt email ──
        const mailResult = await sendPaymentReceipt({
            to:          agent.email,
            agentName:   agent.full_name,
            formulaName: `${formula.formula_key} — ${formula.name}`,
            amount:      amountConfirmed,
            currency:    'GHS',
            reference,
            method:      'Manual Payment',
            paidAt:      format(now, 'dd MMMM yyyy, HH:mm'),
        })

        // ── Log notification ──
        await supabaseAdmin.from('notifications_log').insert({
            recipient_id:  agentId,
            email_to:      agent.email,
            subject:       `Payment Confirmed — ${formula.formula_key} — ${formula.name}`,
            type:          'receipt',
            status:        mailResult.success ? 'sent' : 'failed',
            resend_id:     mailResult.messageId ?? null,
            error_message: mailResult.error ?? null,
        })

        return NextResponse.json({
            ok:             true,
            subscriptionId: subscription.id,
            paymentId:      payment?.id ?? null,
            expiresAt:      expiresAt.toISOString(),
        })

    } catch (err) {
        console.error('[kwaku/subscriptions/POST]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}
