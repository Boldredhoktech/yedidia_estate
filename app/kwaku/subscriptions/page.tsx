// app/kwaku/subscriptions/page.tsx

import { redirect }          from 'next/navigation'
import { getSession }        from '@/lib/auth'
import { supabaseAdmin }     from '@/lib/db'
import SubscriptionsManager  from '@/components/kwaku/SubscriptionsManager'
import type { Formula }      from '@/components/kwaku/SubscriptionsManager'

async function getFormulas(): Promise<Formula[]> {
    const { data, error } = await supabaseAdmin
        .from('formulas')
        .select('id, formula_key, name, pub_count, pub_duration_days, validity_days, price_ghs')
        .eq('is_active', true)
        .order('formula_key')

    if (error) return []
    return (data ?? []) as Formula[]
}

export default async function KwakuSubscriptionsPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    const formulas = await getFormulas()

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Manual Subscriptions</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Activate subscriptions for agents who paid by cash or mobile money.
                </p>
            </div>

            <SubscriptionsManager formulas={formulas} />

        </div>
    )
}
