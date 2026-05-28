// app/comptable/dashboard/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import Link              from 'next/link'

async function getFinancialSummary() {
    const [paymentsRes, todayRes] = await Promise.all([
        // All time
        supabaseAdmin
            .from('payments')
            .select('amount, status, method, created_at'),

        // Today
        supabaseAdmin
            .from('payments')
            .select('amount, status')
            .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
            .eq('status', 'success'),
    ])

    const all = paymentsRes.data ?? []

    const totalRevenue   = all.filter(p => p.status === 'success')
        .reduce((s, p) => s + p.amount, 0)
    const todayRevenue   = (todayRes.data ?? []).reduce((s, p) => s + p.amount, 0)
    const successCount   = all.filter(p => p.status === 'success').length
    const failedCount    = all.filter(p => p.status === 'failed').length
    const pendingCount   = all.filter(p => p.status === 'pending').length
    const manualCount    = all.filter(p => p.method  === 'manual').length
    const paystackCount  = all.filter(p => p.method  === 'paystack').length

    // This month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0,0,0,0)
    const monthRevenue = all
        .filter(p => p.status === 'success' && new Date(p.created_at) >= monthStart)
        .reduce((s, p) => s + p.amount, 0)

    // Recent 5
    const { data: recent } = await supabaseAdmin
        .from('payments')
        .select(`
      id, amount, currency, status, method, created_at,
      users!agent_id ( full_name, email ),
      formulas ( name, formula_key )
    `)
        .order('created_at', { ascending: false })
        .limit(5)

    return {
        totalRevenue, todayRevenue, monthRevenue,
        successCount, failedCount, pendingCount,
        manualCount, paystackCount,
        recent: (recent ?? []).map((r: any) => ({
            id:          r.id,
            amount:      r.amount,
            currency:    r.currency,
            status:      r.status,
            method:      r.method,
            created_at:  r.created_at,
            agentName:   r.users?.full_name ?? 'Unknown',
            agentEmail:  r.users?.email     ?? '',
            formulaKey:  r.formulas?.formula_key ?? '—',
            formulaName: r.formulas?.name ?? '—',
        })),
    }
}

const STATUS_STYLES: Record<string, string> = {
    success:  'bg-emerald-900 text-emerald-400',
    pending:  'bg-amber-900   text-amber-400',
    failed:   'bg-red-950     text-red-400',
    refunded: 'bg-slate-800   text-slate-400',
}

export default async function ComptableDashboardPage() {
    const session = await getSession()
    if (!session) redirect('/comptable/login')

    const data = await getFinancialSummary()

    return (
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">
                    Financial Dashboard
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Platform revenue and payment tracking overview.
                </p>
            </div>

            {/* Revenue highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <RevenueCard
                    label="Total Revenue"
                    amount={data.totalRevenue}
                    sub={`${data.successCount} successful payments`}
                    accent="teal"
                />
                <RevenueCard
                    label="This Month"
                    amount={data.monthRevenue}
                    sub={new Date().toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })}
                    accent="indigo"
                />
                <RevenueCard
                    label="Today"
                    amount={data.todayRevenue}
                    sub={new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'short' })}
                    accent="purple"
                />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Successful',  value: data.successCount,  color: 'text-emerald-400' },
                    { label: 'Failed',      value: data.failedCount,   color: 'text-red-400'     },
                    { label: 'Pending',     value: data.pendingCount,  color: 'text-amber-400'   },
                    { label: 'Manual',      value: data.manualCount,   color: 'text-slate-300'   },
                ].map(stat => (
                    <div key={stat.label}
                         className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                            {stat.label}
                        </p>
                        <p className={`text-2xl font-extrabold ${stat.color}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Recent payments */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center
                        justify-between">
                    <h2 className="font-bold text-white text-base">Recent Payments</h2>
                    <Link href="/comptable/payments"
                          className="text-xs font-bold text-teal-400 hover:text-teal-200
                           underline underline-offset-2 transition-colors">
                        View all →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-800 bg-slate-950">
                            {['Date', 'Agent', 'Plan', 'Amount', 'Method', 'Status'].map(h => (
                                <th key={h}
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-500
                                 uppercase tracking-wide whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {data.recent.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-600 text-sm">
                                    No payments yet.
                                </td>
                            </tr>
                        ) : data.recent.map(p => (
                            <tr key={p.id}
                                className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                                    {new Date(p.created_at).toLocaleDateString('en-GH', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <p className="text-white font-semibold text-xs">{p.agentName}</p>
                                    <p className="text-slate-600 text-xs">{p.agentEmail}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-bold text-teal-400">
                      {p.formulaKey}
                    </span>
                                    <span className="text-slate-500 text-xs ml-1">{p.formulaName}</span>
                                </td>
                                <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                                    {p.currency} {p.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                                })}
                                </td>
                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap capitalize text-xs">
                                    {p.method}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize
                                      ${STATUS_STYLES[p.status] ?? 'bg-slate-800 text-slate-400'}`}>
                      {p.status}
                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

// ─────────────────────────────────────────────
// REVENUE CARD
// ─────────────────────────────────────────────

const revenueAccents: Record<string, { border: string; num: string }> = {
    teal:   { border: 'border-teal-800 bg-teal-950',     num: 'text-teal-300'   },
    indigo: { border: 'border-indigo-800 bg-indigo-950', num: 'text-indigo-300' },
    purple: { border: 'border-purple-800 bg-purple-950', num: 'text-purple-300' },
}

function RevenueCard({
                         label, amount, sub, accent,
                     }: {
    label:  string
    amount: number
    sub:    string
    accent: string
}) {
    const a = revenueAccents[accent] ?? revenueAccents.teal
    return (
        <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${a.border}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </p>
            <p className={`text-2xl font-extrabold ${a.num}`}>
                GHS {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2, maximumFractionDigits: 2,
            })}
            </p>
            <p className="text-xs text-slate-600">{sub}</p>
        </div>
    )
}