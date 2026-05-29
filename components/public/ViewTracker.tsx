// components/public/ViewTracker.tsx
// Invisible client component — fires a view tracking API call on mount.
// Renders nothing visible. Safe to place anywhere on the property page.

'use client'

import { useEffect } from 'react'

export default function ViewTracker({ listingId }: { listingId: string }) {
    useEffect(() => {
        fetch(`/api/listings/${listingId}/view`, { method: 'POST' })
            .catch(() => {}) // silent — analytics must never block UX
    }, [listingId])

    return null
}
