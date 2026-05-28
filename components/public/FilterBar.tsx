// components/public/FilterBar.tsx

'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { siteConfig } from '@/config/siteconfig'

// ─────────────────────────────────────────────
// GHANA CITIES — extend as needed
// ─────────────────────────────────────────────

const GHANA_CITIES = [
    'All Cities',
    'Accra',
    'Kumasi',
    'Tamale',
    'Takoradi',
    'Cape Coast',
    'Sunyani',
    'Koforidua',
    'Ho',
    'Bolgatanga',
    'Wa',
    'Tema',
    'Kasoa',
    'Madina',
    'East Legon',
    'Spintex',
    'Adenta',
    'Ashaiman',
]

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function FilterBar() {
    const router         = useRouter()
    const pathname       = usePathname()
    const searchParams   = useSearchParams()
    const [pending, startTransition] = useTransition()

    // Current filter values from URL
    const city     = searchParams.get('city')    ?? ''
    const type     = searchParams.get('type')    ?? ''
    const minPrice = searchParams.get('minPrice') ?? ''
    const maxPrice = searchParams.get('maxPrice') ?? ''

    // ── Update URL search params ──
    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value && value !== 'all' && value !== '') {
                params.set(key, value)
            } else {
                params.delete(key)
            }
            // Reset to page 1 on filter change
            params.delete('page')

            startTransition(() => {
                router.push(`${pathname}?${params.toString()}`, { scroll: false })
            })
        },
        [pathname, router, searchParams]
    )

    const handleReset = () => {
        startTransition(() => {
            router.push(pathname, { scroll: false })
        })
    }

    const hasActiveFilters = city || type || minPrice || maxPrice

    return (
        <div className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-16 md:top-20 z-30">

            {/* ── Kente accent line ── */}
            <div className="h-0.5 w-full flex">
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-stretch sm:items-end">

                    {/* ── City ── */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            City
                        </label>
                        <div className="relative">
                            <select
                                value={city}
                                onChange={e => updateFilter('city', e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200
                           text-gray-800 text-sm font-medium
                           rounded-xl px-3 py-2.5 pr-8
                           focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-brand-400 hover:border-gray-300
                           transition-colors duration-150 cursor-pointer"
                            >
                                <option value="">All Cities</option>
                                {GHANA_CITIES.filter(c => c !== 'All Cities').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* ── Property type ── */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Property
                        </label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={e => updateFilter('type', e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200
                           text-gray-800 text-sm font-medium
                           rounded-xl px-3 py-2.5 pr-8
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

                    {/* ── Min price ── */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Min Budget (GHS)
                        </label>
                        <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={minPrice}
                            onChange={e => updateFilter('minPrice', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200
                         text-gray-800 text-sm font-medium
                         rounded-xl px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-brand-400 hover:border-gray-300
                         transition-colors duration-150
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    {/* ── Max price ── */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                            Max Budget (GHS)
                        </label>
                        <input
                            type="number"
                            min={0}
                            placeholder="Any"
                            value={maxPrice}
                            onChange={e => updateFilter('maxPrice', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200
                         text-gray-800 text-sm font-medium
                         rounded-xl px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-brand-400
                         focus:border-brand-400 hover:border-gray-300
                         transition-colors duration-150
                         [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                         [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    {/* ── Reset button — only when filters active ── */}
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

                {/* ── Loading indicator ── */}
                {pending && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-brand-500 font-medium">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Filtering…
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// SMALL SUB-COMPONENT — reused chevron icon
// ─────────────────────────────────────────────

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