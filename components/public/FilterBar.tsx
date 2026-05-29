// components/public/FilterBar.tsx

'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { siteConfig } from '@/config/siteconfig'

// ─────────────────────────────────────────────
// GHANA CITIES
// ─────────────────────────────────────────────

const GHANA_CITIES = [
    'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast',
    'Sunyani', 'Koforidua', 'Ho', 'Bolgatanga', 'Wa',
    'Tema', 'Kasoa', 'Madina', 'East Legon', 'Spintex',
    'Adenta', 'Ashaiman',
]

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function FilterBar() {
    const router       = useRouter()
    const pathname     = usePathname()
    const searchParams = useSearchParams()
    const [pending, startTransition] = useTransition()

    // ── Selects: read directly from URL (instant update on click) ──
    const city = searchParams.get('city') ?? ''
    const type = searchParams.get('type') ?? ''

    // ── Budget inputs: local state to avoid keystroke lag ──
    // The URL is only pushed after a 500ms pause (debounce).
    const [localMin, setLocalMin] = useState(searchParams.get('minPrice') ?? '')
    const [localMax, setLocalMax] = useState(searchParams.get('maxPrice') ?? '')
    const minTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // When "Clear" button resets the URL, sync local state back to empty
    const urlMin = searchParams.get('minPrice') ?? ''
    const urlMax = searchParams.get('maxPrice') ?? ''
    useEffect(() => { if (!urlMin) setLocalMin('') }, [urlMin])
    useEffect(() => { if (!urlMax) setLocalMax('') }, [urlMax])

    // ── Core URL updater ──
    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) { params.set(key, value) } else { params.delete(key) }
            params.delete('page')
            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false })
            })
        },
        [pathname, router, searchParams]
    )

    // ── Budget handlers with debounce ──
    const handleMinChange = (val: string) => {
        setLocalMin(val)
        if (minTimer.current) clearTimeout(minTimer.current)
        minTimer.current = setTimeout(() => updateFilter('minPrice', val), 500)
    }

    const handleMaxChange = (val: string) => {
        setLocalMax(val)
        if (maxTimer.current) clearTimeout(maxTimer.current)
        maxTimer.current = setTimeout(() => updateFilter('maxPrice', val), 500)
    }

    const handleReset = () => {
        setLocalMin('')
        setLocalMax('')
        if (minTimer.current) clearTimeout(minTimer.current)
        if (maxTimer.current) clearTimeout(maxTimer.current)
        startTransition(() => { router.push(pathname, { scroll: false }) })
    }

    const hasActiveFilters = city || type || localMin || localMax

    return (
        <div className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-16 md:top-20 z-30">

            {/* Kente accent */}
            <div className="h-0.5 w-full flex">
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-end">

                    {/* City */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            City
                        </label>
                        <div className="relative">
                            <select
                                value={city}
                                onChange={e => updateFilter('city', e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200
                           text-gray-800 text-sm font-medium rounded-xl px-3 py-2.5 pr-8
                           focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-brand-400 hover:border-gray-300
                           transition-colors duration-150 cursor-pointer"
                            >
                                <option value="">All Cities</option>
                                {GHANA_CITIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* Property type */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Property
                        </label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={e => updateFilter('type', e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200
                           text-gray-800 text-sm font-medium rounded-xl px-3 py-2.5 pr-8
                           focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-brand-400 hover:border-gray-300
                           transition-colors duration-150 cursor-pointer"
                            >
                                <option value="">All Types</option>
                                {siteConfig.propertyTypes.map(pt => (
                                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* Min budget — local state, debounced */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Min (GHS)
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="0"
                            value={localMin}
                            onChange={e => handleMinChange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200
                         text-gray-800 text-sm font-medium rounded-xl px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-brand-400 hover:border-gray-300
                         transition-colors duration-150
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    {/* Max budget — local state, debounced */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Max (GHS)
                        </label>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            placeholder="Any"
                            value={localMax}
                            onChange={e => handleMaxChange(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200
                         text-gray-800 text-sm font-medium rounded-xl px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-brand-400 hover:border-gray-300
                         transition-colors duration-150
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    {/* Clear */}
                    {hasActiveFilters && (
                        <div className="flex items-end flex-shrink-0">
                            <button
                                onClick={handleReset}
                                disabled={pending}
                                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200
                           text-gray-600 hover:text-gray-800
                           text-sm font-semibold px-4 py-2.5 rounded-xl
                           transition-all duration-150 active:scale-95
                           border border-gray-200 whitespace-nowrap"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                Clear
                            </button>
                        </div>
                    )}

                </div>

                {pending && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-brand-500 font-medium">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Filtering…
                    </div>
                )}
            </div>
        </div>
    )
}

function ChevronIcon() {
    return (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
        </div>
    )
}
