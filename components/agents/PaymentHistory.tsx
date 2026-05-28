// components/agents/PaymentHistory.tsx

import type { PaymentRecord } from '@/app/agents/billing/page'

const STATUS_STYLES: Record<string, string> = {
    success:  'bg-emerald-100 text-emerald-700',
    pending:  'bg-amber-100   text-amber-700',
    failed:   'bg-red-100     text-red-600',
    refunded: 'bg-gray-100    text-gray-500',
}

const METHOD_LABELS: Record<string, string> = {
    paystack: 'Paystack',
    manual:   'Manual',
}

export default function PaymentHistory({ payments }: { payments: PaymentRecord[] }) {
    if (payments.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75
                   4.5h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75
                   a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/>
                </svg>
                <p className="text-gray-500 text-sm font-medium">No payment history yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-base">Payment History</h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        {['Date', 'Plan', 'Amount', 'Method', 'Status', 'Reference'].map(h => (
                            <th key={h}
                                className="px-4 py-3 text-left text-xs font-bold text-gray-500
                               uppercase tracking-wide whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                {new Date(p.created_at).toLocaleDateString('en-GH', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                                {p.formulas
                                    ? `${p.formulas.formula_key} — ${p.formulas.name}`
                                    : '—'
                                }
                            </td>
                            <td className="px-4 py-3 font-bold text-brand-600 whitespace-nowrap">
                                {p.currency} {p.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {METHOD_LABELS[p.method] ?? p.method}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize
                                    ${STATUS_STYLES[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {p.status}
                  </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">
                                {p.paystack_ref
                                    ? p.paystack_ref.slice(0, 16) + '…'
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