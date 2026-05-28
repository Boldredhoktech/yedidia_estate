// app/kwaku/listings/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import ListingsModeration from '@/components/kwaku/ListingsModeration'

export interface ModerationListing {
    id:           string
    title:        string
    type:         string
    status:       string
    city:         string
    neighborhood: string
    price:        number
    created_at:   string
    published_at: string | null
    expires_at:   string | null
    agent: {
        id:        string
        full_name: string
        email:     string
    }
    media_count: number
}

async function getPendingListings(): Promise<ModerationListing[]> {
    const { data, error } = await supabaseAdmin
        .from('listings')
        .select(`
      id, title, type, status, city, neighborhood,
      price, created_at, published_at, expires_at,
      users!agent_id ( id, full_name, email ),
      listing_media ( id )
    `)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: true })
        .limit(50)

    if (error || !data) return []

    return data.map((row: any) => ({
        id:           row.id,
        title:        row.title,
        type:         row.type,
        status:       row.status,
        city:         row.city,
        neighborhood: row.neighborhood,
        price:        row.price,
        created_at:   row.created_at,
        published_at: row.published_at,
        expires_at:   row.expires_at,
        agent: {
            id:        row.users?.id        ?? '',
            full_name: row.users?.full_name ?? 'Unknown',
            email:     row.users?.email     ?? '',
        },
        media_count: (row.listing_media ?? []).length,
    }))
}

export default async function KwakuListingsPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    const listings = await getPendingListings()

    const pendingCount = listings.filter(l => l.status === 'pending').length
    const activeCount  = listings.filter(l => l.status === 'active').length

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Listings Management</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Review pending listings and moderate active ones.
                        Search any listing by ID.
                    </p>
                </div>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap gap-2">
        <span className="text-xs font-bold px-3 py-1.5 rounded-full
                         bg-amber-900 text-amber-400">
          Pending: {pendingCount}
        </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full
                         bg-emerald-900 text-emerald-400">
          Active: {activeCount}
        </span>
            </div>

            {/* Moderation table */}
            <ListingsModeration listings={listings} />

        </div>
    )
}