// app/api/complaint/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { sendComplaintNotification } from '@/lib/mailer'
import { z }                         from 'zod'

// ─────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────

const complaintSchema = z.object({
    visitorName:  z.string().min(2,  'Name must be at least 2 characters.').max(150),
    visitorEmail: z.string().email('Please enter a valid email address.'),
    visitorPhone: z.string().max(30).optional(),
    listingRef:   z.string().max(200).optional(),
    message:      z.string().min(30, 'Please describe the situation (minimum 30 characters).').max(5000),
})

// ─────────────────────────────────────────────
// POST /api/complaint
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body   = await req.json()
        const parsed = complaintSchema.safeParse(body)

        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message ?? 'Invalid form data.'
            return NextResponse.json({ error: firstError }, { status: 400 })
        }

        const {
            visitorName,
            visitorEmail,
            visitorPhone,
            listingRef,
            message,
        } = parsed.data

        // ── Save to DB ──
        const { data: complaint, error: dbError } = await supabaseAdmin
            .from('complaints')
            .insert({
                visitor_name:  visitorName,
                visitor_email: visitorEmail,
                visitor_phone: visitorPhone ?? null,
                listing_ref:   listingRef   ?? null,
                message,
                status:        'received',
            })
            .select('id')
            .single()

        if (dbError || !complaint) {
            console.error('[complaint/route] DB error:', dbError)
            return NextResponse.json(
                { error: 'Could not save your complaint. Please try again.' },
                { status: 500 }
            )
        }

        // ── Send email notification to agency ──
        await sendComplaintNotification({
            visitorName,
            visitorEmail,
            visitorPhone,
            listingRef,
            message,
            complaintId: complaint.id,
        })

        return NextResponse.json({ ok: true, complaintId: complaint.id })

    } catch (err) {
        console.error('[complaint/route] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}