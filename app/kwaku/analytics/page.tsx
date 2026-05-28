// app/kwaku/analytics/page.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import AnalyticsChart  from '@/components/kwaku/AnalyticsChart'
import { siteConfig }  from '@/config/siteconfig'

export default async function KwakuAnalyticsPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Visitor Analytics</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Track visitor traffic, geographic origins and trends across the platform.
                    </p>
                </div>

                {/* Live site link */}
                <a
                    href={siteConfig.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold
                     text-indigo-400 hover:text-indigo-200 border border-indigo-800
                     hover:border-indigo-600 px-3 py-2 rounded-xl
                     transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5
                     A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                    </svg>
                    Live site
                </a>
            </div>

            {/* Info notice */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="text-gray-300 font-semibold">How it works: </span>
                    Visitor data is collected when someone visits any page on the platform.
                    IP addresses are anonymised for privacy. Geographic data is derived from
                    approximate IP geolocation. Unique visitor counts are estimated.
                </p>
            </div>

            {/* Chart component — client-side with date filter */}
            <AnalyticsChart />

        </div>
    )
}