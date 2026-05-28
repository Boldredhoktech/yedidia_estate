// components/kwaku/SubscriptionsManager.tsx

'use client'

import { useState, useEffect } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Formula {
    id:                string
    formula_key:       string
    name:              string
    pub_count:         number
    pub_duration_days: number
    validity_days:     number
    price_ghs:         number
}

interface AgentResult {
    id:             string
    full_name:      string
    email:          string
    phone_call:     string | null
    phone_whatsapp: string | null
}

interface HistoryEntry {
    id:         string
    amount:     number
    currency:   string
    status:     string
    notes:      string | null
    created_at: string
    agent:      { full_name: string; email: string } | null
    formula:    { formula_key: string; name: string } | null
}

interface Props {
    formulas: Formula[]
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function SubscriptionsManager({ formulas }: Props) {

    // ── Form state ──
    const [searchQuery,     setSearchQuery]     = useState('')
    const [searchResults,   setSearchResults]   = useState<AgentResult[]>([])
    const [searchLoading,   setSearchLoading]   = useState(false)
    const [selectedAgent,   setSelectedAgent]   = useState<AgentResult | null>(null)
    const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null)
    const [amount,          setAmount]          = useState('')
    const [notes,           setNotes]           = useState('')
    const [loading,         setLoading]         = useState(false)
    const [error,           setError]           = useState<string | null>(null)
    const [successMsg,      setSuccessMsg]      = useState<string | null>(null)

    // ── History ──
    const [history,        setHistory]        = useState<HistoryEntry[]>([])
    const [historyLoading, setHistoryLoading] = useState(true)

    useEffect(() => { loadHistory() }, [])

    // Debounced agent search
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(() => doSearch(searchQuery.trim()), 380)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Pre-fill amount when formula changes
    useEffect(() => {
        if (selectedFormula) setAmount(selectedFormula.price_ghs.toString())
    }, [selectedFormula])

    // ── Data fetchers ──

    async function loadHistory() {
        setHistoryLoading(true)
        try {
            const res  = await fetch('/api/kwaku/subscriptions')
            const data = await res.json()
            setHistory(data.history ?? [])
        } catch { /* silent */ }
        finally { setHistoryLoading(false) }
    }

    async function doSearch(q: string) {
        setSearchLoading(true)
        try {
            const res  = await fetch(`/api/kwaku/subscriptions?q=${encodeURIComponent(q)}`)
            const data = await res.json()
            setSearchResults(data.agents ?? [])
        } catch { setSearchResults([]) }
        finally { setSearchLoading(false) }
    }

    // ── Actions ──

    function selectAgent(agent: AgentResult) {
        setSelectedAgent(agent)
        setSearchQuery('')
        setSearchResults([])
        setSelectedFormula(null)
        setAmount('')
        setError(null)
        setSuccessMsg(null)
    }

    function resetAll() {
        setSelectedAgent(null)
        setSelectedFormula(null)
        setSearchQuery('')
        setSearchResults([])
        setAmount('')
        setNotes('')
        setError(null)
        setSuccessMsg(null)
    }

