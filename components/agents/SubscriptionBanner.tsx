// components/agents/SubscriptionBanner.tsx

import Link from 'next/link'

interface Subscription {
    id:             string
    status:         string
    pubs_remaining: number
    purchased_at:   string
    expires_at:     string
    formulas: {
        name:              string
        formula_key:       string
        pub_count:         number
        pub_duration_days: number
        validity_days:     number
    } | null
}

export function SubscriptionBanner({
                                       subscription,
                                   }: {
    subscription: Subscription | null
}) {
    if (!subscription) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5
                      flex flex-col sm:flex-row items-start sm:items-center
                      justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center
                          justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
                       c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032
                       -1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                        </svg>
                    </div>
                    <div>
                        <p className="font-bold text-amber-900 text-sm">No active subscription</p>
                        <p className="text-amber-700 text-xs mt-0.5">
                            You need an active subscription to publish listings.
                            Purchase a formula to get started.
                        </p>
                    </div>
                </div>
                <Link
                    href="/agents/billing"
                    className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white
                     font-bold text-sm px-4 py-2.5 rounded-xl
                     transition-all duration-200 active:scale-95"
                >
                    View Plans
                </Link>
            </div>
        )
    }

    const expiresAt   = new Date(subscription.expires_at)
    const now         = new Date()
    const daysLeft    = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpiringSoon = daysLeft <= 14
    const formula     = subscription.formulas

    return (
        <div className={`rounded-2xl border p-5 flex flex-col sm:flex-row
                     items-start sm:items-center justify-between gap-4
                     ${isExpiringSoon
            ? 'bg-orange-50 border-orange-200'
            : 'bg-brand-50 border-brand-200'
        }`}>
            <div className="flex items-center gap-4 flex-wrap">
                {/* Formula badge */}
                <div className="bg-brand-500 text-white font-extrabold text-xs
                        px-3 py-1.5 rounded-full">
                    {formula?.formula_key ?? 'PLAN'} — {formula?.name ?? 'Active'}
                </div>

                {/* Credits */}
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125
                     1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25
                     m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504
                     -1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621
                     0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                    </svg>
                    <span className="text-sm font-bold text-gray-800">
            {subscription.pubs_remaining} publication{subscription.pubs_remaining !== 1 ? 's' : ''} remaining
          </span>
                </div>

                {/* Expiry */}
                <div className={`flex items-center gap-1.5 text-sm font-semibold
                         ${isExpiringSoon ? 'text-orange-700' : 'text-gray-600'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {isExpiringSoon
                        ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`
                        : `Valid until ${expiresAt.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    }
                </div>
            </div>

            <Link
                href="/agents/billing"
                className="flex-shrink-0 text-sm font-bold text-brand-600
                   hover:text-brand-800 underline underline-offset-2
                   transition-colors duration-150"
            >
                {isExpiringSoon ? 'Renew now →' : 'Manage →'}
            </Link>
        </div>
    )
}

export default SubscriptionBanner

// ─────────────────────────────────────────────
// RECENT LISTINGS TABLE
// ─────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    active:    'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100   text-amber-700',
    draft:     'bg-gray-100    text-gray-600',
    expired:   'bg-red-100     text-red-600',
    withdrawn: 'bg-gray-100    text-gray-500',
    archived:  'bg-gray-100    text-gray-400',
}

interface RecentListing {
    id:           string
    title:        string
    type:         string
    status:       string
    city:         string
    price:        number
    published_at: string | null
    expires_at:   string | null
    view_count:   number
}

export function RecentListings({ listings }: { listings: RecentListing[] }) {
    if (listings.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-8
                      text-center flex flex-col items-center gap-3">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5
                   9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504
                   -1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125
                   c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
                <p className="text-gray-500 text-sm font-medium">No listings yet</p>
                <Link href="/agents/publish"
                      className="text-sm font-bold text-brand-500 hover:text-brand-700
                         underline underline-offset-2">
                    Publish your first listing →
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center
                      justify-between">
                <h2 className="font-bold text-gray-900 text-base">Recent Listings</h2>
                <Link href="/agents/my-listings"
                      className="text-xs font-bold text-brand-500 hover:text-brand-700
                         underline underline-offset-2">
                    View all →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        {['Title', 'Type', 'City', 'Price', 'Status', 'Views', 'Expires'].map(h => (
                            <th key={h}
                                className="px-4 py-3 text-left text-xs font-bold text-gray-500
                               uppercase tracking-wide whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {listings.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50 transition-colors duration-100">
                            <td className="px-4 py-3 font-semibold text-gray-900 max-w-[180px]">
                                <span className="truncate block">{l.title}</span>
                                <span className="text-xs text-gray-400 font-mono">
                    {l.id.slice(0, 8)}…
                  </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 capitalize whitespace-nowrap">
                                {l.type.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{l.city}</td>
                            <td className="px-4 py-3 font-bold text-brand-600 whitespace-nowrap">
                                {new Intl.NumberFormat('en-GH', {
                                    style: 'currency', currency: 'GHS', maximumFractionDigits: 0,
                                }).format(l.price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize
                                    ${STATUS_STYLES[l.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {l.status}
                  </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-center whitespace-nowrap">
                                {l.view_count}
                            </td>
                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                {l.expires_at
                                    ? new Date(l.expires_at).toLocaleDateString('en-GH', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })
                                    : '—'
                                }
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}