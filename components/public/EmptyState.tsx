// components/public/EmptyState.tsx

import Link from 'next/link'
import { siteConfig } from '@/config/siteconfig'

interface EmptyStateProps {
    hasFilters: boolean
}

export default function EmptyState({ hasFilters }: EmptyStateProps) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex flex-col items-center justify-center text-center gap-6 max-w-md mx-auto">

                {/* Illustration */}
                <div className="w-24 h-24 rounded-2xl bg-brand-50 flex items-center justify-center
                        shadow-inner flex-shrink-0">
                    {hasFilters ? (
                        <svg className="w-12 h-12 text-brand-300" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917
                       1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25
                       2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013
                       L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409
                       A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096
                       A48.32 48.32 0 0112 3z"/>
                        </svg>
                    ) : (
                        <svg className="w-12 h-12 text-brand-300" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75
                       12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875
                       c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125
                       1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                        </svg>
                    )}
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                        {hasFilters
                            ? 'No properties found'
                            : 'No properties yet'}
                    </h2>
                    <p className="text-gray-500 text-base leading-relaxed">
                        {hasFilters
                            ? 'Try adjusting your filters — different city, type, or budget range might show more results.'
                            : 'Our agents are adding new listings every day. Check back soon or contact us directly.'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {hasFilters && (
                        <Link
                            href="/"
                            className="flex-1 flex items-center justify-center gap-2
                         bg-brand-500 hover:bg-brand-600 text-white
                         font-semibold text-sm px-5 py-3 rounded-xl
                         transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            Clear all filters
                        </Link>
                    )}

                    <a
                        href={siteConfig.contact.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2
                       bg-emerald-500 hover:bg-emerald-600 text-white
                       font-semibold text-sm px-5 py-3 rounded-xl
                       transition-all duration-200 active:scale-95 shadow-sm"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099
                       -.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347
                       .223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48
                       -1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298
                       -.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371
                       -.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5
                       -.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
                       -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213
                       3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694
                       .625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006
                       -1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528
                       5.855L0 24l6.335-1.508A11.946 11.946 0 0012 24c6.627 0 12
                       -5.373 12-12S18.627 0 12 0zm0 22c-1.846 0-3.574-.498-5.065
                       -1.367l-.363-.215-3.762.895.952-3.668-.236-.376A9.944 9.944
                       0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                        </svg>
                        Contact us on WhatsApp
                    </a>
                </div>

            </div>
        </div>
    )
}