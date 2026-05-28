// app/agents/dashboard/page.tsx

import { redirect }       from 'next/navigation'
import Link               from 'next/link'
import { getSession }     from '@/lib/auth'
import { supabaseAdmin }  from '@/lib/db'
import DashboardStats     from '@/components/agents/DashboardStats'
import SubscriptionBanner from '@/components/agents/SubscriptionBanner'
import { RecentListings } from '@/components/agents/SubscriptionBanner'

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

async function getAgentData(agentId: string) {
    const [statsRes, subRes, listingsRes] = await Promise.all([
        // Aggregate stats
        supabaseAdmin
            .from('listings')
            .select('status, view_count, whatsapp_clicks, call_clicks')
            .eq('agent_id', agentId),

        // Active subscription
        supabaseAdmin
            .from('subscriptions')
            .select(`
        id, status, pubs_remaining, purchased_at, expires_at,
        formulas ( name, formula_key, pub_count, pub_duration_days, validity_days )
      `)
            .eq('agent_id', agentId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),

        // Recent 5 listings
        supabaseAdmin
            .from('listings')
            .select('id, title, type, status, city, price, published_at, expires_at, view_count')
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false })
            .limit(5),
    ])

    const listings = statsRes.data ?? []

    const stats = {
        totalListings:   listings.length,
        activeListings:  listings.filter(l => l.status === 'active').length,
        pendingListings: listings.filter(l => l.status === 'pending').length,
        totalViews:      listings.reduce((s, l) => s + (l.view_count ?? 0), 0),
        waClicks:        listings.reduce((s, l) => s + (l.whatsapp_clicks ?? 0), 0),
        callClicks:      listings.reduce((s, l) => s + (l.call_clicks ?? 0), 0),
    }

    return {
        stats,
        subscription: subRes.data ?? null,
        recentListings: listingsRes.data ?? [],
    }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function AgentDashboardPage() {
    const session = await getSession()
    if (!session) redirect('/agents/login')

    const { stats, subscription, recentListings } = await getAgentData(session.userId)

    return (
        <div className="flex flex-col gap-8">

            {/* Page header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Welcome back, {session.fullName.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Here is an overview of your listings and activity.
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

            {/* Subscription banner */}
            <SubscriptionBanner subscription={subscription} />

            {/* Stats cards */}
            <DashboardStats stats={stats} />

            {/* Recent listings */}
            <RecentListings listings={recentListings} />

        </div>
    )
}