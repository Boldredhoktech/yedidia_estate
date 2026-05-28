// app/comptable/login/page.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { agencyConfig }        from '@/config/agency'
import { siteConfig }          from '@/config/siteconfig'

type State = 'idle' | 'loading' | 'error'

export default function ComptableLoginPage() {
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
                body:    JSON.stringify({ ...form, expectedRole: 'comptable' }),
            })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Login failed.')
                setState('error')
                return
            }

            router.push('/comptable/dashboard')
            router.refresh()
        } catch {
            setErrMsg('Network error. Please check your connection.')
            setState('error')
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">

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
                        <div className="w-14 h-14 rounded-2xl bg-teal-700 flex items-center
                            justify-center shadow-lg shadow-teal-900/50">
              <span className="text-white font-extrabold text-xl">
                {agencyConfig.shortName}
              </span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-extrabold text-white">
                                {siteConfig.name}
                            </h1>
                            <p className="text-teal-400 text-sm mt-0.5">
                                Accounting Portal
                            </p>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800
                          overflow-hidden">
                        <div className="bg-teal-800 px-6 py-4">
                            <h2 className="text-white font-bold text-base">
                                Accountant Login
                            </h2>
                            <p className="text-teal-200 text-xs mt-0.5">
                                Financial overview and payment tracking
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email"
                                       className="text-sm font-bold text-slate-400">
                                    Email address
                                </label>
                                <input
                                    id="email" name="email" type="email"
                                    required autoComplete="email"
                                    value={form.email} onChange={handleChange}
                                    placeholder="accountant@yedidia-estate.com"
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password"
                                       className="text-sm font-bold text-slate-400">
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
                           bg-teal-700 hover:bg-teal-600 disabled:bg-teal-900
                           text-white font-bold py-3 rounded-xl
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
                                        Signing in…
                                    </>
                                ) : 'Sign In'}
                            </button>

                        </form>
                    </div>

                    <div className="text-center mt-6">
                        <Link href="/"
                              className="text-xs text-slate-600 hover:text-slate-400
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
  w-full bg-slate-800 border border-slate-700 text-slate-100 text-sm
  rounded-xl px-4 py-3 placeholder-slate-600
  focus:outline-none focus:ring-2 focus:ring-teal-500
  focus:border-teal-500 hover:border-slate-600
  transition-colors duration-150
`