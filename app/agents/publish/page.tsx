// app/agents/publish/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import PublishForm       from '@/components/agents/PublishForm'

async function getActiveSubscription(agentId: string) {
    const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('id, pubs_remaining, expires_at, formulas(name, formula_key, pub_duration_days)')
        .eq('agent_id', agentId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    return data
}

export default async function PublishPage() {
    const session = await getSession()
    if (!session) redirect('/agents/login')

    const subscription = await getActiveSubscription(session.userId)
    const canPublish   = subscription && subscription.pubs_remaining > 0

    return (
        <div className="flex flex-col gap-6 max-w-3xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Publish a Listing</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Fill in the details below. Your listing will be reviewed before going live.
                </p>
            </div>

            {/* No subscription — greyed out */}
            {!canPublish && (
                <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6
                        flex flex-col items-center text-center gap-3">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25
                     2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25
                     2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                    </svg>
                    <p className="font-bold text-gray-600">Publishing is not available</p>
                    <p className="text-sm text-gray-500">
                        {!subscription
                            ? 'You do not have an active subscription. Purchase a plan to start publishing.'
                            : 'You have used all your publication credits. Renew your subscription to publish more.'
                        }
                    </p>
                    <a href="/agents/billing"
                       className="bg-brand-500 hover:bg-brand-600 text-white font-bold
                        text-sm px-5 py-2.5 rounded-xl transition-colors duration-200">
                        View Subscription Plans
                    </a>
                </div>
            )}

            {/* Publish form — only when subscription active */}
            {canPublish && (
                <PublishForm
                    subscriptionId={subscription.id}
                    agentId={session.userId}
                    pubDurationDays={(subscription.formulas as any)?.pub_duration_days ?? 60}
                />
            )}

        </div>
    )
}