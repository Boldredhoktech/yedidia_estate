// app/api/agents/listings/[id]/withdraw/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'

export async function PATCH(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { id } = await params

        // Fetch listing — ensure it belongs to this agent
        const { data: listing, error: fetchErr } = await supabaseAdmin
            .from('listings')
            .select('id, status, agent_id')
            .eq('id', id)
            .single()

        if (fetchErr || !listing) {
            return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
        }

        // Only the owner agent (or validator/superadmin) can withdraw
        const isOwner = listing.agent_id === session.userId
        const isAdmin = ['agent_validator', 'superadmin'].includes(session.role)

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
        }

        // Only active or pending listings can be withdrawn
        if (!['active', 'pending'].includes(listing.status)) {
            return NextResponse.json(
                { error: 'Only active or pending listings can be withdrawn.' },
                { status: 400 }
            )
        }

        // Update status
        const { error: updateErr } = await supabaseAdmin
            .from('listings')
            .update({
                status:       'withdrawn',
                withdrawn_at: new Date().toISOString(),
            })
            .eq('id', id)

        if (updateErr) {
            return NextResponse.json({ error: 'Failed to withdraw listing.' }, { status: 500 })
        }

        return NextResponse.json({ ok: true })

    } catch (err) {
        console.error('[withdraw/route] Error:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}