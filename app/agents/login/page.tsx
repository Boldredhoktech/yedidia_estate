// app/agents/login/page.tsx

'use client'

import { useState, FormEvent } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { agencyConfig }        from '@/config/agency'
import { siteConfig }          from '@/config/siteconfig'

type State = 'idle' | 'loading' | 'error'

export default function AgentLoginPage() {
    const router          = useRouter()
    const [state, setState]   = useState<State>('idle')
    const [errMsg, setErrMsg] = useState('')
    const [form,  setForm]    = useState({ email: '', password: '' })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (state === 'loading') return
        setState('loading')
        setErrMsg('')

        try {
            const res = await fetch('/api/auth/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ ...form, expectedRole: 'agent_immobilier' }),
            })
            const json = await res.json()

            if (!res.ok) {
                setErrMsg(json.error ?? 'Login failed. Please try again.')
                setState('error')
                return
            }

            router.push('/agents/dashboard')
            router.refresh()
        } catch {
            setErrMsg('Network error. Please check your connection.')
            setState('error')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Kente top strip */}
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
                        <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center
                            justify-center shadow-lg">
              <span className="text-white font-extrabold text-xl">
                {agencyConfig.shortName}
              </span>
                        </div>
                        <div className="text-center">
                            <h1 className="text-xl font-extrabold text-gray-900">
                                {siteConfig.name}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Agent Portal — Sign in to your account
                            </p>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200
                          overflow-hidden">
                        <div className="bg-brand-500 px-6 py-4">
                            <h2 className="text-white font-bold text-base">
                                Real Estate Agent Login
                            </h2>
                            <p className="text-brand-100 text-xs mt-0.5">
                                Manage your listings and subscription
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">

                            {/* Email */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="email"
                                       className="text-sm font-bold text-gray-700">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className={inputClass}
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="password"
                                       className="text-sm font-bold text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={inputClass}
                                />
                            </div>

                            {/* Error */}
                            {state === 'error' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                    <p className="text-sm text-red-700 font-medium">{errMsg}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={state === 'loading'}
                                className="w-full flex items-center justify-center gap-2
                           bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300
                           text-white font-bold py-3 rounded-xl
                           transition-all duration-200 active:scale-[0.98]"
                            >
                                {state === 'loading' ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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

                    {/* Support link */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Need help?{' '}
                        <a
                            href={siteConfig.contact.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-brand-500 hover:text-brand-700
                         underline underline-offset-2"
                        >
                            Contact support
                        </a>
                    </p>

                    {/* Back to site */}
                    <div className="text-center mt-4">
                        <Link href="/"
                              className="text-xs text-gray-400 hover:text-gray-600
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
  w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm
  rounded-xl px-4 py-3 placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-brand-400 hover:border-gray-300
  transition-colors duration-150
`