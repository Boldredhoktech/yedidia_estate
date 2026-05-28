// components/agents/ListingsTable.tsx

'use client'

import { useState }     from 'react'
import Image            from 'next/image'
import Link             from 'next/link'
import type { AgentListing } from '@/app/agents/my-listings/page'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    active:    'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100   text-amber-700',
    draft:     'bg-gray-100    text-gray-500',
    expired:   'bg-red-100     text-red-600',
    withdrawn: 'bg-gray-100    text-gray-400',
    archived:  'bg-gray-100    text-gray-400',
}

const TYPE_LABELS: Record<string, string> = {
    parcelle:        'Parcel',
    maison_vente:    'For Sale',
    maison_location: 'For Rent',
    airbnb:          'Airbnb',
}

function daysLeft(expiresAt: string | null): string {
    if (!expiresAt) return '—'
    const diff = Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diff < 0)  return 'Expired'
    if (diff === 0) return 'Today'
    return `${diff}d left`
}

function daysLeftColor(expiresAt: string | null): string {
    if (!expiresAt) return 'text-gray-400'
    const diff = Math.ceil(
        (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (diff < 0)   return 'text-red-500'
    if (diff <= 7)  return 'text-orange-500 font-bold'
    return 'text-gray-600'
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function ListingsTable({ listings }: { listings: AgentListing[] }) {
    const [withdrawingId, setWithdrawingId] = useState<string | null>(null)
    const [withdrawn,     setWithdrawn]     = useState<Set<string>>(new Set())
    const [errMsg,        setErrMsg]        = useState<string | null>(null)

    async function handleWithdraw(id: string, title: string) {
        if (!confirm(`Withdraw "${title}" from the platform? This cannot be undone.`)) return

        setWithdrawingId(id)
        setErrMsg(null)

        try {
            const res  = await fetch(`/api/agents/listings/${id}/withdraw`, { method: 'PATCH' })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Failed to withdraw listing.')
            } else {
                setWithdrawn(prev => new Set([...prev, id]))
            }
        } catch {
            setErrMsg('Network error. Please try again.')
        } finally {
            setWithdrawingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-3">

            {/* Error */}
            {errMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">{errMsg}</p>
                </div>
            )}

            {/* Card-based list — better on mobile */}
            <div className="flex flex-col gap-3">
                {listings.map(listing => {
                    const isWithdrawn = withdrawn.has(listing.id)
                    const effectiveStatus = isWithdrawn ? 'withdrawn' : listing.status
                    const firstMedia = listing.media[0] ?? null
                    const isParcel   = listing.type === 'parcelle'
                    const canWithdraw = ['active', 'pending'].includes(effectiveStatus)

                    return (
                        <div key={listing.id}
                             className={`bg-white border rounded-2xl overflow-hidden shadow-sm
                             transition-opacity duration-300
                             ${isWithdrawn ? 'opacity-50' : 'border-gray-200'}`}>
                            <div className="flex flex-col sm:flex-row gap-0">

                                {/* Thumbnail */}
                                <div className="relative w-full sm:w-32 h-32 sm:h-auto
                                flex-shrink-0 bg-gray-100">
                                    {firstMedia ? (
                                        isParcel ? (
                                            <div className="w-full h-full flex items-center justify-center
                                      bg-gray-800">
                                                <svg className="w-8 h-8 text-white opacity-60"
                                                     fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z"/>
                                                </svg>
                                            </div>
                                        ) : (
                                            <Image
                                                src={firstMedia.storage_url}
                                                alt={listing.title}
                                                fill
                                                className="object-cover"
                                                sizes="128px"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-300" fill="none"
                                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159
                                 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909
                                 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0
                                 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">

                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm leading-snug
                                     truncate">
                                                {listing.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                ID: {listing.id.slice(0, 12)}…
                                            </p>
                                        </div>
                                        <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1
                                      rounded-full capitalize
                                      ${STATUS_STYLES[effectiveStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {effectiveStatus}
                    </span>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-brand-400" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0
                                 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5
                                 7.5 0 1115 0z"/>
                      </svg>
                        {listing.neighborhood}, {listing.city}
                    </span>
                                        <span className="font-bold text-brand-600">
                      GHS {listing.price.toLocaleString()}
                                            {listing.price_label ? ` ${listing.price_label}` : ''}
                    </span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[listing.type] ?? listing.type}
                    </span>
                                    </div>

                                    {/* Stats + expiry row */}
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        <StatPill icon="👁" label="Views"    value={listing.view_count} />
                                        <StatPill icon="💬" label="WhatsApp" value={listing.whatsapp_clicks} />
                                        <StatPill icon="📞" label="Calls"    value={listing.call_clicks} />
                                        <span className={`flex items-center gap-1 font-medium
                                      ${daysLeftColor(listing.expires_at)}`}>
                      🕐 {daysLeft(listing.expires_at)}
                    </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">

                                        {/* View on site — only if active */}
                                        {effectiveStatus === 'active' && (
                                            <Link
                                                href={`/property/${listing.id}`}
                                                target="_blank"
                                                className="flex items-center gap-1.5 text-xs font-semibold
                                   text-brand-600 hover:text-brand-800 transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                                     stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0
                                   005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21
                                   3m0 0h-5.25M21 3v5.25"/>
                                                </svg>
                                                View on site
                                            </Link>
                                        )}

                                        <div className="flex-1" />

                                        {/* Withdraw button */}
                                        {canWithdraw && !isWithdrawn && (
                                            <button
                                                onClick={() => handleWithdraw(listing.id, listing.title)}
                                                disabled={withdrawingId === listing.id}
                                                className="flex items-center gap-1.5 text-xs font-semibold
                                   text-red-500 hover:text-red-700 transition-colors
                                   disabled:opacity-50"
                                            >
                                                {withdrawingId === listing.id ? (
                                                    <svg className="w-3.5 h-3.5 animate-spin" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"/>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8v8H4z"/>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                                         stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              d="M6 18L18 6M6 6l12 12"/>
                                                    </svg>
                                                )}
                                                Withdraw
                                            </button>
                                        )}

                                        {isWithdrawn && (
                                            <span className="text-xs text-gray-400 font-medium italic">
                        Withdrawn
                      </span>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// STAT PILL
// ─────────────────────────────────────────────

function StatPill({ icon, label, value }: {
    icon:  string
    label: string
    value: number
}) {
    return (
        <span className="flex items-center gap-1 text-gray-500">
      <span>{icon}</span>
      <span className="font-bold text-gray-700">{value}</span>
      <span>{label}</span>
    </span>
    )
}