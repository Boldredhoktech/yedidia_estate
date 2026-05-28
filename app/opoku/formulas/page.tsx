// app/opoku/formulas/page.tsx

import { redirect }             from 'next/navigation'
import { getSession }           from '@/lib/auth'
import FormulaPricingManager    from '@/components/opoku/FormulaPricingManager'

export default async function OpokuFormulasPage() {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') redirect('/opoku/login')

    return (
        <div className="flex flex-col gap-6 max-w-4xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Formula Pricing</h1>
                <p className="text-yellow-700 text-sm mt-1">
                    Set and update subscription plan prices. Changes apply immediately
                    to the agent billing page.
                </p>
            </div>

            {/* Warning */}
            <div className="bg-yellow-950 border border-yellow-800 rounded-2xl p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
                     c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032
                     -1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                    <p className="text-yellow-500 text-xs leading-relaxed">
                        <span className="font-bold">Important: </span>
                        Prices are visible to all agents immediately after saving.
                        Existing active subscriptions and their publication credits
                        are never affected by price changes — only new purchases
                        will use the updated price.
                    </p>
                </div>
            </div>

            {/* Pricing manager */}
            <FormulaPricingManager />

        </div>
    )
}