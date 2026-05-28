// components/kwaku/ListingsModeration.tsx

'use client'

import { useState }              from 'react'
import Link                      from 'next/link'
import type { ModerationListing } from '@/app/kwaku/listings/page'

const STATUS_STYLES: Record<string, string> = {
    pending:   'bg-amber-900 text-amber-400',
    active:    'bg-emerald-900 text-emerald-400',
    archived:  'bg-gray-800 text-gray-500',
    withdrawn: 'bg-gray-800 text-gray-500',
}

const TYPE_LABELS: Record<string, string> = {
    parcelle:        'Parcel',
    maison_vente:    'For Sale',
    maison_location: 'For Rent',
    airbnb:          'Airbnb',
}

export default function ListingsModeration({
                                               listings,
                                           }: {
    listings: ModerationListing[]
}) {
    const [list,       setList]       = useState(listings)
    const [searchId,   setSearchId]   = useState('')
    const [searched,   setSearched]   = useState<ModerationListing | null | 'not_found'>(null)
    const [searching,  setSearching]  = useState(false)
    const [loadingId,  setLoadingId]  = useState<string | null>(null)
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // ── Search by ID ──
    async function handleSearch() {
        if (!searchId.trim()) return
        setSearching(true)
        setSearched(null)
        setErrMsg(null)

        try {
            const res  = await fetch(`/api/kwaku/listings?id=${searchId.trim()}`)
            const json = await res.json()

            if (!res.ok || !json.listing) {
                setSearched('not_found')
            } else {
                setSearched(json.listing)
            }
        } catch {
            setErrMsg('Search failed. Please try again.')
        } finally {
            setSearching(false)
        }
    }

    // ── Validate listing ──
    async function handleValidate(listingId: string) {
        setLoadingId(listingId)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/kwaku/listings', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ listingId, action: 'validate' }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Validation failed.'); return }

            setList(prev => prev.map(l =>
                l.id !== listingId ? l : { ...l, status: 'active', published_at: new Date().toISOString() }
            ))
            if (searched && searched !== 'not_found' && (searched as ModerationListing).id === listingId) {
                setSearched({ ...(searched as ModerationListing), status: 'active' })
            }
            setSuccessMsg('Listing validated and now live.')
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch {
            setErrMsg('Network error.')
        } finally {
            setLoadingId(null)
        }
    }

    // ── Archive listing ──
    async function handleArchive(listingId: string) {
        if (!confirm('Archive this listing? It will be removed from public view.')) return
        setLoadingId(listingId)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/kwaku/listings', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ listingId, action: 'archive' }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Archive failed.'); return }

            setList(prev => prev.filter(l => l.id !== listingId))
            setSuccessMsg('Listing archived.')
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch {
            setErrMsg('Network error.')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Search by ID */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Search listing by ID
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={searchId}
                        onChange={e => setSearchId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Paste listing ID here…"
                        className={`flex-1 bg-gray-800 border border-gray-700 text-gray-100
                        text-sm rounded-xl px-4 py-2.5 placeholder-gray-600
                        focus:outline-none focus:ring-2 focus:ring-indigo-500
                        focus:border-indigo-500 font-mono`}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={searching || !searchId.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold
                       text-sm px-5 py-2.5 rounded-xl transition-colors
                       disabled:opacity-50 flex-shrink-0"
                    >
                        {searching ? '…' : 'Search'}
                    </button>
                </div>

                {/* Search result */}
                {searched === 'not_found' && (
                    <p className="text-sm text-red-400 mt-3 font-medium">
                        No listing found with this ID.
                    </p>
                )}
                {searched && searched !== 'not_found' && (
                    <div className="mt-4">
                        <p className="text-xs text-indigo-400 font-bold mb-2">Search result:</p>
                        <ListingCard
                            listing={searched as ModerationListing}
                            loadingId={loadingId}
                            onValidate={handleValidate}
                            onArchive={handleArchive}
                        />
                    </div>
                )}
            </div>

            {/* Feedback */}
            {errMsg && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-sm text-red-400 font-medium">{errMsg}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-3">
                    <p className="text-sm text-emerald-400 font-medium">{successMsg}</p>
                </div>
            )}

            {/* Listings list */}
            {list.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 text-sm">No pending listings. All clear!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {list.map(listing => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            loadingId={loadingId}
                            onValidate={handleValidate}
                            onArchive={handleArchive}
                        />
                    ))}
                </div>
            )}

        </div>
    )
}

// ─────────────────────────────────────────────
// LISTING CARD
// ─────────────────────────────────────────────

function ListingCard({
                         listing,
                         loadingId,
                         onValidate,
                         onArchive,
                     }: {
    listing:    ModerationListing
    loadingId:  string | null
    onValidate: (id: string) => void
    onArchive:  (id: string) => void
}) {
    const isLoading = loadingId === listing.id

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row gap-4">

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0
                              ${STATUS_STYLES[listing.status] ?? 'bg-gray-800 text-gray-400'}`}>
              {listing.status}
            </span>
                        <span className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full">
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
                    </div>

                    <h3 className="font-bold text-white text-sm">{listing.title}</h3>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>📍 {listing.neighborhood}, {listing.city}</span>
                        <span className="font-bold text-indigo-400">
              GHS {listing.price.toLocaleString()}
            </span>
                        <span>🖼 {listing.media_count} media</span>
                    </div>

                    {/* Agent info */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="text-gray-600">Agent:</span>
                        <span className="text-gray-300 font-semibold">{listing.agent.full_name}</span>
                        <span className="text-gray-600">{listing.agent.email}</span>
                    </div>

                    {/* ID */}
                    <p className="text-xs text-gray-700 font-mono">ID: {listing.id}</p>

                    {/* Dates */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <span>
              Submitted: {new Date(listing.created_at).toLocaleDateString('en-GH', {
                day: 'numeric', month: 'short', year: 'numeric',
            })}
            </span>
                        {listing.expires_at && (
                            <span>
                Expires: {new Date(listing.expires_at).toLocaleDateString('en-GH', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
              </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap sm:flex-col items-start gap-2 flex-shrink-0">

                    {/* View on site */}
                    {listing.status === 'active' && (
                        <Link
                            href={`/property/${listing.id}`}
                            target="_blank"
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-200
                         border border-indigo-800 hover:border-indigo-600
                         px-3 py-1.5 rounded-xl transition-colors duration-150
                         whitespace-nowrap"
                        >
                            View live →
                        </Link>
                    )}

                    {/* Validate */}
                    {listing.status === 'pending' && (
                        <button
                            onClick={() => onValidate(listing.id)}
                            disabled={isLoading}
                            className="text-xs font-bold bg-emerald-700 hover:bg-emerald-600
                         text-white px-3 py-1.5 rounded-xl transition-colors
                         disabled:opacity-50 whitespace-nowrap"
                        >
                            {isLoading ? '…' : '✓ Validate'}
                        </button>
                    )}

                    {/* Archive */}
                    {['pending', 'active'].includes(listing.status) && (
                        <button
                            onClick={() => onArchive(listing.id)}
                            disabled={isLoading}
                            className="text-xs font-bold bg-red-900 hover:bg-red-800
                         text-red-300 px-3 py-1.5 rounded-xl transition-colors
                         disabled:opacity-50 whitespace-nowrap"
                        >
                            {isLoading ? '…' : 'Archive'}
                        </button>
                    )}

                </div>
            </div>
        </div>
    )
}