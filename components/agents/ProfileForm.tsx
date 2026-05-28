// components/agents/ProfileForm.tsx

'use client'

import { useState, FormEvent } from 'react'
import type { AgentProfile }   from '@/app/agents/profile/page'

type SaveState = 'idle' | 'loading' | 'success' | 'error'

interface ProfileFormProps {
    profile: AgentProfile
}

export default function ProfileForm({ profile }: ProfileFormProps) {

    // ── Contact info state ──
    const [info, setInfo] = useState({
        full_name:      profile.full_name,
        phone_call:     profile.phone_call      ?? '',
        phone_whatsapp: profile.phone_whatsapp  ?? '',
    })
    const [infoState,  setInfoState]  = useState<SaveState>('idle')
    const [infoErr,    setInfoErr]    = useState('')

    // ── Password state ──
    const [pwd, setPwd] = useState({
        current:  '',
        newPwd:   '',
        confirm:  '',
    })
    const [pwdState,   setPwdState]   = useState<SaveState>('idle')
    const [pwdErr,     setPwdErr]     = useState('')

    // ─────────────────────────────────────────────
    // SUBMIT — contact info
    // ─────────────────────────────────────────────

    async function handleInfoSubmit(e: FormEvent) {
        e.preventDefault()
        if (infoState === 'loading') return
        setInfoState('loading')
        setInfoErr('')

        try {
            const res  = await fetch('/api/agents/profile', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    action:         'update_info',
                    full_name:      info.full_name.trim(),
                    phone_call:     info.phone_call.trim()     || null,
                    phone_whatsapp: info.phone_whatsapp.trim() || null,
                }),
            })
            const json = await res.json()

            if (!res.ok) {
                setInfoErr(json.error ?? 'Update failed. Please try again.')
                setInfoState('error')
                return
            }

            setInfoState('success')
            setTimeout(() => setInfoState('idle'), 3000)

        } catch {
            setInfoErr('Network error. Please try again.')
            setInfoState('error')
        }
    }

    // ─────────────────────────────────────────────
    // SUBMIT — password change
    // ─────────────────────────────────────────────

    async function handlePwdSubmit(e: FormEvent) {
        e.preventDefault()
        if (pwdState === 'loading') return

        if (pwd.newPwd !== pwd.confirm) {
            setPwdErr('New passwords do not match.')
            setPwdState('error')
            return
        }
        if (pwd.newPwd.length < 8) {
            setPwdErr('New password must be at least 8 characters.')
            setPwdState('error')
            return
        }

        setPwdState('loading')
        setPwdErr('')

        try {
            const res  = await fetch('/api/agents/profile', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    action:          'change_password',
                    current_password: pwd.current,
                    new_password:     pwd.newPwd,
                }),
            })
            const json = await res.json()

            if (!res.ok) {
                setPwdErr(json.error ?? 'Password change failed.')
                setPwdState('error')
                return
            }

            setPwd({ current: '', newPwd: '', confirm: '' })
            setPwdState('success')
            setTimeout(() => setPwdState('idle'), 3000)

        } catch {
            setPwdErr('Network error. Please try again.')
            setPwdState('error')
        }
    }

    return (
        <div className="flex flex-col gap-5">

            {/* ── Contact info form ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-gray-900 text-base">Contact Information</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        This information is displayed on your listings.
                    </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="p-6 flex flex-col gap-5">

                    {/* Full name */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Full name <Req />
                        </label>
                        <input
                            type="text"
                            required
                            value={info.full_name}
                            onChange={e => setInfo(p => ({ ...p, full_name: e.target.value }))}
                            placeholder="Your full name"
                            className={inputClass}
                        />
                    </div>

                    {/* Phone call */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            Call button number
                        </label>
                        <input
                            type="tel"
                            value={info.phone_call}
                            onChange={e => setInfo(p => ({ ...p, phone_call: e.target.value }))}
                            placeholder="+233 XX XXX XXXX"
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400">
                            Visitors click this number to call you directly from your listing.
                        </p>
                    </div>

                    {/* WhatsApp */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>
                            WhatsApp button number
                        </label>
                        <input
                            type="tel"
                            value={info.phone_whatsapp}
                            onChange={e => setInfo(p => ({ ...p, phone_whatsapp: e.target.value }))}
                            placeholder="+233XXXXXXXXX (no spaces)"
                            className={inputClass}
                        />
                        <p className="text-xs text-gray-400">
                            Visitors tap this to open a WhatsApp conversation with you.
                            Use international format without spaces.
                        </p>
                    </div>

                    {/* Email — read only */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Email address</label>
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className={`${inputClass} opacity-50 cursor-not-allowed`}
                        />
                        <p className="text-xs text-gray-400">
                            Email cannot be changed. Contact support if needed.
                        </p>
                    </div>

                    {/* Feedback */}
                    {infoState === 'error' && (
                        <FeedbackBox type="error" message={infoErr} />
                    )}
                    {infoState === 'success' && (
                        <FeedbackBox type="success" message="Profile updated successfully." />
                    )}

                    <button
                        type="submit"
                        disabled={infoState === 'loading'}
                        className={submitClass}
                    >
                        {infoState === 'loading' ? <Spinner /> : 'Save Changes'}
                    </button>

                </form>
            </div>

            {/* ── Password form ── */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-gray-900 text-base">Change Password</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Choose a strong password of at least 8 characters.
                    </p>
                </div>

                <form onSubmit={handlePwdSubmit} className="p-6 flex flex-col gap-5">

                    {/* Current password */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Current password <Req /></label>
                        <input
                            type="password"
                            required
                            value={pwd.current}
                            onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                            placeholder="••••••••"
                            className={inputClass}
                        />
                    </div>

                    {/* New password */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>New password <Req /></label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={pwd.newPwd}
                            onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                            placeholder="Minimum 8 characters"
                            className={inputClass}
                        />
                    </div>

                    {/* Confirm new password */}
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Confirm new password <Req /></label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={pwd.confirm}
                            onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                            placeholder="Repeat new password"
                            className={inputClass}
                        />
                    </div>

                    {/* Feedback */}
                    {pwdState === 'error' && (
                        <FeedbackBox type="error" message={pwdErr} />
                    )}
                    {pwdState === 'success' && (
                        <FeedbackBox type="success" message="Password changed successfully." />
                    )}

                    <button
                        type="submit"
                        disabled={pwdState === 'loading'}
                        className={submitClass}
                    >
                        {pwdState === 'loading' ? <Spinner /> : 'Update Password'}
                    </button>

                </form>
            </div>

        </div>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const labelClass  = 'text-sm font-bold text-gray-700'
const inputClass  = `
  w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm
  rounded-xl px-4 py-3 placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-brand-400 hover:border-gray-300
  transition-colors duration-150
`
const submitClass = `
  w-full flex items-center justify-center gap-2
  bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300
  text-white font-bold py-3 rounded-xl
  transition-all duration-200 active:scale-[0.98]
`

const Req = () => <span className="text-brand-500 ml-0.5">*</span>

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
    )
}

function FeedbackBox({ type, message }: { type: 'error' | 'success'; message: string }) {
    return (
        <div className={`rounded-xl p-3 border text-sm font-medium
                     ${type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
            {message}
        </div>
    )
}