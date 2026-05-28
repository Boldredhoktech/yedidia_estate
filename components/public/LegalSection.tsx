// components/public/LegalSection.tsx
// Shared sub-components for all legal pages.
// Extracted here so page files don't export React components
// (which conflicts with Next.js page module type constraints).

import { siteConfig } from '@/config/siteconfig'

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
                {title}
            </h2>
            <div className="text-gray-700 leading-relaxed flex flex-col gap-3 text-base
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2
                      [&_li]:leading-relaxed">
                {children}
            </div>
        </section>
    )
}

export function ContactBlock() {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
            <p className="font-bold text-gray-900">{siteConfig.legal.companyName}</p>
            <p className="text-sm text-gray-600">{siteConfig.address.full}</p>
            <a href={`mailto:${siteConfig.contact.emailContact}`}
               className="text-sm text-brand-600 hover:text-brand-800 underline underline-offset-2">
                {siteConfig.contact.emailContact}
            </a>
            <a href={`tel:${siteConfig.contact.phoneMain.replace(/\s/g, '')}`}
               className="text-sm text-brand-600 hover:text-brand-800 underline underline-offset-2">
                {siteConfig.contact.phoneMain}
            </a>
        </div>
    )
}
