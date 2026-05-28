// app/api/kwaku/agents/route.ts

import { NextRequest, NextResponse }       from 'next/server'
import { supabaseAdmin }                   from '@/lib/db'
import { getSession }                      from '@/lib/auth'
import { sendAccountBlocked,
    sendAccountActivated }            from '@/lib/mailer'
import { z }                               from 'zod'

const schema = z.discriminatedUnion('action', [
    z.object({
        action:  z.literal('activate'),
        agentId: z.string().uuid(),
    }),
    z.object({
        action:  z.literal('block'),
        agentId: z.string().uuid(),
    }),
    z.object({
        action:  z.literal('unblock'),
        agentId: z.string().uuid(),
    }),
    z.object({
        action:         z.literal('edit_profile'),
        agentId:        z.string().uuid(),
        full_name:      z.string().min(2).max(150).optional(),
        phone_call:     z.string().max(30).nullable().optional(),
        phone_whatsapp: z.string().max(30).nullable().optional(),
    }),
])

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const body   = await req.json()
        const parsed = schema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid request.' },
                { status: 400 }
            )
        }

        const data = parsed.data

        // ── Fetch agent ──
        const { data: agent, error: fetchErr } = await supabaseAdmin
            .from('users')
            .select('id, full_name, email, status, role')
            .eq('id', data.agentId)
            .single()

        if (fetchErr || !agent) {
            return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })
        }

        if (agent.role !== 'agent_immobilier') {
            return NextResponse.json(
                { error: 'This action can only be performed on agent accounts.' },
                { status: 400 }
            )
        }

        // ─────────────────────────────────────────
        // ACTIVATE
        // ─────────────────────────────────────────
        if (data.action === 'activate') {
            if (agent.status !== 'pending') {
                return NextResponse.json(
                    { error: 'Agent is not in pending status.' },
                    { status: 400 }
                )
            }

            await supabaseAdmin
                .from('users')
                .update({ status: 'active' })
                .eq('id', data.agentId)

            // Send activation email + free offer triggers from DB
            await sendAccountActivated({
                to:        agent.email,
                agentName: agent.full_name,
            })

            return NextResponse.json({ ok: true })
        }

        // ─────────────────────────────────────────
        // BLOCK
        // ─────────────────────────────────────────
        if (data.action === 'block') {
            await supabaseAdmin
                .from('users')
                .update({
                    status:     'blocked',
                    blocked_at: new Date().toISOString(),
                    blocked_by: session.userId,
                })
                .eq('id', data.agentId)

            // DB trigger archives listings automatically
            await sendAccountBlocked({
                to:        agent.email,
                agentName: agent.full_name,
            })

            return NextResponse.json({ ok: true })
        }

        // ─────────────────────────────────────────
        // UNBLOCK
        // ─────────────────────────────────────────
        if (data.action === 'unblock') {
            await supabaseAdmin
                .from('users')
                .update({
                    status:     'active',
                    blocked_at: null,
                    blocked_by: null,
                })
                .eq('id', data.agentId)

            // DB trigger reactivates non-expired listings automatically
            await sendAccountActivated({
                to:        agent.email,
                agentName: agent.full_name,
            })

            return NextResponse.json({ ok: true })
        }

        // ─────────────────────────────────────────
        // EDIT PROFILE
        // ─────────────────────────────────────────
        if (data.action === 'edit_profile') {
            const updates: Record<string, unknown> = {}
            if (data.full_name      !== undefined) updates.full_name      = data.full_name
            if (data.phone_call     !== undefined) updates.phone_call     = data.phone_call
            if (data.phone_whatsapp !== undefined) updates.phone_whatsapp = data.phone_whatsapp

            if (Object.keys(updates).length === 0) {
                return NextResponse.json({ error: 'No fields to update.' }, { status: 400 })
            }

            await supabaseAdmin
                .from('users')
                .update(updates)
                .eq('id', data.agentId)

            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })

    } catch (err) {
        console.error('[kwaku/agents/route] Error:', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}