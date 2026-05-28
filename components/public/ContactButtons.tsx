// components/public/ContactButtons.tsx

'use client'

interface ContactButtonsProps {
    whatsapp:   string | null
    phone:      string | null
    listingId?: string
    size?:      'sm' | 'md' | 'lg'
    layout?:    'row' | 'col'
}

/**
 * WhatsApp + Call buttons shown on every property card and detail page.
 * Clicking WhatsApp opens wa.me with the agent's number.
 * Clicking Call triggers tel: protocol to dial directly.
 */
export default function ContactButtons({
                                           whatsapp,
                                           phone,
                                           listingId,
                                           size   = 'md',
                                           layout = 'row',
                                       }: ContactButtonsProps) {

    // ── Size classes ──
    const sizeClasses = {
        sm: 'text-xs px-2.5 py-1.5 gap-1',
        md: 'text-sm px-3   py-2   gap-1.5',
        lg: 'text-base px-4 py-2.5 gap-2',
    }

    const iconSize = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4   h-4',
        lg: 'w-5   h-5',
    }

    const s = sizeClasses[size]
    const i = iconSize[size]

    const containerClass = layout === 'col'
        ? 'flex flex-col gap-2 w-full'
        : 'flex flex-row gap-2 flex-wrap'

    const btnBase = `flex items-center justify-center font-semibold rounded-xl
                   transition-all duration-200 active:scale-95 cursor-pointer
                   select-none ${s}`

    const whatsappClean = whatsapp?.replace(/\D/g, '') ?? ''
    const waLink = whatsappClean
        ? `https://wa.me/${whatsappClean}?text=Hello%2C%20I%20am%20interested%20in%20your%20property${listingId ? `%20(ID%3A%20${listingId})` : ''}%20listed%20on%20Yedidia%20Estate.`
        : null

    if (!waLink && !phone) return null

    return (
        <div className={containerClass}>

            {/* WhatsApp */}
            {waLink && (
                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contact on WhatsApp"
                    className={`${btnBase} bg-emerald-500 hover:bg-emerald-600
                      text-white shadow-sm hover:shadow-md
                      ${layout === 'col' ? 'w-full' : 'flex-1 min-w-0'}`}
                >
                    {/* WhatsApp SVG icon */}
                    <svg className={`${i} flex-shrink-0`} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148
                     -.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
                     -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
                     -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
                     .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
                     -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
                     -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
                     -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
                     .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
                     .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
                     .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24
                     l6.335-1.508A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627
                     0 12 0zm0 22c-1.846 0-3.574-.498-5.065-1.367l-.363-.215-3.762.895
                     .952-3.668-.236-.376A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10
                     4.477 10 10-4.477 10-10 10z"/>
                    </svg>
                    <span>WhatsApp</span>
                </a>
            )}

            {/* Call */}
            {phone && (
                <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    aria-label={`Call ${phone}`}
                    className={`${btnBase} bg-white hover:bg-brand-50
                      text-gray-700 hover:text-brand-700
                      border border-gray-200 hover:border-brand-300
                      ${layout === 'col' ? 'w-full' : 'flex-1 min-w-0'}`}
                >
                    {/* Phone SVG icon */}
                    <svg className={`${i} flex-shrink-0`} fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25
                     v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055
                     -1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0
                     01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271
                     .527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25
                     2.25 0 002.25 4.5v2.25z"/>
                    </svg>
                    <span>Call</span>
                </a>
            )}

        </div>
    )
}