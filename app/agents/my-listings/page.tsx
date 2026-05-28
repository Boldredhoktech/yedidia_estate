// app/agents/my-listings/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import ListingsTable     from '@/components/agents/ListingsTable'
import Link              from 'next/link'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface AgentListing {
    id:           string
    title:        string
    type:         string
    status:       string
    city:         string
    neighborhood: string
    price:        number
    price_label:  string | null
    view_count:   number
    whatsapp_clicks: number
    call_clicks:  number
    published_at: string | null
    expires_at:   string | null
    created_at:   string
    media:        { storage_url: string; type: string }[]
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

async function getAgentListings(agentId: string): Promise<AgentListing[]> {
    const { data, error } = await supabaseAdmin
        .from('listings')
        .select(`
      id, title, type, status, city, neighborhood,
      price, price_label, view_count, whatsapp_clicks,
      call_clicks, published_at, expires_at, created_at,
      listing_media ( storage_url, type, display_order )
    `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((row: any) => ({
        ...row,
        media: (row.listing_media ?? [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .slice(0, 1),
    }))
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function MyListingsPage() {
    const session = await getSession()
    if (!session) redirect('/agents/login')

    const listings = await getAgentListings(session.userId)

    const counts = {
        all:       listings.length,
        active:    listings.filter(l => l.status === 'active').length,
        pending:   listings.filter(l => l.status === 'pending').length,
        expired:   listings.filter(l => l.status === 'expired').length,
        withdrawn: listings.filter(l => l.status === 'withdrawn').length,
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">My Listings</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        All your property listings and their current status.
                    </p>
                </div>
                <Link
                    href="/agents/publish"
                    className="flex-shrink-0 flex items-center gap-2 bg-brand-500
                     hover:bg-brand-600 text-white font-bold text-sm
                     px-4 py-2.5 rounded-xl transition-all duration-200
                     active:scale-95 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    New Listing
                </Link>
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: 'All',       count: counts.all,       color: 'bg-gray-100 text-gray-700'       },
                    { label: 'Active',    count: counts.active,    color: 'bg-emerald-100 text-emerald-700' },
                    { label: 'Pending',   count: counts.pending,   color: 'bg-amber-100 text-amber-700'     },
                    { label: 'Expired',   count: counts.expired,   color: 'bg-red-100 text-red-600'         },
                    { label: 'Withdrawn', count: counts.withdrawn, color: 'bg-gray-100 text-gray-500'       },
                ].map(pill => (
                    <span key={pill.label}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full ${pill.color}`}>
            {pill.label}: {pill.count}
          </span>
                ))}
            </div>

            {/* Table */}
            {listings.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12
                        flex flex-col items-center gap-4 text-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75
                     12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875
                     c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125
                     1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                    </svg>
                    <p className="text-gray-500 font-medium">You have no listings yet.</p>
                    <Link href="/agents/publish"
                          className="bg-brand-500 hover:bg-brand-600 text-white font-bold
                           text-sm px-5 py-2.5 rounded-xl transition-colors duration-200">
                        Publish your first listing
                    </Link>
                </div>
            ) : (
                <ListingsTable listings={listings} />
            )}

        </div>
    )
}