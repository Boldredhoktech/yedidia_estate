// components/public/Footer.tsx

import Link            from 'next/link'
import { siteConfig }  from '@/config/siteconfig'
import { agencyConfig } from '@/config/agency'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 text-gray-300">

            {/* Kente strip top accent */}
            <div className="h-1 w-full flex">
                {agencyConfig.ghana.kenteStripe.map((color, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                ))}
                <div className="flex-1 bg-black" />
                {[...agencyConfig.ghana.kenteStripe].reverse().map((color, i) => (
                    <div key={`r-${i}`} className="flex-1" style={{ backgroundColor: color }} />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* ── Column 1 — Brand ── */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        {/* Logo / name */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center
                              justify-center flex-shrink-0">
                <span className="text-white font-extrabold text-sm">
                  {agencyConfig.shortName}
                </span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-base leading-none">
                                    {agencyConfig.name}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {agencyConfig.ghana.flagEmoji} Ghana Real Estate
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-400 leading-relaxed">
                            {siteConfig.tagline}. Connecting buyers, sellers and renters
                            across Ghana.
                        </p>

                        {/* Social icons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <SocialLink href={siteConfig.social.facebook}  label="Facebook"  icon={<FacebookIcon />} />
                            <SocialLink href={siteConfig.social.instagram} label="Instagram" icon={<InstagramIcon />} />
                            <SocialLink href={siteConfig.social.tiktok}    label="TikTok"    icon={<TikTokIcon />} />
                            <SocialLink href={siteConfig.social.linkedin}  label="LinkedIn"  icon={<LinkedInIcon />} />
                            <SocialLink href={siteConfig.social.youtube}   label="YouTube"   icon={<YouTubeIcon />} />
                        </div>
                    </div>

                    {/* ── Column 2 — Contact ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
                            Contact Us
                        </h3>
                        <ul className="flex flex-col gap-3">
                            <ContactItem
                                icon={<PhoneIcon />}
                                label={siteConfig.contact.phoneMain}
                                href={`tel:${siteConfig.contact.phoneMain.replace(/\s/g, '')}`}
                            />
                            <ContactItem
                                icon={<PhoneIcon />}
                                label={siteConfig.contact.phoneSupport}
                                href={`tel:${siteConfig.contact.phoneSupport.replace(/\s/g, '')}`}
                            />
                            <ContactItem
                                icon={<WhatsAppIcon />}
                                label="WhatsApp"
                                href={siteConfig.contact.whatsappLink}
                                external
                            />
                            <ContactItem
                                icon={<EmailIcon />}
                                label={siteConfig.contact.emailContact}
                                href={`mailto:${siteConfig.contact.emailContact}`}
                            />
                            <ContactItem
                                icon={<TelegramIcon />}
                                label="Telegram"
                                href={siteConfig.contact.telegram}
                                external
                            />
                        </ul>
                    </div>

                    {/* ── Column 3 — Address & Hours ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
                            Our Office
                        </h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2.5">
                                <MapIcon className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {siteConfig.address.full}
                                </p>
                            </div>
                            <a
                                href={siteConfig.address.googleMapsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-brand-400 hover:text-brand-300
                           underline underline-offset-2 transition-colors duration-150 w-fit"
                            >
                                View on Google Maps →
                            </a>
                        </div>

                        <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
                            <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                                Business Hours
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-mono">
                                {agencyConfig.businessHours.weekdays}<br/>
                                {agencyConfig.businessHours.saturday}<br/>
                                {agencyConfig.businessHours.sunday}
                            </p>
                            <p className="text-xs text-gray-500">{agencyConfig.businessHours.timezone}</p>
                        </div>
                    </div>

                    {/* ── Column 4 — Legal & Quick links ── */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest">
                            Legal & Info
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            <FooterLink href={siteConfig.legal.privacyPolicyUrl}  label="Privacy Policy" />
                            <FooterLink href={siteConfig.legal.termsOfSaleUrl}    label="Terms of Sale" />
                            <FooterLink href={siteConfig.legal.legalNoticeUrl}    label="Legal Notice" />
                            <FooterLink href={siteConfig.legal.deliveryUrl}       label="Delivery Conditions" />
                            <FooterLink href={siteConfig.legal.cookiePolicyUrl}   label="Cookie Policy" />
                            <FooterLink href="/legal/complaint"                    label="File a Complaint"
                                        highlight />
                            <FooterLink href="/legal/partners"
                                        label="Certified Legal Partners" />
                        </ul>

                        {/* Company registration */}
                        <div className="border-t border-gray-800 pt-4 flex flex-col gap-1">
                            <p className="text-xs text-gray-500">
                                Reg: {siteConfig.legal.registrationNumber}
                            </p>
                            <p className="text-xs text-gray-500">
                                VAT: {siteConfig.legal.vatNumber}
                            </p>
                        </div>
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div className="border-t border-gray-800 mt-10 pt-6
                        flex flex-col sm:flex-row items-center
                        justify-between gap-3 text-center">
                    <p className="text-xs text-gray-500">
                        © {agencyConfig.foundedYear === year
                        ? year
                        : `${agencyConfig.foundedYear}–${year}`
                    } {siteConfig.legal.companyName}. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-600">
                        Made with{' '}
                        <span className="text-brand-500">♥</span>
                        {' '}in {agencyConfig.ghana.flagEmoji} Ghana
                    </p>
                </div>
            </div>
        </footer>
    )
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

function SocialLink({
                        href, label, icon,
                    }: { href: string; label: string; icon: React.ReactNode }) {
    if (!href || href.includes('your-')) return null
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-brand-500
                 flex items-center justify-center text-gray-400 hover:text-white
                 transition-all duration-200"
        >
            {icon}
        </a>
    )
}

function ContactItem({
                         icon, label, href, external = false,
                     }: { icon: React.ReactNode; label: string; href: string; external?: boolean }) {
    return (
        <li>
            <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-2.5 text-sm text-gray-400
                   hover:text-white transition-colors duration-150 group"
            >
        <span className="w-4 h-4 flex-shrink-0 text-brand-400
                         group-hover:text-brand-300 transition-colors duration-150">
          {icon}
        </span>
                {label}
            </a>
        </li>
    )
}

function FooterLink({
                        href, label, highlight = false,
                    }: { href: string; label: string; highlight?: boolean }) {
    return (
        <li>
            <Link
                href={href}
                className={`text-sm transition-colors duration-150
                    ${highlight
                    ? 'text-brand-400 hover:text-brand-300 font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
            >
                {label}
            </Link>
        </li>
    )
}

// ─────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────

const MapIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24"
         stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
    </svg>
)

const PhoneIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
         className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372
             c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97
             1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162
             -.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963
             3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
    </svg>
)

const EmailIcon = () => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
         className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25
             -2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25
             2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0
             01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
    </svg>
)

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
             -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463
             -2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606
             .134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025
             -.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008
             -.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0
             1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262
             .489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
             .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.508
             A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.846
             0-3.574-.498-5.065-1.367l-.363-.215-3.762.895.952-3.668-.236-.376A9.944
             9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
)

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0
             0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0
             0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168
             .9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124
             -2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23
             .007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061
             3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245
             -1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529
             6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
)

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954
             10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533
             -4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956
             1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
)

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058
             1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664
             4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07
             -3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204
             .013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069
             4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052
             .014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78
             6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354
             -.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667
             -.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0
             5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110
             -8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
)

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11
             2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93
             -.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17
             -5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02
             -.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15
             -1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04
             -1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01
             2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03
             -.01-8.05.02-12.07z"/>
    </svg>
)

const LinkedInIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136
             1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37
             -1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01
             -2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452
             zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451
             C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
)

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s
             -7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805
             31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502
             9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00
             .5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
)