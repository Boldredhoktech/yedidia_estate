// app/opoku/dashboard/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import Link              from 'next/link'
import { siteConfig }    from '@/config/siteconfig'

async function getPlatformStats() {
    const [usersRes, listingsRes, paymentsRes, subsRes] = await Promise.all([
        supabaseAdmin.from('users').select('role, status'),
        supabaseAdmin.from('listings').select('status'),
        supabaseAdmin.from('payments').select('amount, status, method'),
        supabaseAdmin.from('subscriptions').select('status'),
    ])

    const users    = usersRes.data    ?? []
    const listings = listingsRes.data ?? []
    const payments = paymentsRes.data ?? []
    const subs     = subsRes.data     ?? []

    const revenue = payments
        .filter(p => p.status === 'success')
        .reduce((s, p) => s + (p.amount ?? 0), 0)

    return {
        users: {
            agents:     users.filter(u => u.role === 'agent_immobilier').length,
            validators: users.filter(u => u.role === 'agent_validator').length,
            comptables: users.filter(u => u.role === 'comptable').length,
            blocked:    users.filter(u => u.status === 'blocked').length,
        },
        listings: {
            active:  listings.filter(l => l.status === 'active').length,
            pending: listings.filter(l => l.status === 'pending').length,
            total:   listings.length,
        },
        payments: {
            total:    payments.length,
            success:  payments.filter(p => p.status === 'success').length,
            failed:   payments.filter(p => p.status === 'failed').length,
            manual:   payments.filter(p => p.method === 'manual').length,
        },
        revenue,
        activeSubs: subs.filter(s => s.status === 'active').length,
    }
}

export default async function OpokuDashboardPage() {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') redirect('/opoku/login')

    const stats = await getPlatformStats()

    return (
        <div className="flex flex-col gap-8">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">
                    SuperAdmin Dashboard
                </h1>
                <p className="text-yellow-700 text-sm mt-1">
                    Full platform overview — {new Date().toLocaleDateString('en-GH', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
                </p>
            </div>

            {/* Revenue highlight */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800
                      rounded-2xl p-6 shadow-lg shadow-yellow-900/30">
                <p className="text-yellow-900 text-xs font-bold uppercase tracking-widest mb-1">
                    Total Platform Revenue
                </p>
                <p className="text-black font-extrabold text-4xl">
                    GHS {stats.revenue.toLocaleString(undefined, {
                    minimumFractionDigits: 2, maximumFractionDigits: 2,
                })}
                </p>
                <p className="text-yellow-900 text-sm mt-2">
                    {stats.payments.success} successful payment{stats.payments.success !== 1 ? 's' : ''} ·{' '}
                    {stats.payments.failed} failed ·{' '}
                    {stats.payments.manual} manual
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Real Estate Agents" value={stats.users.agents}
                          sub={`${stats.users.blocked} blocked`} accent="yellow"
                          href="/kwaku/agents" />
                <StatCard label="Active Listings" value={stats.listings.active}
                          sub={`${stats.listings.pending} pending`} accent="emerald"
                          href="/kwaku/listings" />
                <StatCard label="Active Subscriptions" value={stats.activeSubs}
                          sub="current paying agents" accent="indigo"
                          href="/comptable/dashboard" />
                <StatCard label="Validators" value={stats.users.validators}
                          sub={`${stats.users.comptables} accountants`} accent="purple"
                          href="/opoku/users" />
            </div>

            {/* Quick actions */}
            <div className="bg-gray-900 border border-yellow-900/20 rounded-2xl p-6">
                <h2 className="text-white font-bold text-base mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Manage Users',    href: '/opoku/users',     color: 'bg-yellow-700 hover:bg-yellow-600 text-black'    },
                        { label: 'Update Prices',   href: '/opoku/formulas',  color: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300'},
                        { label: 'Analytics',       href: '/opoku/analytics', color: 'bg-gray-800 hover:bg-gray-700 text-gray-200'     },
                        { label: 'Popups',          href: '/opoku/popups',    color: 'bg-gray-800 hover:bg-gray-700 text-gray-200'     },
                        { label: 'View Site',       href: siteConfig.url,     color: 'bg-gray-900 hover:bg-gray-800 text-yellow-600 border border-yellow-900', external: true },
                    ].map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            target={(item as any).external ? '_blank' : undefined}
                            className={`${item.color} font-bold text-xs text-center
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
    yellow:  'border-yellow-900 bg-yellow-950',
    emerald: 'border-emerald-900 bg-emerald-950',
    indigo:  'border-indigo-900 bg-indigo-950',
    purple:  'border-purple-900 bg-purple-950',
}

const numMap: Record<string, string> = {
    yellow:  'text-yellow-400',
    emerald: 'text-emerald-400',
    indigo:  'text-indigo-400',
    purple:  'text-purple-400',
}

function StatCard({
                      label, value, sub, accent, href,
                  }: {
    label:  string
    value:  number
    sub:    string
    accent: string
    href:   string
}) {
    return (
        <Link
            href={href}
            className={`rounded-2xl border p-5 flex flex-col gap-2
                  transition-opacity hover:opacity-90
                  ${accentMap[accent] ?? 'border-gray-800 bg-gray-900'}`}
        >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {label}
            </p>
            <p className={`text-3xl font-extrabold ${numMap[accent] ?? 'text-white'}`}>
                {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">{sub}</p>
        </Link>
    )
}