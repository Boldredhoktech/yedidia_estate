// app/(public)/legal/complaint/page.tsx

'use client'

import { useState, FormEvent } from 'react'
import Link                    from 'next/link'
import { siteConfig }          from '@/config/siteconfig'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ComplaintPage() {
    const [state,   setState]   = useState<FormState>('idle')
    const [errMsg,  setErrMsg]  = useState('')

    const [form, setForm] = useState({
        visitorName:  '',
        visitorEmail: '',
        visitorPhone: '',
        listingRef:   '',
        message:      '',
    })

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (state === 'loading') return

        setState('loading')
        setErrMsg('')

        try {
            const res = await fetch('/api/complaint', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(form),
            })

            if (!res.ok) {
                const json = await res.json().catch(() => ({}))
                throw new Error(json.error ?? 'Submission failed. Please try again.')
            }

            setState('success')
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'An unexpected error occurred.'
            setErrMsg(msg)
            setState('error')
        }
    }

    // ── Success state ──
    if (state === 'success') {
        return (
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center
                        justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
                    Complaint Received
                </h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    Thank you for reaching out. Our team will review your complaint and
                    contact you as soon as possible at the email address you provided.
                    If necessary, we will refer your case to one of our legal partners.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                     text-white font-semibold px-6 py-3 rounded-xl
                     transition-colors duration-150"
                >
                    Back to listings
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 md:py-16">

            {/* Back */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500
                   hover:text-brand-600 transition-colors duration-150 mb-8 group"
            >
                <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150"
                     fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                </svg>
                Back to listings
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118
                       0zm-9 3.75h.008v.008H12v-.008z"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                        File a Complaint
                    </h1>
                </div>
                <p className="text-gray-600 leading-relaxed">
                    Have you been the victim of fraud after contacting an agent through
                    our platform? Please fill in the form below. Our team will review your
                    complaint and may refer your case to one of our certified legal partners.
                </p>
            </div>

            {/* Airbnb-specific warning */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
                <p className="text-sm text-red-700 leading-relaxed">
                    <span className="font-bold">Reminder: </span>
                    {siteConfig.fraudWarning.airbnb}
                </p>
            </div>

            {/* Form */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                {/* Form header bar */}
                <div className="h-1.5 w-full flex">
                    <div className="flex-1 bg-[#CE1126]" />
                    <div className="flex-1 bg-[#FCD116]" />
                    <div className="flex-1 bg-[#006B3F]" />
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="visitorName"
                               className="text-sm font-bold text-gray-700">
                            Your full name <Required />
                        </label>
                        <input
                            id="visitorName"
                            name="visitorName"
                            type="text"
                            required
                            value={form.visitorName}
                            onChange={handleChange}
                            placeholder="John Mensah"
                            className={inputClass}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="visitorEmail"
                               className="text-sm font-bold text-gray-700">
                            Your email address <Required />
                        </label>
                        <input
                            id="visitorEmail"
                            name="visitorEmail"
                            type="email"
                            required
                            value={form.visitorEmail}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400">
                            We will use this email to contact you regarding your complaint.
                        </p>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="visitorPhone"
                               className="text-sm font-bold text-gray-700">
                            Your phone number
                            <span className="text-gray-400 font-normal ml-1">(optional)</span>
                        </label>
                        <input
                            id="visitorPhone"
                            name="visitorPhone"
                            type="tel"
                            value={form.visitorPhone}
                            onChange={handleChange}
                            placeholder="+233 XX XXX XXXX"
                            className={inputClass}
                        />
                    </div>

                    {/* Listing reference */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="listingRef"
                               className="text-sm font-bold text-gray-700">
                            Listing ID or reference
                            <span className="text-gray-400 font-normal ml-1">(optional but helpful)</span>
                        </label>
                        <input
                            id="listingRef"
                            name="listingRef"
                            type="text"
                            value={form.listingRef}
                            onChange={handleChange}
                            placeholder="e.g. a3f7c2d1-... or listing title"
                            className={`${inputClass} font-mono`}
                        />
                        <p className="text-xs text-gray-400">
                            You can find the listing ID on the property detail page.
                        </p>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="message"
                               className="text-sm font-bold text-gray-700">
                            Describe what happened <Required />
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            minLength={30}
                            rows={6}
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Please describe the situation in detail — what was promised, what happened, any amounts involved..."
                            className={`${inputClass} resize-none`}
                        />
                        <p className="text-xs text-gray-400">
                            Minimum 30 characters. The more detail you provide, the better we
                            can help.
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
                       text-white font-bold text-base
                       py-3.5 rounded-xl shadow-sm
                       transition-all duration-200 active:scale-[0.98]"
                    >
                        {state === 'loading' ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                            stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                Sending…
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12
                           59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
                                </svg>
                                Submit Complaint
                            </>
                        )}
                    </button>

                </form>
            </div>

            {/* Contact alternative */}
            <p className="text-center text-sm text-gray-500 mt-6">
                Prefer to reach us directly?{' '}
                <a
                    href={siteConfig.contact.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand-500 hover:text-brand-700
                     underline underline-offset-2"
                >
                    Chat on WhatsApp
                </a>
                {' '}or email{' '}
                <a
                    href={`mailto:${siteConfig.contact.emailComplaints}`}
                    className="font-semibold text-brand-500 hover:text-brand-700
                     underline underline-offset-2"
                >
                    {siteConfig.contact.emailComplaints}
                </a>
            </p>

        </div>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const inputClass = `
  w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm
  rounded-xl px-4 py-3 placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400
  hover:border-gray-300 transition-colors duration-150
`

function Required() {
    return <span className="text-brand-500 ml-0.5">*</span>
}