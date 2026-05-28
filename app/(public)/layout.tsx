// app/(public)/layout.tsx

import type { Metadata } from 'next'
import Header      from '@/components/public/Header'
import Footer      from '@/components/public/Footer'
import KenteStrip  from '@/components/public/KenteStrip'
import PopupModal  from '@/components/public/PopupModal'
import { siteConfig } from '@/config/siteconfig'

export const metadata: Metadata = {
    title: {
        default:  siteConfig.seo.defaultTitle,
        template: siteConfig.seo.titleTemplate,
    },
}

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">

            {/* Decorative Kente strip — top of every public page */}
            <KenteStrip position="top" />

            {/* Site header with logo */}
            <Header />

            {/* Main content — grows to fill viewport */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Kente strip — bottom accent */}
            <KenteStrip position="bottom" />

            {/* Contextual popup — shown to first-time visitors */}
            <PopupModal />

        </div>
    )
}