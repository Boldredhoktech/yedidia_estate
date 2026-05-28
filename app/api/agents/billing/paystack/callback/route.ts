// app/api/agents/billing/paystack/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { sendPaymentReceipt }        from '@/lib/mailer'

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const reference        = searchParams.get('trxref') ?? searchParams.get('reference')

    if (!reference) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=missing_reference`
        )
    }

    try {
        // ── Verify transaction with Paystack ──
        const verifyRes = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        )
        const verifyData = await verifyRes.json()

        if (!verifyData.status || verifyData.data?.status !== 'success') {
            await markPaymentFailed(reference)
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=payment_failed`
            )
        }

        const meta      = verifyData.data.metadata
        const agentId   = meta?.agentId
        const formulaId = meta?.formulaId
        const paymentId = meta?.paymentId

        if (!agentId || !formulaId || !paymentId) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=invalid_metadata`
            )
        }

        // ── Idempotency — check if already processed ──
        const { data: existingPayment } = await supabaseAdmin
            .from('payments')
            .select('status, subscription_id')
            .eq('id', paymentId)
            .single()

        if (existingPayment?.status === 'success') {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?success=1`
            )
        }

        // ── Get formula ──
        const { data: formula } = await supabaseAdmin
            .from('formulas')
            .select('id, name, formula_key, pub_count, pub_duration_days, validity_days, price_ghs')
            .eq('id', formulaId)
            .single()

        if (!formula) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=formula_not_found`
            )
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
            })
            .select('id')
            .single()

        if (subErr || !subscription) {
            console.error('[callback] Subscription creation error:', subErr)
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=sub_creation_failed`
            )
        }

        // ── Update payment record ──
        await supabaseAdmin
            .from('payments')
            .update({
                status:          'success',
                subscription_id: subscription.id,
                paystack_data:   verifyData.data,
            })
            .eq('id', paymentId)

        // ── Send receipt email ──
        const { data: agent } = await supabaseAdmin
            .from('users')
            .select('email, full_name')
            .eq('id', agentId)
            .single()

        if (agent) {
            await sendPaymentReceipt({
                to:          agent.email,
                agentName:   agent.full_name,
                formulaName: `${formula.formula_key} — ${formula.name}`,
                amount:      formula.price_ghs,
                currency:    'GHS',
                reference,
                method:      'Paystack',
                paidAt:      now.toLocaleDateString('en-GH', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }),
            })

            // Mark receipt sent
            await supabaseAdmin
                .from('payments')
                .update({ receipt_sent: true })
                .eq('id', paymentId)
        }

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?success=1`
        )

    } catch (err) {
        console.error('[callback] Unexpected error:', err)
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/agents/billing?error=unexpected`
        )
    }
}

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

async function markPaymentFailed(reference: string) {
    await supabaseAdmin
        .from('payments')
        .update({ status: 'failed' })
        .eq('paystack_ref', reference)
}