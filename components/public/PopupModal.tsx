// components/public/PopupModal.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface PopupData {
    id:            string
    title:         string | null
    image_url:     string
    link_url:      string | null
    display_from:  string | null
    display_until: string | null
}

const DISMISSED_KEY = 'ye_popup_dismissed'

export default function PopupModal() {
    const [popup,   setPopup]   = useState<PopupData | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        async function fetchPopup() {
            try {
                // Check session — don't show again if already dismissed
                const dismissed = sessionStorage.getItem(DISMISSED_KEY)
                if (dismissed) return

                const res  = await fetch('/api/popup', { cache: 'no-store' })
                const json = await res.json()

                if (json.popup) {
                    setPopup(json.popup)
                    // Small delay for a smooth entrance after page load
                    setTimeout(() => setVisible(true), 800)
                }
            } catch {
                // Silently fail — popup is non-critical
            }
        }

        fetchPopup()
    }, [])

    const dismiss = useCallback(() => {
        setVisible(false)
        sessionStorage.setItem(DISMISSED_KEY, '1')
        // Clean up popup data after animation
        setTimeout(() => setPopup(null), 300)
    }, [])

    if (!popup) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
                    transition-opacity duration-300
                    ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={dismiss}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={popup.title ?? 'Announcement'}
                className={`fixed inset-0 z-50 flex items-center justify-center p-4
                    transition-all duration-300 pointer-events-none
                    ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden
                        max-w-lg w-full pointer-events-auto
                        max-h-[90vh] flex flex-col">

                    {/* Close button */}
                    <button
                        onClick={dismiss}
                        aria-label="Close announcement"
                        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full
                       bg-black/40 hover:bg-black/60 text-white
                       flex items-center justify-center
                       transition-colors duration-150 backdrop-blur-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>

                    {/* Image / flyer */}
                    {popup.link_url ? (
                        <a
                            href={popup.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={dismiss}
                            className="block relative w-full flex-1 min-h-[280px] cursor-pointer"
                        >
                            <Image
                                src={popup.image_url}
                                alt={popup.title ?? 'Announcement'}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 100vw, 512px"
                                priority
                            />
                        </a>
                    ) : (
                        <div className="relative w-full flex-1 min-h-[280px]">
                            <Image
                                src={popup.image_url}
                                alt={popup.title ?? 'Announcement'}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 100vw, 512px"
                                priority
                            />
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-5 py-4 flex items-center justify-between
                          border-t border-gray-100 bg-gray-50 flex-shrink-0">
                        {popup.title && (
                            <p className="text-sm font-semibold text-gray-700 truncate pr-4">
                                {popup.title}
                            </p>
                        )}
                        <button
                            onClick={dismiss}
                            className="flex-shrink-0 text-sm font-semibold text-gray-500
                         hover:text-brand-600 transition-colors duration-150
                         underline underline-offset-2"
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}