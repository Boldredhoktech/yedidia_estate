// components/agents/MediaUploader.tsx

'use client'

import { useState, useRef } from 'react'
import { siteConfig }       from '@/config/siteconfig'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Props {
    mediaType:        'photo' | 'video'
    agentId:          string
    onUploadComplete: (urls: string[]) => void
}

interface UploadedFile {
    url:      string
    name:     string
    preview?: string
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function MediaUploader({ mediaType, agentId, onUploadComplete }: Props) {
    const [files,    setFiles]    = useState<UploadedFile[]>([])
    const [uploading,setUploading]= useState(false)
    const [error,    setError]    = useState<string | null>(null)
    const inputRef               = useRef<HTMLInputElement>(null)

    const isVideo   = mediaType === 'video'
    const maxFiles  = isVideo ? 1 : siteConfig.media.photo.maxPerListing
    const maxSizeMB = isVideo ? siteConfig.media.video.maxSizeMB : siteConfig.media.photo.maxSizeMB
    const accept    = isVideo
        ? siteConfig.media.video.acceptedFormats.join(',')
        : siteConfig.media.photo.acceptedFormats.join(',')

    async function handleFiles(selected: FileList) {
        setError(null)

        const remaining = maxFiles - files.length
        if (remaining <= 0) {
            setError(`Maximum ${maxFiles} ${isVideo ? 'video' : 'photo'}${maxFiles > 1 ? 's' : ''} allowed.`)
            return
        }

        const toUpload = Array.from(selected).slice(0, remaining)
        const uploaded: UploadedFile[] = []

        setUploading(true)

        for (const file of toUpload) {
            // Size check
            if (file.size > (isVideo ? siteConfig.media.video.maxSizeBytes : siteConfig.media.photo.maxSizeBytes)) {
                setError(`"${file.name}" exceeds the ${maxSizeMB} MB limit.`)
                continue
            }

            // Video duration check (client-side)
            if (isVideo) {
                const ok = await checkVideoDuration(file)
                if (!ok) {
                    setError(`Video must be ${siteConfig.media.video.maxDurationSeconds} seconds or less.`)
                    continue
                }
            }

            // Upload
            const form = new FormData()
            form.append('file',      file)
            form.append('agentId',   agentId)
            form.append('mediaType', mediaType)

            try {
                const res  = await fetch('/api/agents/upload', { method: 'POST', body: form })
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error ?? 'Upload failed.')
                    continue
                }

                const preview = isVideo ? undefined : URL.createObjectURL(file)
                uploaded.push({ url: data.url, name: file.name, preview })

            } catch {
                setError('Upload failed. Please check your connection.')
            }
        }

        if (uploaded.length > 0) {
            const next = [...files, ...uploaded]
            setFiles(next)
            onUploadComplete(next.map(f => f.url))
        }

        setUploading(false)
        if (inputRef.current) inputRef.current.value = ''
    }

    function removeFile(index: number) {
        const next = files.filter((_, i) => i !== index)
        setFiles(next)
        onUploadComplete(next.map(f => f.url))
        setError(null)
    }

    const canAdd = files.length < maxFiles && !uploading

    // ─────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-4">

            {/* Drop zone / button */}
            {canAdd && (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8
                               flex flex-col items-center gap-3 cursor-pointer
                               hover:border-brand-400 hover:bg-brand-50
                               transition-all duration-150"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center
                                    justify-center">
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-brand-500
                                            border-t-transparent rounded-full animate-spin"/>
                        ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none"
                                 viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5
                                         0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0
                                         013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
                            </svg>
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">
                            {uploading ? 'Uploading…' : `Click to add ${isVideo ? 'video' : 'photo'}${!isVideo && maxFiles > 1 ? 's' : ''}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {isVideo
                                ? `MP4, MOV or WebM · max ${maxSizeMB} MB · max ${siteConfig.media.video.maxDurationSeconds}s`
                                : `JPG, PNG or WebP · max ${maxSizeMB} MB each`
                            }
                            {!isVideo && ` · ${files.length}/${maxFiles} added`}
                        </p>
                    </div>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        multiple={!isVideo}
                        className="hidden"
                        onChange={e => e.target.files && handleFiles(e.target.files)}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200
                               rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            {/* Previews */}
            {files.length > 0 && (
                <div className={`grid gap-3 ${isVideo ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {files.map((f, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden
                                                border border-gray-200 bg-gray-50">
                            {isVideo ? (
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex
                                                    items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-gray-500" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75
                                                     0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0
                                                     002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25
                                                     2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-600 truncate flex-1">{f.name}</p>
                                </div>
                            ) : f.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.preview} alt={f.name}
                                     className="w-full aspect-square object-cover"/>
                            ) : (
                                <div className="w-full aspect-square bg-gray-100 flex items-center
                                                justify-center">
                                    <svg className="w-8 h-8 text-gray-300" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              strokeWidth={1.5}
                                              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159
                                                 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182
                                                 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6
                                                 a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12
                                                 a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008
                                                 V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
                                    </svg>
                                </div>
                            )}

                            {/* Remove button */}
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full
                                           bg-red-500 text-white flex items-center justify-center
                                           opacity-0 group-hover:opacity-100 transition-opacity
                                           hover:bg-red-600"
                                title="Remove"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

// ─────────────────────────────────────────────
// HELPER — check video duration client-side
// ─────────────────────────────────────────────

function checkVideoDuration(file: File): Promise<boolean> {
    return new Promise(resolve => {
        const url   = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(url)
            resolve(video.duration <= siteConfig.media.video.maxDurationSeconds)
        }
        video.onerror = () => { URL.revokeObjectURL(url); resolve(false) }
        video.src = url
    })
}
