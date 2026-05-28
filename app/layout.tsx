// app/layout.tsx

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/config/siteconfig'
import { agencyConfig } from '@/config/agency'

// ─────────────────────────────────────────────
// FONT
// ─────────────────────────────────────────────

const plusJakarta = Plus_Jakarta_Sans({
    subsets:  ['latin'],
    weight:   ['300', '400', '500', '600', '700', '800'],
    variable: '--font-jakarta',
    display:  'swap',
})

// ─────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default:  siteConfig.seo.defaultTitle,
        template: siteConfig.seo.titleTemplate,
    },
    description: siteConfig.seo.defaultDescription,
    keywords:    [...siteConfig.seo.keywords],
    authors:     [{ name: siteConfig.name, url: siteConfig.url }],
    creator:     siteConfig.name,
    openGraph: {
        type:        'website',
        locale:      siteConfig.locale,
        url:         siteConfig.url,
        siteName:    siteConfig.name,
        title:       siteConfig.seo.defaultTitle,
        description: siteConfig.seo.defaultDescription,
        images: [
            {
                url:    siteConfig.seo.ogImage,
                width:  1200,
                height: 630,
                alt:    siteConfig.name,
            },
        ],
    },
    twitter: {
        card:    'summary_large_image',
        title:   siteConfig.seo.defaultTitle,
        description: siteConfig.seo.defaultDescription,
        images:  [siteConfig.seo.ogImage],
        creator: siteConfig.seo.twitterHandle,
    },
    icons: {
        icon:             [{ url: '/logo.png', type: 'image/png' }],
        apple:            '/apple-touch-icon.png',
        shortcut:         '/logo.png',
    },
    robots: {
        index:  true,
        follow: true,
    },
}

// ─────────────────────────────────────────────
// ROOT LAYOUT
// ─────────────────────────────────────────────

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={plusJakarta.variable}>
        <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
        </body>
        </html>
    )
}