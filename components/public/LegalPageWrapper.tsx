// components/public/LegalPageWrapper.tsx

import Link from 'next/link'
import { siteConfig } from '@/config/siteconfig'

type IconType = 'shield' | 'document' | 'scale' | 'truck' | 'cookie'

interface LegalPageWrapperProps {
    title:    string
    subtitle?: string
    icon:     IconType
    children: React.ReactNode
}

const ICONS: Record<IconType, React.ReactNode> = {
    shield: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598
               6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176
               -1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196
               0-6.1-1.248-8.25-3.285z"/>
        </svg>
    ),
    document: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125
               1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0
               12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125
               1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125
               -.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
        </svg>
    ),
    scale: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472
               0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291
               0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62
               10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031
               .352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202
               L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726
               c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352
               5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25
               4.971z"/>
        </svg>
    ),
    truck: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9
               0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5
               0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504
               1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0
               00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422
               -1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0
               00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>
        </svg>
    ),
    cookie: (
        <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51
               6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155
               8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75
               l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354
               0 01-3 0 3.354 3.354 0 00-3 0L3 18m0-13.5h18"/>
        </svg>
    ),
}

export default function LegalPageWrapper({
                                             title,
                                             subtitle,
                                             icon,
                                             children,
                                         }: LegalPageWrapperProps) {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">

            {/* Back */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold
                   text-gray-500 hover:text-brand-600 transition-colors
                   duration-150 mb-8 group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to listings
            </Link>

            {/* Header */}
            <div className="flex items-start gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100
                        flex items-center justify-center flex-shrink-0">
                    {ICONS[icon]}
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Kente accent */}
            <div className="h-1 w-full flex rounded-full overflow-hidden mb-10">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-8">
                {children}
            </div>

            {/* Bottom nav — other legal pages */}
            <div className="mt-14 border-t border-gray-100 pt-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Other Legal Pages
                </p>
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'Privacy Policy',       href: siteConfig.legal.privacyPolicyUrl  },
                        { label: 'Terms of Sale',         href: siteConfig.legal.termsOfSaleUrl    },
                        { label: 'Legal Notice',          href: siteConfig.legal.legalNoticeUrl    },
                        { label: 'Delivery Conditions',   href: siteConfig.legal.deliveryUrl       },
                        { label: 'Cookie Policy',         href: siteConfig.legal.cookiePolicyUrl   },
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-xs font-semibold text-gray-500 hover:text-brand-600
                         border border-gray-200 hover:border-brand-200 px-3 py-1.5
                         rounded-full transition-colors duration-150"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    )
}