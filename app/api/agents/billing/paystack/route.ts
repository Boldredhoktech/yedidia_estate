// app/api/agents/billing/paystack/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { z }                         from 'zod'

const schema = z.object({
    formulaId: z.string().uuid(),
    agentId:   z.string(),
})

export async function POST(req: NextRequest) {
    try {
        // ── Auth ──
        const session = await getSession()
        if (!session || !['agent_immobilier', 'agent_validator', 'superadmin']
            .includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = schema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
        }

        const { formulaId, agentId } = parsed.data

        // ── Check no active subscription ──
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('agent_id', agentId)
            .eq('status', 'active')
            .maybeSingle()

        if (existingSub) {
            return NextResponse.json(
                { error: 'You already have an active subscription.' },
                { status: 400 }
            )
        }

        // ── Get formula details ──
        const { data: formula, error: formulaErr } = await supabaseAdmin
            .from('formulas')
            .select('id, name, formula_key, price_ghs, pub_count, pub_duration_days, validity_days')
            .eq('id', formulaId)
            .eq('is_active', true)
            .single()

        if (formulaErr || !formula) {
            return NextResponse.json({ error: 'Formula not found.' }, { status: 404 })
        }

        // ── Get agent email ──
        const { data: agent } = await supabaseAdmin
            .from('users')
            .select('email, full_name')
            .eq('id', agentId)
            .single()

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
        }

        // ── Create pending payment record ──
        const { data: payment, error: payErr } = await supabaseAdmin
            .from('payments')
            .insert({
                agent_id:   agentId,
                formula_id: formulaId,
                amount:     formula.price_ghs,
                currency:   'GHS',
                status:     'pending',
                method:     'paystack',
            })
            .select('id')
            .single()

        if (payErr || !payment) {
            return NextResponse.json({ error: 'Failed to initiate payment.' }, { status: 500 })
        }

        // ── Initialize Paystack transaction ──
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method:  'POST',
            headers: {
                Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email:    agent.email,
                amount:   Math.round(formula.price_ghs * 100), // Paystack uses pesewas
                currency: 'GHS',
                reference: `YE-${payment.id}`,
                metadata: {
                    agentId,
                    formulaId,
                    formulaKey:  formula.formula_key,
                    formulaName: formula.name,
                    paymentId:   payment.id,
                    agentName:   agent.full_name,
                },
                callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/billing/paystack/callback`,
            }),
        })

        const paystackData = await paystackRes.json()

        if (!paystackData.status) {
            console.error('[paystack/route] Paystack error:', paystackData)
            return NextResponse.json(
                { error: 'Payment gateway error. Please try again.' },
                { status: 502 }
            )
        }

        // ── Save Paystack reference ──
        await supabaseAdmin
            .from('payments')
            .update({ paystack_ref: paystackData.data.reference })
            .eq('id', payment.id)

        return NextResponse.json({
            ok:               true,
            authorizationUrl: paystackData.data.authorization_url,
            reference:        paystackData.data.reference,
        })

    } catch (err) {
        console.error('[paystack/route] Unexpected error:', err)
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
    }
}