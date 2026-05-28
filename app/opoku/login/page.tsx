// app/opoku/login/page.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { agencyConfig }        from '@/config/agency'
import { siteConfig }          from '@/config/siteconfig'

type State = 'idle' | 'loading' | 'error'

export default function OpokuLoginPage() {
    const router = useRouter()
    const [state,  setState]  = useState<State>('idle')
    const [errMsg, setErrMsg] = useState('')
    const [form,   setForm]   = useState({ email: '', password: '' })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (state === 'loading') return
        setState('loading')
        setErrMsg('')

        try {
            const res  = await fetch('/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ ...form, expectedRole: 'superadmin' }),
            })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Access denied.')
                setState('error')
                return
            }

            router.push('/opoku/dashboard')
            router.refresh()
        } catch {
            setErrMsg('Network error. Please check your connection.')
            setState('error')
        }
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">

            {/* Kente strip */}
            <div className="h-1.5 w-full flex">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">

                    {/* Logo */}
                    <div className="flex flex-col items-center gap-3 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500
                            to-yellow-700 flex items-center justify-center
                            shadow-lg shadow-yellow-900/50">
              <span className="text-black font-extrabold text-2xl">
                {agencyConfig.shortName}
              </span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                {siteConfig.name}
                            </h1>
                            <p className="text-yellow-600 text-xs font-bold uppercase
                            tracking-widest mt-1">
                                Super Administrator
                            </p>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-950 border border-yellow-800 rounded-xl p-3 mb-5">
                        <p className="text-yellow-500 text-xs font-semibold text-center">
                            ⚠️ Restricted access — authorised personnel only
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-gray-950 rounded-2xl border border-yellow-900/50
                          overflow-hidden shadow-2xl">

                        <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 px-6 py-4">
                            <h2 className="text-black font-extrabold text-base">
                                SuperAdmin Portal
                            </h2>
                            <p className="text-yellow-900 text-xs mt-0.5 font-medium">
                                Full platform control — handle with care
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email"
                                       className="text-sm font-bold text-gray-400">
                                    Username / Email
                                </label>
                                <input
                                    id="email" name="email" type="text"
                                    required autoComplete="username"
                                    value={form.email} onChange={handleChange}
                                    placeholder="superadmin username"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password"
                                       className="text-sm font-bold text-gray-400">
                                    Password
                                </label>
                                <input
                                    id="password" name="password" type="password"
                                    required autoComplete="current-password"
                                    value={form.password} onChange={handleChange}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                            </div>

                            {state === 'error' && (
                                <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                                    <p className="text-sm text-red-400 font-medium">{errMsg}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={state === 'loading'}
                                className="w-full flex items-center justify-center gap-2
                           bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900
                           text-black font-extrabold py-3 rounded-xl
                           transition-all duration-200 active:scale-[0.98]"
                            >
                                {state === 'loading' ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                    stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8v8H4z"/>
                                        </svg>
                                        Authenticating…
                                    </>
                                ) : 'Access SuperAdmin Panel'}
                            </button>

                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/"
                              className="text-xs text-gray-700 hover:text-gray-500
                             transition-colors duration-150">
                            ← Back to {siteConfig.name}
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

const inputClass = `
  w-full bg-gray-900 border border-gray-800 text-gray-100 text-sm
  rounded-xl px-4 py-3 placeholder-gray-700
  focus:outline-none focus:ring-2 focus:ring-yellow-600
  focus:border-yellow-600 hover:border-gray-700
  transition-colors duration-150
`