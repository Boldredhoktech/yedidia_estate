// components/public/PropertyGallery.tsx

'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface MediaItem {
    id:               string
    storage_url:      string
    type:             string
    display_order:    number
    duration_seconds: number | null
}

interface PropertyGalleryProps {
    media:  MediaItem[]
    title:  string
}

export default function PropertyGallery({ media, title }: PropertyGalleryProps) {
    const [activeIdx,   setActiveIdx]   = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const photos  = media.filter(m => m.type === 'photo')
    const video   = media.find(m => m.type === 'video')
    const isParcel = !!video && photos.length === 0

    const openLightbox  = useCallback((i: number) => { setActiveIdx(i); setLightboxOpen(true)  }, [])
    const closeLightbox = useCallback(() => setLightboxOpen(false), [])
    const prev = useCallback(() => setActiveIdx(i => (i - 1 + photos.length) % photos.length), [photos.length])
    const next = useCallback(() => setActiveIdx(i => (i + 1) % photos.length), [photos.length])

    // ── Parcel — video only ──
    if (isParcel && video) {
        return (
            <div className="w-full rounded-2xl overflow-hidden bg-black shadow-lg">
                <video
                    src={video.storage_url}
                    controls
                    playsInline
                    className="w-full max-h-[520px] object-contain"
                    poster=""
                />
            </div>
        )
    }

    // ── No media ──
    if (photos.length === 0) {
        return (
            <div className="w-full rounded-2xl bg-gray-100 flex items-center justify-center
                      aspect-[16/9] shadow-inner">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159
                     5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909
                     2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0
                     00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5
                     1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375
                     0 11-.75 0 .375.375 0 01.75 0z"/>
                    </svg>
                    <span className="text-sm font-medium">No photos available</span>
                </div>
            </div>
        )
    }

    // ── Photos gallery ──
    const active = photos[activeIdx]

    return (
        <>
            {/* Main photo */}
            <div className="w-full rounded-2xl overflow-hidden bg-gray-100 shadow-lg
                      relative aspect-[16/9] cursor-zoom-in group"
                 onClick={() => openLightbox(activeIdx)}>
                <Image
                    src={active.storage_url}
                    alt={`${title} — photo ${activeIdx + 1}`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                    priority
                />

                {/* Expand hint */}
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs
                        font-semibold px-2.5 py-1.5 rounded-xl backdrop-blur-sm
                        flex items-center gap-1.5 opacity-0 group-hover:opacity-100
                        transition-opacity duration-200">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0
                     4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15
                     9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                    </svg>
                    View full screen
                </div>

                {/* Photo counter */}
                {photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                          bg-black/60 text-white text-xs font-semibold
                          px-3 py-1 rounded-full backdrop-blur-sm">
                        {activeIdx + 1} / {photos.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1
                        scrollbar-thin scrollbar-thumb-gray-200">
                    {photos.map((photo, idx) => (
                        <button
                            key={photo.id}
                            onClick={() => setActiveIdx(idx)}
                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20
                          rounded-xl overflow-hidden border-2 transition-all duration-150
                          ${idx === activeIdx
                                ? 'border-brand-500 shadow-md scale-105'
                                : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <Image
                                src={photo.storage_url}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* ── LIGHTBOX ── */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center
                     justify-center p-4 backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full
                       bg-white/10 hover:bg-white/20 text-white flex items-center
                       justify-center transition-colors duration-150"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                          bg-white/10 text-white text-sm font-semibold
                          px-3 py-1 rounded-full backdrop-blur-sm">
                        {activeIdx + 1} / {photos.length}
                    </div>

                    {/* Prev arrow */}
                    {photos.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); prev() }}
                            className="absolute left-4 z-10 w-11 h-11 rounded-full
                         bg-white/10 hover:bg-white/25 text-white flex items-center
                         justify-center transition-colors duration-150"
                            aria-label="Previous"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                    )}

                    {/* Full image */}
                    <div
                        className="relative w-full max-w-4xl max-h-[85vh] aspect-auto
                       flex items-center justify-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <Image
                            src={photos[activeIdx].storage_url}
                            alt={`${title} — photo ${activeIdx + 1}`}
                            width={1200}
                            height={900}
                            className="object-contain max-h-[85vh] w-auto rounded-xl shadow-2xl"
                            sizes="100vw"
                        />
                    </div>

                    {/* Next arrow */}
                    {photos.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); next() }}
                            className="absolute right-4 z-10 w-11 h-11 rounded-full
                         bg-white/10 hover:bg-white/25 text-white flex items-center
                         justify-center transition-colors duration-150"
                            aria-label="Next"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </>
    )
}