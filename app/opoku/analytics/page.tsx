// app/opoku/analytics/page.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import AnalyticsChart  from '@/components/kwaku/AnalyticsChart'
import { siteConfig }  from '@/config/siteconfig'

export default async function OpokuAnalyticsPage() {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') redirect('/opoku/login')

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Platform Analytics</h1>
                    <p className="text-yellow-700 text-sm mt-1">
                        Full visitor traffic overview — all periods, all locations.
                    </p>
                </div>
                <a
                    href={siteConfig.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold
                     text-yellow-600 hover:text-yellow-400 border border-yellow-900
                     hover:border-yellow-700 px-3 py-2 rounded-xl
                     transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21
                     h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                    </svg>
                    Live site
                </a>
            </div>

            {/* Reuse same AnalyticsChart as Kwaku — API already allows superadmin */}
            <AnalyticsChart />

        </div>
    )
}