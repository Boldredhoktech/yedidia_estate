// components/public/PropertyCard.tsx

import Link            from 'next/link'
import Image           from 'next/image'
import ContactButtons  from '@/components/public/ContactButtons'
import type { ListingCard } from '@/app/(public)/page'

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatPrice(price: number, label: string | null): string {
    const formatted = new Intl.NumberFormat('en-GH', {
        style:    'currency',
        currency: 'GHS',
        maximumFractionDigits: 0,
    }).format(price)
    return label ? `${formatted} ${label}` : formatted
}

function formatArea(m2: number | null, ha: number | null): string | null {
    if (!m2 && !ha) return null
    const parts: string[] = []
    if (m2)  parts.push(`${m2.toLocaleString()} m²`)
    if (ha)  parts.push(`${ha.toLocaleString()} ha`)
    return parts.join(' · ')
}

const TYPE_LABELS: Record<string, string> = {
    parcelle:        'Land / Parcel',
    maison_vente:    'House for Sale',
    maison_location: 'House for Rent',
    airbnb:          'Furnished Apt',
}

const TYPE_COLORS: Record<string, string> = {
    parcelle:        'bg-amber-100 text-amber-800',
    maison_vente:    'bg-blue-100 text-blue-800',
    maison_location: 'bg-emerald-100 text-emerald-800',
    airbnb:          'bg-purple-100 text-purple-700',
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function PropertyCard({ listing }: { listing: ListingCard }) {
    const isParcel  = listing.type === 'parcelle'
    const firstMedia = listing.media[0] ?? null
    const area      = formatArea(listing.area_m2, listing.area_hectares)
    const typeLabel = TYPE_LABELS[listing.type] ?? listing.type
    const typeColor = TYPE_COLORS[listing.type] ?? 'bg-gray-100 text-gray-700'

    return (
        <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden
                        shadow-sm hover:shadow-lg hover:-translate-y-0.5
                        transition-all duration-300 flex flex-col">

            {/* ── Media ── */}
            <Link href={`/property/${listing.id}`} className="block relative flex-shrink-0">
                <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">

                    {firstMedia ? (
                        isParcel ? (
                            /* Video thumbnail for parcels */
                            <div className="relative w-full h-full">
                                <video
                                    src={firstMedia.storage_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                    preload="metadata"
                                    poster=""
                                />
                                {/* Play overlay */}
                                <div className="absolute inset-0 flex items-center justify-center
                                bg-black/20 group-hover:bg-black/30 transition-colors duration-200">
                                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center
                                  justify-center shadow-lg group-hover:scale-110
                                  transition-transform duration-200">
                                        <svg className="w-5 h-5 text-brand-500 ml-0.5" fill="currentColor"
                                             viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Photo for houses/apartments */
                            <Image
                                src={firstMedia.storage_url}
                                alt={listing.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw,
                       (max-width: 1024px) 50vw,
                       33vw"
                            />
                        )
                    ) : (
                        /* Placeholder */
                        <div className="w-full h-full flex flex-col items-center justify-center
                            bg-gradient-to-br from-gray-50 to-gray-100">
                            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5
                         9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504
                         -1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125
                         c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                            </svg>
                            <span className="text-xs text-gray-400">No image yet</span>
                        </div>
                    )}

                    {/* Photo count badge */}
                    {!isParcel && listing.media.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white
                            text-xs font-semibold px-2 py-1 rounded-lg
                            flex items-center gap-1 backdrop-blur-sm">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5
                         -1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5
                         a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25
                         6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375
                         0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                            </svg>
                            {listing.media.length}
                        </div>
                    )}

                    {/* Video badge for parcels */}
                    {isParcel && firstMedia && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white
                            text-xs font-semibold px-2 py-1 rounded-lg
                            flex items-center gap-1 backdrop-blur-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2
                         2 0 00-2-2H4zm14 5.5l4-2v9l-4-2V9.5z"/>
                            </svg>
                            Video
                        </div>
                    )}
                </div>

                {/* Type badge */}
                <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
                </div>
            </Link>

            {/* ── Content ── */}
            <div className="flex flex-col flex-1 p-4 gap-3">

                {/* Title */}
                <Link href={`/property/${listing.id}`}>
                    <h2 className="font-bold text-gray-900 text-base leading-snug
                         line-clamp-2 hover:text-brand-600 transition-colors duration-150">
                        {listing.title}
                    </h2>
                </Link>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-gray-500">
                    <svg className="w-4 h-4 flex-shrink-0 text-brand-400" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5
                     10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <span className="text-sm truncate">
            {listing.neighborhood}, {listing.city}
          </span>
                </div>

                {/* Area — parcels only */}
                {area && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                        <svg className="w-4 h-4 flex-shrink-0 text-amber-500" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0
                       4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15
                       9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                        </svg>
                        <span className="text-sm font-medium text-amber-700">{area}</span>
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price */}
                <div className="border-t border-gray-100 pt-3">
                    <p className="text-brand-600 font-extrabold text-lg leading-none">
                        {formatPrice(listing.price, listing.price_label)}
                    </p>
                </div>

                {/* Contact buttons */}
                <ContactButtons
                    whatsapp={listing.whatsapp}
                    phone={listing.phone}
                    listingId={listing.id}
                    size="sm"
                />

            </div>
        </article>
    )
}