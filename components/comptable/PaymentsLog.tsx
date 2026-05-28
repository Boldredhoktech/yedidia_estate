// components/comptable/PaymentsLog.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Payment {
    id:           string
    amount:       number
    currency:     string
    status:       string
    method:       string
    paystack_ref: string | null
    receipt_sent: boolean
    created_at:   string
    notes:        string | null
    agent: { id: string; full_name: string; email: string }
    formula: { name: string; formula_key: string }
}

interface FetchResult {
    payments:     Payment[]
    total:        number
    page:         number
    pages:        number
    successTotal: number
}

const STATUS_STYLES: Record<string, string> = {
    success:  'bg-emerald-900 text-emerald-400',
    pending:  'bg-amber-900   text-amber-400',
    failed:   'bg-red-950     text-red-400',
    refunded: 'bg-slate-800   text-slate-400',
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function PaymentsLog() {
    const [result,  setResult]  = useState<FetchResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [errMsg,  setErrMsg]  = useState('')

    // Filters
    const [status, setStatus]   = useState('')
    const [method, setMethod]   = useState('')
    const [from,   setFrom]     = useState('')
    const [to,     setTo]       = useState('')
    const [page,   setPage]     = useState(1)

    const fetchPayments = useCallback(async () => {
        setLoading(true)
        setErrMsg('')
        try {
            const params = new URLSearchParams()
            if (status) params.set('status', status)
            if (method) params.set('method', method)
            if (from)   params.set('from',   from)
            if (to)     params.set('to',     to)
            params.set('page', String(page))

            const res  = await fetch(`/api/comptable/payments?${params.toString()}`)
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Failed to load.'); return }
            setResult(json)
        } catch {
            setErrMsg('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [status, method, from, to, page])

    useEffect(() => { fetchPayments() }, [fetchPayments])

    function handleFilterChange() {
        setPage(1)
    }

    return (
        <div className="flex flex-col gap-5">

            {/* ── Filter bar ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4
                      flex flex-wrap gap-3 items-end">

                <div className="flex flex-col gap-1">
                    <label className={lbl}>Status</label>
                    <select value={status}
                            onChange={e => { setStatus(e.target.value); handleFilterChange() }}
                            className={sel}>
                        <option value="">All</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className={lbl}>Method</label>
                    <select value={method}
                            onChange={e => { setMethod(e.target.value); handleFilterChange() }}
                            className={sel}>
                        <option value="">All</option>
                        <option value="paystack">Paystack</option>
                        <option value="manual">Manual</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className={lbl}>From</label>
                    <input type="date" value={from}
                           onChange={e => { setFrom(e.target.value); handleFilterChange() }}
                           className={sel} />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={lbl}>To</label>
                    <input type="date" value={to}
                           onChange={e => { setTo(e.target.value); handleFilterChange() }}
                           className={sel} />
                </div>

                {(status || method || from || to) && (
                    <button
                        onClick={() => {
                            setStatus(''); setMethod(''); setFrom(''); setTo('')
                            setPage(1)
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-300
                       bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl
                       transition-colors self-end"
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* ── Success total for current filter ── */}
            {result && (
                <div className="bg-teal-950 border border-teal-800 rounded-xl px-4 py-3
                        flex items-center justify-between">
                    <p className="text-xs font-bold text-teal-500 uppercase tracking-wide">
                        Revenue (filtered)
                    </p>
                    <p className="text-teal-300 font-extrabold text-lg">
                        GHS {result.successTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                    })}
                    </p>
                </div>
            )}

            {/* ── Error ── */}
            {errMsg && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-sm text-red-400 font-medium">{errMsg}</p>
                </div>
            )}

            {/* ── Table ── */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

                {/* Result count */}
                <div className="px-5 py-3 border-b border-slate-800 flex items-center
                        justify-between">
                    <p className="text-xs text-slate-500 font-medium">
                        {loading ? 'Loading…'
                            : `${result?.total ?? 0} payment${result?.total !== 1 ? 's' : ''} found`
                        }
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-slate-800 bg-slate-950">
                            {['Date', 'Agent', 'Plan', 'Amount', 'Method', 'Status', 'Receipt', 'Ref'].map(h => (
                                <th key={h}
                                    className="px-4 py-3 text-left text-xs font-bold text-slate-500
                                 uppercase tracking-wide whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center">
                                    <div className="flex justify-center">
                                        <svg className="w-6 h-6 text-teal-500 animate-spin"
                                             fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                    stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        ) : result?.payments.length === 0 ? (
                            <tr>
                                <td colSpan={8}
                                    className="px-4 py-12 text-center text-slate-600 text-sm">
                                    No payments match your filters.
                                </td>
                            </tr>
                        ) : result?.payments.map(p => (
                            <tr key={p.id}
                                className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                                    {new Date(p.created_at).toLocaleDateString('en-GH', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                    <br />
                                    <span className="text-slate-600">
                      {new Date(p.created_at).toLocaleTimeString('en-GH', {
                          hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <p className="text-white font-semibold text-xs">{p.agent.full_name}</p>
                                    <p className="text-slate-600 text-xs">{p.agent.email}</p>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-extrabold text-teal-400">
                      {p.formula.formula_key}
                    </span>
                                    <span className="text-slate-500 text-xs ml-1">{p.formula.name}</span>
                                </td>
                                <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                                    {p.currency}{' '}
                                    {p.amount.toLocaleString(undefined, {
                                        minimumFractionDigits: 2, maximumFractionDigits: 2,
                                    })}
                                </td>
                                <td className="px-4 py-3 text-slate-400 text-xs capitalize whitespace-nowrap">
                                    {p.method}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                      capitalize
                                      ${STATUS_STYLES[p.status] ?? 'bg-slate-800 text-slate-400'}`}>
                      {p.status}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {p.receipt_sent ? (
                                        <span className="text-emerald-500 text-xs">✓</span>
                                    ) : (
                                        <span className="text-slate-700 text-xs">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-600 text-xs font-mono
                                 whitespace-nowrap max-w-[100px] truncate">
                                    {p.paystack_ref ?? '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {result && result.pages > 1 && (
                    <div className="px-5 py-4 border-t border-slate-800 flex items-center
                          justify-between gap-3">
                        <p className="text-xs text-slate-600">
                            Page {result.page} of {result.pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={result.page <= 1}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl
                           bg-slate-800 hover:bg-slate-700 text-slate-400
                           disabled:opacity-40 transition-colors"
                            >
                                ← Prev
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(result.pages, p + 1))}
                                disabled={result.page >= result.pages}
                                className="text-xs font-bold px-3 py-1.5 rounded-xl
                           bg-slate-800 hover:bg-slate-700 text-slate-400
                           disabled:opacity-40 transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}

const lbl = 'text-xs font-bold text-slate-500 uppercase tracking-wide'
const sel = `
  bg-slate-800 border border-slate-700 text-slate-200 text-xs
  rounded-xl px-3 py-2 focus:outline-none focus:ring-2
  focus:ring-teal-500 focus:border-teal-500
  hover:border-slate-600 transition-colors
`