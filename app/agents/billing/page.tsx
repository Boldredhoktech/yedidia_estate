// app/agents/billing/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import FormulaCards      from '@/components/agents/FormulaCards'
import PaymentHistory    from '@/components/agents/PaymentHistory'
import { siteConfig }    from '@/config/siteconfig'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface Formula {
    id:               string
    formula_key:      string
    name:             string
    pub_count:        number
    pub_duration_days:number
    validity_days:    number
    price_ghs:        number
    is_active:        boolean
}

export interface PaymentRecord {
    id:           string
    amount:       number
    currency:     string
    status:       string
    method:       string
    paystack_ref: string | null
    created_at:   string
    formulas: { name: string; formula_key: string } | null
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

async function getBillingData(agentId: string) {
    const [formulasRes, paymentsRes, activeSubRes] = await Promise.all([
        supabaseAdmin
            .from('formulas')
            .select('*')
            .eq('is_active', true)
            .neq('formula_key', 'FREE')
            .order('pub_count', { ascending: true }),

        supabaseAdmin
            .from('payments')
            .select(`
        id, amount, currency, status, method,
        paystack_ref, created_at,
        formulas ( name, formula_key )
      `)
            .eq('agent_id', agentId)
            .order('created_at', { ascending: false })
            .limit(20),

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
    ])

    return {
        formulas:      (formulasRes.data   ?? []) as Formula[],
        payments:      (paymentsRes.data   ?? []) as PaymentRecord[],
        activeSubscription: activeSubRes.data ?? null,
    }
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function BillingPage() {
    const session = await getSession()
    if (!session) redirect('/agents/login')

    const { formulas, payments, activeSubscription } = await getBillingData(session.userId)

    const hasActiveSub = !!activeSubscription

    return (
        <div className="flex flex-col gap-8 max-w-4xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Subscription & Billing</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage your subscription plan and view payment history.
                </p>
            </div>

            {/* Active subscription info */}
            {hasActiveSub && (
                <ActiveSubCard subscription={activeSubscription} />
            )}

            {/* Cannot buy new plan if one is active */}
            {hasActiveSub ? (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75
                       0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9
                       -3.75h.008v.008H12V8.25z"/>
                        </svg>
                        <p className="text-sm text-blue-800">
                            <span className="font-bold">One subscription at a time. </span>
                            You already have an active subscription. You can purchase a new plan
                            once your current subscription expires.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Formula cards */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Choose a Plan
                        </h2>
                        <FormulaCards
                            formulas={formulas}
                            agentId={session.userId}
                        />
                    </div>

                    {/* Manual payment option */}
                    <ManualPaymentCard />
                </>
            )}

            {/* Payment history */}
            <PaymentHistory payments={payments} />

        </div>
    )
}

// ─────────────────────────────────────────────
// ACTIVE SUBSCRIPTION CARD
// ─────────────────────────────────────────────

function ActiveSubCard({ subscription }: { subscription: any }) {
    const formula   = subscription.formulas
    const expiresAt = new Date(subscription.expires_at)
    const daysLeft  = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const progress  = Math.max(0, Math.min(100,
        (subscription.pubs_remaining / (formula?.pub_count ?? 1)) * 100
    ))

    return (
        <div className="bg-gradient-to-br from-brand-500 to-brand-700
                    rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <p className="text-brand-200 text-xs font-bold uppercase tracking-widest mb-1">
                        Active Plan
                    </p>
                    <h2 className="text-2xl font-extrabold">
                        {formula?.formula_key} — {formula?.name}
                    </h2>
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5
                         rounded-full flex-shrink-0">
          ACTIVE
        </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                <Stat label="Publications left" value={String(subscription.pubs_remaining)} />
                <Stat label="Per publication"
                      value={`${Math.round((formula?.pub_duration_days ?? 0) / 30)} month(s)`} />
                <Stat label="Expires"
                      value={daysLeft > 0 ? `${daysLeft} days` : 'Expired'} />
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex justify-between text-xs text-brand-200 mb-1.5">
                    <span>Publications used</span>
                    <span>
            {(formula?.pub_count ?? 0) - subscription.pubs_remaining} / {formula?.pub_count ?? 0}
          </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${100 - progress}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-brand-200 text-xs mb-0.5">{label}</p>
            <p className="text-white font-bold text-base">{value}</p>
        </div>
    )
}

// ─────────────────────────────────────────────
// MANUAL PAYMENT CARD
// ─────────────────────────────────────────────

function ManualPaymentCard() {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center
                        justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75
                     4.5h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75
                     a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">
                        Payment gateway unavailable?
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        If Paystack is unavailable or you prefer to pay manually, contact
                        our support team. We will activate your subscription within 24–48h
                        after payment confirmation.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={siteConfig.contact.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600
                         text-white font-bold text-xs px-4 py-2 rounded-xl
                         transition-colors duration-200"
                        >
                            WhatsApp Support
                        </a>
                        <a
                            href={`mailto:${siteConfig.contact.emailSupport}`}
                            className="flex items-center gap-1.5 bg-white border border-gray-200
                         hover:border-gray-300 text-gray-700 font-bold text-xs
                         px-4 py-2 rounded-xl transition-colors duration-200"
                        >
                            {siteConfig.contact.emailSupport}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}