// app/comptable/revenue/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

async function getRevenueData() {
    const { data: payments } = await supabaseAdmin
        .from('payments')
        .select('amount, status, created_at, formulas(name, formula_key)')
        .eq('status', 'success')
        .order('created_at', { ascending: true })

    const all = payments ?? []

    // ── Monthly breakdown — last 12 months ──
    const monthlyMap: Record<string, number> = {}
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyMap[key] = 0
    }

    for (const p of all) {
        const d   = new Date(p.created_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (key in monthlyMap) monthlyMap[key] += p.amount
    }

    const monthly = Object.entries(monthlyMap).map(([month, total]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-GH', {
            month: 'short', year: '2-digit',
        }),
        total,
    }))

    // ── Per formula breakdown ──
    const formulaMap: Record<string, { name: string; key: string; total: number; count: number }> = {}
    for (const p of all) {
        const key  = (p.formulas as any)?.formula_key ?? 'Unknown'
        const name = (p.formulas as any)?.name        ?? 'Unknown'
        if (!formulaMap[key]) formulaMap[key] = { name, key, total: 0, count: 0 }
        formulaMap[key].total += p.amount
        formulaMap[key].count += 1
    }

    const byFormula = Object.values(formulaMap)
        .sort((a, b) => b.total - a.total)

    const grandTotal = all.reduce((s, p) => s + p.amount, 0)
    const maxMonthly = Math.max(...monthly.map(m => m.total), 1)

    return { monthly, byFormula, grandTotal, maxMonthly }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function ComptableRevenuePage() {
    const session = await getSession()
    if (!session) redirect('/comptable/login')

    const { monthly, byFormula, grandTotal, maxMonthly } = await getRevenueData()

    const currentMonth  = monthly[monthly.length - 1]
    const previousMonth = monthly[monthly.length - 2]
    const growth = previousMonth && previousMonth.total > 0
        ? Math.round(((currentMonth.total - previousMonth.total) / previousMonth.total) * 100)
        : null

    return (
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Revenue</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Monthly revenue breakdown and formula performance.
                </p>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-teal-950 border border-teal-800 rounded-2xl p-5">
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-wide mb-1">
                        Total Revenue (all time)
                    </p>
                    <p className="text-3xl font-extrabold text-teal-300">
                        GHS {grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })}
                    </p>
                </div>

                <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-5">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">
                        This Month — {currentMonth?.label}
                    </p>
                    <p className="text-3xl font-extrabold text-indigo-300">
                        GHS {(currentMonth?.total ?? 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })}
                    </p>
                    {growth !== null && (
                        <p className={`text-xs font-bold mt-1 ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs last month
                        </p>
                    )}
                </div>

                <div className="bg-purple-950 border border-purple-800 rounded-2xl p-5">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">
                        Best Month
                    </p>
                    {(() => {
                        const best = [...monthly].sort((a, b) => b.total - a.total)[0]
                        return (
                            <>
                                <p className="text-3xl font-extrabold text-purple-300">
                                    GHS {(best?.total ?? 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                                })}
                                </p>
                                <p className="text-xs text-purple-700 mt-1">{best?.label}</p>
                            </>
                        )
                    })()}
                </div>

            </div>

            {/* Monthly bar chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-sm mb-5">
                    Monthly Revenue — Last 12 Months
                </h2>

                <div className="flex items-end gap-2 h-40">
                    {monthly.map(m => {
                        const pct = Math.max(4, Math.round((m.total / maxMonthly) * 100))
                        const isCurrent = m.month === monthly[monthly.length - 1].month
                        return (
                            <div key={m.month}
                                 className="flex-1 flex flex-col items-center gap-1.5 group">
                                <div className="w-full flex flex-col justify-end"
                                     style={{ height: '120px' }}>
                                    <div
                                        title={`${m.label}: GHS ${m.total.toLocaleString()}`}
                                        className={`w-full rounded-t-lg transition-all duration-300
                                ${isCurrent
                                            ? 'bg-teal-500'
                                            : 'bg-slate-700 group-hover:bg-teal-700'
                                        }`}
                                        style={{ height: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-600 whitespace-nowrap">
                  {m.label}
                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* By formula */}
            {byFormula.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-white font-bold text-sm mb-5">
                        Revenue by Plan
                    </h2>
                    <div className="flex flex-col gap-3">
                        {byFormula.map(f => {
                            const pct = grandTotal > 0
                                ? Math.round((f.total / grandTotal) * 100) : 0
                            return (
                                <div key={f.key} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-teal-400 w-8">
                        {f.key}
                      </span>
                                            <span className="text-slate-300 font-semibold">{f.name}</span>
                                            <span className="text-slate-600">
                        ({f.count} sale{f.count !== 1 ? 's' : ''})
                      </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500">{pct}%</span>
                                            <span className="text-white font-bold">
                        GHS {f.total.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                      </span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-600 rounded-full
                                 transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty */}
            {byFormula.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl
                        p-12 text-center">
                    <p className="text-slate-600 text-sm">
                        No revenue data yet. Payments will appear here once processed.
                    </p>
                </div>
            )}

        </div>
    )
}