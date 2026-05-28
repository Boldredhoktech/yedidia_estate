// components/opoku/FormulaPricingManager.tsx

'use client'

import { useState, useEffect } from 'react'
import { siteConfig }          from '@/config/siteconfig'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Formula {
    id:               string
    formula_key:      string
    name:             string
    pub_count:        number
    pub_duration_days:number
    validity_days:    number
    price_ghs:        number
    is_active:        boolean
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function FormulaPricingManager() {
    const [formulas,   setFormulas]   = useState<Formula[]>([])
    const [loading,    setLoading]    = useState(true)
    const [savingId,   setSavingId]   = useState<string | null>(null)
    const [prices,     setPrices]     = useState<Record<string, string>>({})
    const [dirtyIds,   setDirtyIds]   = useState<Set<string>>(new Set())
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // ── Fetch formulas ──
    useEffect(() => {
        async function fetchFormulas() {
            try {
                const res  = await fetch('/api/opoku/formulas')
                const json = await res.json()
                if (res.ok) {
                    setFormulas(json.formulas ?? [])
                    const initial: Record<string, string> = {}
                    for (const f of (json.formulas ?? [])) {
                        initial[f.id] = String(f.price_ghs)
                    }
                    setPrices(initial)
                }
            } catch {
                setErrMsg('Failed to load formulas.')
            } finally {
                setLoading(false)
            }
        }
        fetchFormulas()
    }, [])

    // ── Price input change ──
    function handlePriceChange(id: string, value: string) {
        setPrices(prev => ({ ...prev, [id]: value }))
        setDirtyIds(prev => new Set([...prev, id]))
    }

    // ── Save price ──
    async function handleSavePrice(formula: Formula) {
        const raw   = prices[formula.id] ?? ''
        const price = parseFloat(raw)

        if (isNaN(price) || price < 0) {
            setErrMsg('Please enter a valid price (0 or greater).')
            return
        }

        setSavingId(formula.id)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/opoku/formulas', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: formula.id, price_ghs: price }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Save failed.'); return }

            setFormulas(prev => prev.map(f =>
                f.id !== formula.id ? f : { ...f, price_ghs: price }
            ))
            setDirtyIds(prev => {
                const next = new Set(prev)
                next.delete(formula.id)
                return next
            })
            showSuccess(`${formula.name} price updated to GHS ${price.toFixed(2)}`)

        } catch {
            setErrMsg('Network error. Please try again.')
        } finally {
            setSavingId(null)
        }
    }

    // ── Toggle active ──
    async function handleToggle(formula: Formula) {
        setSavingId(formula.id)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/opoku/formulas', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: formula.id, is_active: !formula.is_active }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Toggle failed.'); return }

            setFormulas(prev => prev.map(f =>
                f.id !== formula.id ? f : { ...f, is_active: !f.is_active }
            ))
            showSuccess(`${formula.name} ${!formula.is_active ? 'activated' : 'deactivated'}.`)

        } catch {
            setErrMsg('Network error.')
        } finally {
            setSavingId(null)
        }
    }

    function showSuccess(msg: string) {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(null), 3000)
    }

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {[1,2,3,4,5,6,7].map(i => (
                    <div key={i}
                         className="bg-gray-900 border border-gray-800 rounded-2xl
                          h-24 animate-pulse" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Feedback */}
            {errMsg     && <FB type="error"   msg={errMsg}     />}
            {successMsg && <FB type="success" msg={successMsg} />}

            {/* Formulas */}
            <div className="flex flex-col gap-4">
                {formulas.map(formula => {
                    const isDirty    = dirtyIds.has(formula.id)
                    const isSaving   = savingId === formula.id
                    const isFree     = formula.formula_key === 'FREE'
                    const months     = Math.round(formula.validity_days / 30)
                    const pubMonths  = Math.round(formula.pub_duration_days / 30)

                    // Find matching config entry for display
                    const configEntry = siteConfig.formulas.find(
                        f => f.key === formula.formula_key
                    )

                    return (
                        <div
                            key={formula.id}
                            className={`bg-gray-900 border rounded-2xl p-5 transition-all duration-200
                          ${!formula.is_active
                                ? 'border-gray-800 opacity-60'
                                : 'border-gray-700'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row gap-5">

                                {/* Left — formula info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-extrabold text-yellow-500
                                     uppercase tracking-widest">
                      {formula.formula_key}
                    </span>
                                        <h3 className="font-extrabold text-white text-base">
                                            {formula.name}
                                        </h3>
                                        {isFree && (
                                            <span className="text-xs bg-gray-800 text-gray-500
                                       px-2 py-0.5 rounded-full font-bold">
                        Auto-assigned
                      </span>
                                        )}
                                        {!formula.is_active && (
                                            <span className="text-xs bg-red-950 text-red-500
                                       px-2 py-0.5 rounded-full font-bold">
                        Inactive
                      </span>
                                        )}
                                    </div>

                                    {/* Specs grid */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <SpecPill
                                            label="Publications"
                                            value={String(formula.pub_count)}
                                            icon="📋"
                                        />
                                        <SpecPill
                                            label="Per listing"
                                            value={`${pubMonths}mo`}
                                            icon="📅"
                                        />
                                        <SpecPill
                                            label="Validity"
                                            value={`${months}mo`}
                                            icon="⏳"
                                        />
                                    </div>
                                </div>

                                {/* Right — price editor */}
                                <div className="flex flex-col gap-3 min-w-[200px]">

                                    {isFree ? (
                                        /* FREE offer — price always 0, read only */
                                        <div className="bg-gray-800 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Price</p>
                                            <p className="text-xl font-extrabold text-gray-400">
                                                FREE
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Cannot be changed
                                            </p>
                                        </div>
                                    ) : (
                                        /* Paid formula — editable price */
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-gray-400">
                                                Price (GHS)
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2
                                           text-gray-500 text-sm font-bold">
                            GHS
                          </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={prices[formula.id] ?? ''}
                                                        onChange={e => handlePriceChange(formula.id, e.target.value)}
                                                        className="w-full bg-gray-800 border border-gray-700
                                       text-white text-sm font-bold rounded-xl
                                       pl-12 pr-3 py-2.5
                                       focus:outline-none focus:ring-2
                                       focus:ring-yellow-600 focus:border-yellow-600
                                       hover:border-gray-600
                                       transition-colors duration-150
                                       [appearance:textfield]
                                       [&::-webkit-outer-spin-button]:appearance-none
                                       [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                </div>

                                                {isDirty && (
                                                    <button
                                                        onClick={() => handleSavePrice(formula)}
                                                        disabled={isSaving}
                                                        className="flex-shrink-0 bg-yellow-600 hover:bg-yellow-500
                                       disabled:bg-yellow-900 text-black font-extrabold
                                       text-xs px-3 py-2 rounded-xl
                                       transition-colors duration-150"
                                                    >
                                                        {isSaving ? '…' : 'Save'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Current saved price */}
                                            <p className="text-xs text-gray-600">
                                                Current:{' '}
                                                <span className="text-gray-400 font-bold">
                          GHS {formula.price_ghs.toFixed(2)}
                        </span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Toggle active */}
                                    {!isFree && (
                                        <button
                                            onClick={() => handleToggle(formula)}
                                            disabled={isSaving}
                                            className={`w-full text-xs font-bold py-2 rounded-xl
                                  transition-colors duration-150 disabled:opacity-50
                                  ${formula.is_active
                                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                                                : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-300'
                                            }`}
                                        >
                                            {isSaving ? '…'
                                                : formula.is_active ? 'Deactivate plan' : 'Activate plan'
                                            }
                                        </button>
                                    )}

                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Note */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="text-gray-400 font-bold">Note: </span>
                    Price changes take effect immediately and are visible to agents on the
                    billing page. Existing active subscriptions are not affected by price
                    changes. Deactivating a plan hides it from agents but does not cancel
                    existing subscriptions.
                </p>
            </div>

        </div>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function SpecPill({ label, value, icon }: {
    label: string; value: string; icon: string
}) {
    return (
        <div className="bg-gray-800 rounded-xl p-2.5 text-center">
            <p className="text-xs text-gray-500 mb-0.5">{icon} {label}</p>
            <p className="text-sm font-extrabold text-white">{value}</p>
        </div>
    )
}

function FB({ type, msg }: { type: 'error' | 'success'; msg: string }) {
    return (
        <div className={`rounded-xl p-3 border text-sm font-medium
                     ${type === 'error'
            ? 'bg-red-950 border-red-800 text-red-400'
            : 'bg-emerald-950 border-emerald-800 text-emerald-400'
        }`}>
            {msg}
        </div>
    )
}