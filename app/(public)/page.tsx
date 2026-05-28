// app/(public)/page.tsx

import { Suspense }       from 'react'
import { supabaseAdmin }  from '@/lib/db'
import FilterBar          from '@/components/public/FilterBar'
import PropertyGrid       from '@/components/public/PropertyGrid'
import EmptyState         from '@/components/public/EmptyState'
import FraudWarning       from '@/components/public/FraudWarning'
import type { Metadata }  from 'next'
import { siteConfig }     from '@/config/siteconfig'

// ─────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────

export const metadata: Metadata = {
    title:       siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ListingCard {
    id:            string
    type:          string
    title:         string
    city:          string
    neighborhood:  string
    price:         number
    price_label:   string | null
    area_m2:       number | null
    area_hectares: number | null
    whatsapp:      string | null   // agent phone_whatsapp
    phone:         string | null   // agent phone_call
    media:         { storage_url: string; type: string; display_order: number }[]
}

// ─────────────────────────────────────────────
// SEARCH PARAMS
// ─────────────────────────────────────────────

interface PageProps {
    searchParams: Promise<{
        city?:     string
        type?:     string
        minPrice?: string
        maxPrice?: string
        page?:     string
    }>
}

const PAGE_SIZE = 12

// ─────────────────────────────────────────────
// DATA FETCHING
// ─────────────────────────────────────────────

async function getListings(params: Awaited<PageProps['searchParams']>): Promise<{
    listings: ListingCard[]
    total:    number
    page:     number
    pages:    number
}> {
    const page     = Math.max(1, parseInt(params.page ?? '1', 10))
    const from     = (page - 1) * PAGE_SIZE
    const to       = from + PAGE_SIZE - 1

    let query = supabaseAdmin
        .from('listings')
        .select(`
      id,
      type,
      title,
      city,
      neighborhood,
      price,
      price_label,
      area_m2,
      area_hectares,
      users!agent_id (
        phone_whatsapp,
        phone_call
      ),
      listing_media (
        storage_url,
        type,
        display_order
      )
    `, { count: 'exact' })
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.city)     query = query.ilike('city', params.city)
    if (params.type)     query = query.eq('type', params.type)
    if (params.minPrice) query = query.gte('price', parseFloat(params.minPrice))
    if (params.maxPrice) query = query.lte('price', parseFloat(params.maxPrice))

    const { data, error, count } = await query

    if (error || !data) {
        console.error('[getListings]', error)
        return { listings: [], total: 0, page, pages: 0 }
    }

    const listings: ListingCard[] = data.map((row: any) => ({
        id:           row.id,
        type:         row.type,
        title:        row.title,
        city:         row.city,
        neighborhood: row.neighborhood,
        price:        row.price,
        price_label:  row.price_label,
        area_m2:      row.area_m2,
        area_hectares:row.area_hectares,
        whatsapp:     row.users?.phone_whatsapp ?? null,
        phone:        row.users?.phone_call     ?? null,
        media:        (row.listing_media ?? []).sort(
            (a: any, b: any) => a.display_order - b.display_order
        ),
    }))

    const total = count ?? 0
    const pages = Math.ceil(total / PAGE_SIZE)

    return { listings, total, page, pages }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function HomePage({ searchParams }: PageProps) {
    const params   = await searchParams
    const { listings, total, page, pages } = await getListings(params)

    const hasFilters = !!(params.city || params.type || params.minPrice || params.maxPrice)

    return (
        <>
            {/* Fraud / anti-scam warning banner */}
            <FraudWarning />

            {/* Sticky filter bar */}
            <Suspense fallback={<FilterBarSkeleton />}>
                <FilterBar />
            </Suspense>

            {/* Results count */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <p className="text-sm text-gray-500 font-medium">
                    {total === 0
                        ? hasFilters
                            ? 'No properties match your search.'
                            : 'No properties available yet.'
                        : (
                            <>
                                <span className="text-gray-900 font-bold">{total}</span>
                                {' '}propert{total === 1 ? 'y' : 'ies'} found
                                {hasFilters && (
                                    <span className="text-brand-500"> · filtered</span>
                                )}
                            </>
                        )
                    }
                </p>
            </div>

            {/* Grid or empty state */}
            {listings.length === 0
                ? <EmptyState hasFilters={hasFilters} />
                : <PropertyGrid listings={listings} />
            }

            {/* Pagination */}
            {pages > 1 && (
                <Pagination page={page} pages={pages} params={params} />
            )}

            {/* Bottom spacer */}
            <div className="h-12" />
        </>
    )
}

// ─────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────

function Pagination({
                        page,
                        pages,
                        params,
                    }: {
    page:   number
    pages:  number
    params: Record<string, string | undefined>
}) {
    function buildHref(p: number) {
        const sp = new URLSearchParams()
        if (params.city)     sp.set('city',     params.city)
        if (params.type)     sp.set('type',     params.type)
        if (params.minPrice) sp.set('minPrice', params.minPrice)
        if (params.maxPrice) sp.set('maxPrice', params.maxPrice)
        sp.set('page', String(p))
        return `/?${sp.toString()}`
    }

    const pageNumbers: (number | '…')[] = []
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
            pageNumbers.push(i)
        } else if (
            (i === page - 2 && page - 2 > 1) ||
            (i === page + 2 && page + 2 < pages)
        ) {
            pageNumbers.push('…')
        }
    }

    return (
        <div className="flex justify-center items-center gap-2 py-8 px-4">
            {/* Prev */}
            {page > 1 && (
                <a
                    href={buildHref(page - 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200
                     bg-white text-sm font-semibold text-gray-600 hover:border-brand-300
                     hover:text-brand-600 transition-colors duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Prev
                </a>
            )}

            {/* Page numbers */}
            {pageNumbers.map((p, i) =>
                p === '…' ? (
                    <span key={`ellipsis-${i}`}
                          className="px-2 text-gray-400 text-sm select-none">…</span>
                ) : (
                    <a
                        key={p}
                        href={buildHref(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm
                        font-semibold border transition-colors duration-150
                        ${p === page
                            ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
                        }`}
                    >
                        {p}
                    </a>
                )
            )}

            {/* Next */}
            {page < pages && (
                <a
                    href={buildHref(page + 1)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200
                     bg-white text-sm font-semibold text-gray-600 hover:border-brand-300
                     hover:text-brand-600 transition-colors duration-150"
                >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                    </svg>
                </a>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// SKELETON — FilterBar loading state
// ─────────────────────────────────────────────

function FilterBarSkeleton() {
    return (
        <div className="w-full bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
            <div className="h-0.5 w-full flex">
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i}
                             className="flex-1 h-10 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    )
}