// app/kwaku/publish/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import PublishForm       from '@/components/agents/PublishForm'

async function getValidatorSubscription(userId: string) {
    const { data } = await supabaseAdmin
        .from('subscriptions')
        .select('id, pubs_remaining, expires_at, formulas(name, formula_key, pub_duration_days)')
        .eq('agent_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    return data
}

export default async function KwakuPublishPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    const subscription = await getValidatorSubscription(session.userId)
    const canPublish   = subscription && subscription.pubs_remaining > 0

    return (
        <div className="flex flex-col gap-6 max-w-3xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Publish a Listing</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Publishing under your own validator profile. Listings are validated instantly.
                </p>
            </div>

            {/* Info banner */}
            <div className="bg-indigo-950 border border-indigo-800 rounded-2xl p-4">
                <p className="text-sm text-indigo-300">
                    <span className="font-bold">Validator publishing: </span>
                    Listings you publish are automatically validated and go live immediately,
                    without requiring a separate validation step.
                </p>
            </div>

            {/* No subscription */}
            {!canPublish && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8
                        flex flex-col items-center text-center gap-3">
                    <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25
                     2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25
                     2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                    </svg>
                    <p className="font-bold text-gray-400">No active subscription</p>
                    <p className="text-sm text-gray-600">
                        You need an active subscription to publish listings on your own profile.
                    </p>
                </div>
            )}

            {/* Publish form */}
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