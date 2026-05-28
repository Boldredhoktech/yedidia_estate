// app/api/cron/expiry-warning/route.ts

import { NextRequest, NextResponse }  from 'next/server'
import { supabaseAdmin }              from '@/lib/db'
import { sendExpiryWarning }          from '@/lib/mailer'
import { expireOldSubscriptions }     from '@/lib/subscription'
import { format, addDays }            from 'date-fns'

// ─────────────────────────────────────────────
// GET /api/cron/expiry-warning
//
// Called daily at 08:00 UTC by Vercel Cron.
// Requires: Authorization: Bearer CRON_SECRET
//
// Steps:
//   1. Expire overdue active listings       (active → expired)
//   2. Expire overdue active subscriptions  (active → expired)
//   3. Send J-7 expiry warning emails for listings expiring in 6–7 days
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {

    // ── Auth ──
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const now     = new Date()
    const results = {
        listingsExpired:      0,
        subscriptionsExpired: 0,
        warningsSent:         0,
        warningsFailed:       0,
    }

    try {

        // ────────────────────────────────────────
        // STEP 1 — Expire overdue listings
        // ────────────────────────────────────────
        const { data: expiredListings } = await supabaseAdmin
            .from('listings')
            .update({ status: 'expired' })
            .eq('status', 'active')
            .lt('expires_at', now.toISOString())
            .select('id')

        results.listingsExpired = expiredListings?.length ?? 0

        // ────────────────────────────────────────
        // STEP 2 — Expire overdue subscriptions
        // ────────────────────────────────────────
        const { expired: subsExpired } = await expireOldSubscriptions()
        results.subscriptionsExpired = subsExpired

        // ────────────────────────────────────────
        // STEP 3 — Send J-7 expiry warnings
        // Query window: listings expiring in the next 6–7 days.
        // Running daily at 08:00, this ensures each listing gets
        // exactly one warning approximately 7 days before expiry.
        // ────────────────────────────────────────
        const windowStart = addDays(now, 6).toISOString()
        const windowEnd   = addDays(now, 7).toISOString()

        const { data: expiringListings, error: listErr } = await supabaseAdmin
            .from('listings')
            .select(`
                id,
                title,
                expires_at,
                agent:users!agent_id ( id, email, full_name )
            `)
            .eq('status', 'active')
            .gte('expires_at', windowStart)
            .lte('expires_at', windowEnd)

        if (listErr) {
            console.error('[cron/expiry-warning] listing query error:', listErr)
        }

        for (const listing of (expiringListings ?? [])) {
            const agent = listing.agent as {
                id:        string
                email:     string
                full_name: string
            } | null

            if (!agent?.email) continue

            // Send warning email
            const mailResult = await sendExpiryWarning({
                to:           agent.email,
                agentName:    agent.full_name,
                listingTitle: listing.title,
                listingId:    listing.id,
                expiresAt:    format(new Date(listing.expires_at), 'dd MMMM yyyy'),
            })

            // Log the notification
            await supabaseAdmin.from('notifications_log').insert({
                recipient_id:  agent.id,
                email_to:      agent.email,
                subject:       `Listing expiry warning — ${listing.title}`,
                type:          'expiry_warning',
                status:        mailResult.success ? 'sent' : 'failed',
                resend_id:     mailResult.messageId ?? null,
                error_message: mailResult.error    ?? null,
            })

            if (mailResult.success) {
                results.warningsSent++
            } else {
                results.warningsFailed++
                console.error(
                    '[cron/expiry-warning] mail failed for listing',
                    listing.id,
                    mailResult.error,
                )
            }
        }

        console.log('[cron/expiry-warning] completed:', results)
        return NextResponse.json({ ok: true, ...results })

    } catch (err) {
        console.error('[cron/expiry-warning] unexpected error:', err)
        return NextResponse.json({ error: 'Cron job failed.', ...results }, { status: 500 })
    }
}
