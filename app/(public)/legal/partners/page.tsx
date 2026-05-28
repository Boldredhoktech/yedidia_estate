// app/(public)/legal/partners/page.tsx

import Link           from 'next/link'
import type { Metadata } from 'next'
import { siteConfig } from '@/config/siteconfig'

export const metadata: Metadata = {
    title: 'Certified Legal Partners',
    description:
        'Access Yedidia Estate\'s network of certified notaries, lawyers and bailiffs for legal assistance during property transactions in Ghana.',
}

export default function LegalPartnersPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">

            {/* Back */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500
                   hover:text-brand-600 transition-colors duration-150 mb-8 group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to listings
            </Link>

            {/* Header */}
            <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center
                        justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0
                     2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291
                     0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62
                     10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352
                     5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75
                     4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499
                     -.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0
                     01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"/>
                    </svg>
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                        Certified Legal Partners
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                        We are building a trusted network of notaries, lawyers and bailiffs
                        to assist you with full legal compliance during property purchases
                        and transactions in Ghana.
                    </p>
                </div>
            </div>

            {/* Coming soon card */}
            <div className="bg-gradient-to-br from-brand-50 to-white border border-brand-100
                      rounded-2xl p-8 md:p-10 flex flex-col items-center text-center
                      shadow-sm mb-8">

                {/* Animated clock icon */}
                <div className="w-20 h-20 rounded-full bg-white border-4 border-brand-200
                        flex items-center justify-center shadow-inner mb-6">
                    <svg className="w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>

                <h2 className="text-xl font-extrabold text-gray-900 mb-3">
                    Coming Soon
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-md mb-6">
                    Our team is currently verifying and onboarding certified notaries,
                    lawyers and bailiffs across Ghana. This section will be available
                    very soon.
                </p>

                {/* Placeholder partner type badges */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {[
                        { label: 'Notaires',  color: 'bg-blue-100 text-blue-700 border-blue-200'     },
                        { label: 'Avocats',   color: 'bg-purple-100 text-purple-700 border-purple-200'},
                        { label: 'Huissiers', color: 'bg-amber-100 text-amber-700 border-amber-200'  },
                    ].map(badge => (
                        <span key={badge.label}
                              className={`text-sm font-bold px-4 py-2 rounded-full border
                              ${badge.color} opacity-60`}>
              {badge.label}
            </span>
                    ))}
                </div>

                {/* Contact to be notified */}
                <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl
                        p-5 flex flex-col gap-3">
                    <p className="text-sm font-semibold text-gray-700 text-center">
                        Want to be notified when this launches?
                    </p>
                    <a
                        href={`mailto:${siteConfig.contact.emailPartnership}`}
                        className="w-full flex items-center justify-center gap-2
                       bg-brand-500 hover:bg-brand-600 text-white
                       font-semibold text-sm px-5 py-3 rounded-xl
                       transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0
                       01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25
                       2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916
                       l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0
                       01-1.07-1.916V6.75"/>
                        </svg>
                        Contact our partnerships team
                    </a>
                    <a
                        href={siteConfig.contact.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2
                       bg-emerald-500 hover:bg-emerald-600 text-white
                       font-semibold text-sm px-5 py-3 rounded-xl
                       transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471
                       -.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644
                       .075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653
                       -2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
                       .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149
                       -.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371
                       -.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04
                       2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077
                       4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118
                       .571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413
                       -.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0
                       24l6.335-1.508A11.946 11.946 0 0012 24c6.627 0 12-5.373 12
                       -12S18.627 0 12 0zm0 22c-1.846 0-3.574-.498-5.065-1.367l-.363
                       -.215-3.762.895.952-3.668-.236-.376A9.944 9.944 0 012 12C2 6.477
                       6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        Chat on WhatsApp
                    </a>
                </div>

            </div>

            {/* Why legal verification matters */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71
                     c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032
                     -1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                    </svg>
                    Why legal verification matters
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                    In Ghana, land and property ownership disputes are common.
                    Before any purchase or significant transaction, ensure the title deed
                    is verified, the seller has legal authority, and all documents are
                    authenticated by a certified professional. Yedidia Estate strongly
                    recommends using a qualified notary or lawyer for every transaction.
                </p>
            </div>

        </div>
    )
}