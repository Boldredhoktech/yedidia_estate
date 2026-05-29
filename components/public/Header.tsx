// components/public/Header.tsx

import Link          from 'next/link'
import Image         from 'next/image'
import { siteConfig }  from '@/config/siteconfig'
import { agencyConfig } from '@/config/agency'

export default function Header() {
    const wa = siteConfig.contact.whatsappLink
    const ph = siteConfig.contact.phoneMain

    return (
        <header className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* ── Logo ── */}
                    <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
                        {/* Logo */}
                        <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-xl overflow-hidden
                            bg-white border border-gray-100 flex-shrink-0
                            shadow-md group-hover:shadow-brand-300 transition-shadow duration-300">
                            <Image
                                src="/logo.png"
                                alt={agencyConfig.name}
                                fill
                                className="object-contain p-1 z-10"
                                unoptimized
                                priority
                            />
                        </div>

                        {/* Brand name */}
                        <div className="flex flex-col leading-none">
              <span className="text-gray-900 font-bold text-base md:text-lg tracking-tight
                               group-hover:text-brand-500 transition-colors duration-200">
                {agencyConfig.name}
              </span>
                            <span className="text-gray-400 text-[10px] md:text-xs font-medium tracking-wide
                               hidden sm:block">
                {agencyConfig.ghana.flagEmoji} Ghana Real Estate
              </span>
                        </div>
                    </Link>

                    {/* ── Right side: contact CTAs ── */}
                    <div className="flex items-center gap-2 md:gap-3">

                        {/* WhatsApp button — always visible */}
                        <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Chat on WhatsApp"
                            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600
                         text-white text-xs md:text-sm font-semibold
                         px-3 md:px-4 py-2 md:py-2.5 rounded-xl
                         transition-all duration-200 shadow-sm hover:shadow-md
                         active:scale-95"
                        >
                            {/* WhatsApp icon */}
                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
                         -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
                         -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
                         -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
                         .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
                         -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
                         -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
                         -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
                         .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
                         .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
                         .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508
                         A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22
                         c-1.846 0-3.574-.498-5.065-1.367l-.363-.215-3.762.895.952-3.668
                         -.236-.376A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10
                         -4.477 10-10 10z"/>
                            </svg>
                            <span className="hidden sm:inline">WhatsApp</span>
                        </a>

                        {/* Phone call — hidden on very small screens */}
                        <a
                            href={`tel:${ph.replace(/\s/g, '')}`}
                            aria-label={`Call ${ph}`}
                            className="hidden xs:flex items-center gap-1.5 bg-gray-50 hover:bg-brand-50
                         text-gray-700 hover:text-brand-600 border border-gray-200
                         hover:border-brand-200 text-xs md:text-sm font-semibold
                         px-3 md:px-4 py-2 md:py-2.5 rounded-xl
                         transition-all duration-200 active:scale-95"
                        >
                            {/* Phone icon */}
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0
                         002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11
                         -.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38
                         a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97
                         c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0
                         00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                            </svg>
                            <span className="hidden md:inline">{ph}</span>
                        </a>

                    </div>
                </div>
            </div>
        </header>
    )
}