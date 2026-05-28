// app/comptable/payments/page.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import PaymentsLog     from '@/components/comptable/PaymentsLog'

export default async function ComptablePaymentsPage() {
    const session = await getSession()
    if (!session) redirect('/comptable/login')

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Payment Logs</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Full payment history — filter by status, method and date range.
                </p>
            </div>

            {/* Interactive log */}
            <PaymentsLog />

        </div>
    )
}