    async function handleActivate() {
        if (!selectedAgent || !selectedFormula) return

        const amountNum = parseFloat(amount)
        if (isNaN(amountNum) || amountNum < 0) {
            setError('Please enter a valid amount.')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res  = await fetch('/api/kwaku/subscriptions', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    agentId:         selectedAgent.id,
                    formulaId:       selectedFormula.id,
                    amountConfirmed: amountNum,
                    notes:           notes.trim() || undefined,
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error ?? 'Activation failed.')
                return
            }

            setSuccessMsg(
                `Subscription activated for ${selectedAgent.full_name} — ` +
                `${selectedFormula.formula_key} ${selectedFormula.name}. ` +
                `Receipt sent to ${selectedAgent.email}.`
            )
            await loadHistory()

        } catch {
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-8">

            {/* ── ACTIVATION FORM ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                <div className="px-6 py-4 border-b border-gray-800 flex items-center
                                justify-between">
                    <div>
                        <h2 className="text-white font-bold text-base">Activate a Subscription</h2>
                        <p className="text-gray-500 text-xs mt-0.5">
                            For agents who paid by cash or mobile money
                        </p>
                    </div>
                    {(selectedAgent || successMsg) && (
                        <button
                            onClick={resetAll}
                            className="text-xs font-bold text-gray-500 hover:text-gray-300
                                       transition-colors duration-150"
                        >
                            Start over
                        </button>
                    )}
                </div>

                <div className="p-6 flex flex-col gap-6">

                    {/* ── SUCCESS ── */}
                    {successMsg && (
                        <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-5
                                        flex flex-col gap-3">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center
                                                justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-emerald-400" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M4.5 12.75l6 6 9-13.5"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-bold text-emerald-300 text-sm">
                                        Subscription activated successfully
                                    </p>
                                    <p className="text-emerald-600 text-xs mt-1">{successMsg}</p>
                                </div>
                            </div>
                            <button
                                onClick={resetAll}
                                className="self-start bg-emerald-800 hover:bg-emerald-700
                                           text-emerald-200 font-bold text-xs px-4 py-2
                                           rounded-xl transition-colors duration-150"
                            >
                                Activate another →
                            </button>
                        </div>
                    )}

                    {!successMsg && (
                        <>
                            {/* ── STEP 1: AGENT SEARCH ── */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-gray-300">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-indigo-700 flex items-center
                                                         justify-center text-white text-xs font-extrabold">1</span>
                                        Search Agent
                                    </span>
                                </label>

                                {selectedAgent ? (
                                    /* Selected agent card */
                                    <div className="bg-indigo-950 border border-indigo-700 rounded-xl p-4
                                                    flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-800 flex items-center
                                                            justify-center flex-shrink-0">
                                                <span className="text-indigo-300 font-bold text-sm">
                                                    {selectedAgent.full_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">
                                                    {selectedAgent.full_name}
                                                </p>
                                                <p className="text-indigo-400 text-xs">
                                                    {selectedAgent.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedAgent(null)
                                                setSelectedFormula(null)
                                                setAmount('')
                                                setError(null)
                                            }}
                                            className="text-gray-600 hover:text-gray-300 transition-colors"
                                            title="Change agent"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M6 18L18 6M6 6l12 12"/>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    /* Search input + results */
                                    <div className="relative">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                                                            text-gray-500" fill="none" viewBox="0 0 24 24"
                                                 stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196
                                                         a7.5 7.5 0 0010.607 10.607z"/>
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Type agent name or email…"
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl
                                                           pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500
                                                           focus:outline-none focus:border-indigo-600
                                                           focus:ring-1 focus:ring-indigo-600 transition-colors"
                                            />
                                            {searchLoading && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-indigo-500
                                                                    border-t-transparent rounded-full animate-spin"/>
                                                </div>
                                            )}
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-gray-800 border
                                                            border-gray-700 rounded-xl overflow-hidden shadow-xl">
                                                {searchResults.map(agent => (
                                                    <button
                                                        key={agent.id}
                                                        onClick={() => selectAgent(agent)}
                                                        className="w-full flex items-center gap-3 px-4 py-3
                                                                   hover:bg-gray-700 transition-colors text-left
                                                                   border-b border-gray-700 last:border-b-0"
                                                    >
                                                        <div className="w-8 h-8 rounded-full bg-indigo-900 flex
                                                                        items-center justify-center flex-shrink-0">
                                                            <span className="text-indigo-300 font-bold text-xs">
                                                                {agent.full_name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-white truncate">
                                                                {agent.full_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {agent.email}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {searchQuery.trim().length >= 2 && !searchLoading &&
                                         searchResults.length === 0 && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                No active agents found for &ldquo;{searchQuery}&rdquo;.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ── STEP 2: FORMULA SELECTION ── */}
                            {selectedAgent && (
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-bold text-gray-300">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-indigo-700 flex items-center
                                                             justify-center text-white text-xs font-extrabold">2</span>
                                            Select Formula
                                        </span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {formulas.map(f => {
                                            const isSelected = selectedFormula?.id === f.id
                                            const isFree     = f.formula_key === 'FREE'
                                            return (
                                                <button
                                                    key={f.id}
                                                    onClick={() => setSelectedFormula(f)}
                                                    className={`rounded-xl border p-4 text-left transition-all
                                                                duration-150 flex flex-col gap-2
                                                                ${isSelected
                                                        ? 'border-indigo-500 bg-indigo-950'
                                                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-xs font-extrabold px-2 py-0.5
                                                                          rounded-full
                                                                          ${isSelected
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-700 text-gray-300'
                                                        }`}>
                                                            {f.formula_key}
                                                        </span>
                                                        {isSelected && (
                                                            <svg className="w-4 h-4 text-indigo-400" fill="none"
                                                                 viewBox="0 0 24 24" stroke="currentColor"
                                                                 strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                                      d="M4.5 12.75l6 6 9-13.5"/>
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <p className="text-white font-bold text-sm">{f.name}</p>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-gray-500 text-xs">
                                                            {f.pub_count} pubs × {f.pub_duration_days}d
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            Valid {f.validity_days} days
                                                        </p>
                                                        <p className={`text-xs font-bold mt-1
                                                                       ${isFree ? 'text-emerald-400' : 'text-indigo-300'}`}>
                                                            {isFree ? 'Free' : `GHS ${f.price_ghs.toFixed(2)}`}
                                                        </p>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── STEP 3: CONFIRM & ACTIVATE ── */}
                            {selectedAgent && selectedFormula && (
                                <div className="flex flex-col gap-4">
                                    <label className="text-sm font-bold text-gray-300">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-full bg-indigo-700 flex items-center
                                                             justify-center text-white text-xs font-extrabold">3</span>
                                            Confirm Payment Received
                                        </span>
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Amount */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-gray-400">
                                                Amount received (GHS) *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2
                                                                 text-gray-500 text-sm font-bold">GHS</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={amount}
                                                    onChange={e => setAmount(e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl
                                                               pl-12 pr-4 py-3 text-sm text-white
                                                               focus:outline-none focus:border-indigo-600
                                                               focus:ring-1 focus:ring-indigo-600 transition-colors"
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-gray-400">
                                                Notes (optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder="e.g. Paid via MTN MoMo, ref #1234"
                                                maxLength={500}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-xl
                                                           px-4 py-3 text-sm text-white placeholder-gray-500
                                                           focus:outline-none focus:border-indigo-600
                                                           focus:ring-1 focus:ring-indigo-600 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Summary recap */}
                                    <div className="bg-gray-800 rounded-xl p-4 text-xs flex flex-col gap-2">
                                        <p className="text-gray-400 font-bold uppercase tracking-wide mb-1">
                                            Summary
                                        </p>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Agent</span>
                                            <span className="text-white font-semibold">
                                                {selectedAgent.full_name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Formula</span>
                                            <span className="text-white font-semibold">
                                                {selectedFormula.formula_key} — {selectedFormula.name}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Publications</span>
                                            <span className="text-white font-semibold">
                                                {selectedFormula.pub_count} × {selectedFormula.pub_duration_days} days
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Validity</span>
                                            <span className="text-white font-semibold">
                                                {selectedFormula.validity_days} days from today
                                            </span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-950 border border-red-800 rounded-xl
                                                        px-4 py-3 text-sm text-red-400 font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleActivate}
                                        disabled={loading || !amount}
                                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
                                                   disabled:cursor-not-allowed text-white font-bold text-sm
                                                   px-6 py-3.5 rounded-xl transition-all duration-150
                                                   active:scale-95 flex items-center justify-center gap-2
                                                   self-start"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/40
                                                                border-t-white rounded-full animate-spin"/>
                                                Activating…
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                                     stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                                Activate Subscription
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── RECENT ACTIVATIONS HISTORY ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-white font-bold text-base">Recent Manual Activations</h2>
                    <button
                        onClick={loadHistory}
                        className="text-xs font-bold text-gray-500 hover:text-gray-300
                                   transition-colors duration-150"
                    >
                        Refresh
                    </button>
                </div>

                {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent
                                        rounded-full animate-spin"/>
                    </div>
                ) : history.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-600 text-sm">No manual activations yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/60">
                                {['Agent', 'Formula', 'Amount', 'Status', 'Notes', 'Date'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-bold
                                                           text-gray-500 uppercase tracking-wide
                                                           whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                            {history.map(row => (
                                <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <p className="text-white font-semibold text-sm">
                                            {row.agent?.full_name ?? '—'}
                                        </p>
                                        <p className="text-gray-500 text-xs">{row.agent?.email ?? '—'}</p>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <span className="text-xs font-extrabold bg-indigo-900
                                                         text-indigo-300 px-2 py-1 rounded-full">
                                            {row.formula?.formula_key ?? '—'}
                                        </span>
                                        <span className="text-gray-400 text-xs ml-2">
                                            {row.formula?.name ?? ''}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap font-bold text-white">
                                        {row.currency} {Number(row.amount).toFixed(2)}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                                          ${row.status === 'success'
                                            ? 'bg-emerald-900 text-emerald-400'
                                            : 'bg-red-950 text-red-400'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs max-w-[180px]">
                                        <span className="truncate block">{row.notes ?? '—'}</span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                                        {new Date(row.created_at).toLocaleDateString('en-GH', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    )
}
