// app/kwaku/dashboard/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import Link              from 'next/link'

async function getDashboardStats() {
    const [agentsRes, listingsRes, paymentsRes, complaintsRes] = await Promise.all([
        supabaseAdmin
            .from('users')
            .select('status')
            .eq('role', 'agent_immobilier'),

        supabaseAdmin
            .from('listings')
            .select('status'),

        supabaseAdmin
            .from('payments')
            .select('amount, status')
            .eq('status', 'success'),

        supabaseAdmin
            .from('complaints')
            .select('status')
            .eq('status', 'received'),
    ])

    const agents   = agentsRes.data   ?? []
    const listings = listingsRes.data ?? []
    const payments = paymentsRes.data ?? []

    return {
        agents: {
            total:   agents.length,
            active:  agents.filter(a => a.status === 'active').length,
            pending: agents.filter(a => a.status === 'pending').length,
            blocked: agents.filter(a => a.status === 'blocked').length,
        },
        listings: {
            total:   listings.length,
            active:  listings.filter(l => l.status === 'active').length,
            pending: listings.filter(l => l.status === 'pending').length,
        },
        revenue: payments.reduce((s, p) => s + (p.amount ?? 0), 0),
        openComplaints: complaintsRes.data?.length ?? 0,
    }
}

export default async function KwakuDashboardPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    const stats = await getDashboardStats()

    return (
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">
                    Welcome, {session.fullName.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Platform overview — {new Date().toLocaleDateString('en-GH', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                <StatCard
                    label="Active Agents"
                    value={stats.agents.active}
                    sub={`${stats.agents.pending} pending validation`}
                    accent="indigo"
                    href="/kwaku/agents"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5
                       0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933
                       0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                        </svg>
                    }
                />

                <StatCard
                    label="Active Listings"
                    value={stats.listings.active}
                    sub={`${stats.listings.pending} awaiting review`}
                    accent="emerald"
                    href="/kwaku/listings"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75
                       12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v
                       -4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125
                       .504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125
                       V9.75M8.25 21h8.25"/>
                        </svg>
                    }
                />

                <StatCard
                    label="Revenue (GHS)"
                    value={stats.revenue.toLocaleString()}
                    sub="total successful payments"
                    accent="amber"
                    href="/kwaku/subscriptions"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242
                       0 3.12-2.347 3.307-6.227.872-9.123a5.002 5.002 0
                       00-6.824 0C2.693 9.955 2.88 13.835 6 16.182L6.88
                       15.522M12 6V3.75"/>
                        </svg>
                    }
                />

                <StatCard
                    label="Open Complaints"
                    value={stats.openComplaints}
                    sub="awaiting review"
                    accent="red"
                    href="/kwaku/analytics"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
                       3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
                       3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12
                       15.75h.007v.008H12v-.008z"/>
                        </svg>
                    }
                />

            </div>

            {/* Quick actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-base mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Validate Agents',   href: '/kwaku/agents',        color: 'bg-indigo-700 hover:bg-indigo-600'  },
                        { label: 'Review Listings',   href: '/kwaku/listings',      color: 'bg-emerald-800 hover:bg-emerald-700'},
                        { label: 'Publish Listing',   href: '/kwaku/publish',       color: 'bg-brand-600 hover:bg-brand-500'    },
                        { label: 'View Analytics',    href: '/kwaku/analytics',     color: 'bg-gray-700 hover:bg-gray-600'      },
                        { label: 'Legal Partners',    href: '/kwaku/legal-partners',color: 'bg-amber-800 hover:bg-amber-700'    },
                        { label: 'Subscriptions',     href: '/kwaku/subscriptions', color: 'bg-purple-800 hover:bg-purple-700'  },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${item.color} text-white font-bold text-xs text-center
                          px-4 py-3 rounded-xl transition-colors duration-150`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    )
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────

const accentMap: Record<string, string> = {
    indigo:  'border-indigo-800 bg-indigo-950',
    emerald: 'border-emerald-900 bg-emerald-950',
    amber:   'border-amber-900 bg-amber-950',
    red:     'border-red-900 bg-red-950',
}

const numColorMap: Record<string, string> = {
    indigo:  'text-indigo-300',
    emerald: 'text-emerald-300',
    amber:   'text-amber-300',
    red:     'text-red-400',
}

function StatCard({
                      label, value, sub, accent, href, icon,
                  }: {
    label:  string
    value:  string | number
    sub:    string
    accent: string
    href:   string
    icon:   React.ReactNode
}) {
    return (
        <Link
            href={href}
            className={`rounded-2xl border p-5 flex flex-col gap-3
                  transition-opacity duration-150 hover:opacity-90
                  ${accentMap[accent] ?? 'border-gray-800 bg-gray-900'}`}
        >
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {label}
                </p>
                <span className={`${numColorMap[accent] ?? 'text-gray-400'}`}>
          {icon}
        </span>
            </div>
            <p className={`text-3xl font-extrabold ${numColorMap[accent] ?? 'text-white'}`}>
                {value}
            </p>
            <p className="text-xs text-gray-600">{sub}</p>
        </Link>
    )
}