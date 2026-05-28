// components/public/PropertyDetailCard.tsx

import type { ListingDetail } from '@/app/(public)/property/[id]/page'

interface Props {
    listing: ListingDetail
}

const SPEC_COLORS: Record<string, string> = {
    parcelle:        'bg-amber-50  border-amber-200',
    maison_vente:    'bg-blue-50   border-blue-200',
    maison_location: 'bg-emerald-50 border-emerald-200',
    airbnb:          'bg-purple-50  border-purple-200',
}

export default function PropertyDetailCard({ listing }: Props) {
    const isParcel = listing.type === 'parcelle'
    const specsBox = SPEC_COLORS[listing.type] ?? 'bg-gray-50 border-gray-200'

    return (
        <div className="flex flex-col gap-6">

            {/* ── Key specs ── */}
            <div className={`rounded-2xl border p-5 ${specsBox}`}>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Property Details
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    {/* Location */}
                    <SpecItem
                        icon={<LocationIcon />}
                        label="Location"
                        value={`${listing.neighborhood}, ${listing.city}`}
                    />

                    {/* Price */}
                    <SpecItem
                        icon={<PriceIcon />}
                        label="Price"
                        value={new Intl.NumberFormat('en-GH', {
                            style: 'currency', currency: 'GHS', maximumFractionDigits: 0,
                        }).format(listing.price) + (listing.price_label ? ` ${listing.price_label}` : '')}
                        highlight
                    />

                    {/* Area — parcels only */}
                    {isParcel && listing.area_m2 && (
                        <SpecItem
                            icon={<AreaIcon />}
                            label="Area"
                            value={`${listing.area_m2.toLocaleString()} m²`}
                        />
                    )}
                    {isParcel && listing.area_hectares && (
                        <SpecItem
                            icon={<AreaIcon />}
                            label="Area (ha)"
                            value={`${listing.area_hectares.toLocaleString()} ha`}
                        />
                    )}

                    {/* Bedrooms — houses */}
                    {!isParcel && listing.bedrooms != null && (
                        <SpecItem
                            icon={<BedIcon />}
                            label="Bedrooms"
                            value={String(listing.bedrooms)}
                        />
                    )}

                    {/* Bathrooms — houses */}
                    {!isParcel && listing.bathrooms != null && (
                        <SpecItem
                            icon={<BathIcon />}
                            label="Bathrooms"
                            value={String(listing.bathrooms)}
                        />
                    )}

                    {/* Published date */}
                    {listing.published_at && (
                        <SpecItem
                            icon={<CalendarIcon />}
                            label="Listed on"
                            value={new Date(listing.published_at).toLocaleDateString('en-GH', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
                        />
                    )}

                </div>
            </div>

            {/* ── Description ── */}
            {listing.description && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Description
                    </h2>
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                        {listing.description}
                    </p>
                </div>
            )}

            {/* ── Legal notice for parcels & Airbnb ── */}
            {(listing.type === 'parcelle' || listing.type === 'maison_vente') && (
                <LegalNotice type={listing.type} />
            )}
            {listing.type === 'airbnb' && (
                <AirbnbWarning />
            )}

        </div>
    )
}

// ─────────────────────────────────────────────
// SPEC ITEM
// ─────────────────────────────────────────────

function SpecItem({
                      icon, label, value, highlight = false,
                  }: {
    icon:       React.ReactNode
    label:      string
    value:      string
    highlight?: boolean
}) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-4 h-4 flex-shrink-0">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className={`text-sm font-bold leading-snug pl-5
                     ${highlight ? 'text-brand-600 text-base' : 'text-gray-900'}`}>
                {value}
            </p>
        </div>
    )
}

// ─────────────────────────────────────────────
// LEGAL NOTICE
// ─────────────────────────────────────────────

function LegalNotice({ type }: { type: string }) {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100
                        flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
                     3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
                     3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-amber-800">Important Legal Notice</p>
                    <p className="text-sm text-amber-700 leading-relaxed">
                        All {type === 'parcelle' ? 'land' : 'property'} transactions must be verified
                        by a qualified legal professional before any agreement or payment.
                        Yedidia Estate is not liable for any fraudulent acts.
                    </p>
                    <a
                        href="/legal/partners"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold
                       text-amber-800 underline underline-offset-2 hover:text-amber-900
                       transition-colors duration-150 w-fit"
                    >
                        Access our certified legal partners →
                    </a>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// AIRBNB WARNING
// ─────────────────────────────────────────────

function AirbnbWarning() {
    return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100
                        flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold text-red-800">Safety Warning — Furnished Apartment</p>
                    <p className="text-sm text-red-700 leading-relaxed">
                        Never transfer money to a contact without first verifying their absolute
                        reliability in person or through a trusted third party.
                        Yedidia Estate is not liable for any financial losses from unverified transfers.
                    </p>
                    <a
                        href="/legal/complaint"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold
                       text-red-800 underline underline-offset-2 hover:text-red-900
                       transition-colors duration-150 w-fit"
                    >
                        File a complaint →
                    </a>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// SMALL INLINE ICONS
// ─────────────────────────────────────────────

const LocationIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
    </svg>
)
const PriceIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0
             3.12-2.347 3.307-6.227.872-9.123a5.002 5.002 0 00-6.824
             0C2.693 9.955 2.88 13.835 6 16.182L6.88 15.522M12 6V3.75"/>
    </svg>
)
const AreaIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5
             0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5
             0v-4.5m0 4.5L15 15"/>
    </svg>
)
const BedIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25
             2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25
             c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125
             -1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>
    </svg>
)
const BathIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987
             8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0
             016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018
             18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
    </svg>
)
const CalendarIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5
             A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25
             2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25
             0 0121 11.25v7.5"/>
    </svg>
)