// components/agents/FormulaCards.tsx

'use client'

import { useState }   from 'react'
import type { Formula } from '@/app/agents/billing/page'

interface FormulaCardsProps {
    formulas: Formula[]
    agentId:  string
}

const HIGHLIGHTS: Record<string, string> = {
    F3: 'Most Popular',
    F5: 'Best Value',
    F6: 'Premium',
}

export default function FormulaCards({ formulas, agentId }: FormulaCardsProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [errMsg,    setErrMsg]    = useState<string | null>(null)

    async function handleBuy(formula: Formula) {
        setLoadingId(formula.id)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/agents/billing/paystack', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ formulaId: formula.id, agentId }),
            })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Payment initialisation failed. Please try again.')
                setLoadingId(null)
                return
            }

            // Redirect to Paystack checkout
            window.location.href = json.authorizationUrl

        } catch {
            setErrMsg('Network error. Please check your connection.')
            setLoadingId(null)
        }
    }

    if (formulas.length === 0) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                <p className="text-gray-500 text-sm">No plans available at the moment.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">

            {errMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">{errMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {formulas.map(formula => {
                    const highlight = HIGHLIGHTS[formula.formula_key]
                    const isLoading = loadingId === formula.id
                    const months    = Math.round(formula.validity_days / 30)
                    const pubMonths = Math.round(formula.pub_duration_days / 30)

                    return (
                        <div
                            key={formula.id}
                            className={`relative bg-white rounded-2xl border-2 p-5 flex flex-col
                          gap-4 shadow-sm transition-shadow duration-200 hover:shadow-md
                          ${highlight
                                ? 'border-brand-400'
                                : 'border-gray-200'
                            }`}
                        >
                            {/* Highlight badge */}
                            {highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-500 text-white text-xs font-bold
                                   px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                    {highlight}
                  </span>
                                </div>
                            )}

                            {/* Plan name + key */}
                            <div className="flex items-center justify-between">
                                <div>
                  <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                    {formula.formula_key}
                  </span>
                                    <h3 className="font-extrabold text-gray-900 text-lg leading-none mt-0.5">
                                        {formula.name}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center
                                justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125
                             1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25
                             m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504
                             -1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621
                             0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                                    </svg>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="border-t border-b border-gray-100 py-3">
                                <p className="text-3xl font-extrabold text-gray-900">
                                    GHS {formula.price_ghs.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">one-time payment</p>
                            </div>

                            {/* Features */}
                            <ul className="flex flex-col gap-2">
                                <FeatureRow
                                    icon="📋"
                                    text={`${formula.pub_count} publications`}
                                />
                                <FeatureRow
                                    icon="📅"
                                    text={`${pubMonths} month${pubMonths !== 1 ? 's' : ''} per listing`}
                                />
                                <FeatureRow
                                    icon="⏳"
                                    text={`Valid for ${months} month${months !== 1 ? 's' : ''}`}
                                />
                            </ul>

                            {/* CTA */}
                            <button
                                onClick={() => handleBuy(formula)}
                                disabled={!!loadingId}
                                className={`w-full flex items-center justify-center gap-2
                            font-bold text-sm py-3 rounded-xl
                            transition-all duration-200 active:scale-[0.98]
                            disabled:opacity-60
                            ${highlight
                                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                    stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                        Processing…
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                             stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75
                               4.5h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75
                               a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/>
                                        </svg>
                                        Subscribe — GHS {formula.price_ghs.toLocaleString()}
                                    </>
                                )}
                            </button>

                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
    return (
        <li className="flex items-center gap-2 text-sm text-gray-700">
            <span className="flex-shrink-0">{icon}</span>
            {text}
        </li>
    )
}