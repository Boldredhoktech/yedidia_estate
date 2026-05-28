// components/public/PropertyGrid.tsx

import PropertyCard       from '@/components/public/PropertyCard'
import type { ListingCard } from '@/app/(public)/page'

interface PropertyGridProps {
    listings: ListingCard[]
}

export default function PropertyGrid({ listings }: PropertyGridProps) {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map(listing => (
                    <PropertyCard key={listing.id} listing={listing} />
                ))}
            </div>
        </section>
    )
}