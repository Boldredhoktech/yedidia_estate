// app/(public)/property/[id]/page.tsx

import { notFound }          from 'next/navigation'
import type { Metadata }     from 'next'
import { supabaseAdmin }     from '@/lib/db'
import { siteConfig }        from '@/config/siteconfig'
import PropertyGallery       from '@/components/public/PropertyGallery'
import PropertyDetailCard    from '@/components/public/PropertyDetailCard'
import ContactButtons        from '@/components/public/ContactButtons'
import Link                  from 'next/link'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ListingDetail {
    id:            string
    type:          string
    title:         string
    description:   string | null
    city:          string
    neighborhood:  string
    price:         number
    price_label:   string | null
    area_m2:       number | null
    area_hectares: number | null
    bedrooms:      number | null
    bathrooms:     number | null
    published_at:  string | null
    agent: {
        full_name:       string
        phone_call:      string | null
        phone_whatsapp:  string | null
    }
    media: {
        id:              string
        storage_url:     string
        type:            string
        display_order:   number
        duration_seconds:number | null
    }[]
}

// ─────────────────────────────────────────────
// DATA FETCHING
// ─────────────────────────────────────────────

async function getListing(id: string): Promise<ListingDetail | null> {
    const { data, error } = await supabaseAdmin
        .from('listings')
        .select(`
      id, type, title, description,
      city, neighborhood, price, price_label,
      area_m2, area_hectares, bedrooms, bathrooms,
      published_at,
      users!agent_id (
        full_name,
        phone_call,
        phone_whatsapp
      ),
      listing_media (
        id,
        storage_url,
        type,
        display_order,
        duration_seconds
      )
    `)
        .eq('id', id)
        .eq('status', 'active')
        .single()

    if (error || !data) return null

    const row = data as any
    return {
        id:            row.id,
        type:          row.type,
        title:         row.title,
        description:   row.description,
        city:          row.city,
        neighborhood:  row.neighborhood,
        price:         row.price,
        price_label:   row.price_label,
        area_m2:       row.area_m2,
        area_hectares: row.area_hectares,
        bedrooms:      row.bedrooms,
        bathrooms:     row.bathrooms,
        published_at:  row.published_at,
        agent: {
            full_name:      row.users?.full_name      ?? 'Yedidia Estate',
            phone_call:     row.users?.phone_call     ?? null,
            phone_whatsapp: row.users?.phone_whatsapp ?? null,
        },
        media: (row.listing_media ?? []).sort(
            (a: any, b: any) => a.display_order - b.display_order
        ),
    }
}

// Increment view count (fire and forget)
async function incrementViews(id: string) {
    try {
        await supabaseAdmin.rpc('increment_view_count', { listing_id: id })
    } catch { /* silent */ }
}

// ─────────────────────────────────────────────
// DYNAMIC METADATA
// ─────────────────────────────────────────────

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id }  = await params
    const listing = await getListing(id)
    if (!listing) return { title: 'Property not found' }

    const firstPhoto = listing.media.find(m => m.type === 'photo')

    return {
        title:       `${listing.title} | ${siteConfig.name}`,
        description: listing.description
            ?? `${listing.type === 'parcelle' ? 'Land' : 'Property'} in ${listing.neighborhood}, ${listing.city} — GHS ${listing.price.toLocaleString()}`,
        openGraph: {
            title:  listing.title,
            images: firstPhoto ? [{ url: firstPhoto.storage_url }] : [],
        },
    }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function PropertyDetailPage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>
}) {
    const { id }  = await params
    const listing = await getListing(id)

    if (!listing) notFound()

    // Fire-and-forget view counter
    incrementViews(id)

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

            {/* ── Back button ── */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500
                   hover:text-brand-600 transition-colors duration-150 mb-6 group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to listings
            </Link>

            {/* ── Property ID badge ── */}
            <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-mono text-gray-400 bg-gray-100
                         px-2.5 py-1 rounded-lg select-all">
          ID: {listing.id}
        </span>
                <TypeBadge type={listing.type} />
            </div>

            {/* ── Title ── */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900
                     leading-tight mb-6">
                {listing.title}
            </h1>

            {/* ── Gallery ── */}
            <div className="mb-8">
                <PropertyGallery media={listing.media} title={listing.title} />
            </div>

            {/* ── Main layout: details + sticky contact ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: full details */}
                <div className="lg:col-span-2">
                    <PropertyDetailCard listing={listing} />
                </div>

                {/* Right: sticky contact panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl
                          shadow-lg overflow-hidden">

                        {/* Price header */}
                        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-5">
                            <p className="text-brand-100 text-xs font-semibold uppercase tracking-wide mb-1">
                                Price
                            </p>
                            <p className="text-white font-extrabold text-2xl leading-none">
                                {new Intl.NumberFormat('en-GH', {
                                    style: 'currency', currency: 'GHS', maximumFractionDigits: 0,
                                }).format(listing.price)}
                                {listing.price_label && (
                                    <span className="text-brand-200 text-sm font-medium ml-1">
                    {listing.price_label}
                  </span>
                                )}
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="p-5 flex flex-col gap-4">
                            <p className="text-sm text-gray-500 font-medium">
                                Listed by{' '}
                                <span className="text-gray-900 font-bold">
                  {listing.agent.full_name}
                </span>
                            </p>

                            <ContactButtons
                                whatsapp={listing.agent.phone_whatsapp}
                                phone={listing.agent.phone_call}
                                listingId={listing.id}
                                size="lg"
                                layout="col"
                            />

                            {/* Disclaimer */}
                            <p className="text-xs text-gray-400 leading-relaxed border-t
                            border-gray-100 pt-3">
                                {siteConfig.fraudWarning.general}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// TYPE BADGE
// ─────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string }> = {
    parcelle:        { label: 'Land / Parcel',       color: 'bg-amber-100 text-amber-800'    },
    maison_vente:    { label: 'House for Sale',       color: 'bg-blue-100 text-blue-800'      },
    maison_location: { label: 'House for Rent',       color: 'bg-emerald-100 text-emerald-800'},
    airbnb:          { label: 'Furnished Apartment',  color: 'bg-purple-100 text-purple-700'  },
}

function TypeBadge({ type }: { type: string }) {
    const meta = TYPE_META[type] ?? { label: type, color: 'bg-gray-100 text-gray-700' }
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
      {meta.label}
    </span>
    )
}