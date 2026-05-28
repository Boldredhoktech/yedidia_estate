// components/agents/PublishForm.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useRouter }           from 'next/navigation'
import { siteConfig }          from '@/config/siteconfig'
import MediaUploader           from '@/components/agents/MediaUploader'

interface PublishFormProps {
    subscriptionId:  string
    agentId:         string
    pubDurationDays: number
}

type PropertyType = 'parcelle' | 'maison_vente' | 'maison_location' | 'airbnb'
type FormState    = 'idle' | 'loading' | 'error' | 'success'

const PROPERTY_TYPES = siteConfig.propertyTypes

export default function PublishForm({
                                        subscriptionId,
                                        agentId,
                                        pubDurationDays,
                                    }: PublishFormProps) {
    const router  = useRouter()
    const [state, setState]   = useState<FormState>('idle')
    const [errMsg, setErrMsg] = useState('')
    const [uploadedMedia, setUploadedMedia] = useState<string[]>([]) // storage URLs

    const [form, setForm] = useState({
        type:         '' as PropertyType | '',
        title:        '',
        description:  '',
        city:         '',
        neighborhood: '',
        price:        '',
        price_label:  '',
        area_m2:      '',
        area_hectares:'',
        bedrooms:     '',
        bathrooms:    '',
    })

    const selectedType = PROPERTY_TYPES.find(t => t.value === form.type)
    const isParcel     = form.type === 'parcelle'
    const needsArea    = form.type === 'parcelle'
    const needsRooms   = ['maison_vente', 'maison_location', 'airbnb'].includes(form.type)

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (state === 'loading') return

        // Validate media
        if (uploadedMedia.length === 0) {
            setErrMsg(isParcel
                ? 'Please upload a video for this parcel listing.'
                : 'Please upload at least one photo.')
            setState('error')
            return
        }

        setState('loading')
        setErrMsg('')

        try {
            const payload = {
                subscriptionId,
                agentId,
                type:         form.type,
                title:        form.title.trim(),
                description:  form.description.trim() || null,
                city:         form.city.trim(),
                neighborhood: form.neighborhood.trim(),
                price:        parseFloat(form.price),
                price_label:  form.price_label.trim() || null,
                area_m2:      form.area_m2      ? parseFloat(form.area_m2)      : null,
                area_hectares:form.area_hectares ? parseFloat(form.area_hectares) : null,
                bedrooms:     form.bedrooms     ? parseInt(form.bedrooms)        : null,
                bathrooms:    form.bathrooms    ? parseInt(form.bathrooms)        : null,
                mediaUrls:    uploadedMedia,
                mediaType:    isParcel ? 'video' : 'photo',
            }

            const res  = await fetch('/api/agents/listings', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Failed to submit listing. Please try again.')
                setState('error')
                return
            }

            setState('success')
            router.push('/agents/my-listings')
            router.refresh()

        } catch {
            setErrMsg('Network error. Please check your connection.')
            setState('error')
        }
    }

    return (
        <form onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Header stripe */}
            <div className="h-1 w-full flex">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-7">

                {/* ── Section 1: Type ── */}
                <FormSection title="1. Property Type" required>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {PROPERTY_TYPES.map(pt => (
                            <button
                                key={pt.value}
                                type="button"
                                onClick={() => setForm(prev => ({
                                    ...prev, type: pt.value as PropertyType,
                                    area_m2: '', area_hectares: '', bedrooms: '', bathrooms: '',
                                }))}
                                className={`py-3 px-2 rounded-xl border-2 text-sm font-bold
                            transition-all duration-150 text-center
                            ${form.type === pt.value
                                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {pt.label}
                                <span className="block text-xs font-normal mt-0.5 text-gray-400">
                  {pt.mediaType === 'video' ? '📹 Video' : '📷 Photos'}
                </span>
                            </button>
                        ))}
                    </div>
                </FormSection>

                {form.type && (
                    <>
                        {/* ── Section 2: Basic info ── */}
                        <FormSection title="2. Listing Details" required>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <label className={labelClass}>Title <Req /></label>
                                    <input name="title" type="text" required value={form.title}
                                           onChange={handleChange} placeholder="e.g. Beautiful 3-bed house in East Legon"
                                           className={inputClass} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>City <Req /></label>
                                    <input name="city" type="text" required value={form.city}
                                           onChange={handleChange} placeholder="e.g. Accra"
                                           className={inputClass} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Neighbourhood / District <Req /></label>
                                    <input name="neighborhood" type="text" required value={form.neighborhood}
                                           onChange={handleChange} placeholder="e.g. East Legon"
                                           className={inputClass} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>Price (GHS) <Req /></label>
                                    <input name="price" type="number" min="0" step="0.01" required
                                           value={form.price} onChange={handleChange}
                                           placeholder="e.g. 250000" className={inputClass} />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>
                                        Price label
                                        <span className="text-gray-400 font-normal ml-1">(optional)</span>
                                    </label>
                                    <input name="price_label" type="text" value={form.price_label}
                                           onChange={handleChange} placeholder="e.g. / month, / year"
                                           className={inputClass} />
                                </div>

                                {/* Parcel area fields */}
                                {needsArea && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className={labelClass}>Area (m²)</label>
                                            <input name="area_m2" type="number" min="0" step="0.01"
                                                   value={form.area_m2} onChange={handleChange}
                                                   placeholder="e.g. 500" className={inputClass} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className={labelClass}>Area (hectares)</label>
                                            <input name="area_hectares" type="number" min="0" step="0.0001"
                                                   value={form.area_hectares} onChange={handleChange}
                                                   placeholder="e.g. 0.05" className={inputClass} />
                                        </div>
                                    </>
                                )}

                                {/* Room fields for houses */}
                                {needsRooms && (
                                    <>
                                        <div className="flex flex-col gap-1.5">
                                            <label className={labelClass}>Bedrooms</label>
                                            <input name="bedrooms" type="number" min="0" step="1"
                                                   value={form.bedrooms} onChange={handleChange}
                                                   placeholder="e.g. 3" className={inputClass} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className={labelClass}>Bathrooms</label>
                                            <input name="bathrooms" type="number" min="0" step="1"
                                                   value={form.bathrooms} onChange={handleChange}
                                                   placeholder="e.g. 2" className={inputClass} />
                                        </div>
                                    </>
                                )}

                                <div className="sm:col-span-2 flex flex-col gap-1.5">
                                    <label className={labelClass}>Description</label>
                                    <textarea name="description" rows={4} value={form.description}
                                              onChange={handleChange}
                                              placeholder="Describe the property — features, surroundings, access..."
                                              className={`${inputClass} resize-none`} />
                                </div>

                            </div>
                        </FormSection>

                        {/* ── Section 3: Media ── */}
                        <FormSection
                            title={isParcel ? '3. Upload Video' : '3. Upload Photos'}
                            required
                        >
                            <p className="text-xs text-gray-500 mb-3">
                                {isParcel
                                    ? `Upload one video — max ${siteConfig.media.video.maxSizeMB} MB, max ${siteConfig.media.video.maxDurationSeconds}s.`
                                    : `Upload up to ${siteConfig.media.photo.maxPerListing} photos — max ${siteConfig.media.photo.maxSizeMB} MB each.`
                                }
                            </p>
                            <MediaUploader
                                mediaType={isParcel ? 'video' : 'photo'}
                                agentId={agentId}
                                onUploadComplete={urls => setUploadedMedia(urls)}
                            />
                        </FormSection>

                        {/* ── Publication duration notice ── */}
                        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                            <p className="text-sm text-brand-800 font-medium">
                                <span className="font-bold">Note: </span>
                                Once validated, this listing will be live for{' '}
                                <span className="font-extrabold">{pubDurationDays / 30} month(s)</span>.
                                The timer starts from the validation date.
                                Once validated, your listing cannot be modified.
                            </p>
                        </div>

                        {/* Error */}
                        {state === 'error' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-700 font-medium">{errMsg}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={state === 'loading'}
                            className="w-full flex items-center justify-center gap-2
                         bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300
                         text-white font-bold text-base py-4 rounded-xl
                         transition-all duration-200 active:scale-[0.98] shadow-sm"
                        >
                            {state === 'loading' ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                    </svg>
                                    Submitting…
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                         stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77
                             59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                                    </svg>
                                    Submit for Review
                                </>
                            )}
                        </button>

                    </>
                )}
            </div>
        </form>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function FormSection({
                         title, required, children,
                     }: { title: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="font-bold text-gray-900 text-base border-b border-gray-100 pb-2">
                {title}
                {required && <span className="text-brand-500 ml-1 text-sm">*</span>}
            </h3>
            {children}
        </div>
    )
}

const labelClass = 'text-sm font-bold text-gray-700'
const inputClass = `
  w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm
  rounded-xl px-4 py-3 placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-brand-400 hover:border-gray-300
  transition-colors duration-150
`
const Req = () => <span className="text-brand-500 ml-0.5">*</span>