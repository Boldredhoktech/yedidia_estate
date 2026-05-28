// app/api/comptable/payments/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'

// ─────────────────────────────────────────────
// GET /api/comptable/payments
// Query params: status, method, from, to, page
// ─────────────────────────────────────────────

const PAGE_SIZE = 25

export async function GET(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || !['comptable', 'superadmin'].includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const { searchParams } = req.nextUrl
        const status  = searchParams.get('status')   // success | failed | pending
        const method  = searchParams.get('method')   // paystack | manual
        const from    = searchParams.get('from')
        const to      = searchParams.get('to')
        const page    = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
        const offset  = (page - 1) * PAGE_SIZE

        let query = supabaseAdmin
            .from('payments')
            .select(`
        id, amount, currency, status, method,
        paystack_ref, receipt_sent, created_at,
        notes,
        users!agent_id ( id, full_name, email ),
        formulas ( name, formula_key )
      `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1)

        if (status) query = query.eq('status', status)
        if (method) query = query.eq('method', method)
        if (from)   query = query.gte('created_at', new Date(from).toISOString())
        if (to) {
            const toDate = new Date(to)
            toDate.setHours(23, 59, 59, 999)
            query = query.lte('created_at', toDate.toISOString())
        }

        const { data, error, count } = await query

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch payments.' }, { status: 500 })
        }

        const payments = (data ?? []).map((row: any) => ({
            id:          row.id,
            amount:      row.amount,
            currency:    row.currency,
            status:      row.status,
            method:      row.method,
            paystack_ref:row.paystack_ref,
            receipt_sent:row.receipt_sent,
            created_at:  row.created_at,
            notes:       row.notes,
            agent: {
                id:        row.users?.id        ?? '',
                full_name: row.users?.full_name ?? 'Unknown',
                email:     row.users?.email     ?? '',
            },
            formula: {
                name:        row.formulas?.name        ?? '—',
                formula_key: row.formulas?.formula_key ?? '—',
            },
        }))

        // Revenue totals for current filter
        const successTotal = payments
            .filter(p => p.status === 'success')
            .reduce((s, p) => s + p.amount, 0)

        return NextResponse.json({
            payments,
            total:        count ?? 0,
            page,
            pages:        Math.ceil((count ?? 0) / PAGE_SIZE),
            successTotal,
        })

    } catch (err) {
        console.error('[comptable/payments GET]', err)
        return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
    }
}