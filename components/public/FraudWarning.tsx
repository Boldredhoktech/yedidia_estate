// components/public/FraudWarning.tsx

'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { siteConfig } from '@/config/siteconfig'

export default function FraudWarning() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="w-full bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-start gap-3">

                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100
                          flex items-center justify-center mt-0.5">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948
                       3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949
                       3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12
                       15.75h.007v.008H12v-.008z"/>
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-800 leading-relaxed">
                            <span className="font-bold">Important notice: </span>
                            {siteConfig.fraudWarning.general}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-3 mt-2">

                            {/* Legal partners */}
                            <Link
                                href={siteConfig.fraudWarning.legalPartnersUrl}
                                className="inline-flex items-center gap-1.5 text-xs font-bold
                           text-amber-700 hover:text-amber-900 underline
                           underline-offset-2 transition-colors duration-150"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0
                           004.121-.952 4.125 4.125 0 00-7.533-2.493M15
                           19.128v-.003c0-1.113-.285-2.16-.786-3.07M15
                           19.128v.106A12.318 12.318 0 018.624 21c-2.331
                           0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375
                           0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75
                           0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625
                           0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                                </svg>
                                {siteConfig.fraudWarning.legalPartnersLabel}
                            </Link>

                            <span className="text-amber-300 text-xs hidden sm:inline">·</span>

                            {/* Complaint */}
                            <Link
                                href={siteConfig.fraudWarning.complaintUrl}
                                className="inline-flex items-center gap-1.5 text-xs font-bold
                           text-red-600 hover:text-red-800 underline
                           underline-offset-2 transition-colors duration-150"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293
                           2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0
                           100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                </svg>
                                {siteConfig.fraudWarning.complaintLabel}
                            </Link>

                        </div>
                    </div>

                    {/* Dismiss */}
                    <button
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss warning"
                        className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100
                       hover:bg-amber-200 text-amber-600 flex items-center
                       justify-center transition-colors duration-150 mt-0.5"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>

                </div>
            </div>
        </div>
    )
}