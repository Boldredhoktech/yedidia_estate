// components/agents/AgentLandingPage.tsx

'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter }                   from 'next/navigation'
import Link                            from 'next/link'
import Image                           from 'next/image'
import { siteConfig }                  from '@/config/siteconfig'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface Formula {
    formula_key:       string
    name:              string
    pub_count:         number
    pub_duration_days: number
    validity_days:     number
    price_ghs:         number
    is_active:         boolean
}

interface Props { formulas: Formula[] }

type Tab   = 'login' | 'register'
type State = 'idle' | 'loading' | 'success' | 'error'

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function AgentLandingPage({ formulas }: Props) {
    const router = useRouter()
    const formRef = useRef<HTMLDivElement>(null)

    // ── Tab ──
    const [tab, setTab] = useState<Tab>('login')

    // ── Login form ──
    const [loginForm, setLoginForm] = useState({ email: '', password: '' })
    const [loginState, setLoginState] = useState<State>('idle')
    const [loginError, setLoginError] = useState('')

    // ── Register form ──
    const [regForm, setRegForm] = useState({
        full_name: '', email: '', password: '', confirm: '',
        phone_call: '', phone_whatsapp: '',
    })
    const [regState, setRegState] = useState<State>('idle')
    const [regError, setRegError] = useState('')

    // ── Actions ──

    function scrollToForm(t: Tab) {
        setTab(t)
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }

    async function handleLogin(e: FormEvent) {
        e.preventDefault()
        if (loginState === 'loading') return
        setLoginState('loading')
        setLoginError('')
        try {
            const res  = await fetch('/api/auth/login', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...loginForm, expectedRole: 'agent_immobilier' }),
            })
            const json = await res.json()
            if (!res.ok) { setLoginError(json.error ?? 'Login failed.'); setLoginState('error'); return }
            router.push('/agents/dashboard')
            router.refresh()
        } catch { setLoginError('Network error.'); setLoginState('error') }
    }

    async function handleRegister(e: FormEvent) {
        e.preventDefault()
        if (regState === 'loading') return
        if (regForm.password !== regForm.confirm) {
            setRegError('Passwords do not match.')
            return
        }
        setRegState('loading')
        setRegError('')
        try {
            const { confirm, ...payload } = regForm
            const res  = await fetch('/api/agents/register', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    phone_call:     payload.phone_call     || null,
                    phone_whatsapp: payload.phone_whatsapp || null,
                }),
            })
            const json = await res.json()
            if (!res.ok) { setRegError(json.error ?? 'Registration failed.'); setRegState('error'); return }
            setRegState('success')
        } catch { setRegError('Network error.'); setRegState('error') }
    }

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ── Kente strip ── */}
            <div className="h-1.5 w-full flex flex-shrink-0">
                {['#CE1126','#FCD116','#006B3F','#000000','#006B3F','#FCD116','#CE1126'].map((c,i)=>(
                    <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
            </div>

            {/* ══════════════════════════════════
                HERO
            ══════════════════════════════════ */}
            <section className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700
                                relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full
                                bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full
                                bg-white/5 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                                py-16 md:py-24">
                    <div className="flex flex-col lg:flex-row items-center gap-12">

                        {/* Text */}
                        <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full
                                            px-4 py-1.5 text-white text-sm font-semibold w-fit mx-auto lg:mx-0">
                                🇬🇭 Ghana&apos;s Real Estate Platform
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold
                                           text-white leading-tight">
                                Grow Your Real Estate<br />
                                <span className="text-yellow-300">Business in Ghana</span>
                            </h1>

                            <p className="text-brand-100 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                                Publish your listings, reach thousands of buyers and renters across Ghana,
                                and track every click — all from one powerful platform.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                                <button
                                    onClick={() => scrollToForm('register')}
                                    className="bg-white text-brand-600 font-extrabold px-8 py-4
                                               rounded-2xl shadow-lg hover:shadow-xl
                                               hover:bg-brand-50 transition-all duration-200
                                               active:scale-95 text-base"
                                >
                                    🚀 Create Free Account
                                </button>
                                <button
                                    onClick={() => scrollToForm('login')}
                                    className="border-2 border-white/60 text-white font-bold
                                               px-8 py-4 rounded-2xl hover:bg-white/10
                                               transition-all duration-200 text-base"
                                >
                                    Sign In
                                </button>
                            </div>

                            {/* Free offer badge */}
                            <div className="inline-flex items-center gap-2 text-white/80 text-sm
                                            font-medium mx-auto lg:mx-0">
                                <svg className="w-4 h-4 text-yellow-300" fill="currentColor"
                                     viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1
                                             1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8
                                             2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755
                                             1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8
                                             2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1
                                             1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588
                                             -1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                                Free starter offer: 4 publications × 60 days — no credit card required
                            </div>
                        </div>

                        {/* Logo card */}
                        <div className="flex-shrink-0 hidden lg:flex flex-col items-center gap-4">
                            <div className="w-40 h-40 rounded-3xl bg-white shadow-2xl overflow-hidden p-3">
                                <Image src="/logo.png" alt="Yedidia Estate" width={144} height={144}
                                       className="object-contain w-full h-full" unoptimized />
                            </div>
                            <p className="text-white/70 text-sm font-medium">{siteConfig.name}</p>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                STATS BAR
            ══════════════════════════════════ */}
            <section className="bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {[
                            { num: '4',    suffix: ' Free',   label: 'Publications to start' },
                            { num: '100%', suffix: '',         label: 'Online visibility' },
                            { num: '24/7', suffix: '',         label: 'Platform available' },
                            { num: '🇬🇭',  suffix: '',         label: 'Ghana-focused platform' },
                        ].map(s => (
                            <div key={s.label} className="flex flex-col gap-1">
                                <p className="text-3xl font-extrabold text-brand-400">
                                    {s.num}<span className="text-xl">{s.suffix}</span>
                                </p>
                                <p className="text-gray-400 text-sm">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                BENEFITS
            ══════════════════════════════════ */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                            Why Agents Choose Yedidia Estate
                        </h2>
                        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                            The smartest way to manage and grow your real estate business in Ghana.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFITS.map(b => (
                            <div key={b.title}
                                 className="bg-gray-50 rounded-2xl p-6 flex flex-col gap-4
                                            hover:shadow-md transition-shadow duration-200
                                            border border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center
                                                justify-center text-2xl flex-shrink-0">
                                    {b.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">{b.title}</h3>
                                    <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
                                        {b.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════ */}
            <section className="py-16 bg-brand-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                            Get Started in 3 Simple Steps
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connector line (desktop) */}
                        <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5
                                        bg-brand-200 z-0" />
                        {STEPS.map((s, i) => (
                            <div key={s.title}
                                 className="relative z-10 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-brand-500 text-white
                                                font-extrabold text-xl flex items-center justify-center
                                                shadow-lg shadow-brand-200">
                                    {i + 1}
                                </div>
                                <h3 className="font-bold text-gray-900">{s.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                PLANS (dynamic prices from DB)
            ══════════════════════════════════ */}
            {formulas.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                                Subscription Plans
                            </h2>
                            <p className="text-gray-500 mt-3">
                                Start free, then choose the plan that fits your business.
                                All prices in Ghana Cedis (GHS).
                            </p>
                        </div>

                        {/* Free offer highlight */}
                        <div className="mb-8 bg-gradient-to-r from-emerald-50 to-brand-50
                                        border border-emerald-200 rounded-2xl p-5
                                        flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center
                                            justify-center flex-shrink-0 text-xl">
                                🎁
                            </div>
                            <div className="flex-1">
                                <p className="font-extrabold text-gray-900">
                                    Free Starter Offer — included with every new account
                                </p>
                                <p className="text-gray-600 text-sm mt-0.5">
                                    4 publications × 60 days of visibility. No credit card, no commitment.
                                    Automatically activated when your account is validated.
                                </p>
                            </div>
                            <button
                                onClick={() => scrollToForm('register')}
                                className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white
                                           font-bold text-sm px-5 py-2.5 rounded-xl
                                           transition-colors duration-150 active:scale-95 whitespace-nowrap"
                            >
                                Claim Free Offer →
                            </button>
                        </div>

                        {/* Paid plans grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {formulas.map((f, i) => {
                                const isPopular = f.formula_key === 'F3'
                                return (
                                    <div key={f.formula_key}
                                         className={`rounded-2xl border p-6 flex flex-col gap-4
                                                     relative transition-all duration-200
                                                     hover:shadow-lg hover:-translate-y-0.5
                                                     ${isPopular
                                             ? 'border-brand-400 bg-brand-50 shadow-md'
                                             : 'border-gray-200 bg-white'
                                         }`}>
                                        {isPopular && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2
                                                             bg-brand-500 text-white text-xs font-extrabold
                                                             px-4 py-1 rounded-full whitespace-nowrap">
                                                Most Popular
                                            </span>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs font-extrabold px-3 py-1 rounded-full
                                                              ${isPopular
                                                ? 'bg-brand-500 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {f.formula_key}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                Valid {f.validity_days >= 365
                                                    ? `${Math.round(f.validity_days / 30)} months`
                                                    : `${f.validity_days} days`}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="font-extrabold text-gray-900 text-lg">
                                                {f.name}
                                            </p>
                                            <p className={`text-3xl font-extrabold mt-1
                                                           ${isPopular ? 'text-brand-600' : 'text-gray-900'}`}>
                                                {f.price_ghs === 0
                                                    ? 'Free'
                                                    : `GHS ${f.price_ghs.toLocaleString('en-GH')}`}
                                            </p>
                                        </div>

                                        <ul className="flex flex-col gap-2 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <CheckIcon /> {f.pub_count} publications
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckIcon /> {f.pub_duration_days} days per listing
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckIcon /> Click analytics included
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckIcon /> WhatsApp &amp; call tracking
                                            </li>
                                        </ul>

                                        <button
                                            onClick={() => scrollToForm('register')}
                                            className={`w-full py-3 rounded-xl font-bold text-sm
                                                        transition-all duration-150 active:scale-95 mt-auto
                                                        ${isPopular
                                                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            Get Started
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════
                LOGIN / REGISTER FORMS
            ══════════════════════════════════ */}
            <section ref={formRef}
                     className="py-16 bg-gray-50 border-t border-gray-100" id="auth">
                <div className="max-w-lg mx-auto px-4">

                    {/* Tabs */}
                    <div className="flex bg-white rounded-2xl p-1 border border-gray-200
                                    shadow-sm mb-6">
                        {(['register', 'login'] as Tab[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold
                                            transition-all duration-150
                                            ${tab === t
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {t === 'register' ? '🚀 Create Account' : '🔑 Sign In'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm
                                    overflow-hidden">

                        {/* Header */}
                        <div className="bg-brand-500 px-6 py-4">
                            <h2 className="text-white font-bold text-base">
                                {tab === 'register'
                                    ? 'Join Yedidia Estate — Free'
                                    : 'Welcome Back, Agent'}
                            </h2>
                            <p className="text-brand-100 text-xs mt-0.5">
                                {tab === 'register'
                                    ? 'Create your account and start listing in minutes'
                                    : 'Sign in to manage your listings and subscription'}
                            </p>
                        </div>

                        {/* ── LOGIN FORM ── */}
                        {tab === 'login' && (
                            <form onSubmit={handleLogin} className="p-6 flex flex-col gap-5">
                                <Field label="Email address" id="l-email">
                                    <input id="l-email" type="email" required autoComplete="email"
                                           value={loginForm.email}
                                           onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                                           placeholder="you@example.com"
                                           className={inputCls} />
                                </Field>
                                <Field label="Password" id="l-pass">
                                    <input id="l-pass" type="password" required autoComplete="current-password"
                                           value={loginForm.password}
                                           onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                                           placeholder="••••••••"
                                           className={inputCls} />
                                </Field>
                                {loginState === 'error' && <ErrorBox msg={loginError} />}
                                <SubmitBtn loading={loginState === 'loading'} label="Sign In" />
                                <p className="text-center text-xs text-gray-400">
                                    No account yet?{' '}
                                    <button type="button" onClick={() => setTab('register')}
                                            className="text-brand-500 font-bold hover:underline">
                                        Create one free →
                                    </button>
                                </p>
                            </form>
                        )}

                        {/* ── REGISTER FORM ── */}
                        {tab === 'register' && (
                            <>
                                {regState === 'success' ? (
                                    <div className="p-8 flex flex-col items-center gap-4 text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center
                                                        justify-center text-3xl">✅</div>
                                        <h3 className="text-lg font-extrabold text-gray-900">
                                            Account created successfully!
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            Your account is now <strong>pending validation</strong>.
                                            Our team will review and activate it shortly.
                                            You will receive a confirmation once activated.
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Questions?{' '}
                                            <a href={siteConfig.contact.whatsappLink}
                                               target="_blank" rel="noopener noreferrer"
                                               className="text-brand-500 font-bold hover:underline">
                                                Contact us on WhatsApp
                                            </a>
                                        </p>
                                        <button onClick={() => setTab('login')}
                                                className="mt-2 text-sm font-bold text-brand-500
                                                           hover:underline">
                                            ← Go to Sign In
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleRegister} className="p-6 flex flex-col gap-4">
                                        <Field label="Full name *" id="r-name">
                                            <input id="r-name" type="text" required
                                                   value={regForm.full_name}
                                                   onChange={e => setRegForm(p => ({ ...p, full_name: e.target.value }))}
                                                   placeholder="John Mensah"
                                                   className={inputCls} />
                                        </Field>
                                        <Field label="Email address *" id="r-email">
                                            <input id="r-email" type="email" required
                                                   value={regForm.email}
                                                   onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                                                   placeholder="you@example.com"
                                                   className={inputCls} />
                                        </Field>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Call number" id="r-call">
                                                <input id="r-call" type="tel"
                                                       value={regForm.phone_call}
                                                       onChange={e => setRegForm(p => ({ ...p, phone_call: e.target.value }))}
                                                       placeholder="+233 50 000 0000"
                                                       className={inputCls} />
                                            </Field>
                                            <Field label="WhatsApp number" id="r-wa">
                                                <input id="r-wa" type="tel"
                                                       value={regForm.phone_whatsapp}
                                                       onChange={e => setRegForm(p => ({ ...p, phone_whatsapp: e.target.value }))}
                                                       placeholder="+233 50 000 0000"
                                                       className={inputCls} />
                                            </Field>
                                        </div>
                                        <Field label="Password * (min 8 characters)" id="r-pass">
                                            <input id="r-pass" type="password" required minLength={8}
                                                   value={regForm.password}
                                                   onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))}
                                                   placeholder="••••••••"
                                                   className={inputCls} />
                                        </Field>
                                        <Field label="Confirm password *" id="r-confirm">
                                            <input id="r-confirm" type="password" required
                                                   value={regForm.confirm}
                                                   onChange={e => setRegForm(p => ({ ...p, confirm: e.target.value }))}
                                                   placeholder="••••••••"
                                                   className={inputCls} />
                                        </Field>

                                        {regState === 'error' && <ErrorBox msg={regError} />}

                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            By creating an account you agree to our{' '}
                                            <Link href="/legal/terms-of-sale"
                                                  className="text-brand-500 hover:underline">
                                                Terms of Sale
                                            </Link>{' '}and{' '}
                                            <Link href="/legal/privacy-policy"
                                                  className="text-brand-500 hover:underline">
                                                Privacy Policy
                                            </Link>.
                                        </p>

                                        {/* Anti-abuse warning */}
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl
                                                        px-3 py-2.5 flex items-start gap-2">
                                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                                                 fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                                 strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round"
                                                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374
                                                         1.948 3.374h14.71c1.73 0 2.813-1.874 1.948
                                                         -3.374L13.949 3.378c-.866-1.5-3.032-1.5
                                                         -3.898 0L2.697 16.126zM12 15.75h.007v.008H12
                                                         v-.008z"/>
                                            </svg>
                                            <p className="text-[11px] text-amber-800 leading-snug">
                                                <strong>Notice:</strong> Email, call number and WhatsApp
                                                number are checked for uniqueness. Repeated registration
                                                attempts using different identifiers to claim multiple
                                                free offers will be flagged by our system and your IP
                                                may be reported as a Terms of Service violation.
                                            </p>
                                        </div>

                                        <SubmitBtn loading={regState === 'loading'}
                                                   label="Create My Free Account" />

                                        <p className="text-center text-xs text-gray-400">
                                            Already have an account?{' '}
                                            <button type="button" onClick={() => setTab('login')}
                                                    className="text-brand-500 font-bold hover:underline">
                                                Sign in →
                                            </button>
                                        </p>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <a href={siteConfig.contact.whatsappLink} target="_blank" rel="noopener noreferrer"
                           className="text-xs text-gray-400 hover:text-brand-500 transition-colors">
                            💬 Support WhatsApp
                        </a>
                        <Link href="/"
                              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                            ← Back to website
                        </Link>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                MINI FOOTER
            ══════════════════════════════════ */}
            <footer className="bg-gray-900 py-6 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0">
                                <Image src="/logo.png" alt="Yedidia Estate" fill
                                       className="object-contain p-0.5" unoptimized />
                            </div>
                            <span className="text-white font-bold text-sm">{siteConfig.name}</span>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            <Link href="/legal/privacy-policy" className="text-xs text-gray-500 hover:text-gray-300">
                                Privacy
                            </Link>
                            <Link href="/legal/terms-of-sale" className="text-xs text-gray-500 hover:text-gray-300">
                                Terms
                            </Link>
                            <Link href="/legal/complaint" className="text-xs text-gray-500 hover:text-gray-300">
                                Complaint
                            </Link>
                            <a href={`tel:${siteConfig.contact.phoneMain.replace(/\s/g,'')}`}
                               className="text-xs text-gray-500 hover:text-gray-300">
                                {siteConfig.contact.phoneMain}
                            </a>
                        </div>
                        <p className="text-xs text-gray-600">
                            © {new Date().getFullYear()} {siteConfig.name}
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    )
}

// ─────────────────────────────────────────────
// MICRO-COMPONENTS
// ─────────────────────────────────────────────

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">{label}</label>
            {children}
        </div>
    )
}

function ErrorBox({ msg }: { msg: string }) {
    return (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700 font-medium">{msg}</p>
        </div>
    )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
    return (
        <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2
                           bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300
                           text-white font-bold py-3.5 rounded-xl
                           transition-all duration-200 active:scale-[0.98]">
            {loading ? (
                <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Processing…
                </>
            ) : label}
        </button>
    )
}

function CheckIcon() {
    return (
        <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
        </svg>
    )
}

// ─────────────────────────────────────────────
// STATIC CONTENT DATA
// ─────────────────────────────────────────────

const BENEFITS = [
    {
        icon: '📢',
        title: 'Massive Online Visibility',
        desc:  'Your listings reach thousands of buyers and renters across Ghana daily — on mobile and desktop.',
    },
    {
        icon: '🎁',
        title: '4 Free Publications to Start',
        desc:  'Every new agent gets 4 free publications for 60 days — no credit card, no commitment.',
    },
    {
        icon: '📊',
        title: 'Real-Time Analytics',
        desc:  'Track views, WhatsApp clicks and call clicks on each listing. Know exactly what works.',
    },
    {
        icon: '⚡',
        title: 'Fast Validation',
        desc:  'Our team validates your listings quickly. Once approved, your property goes live immediately.',
    },
    {
        icon: '📱',
        title: 'Mobile-First Platform',
        desc:  'Built for Ghana — optimized for Android and iOS. 90% of your buyers are on mobile.',
    },
    {
        icon: '🔒',
        title: 'Trusted & Secure',
        desc:  'Verified agents, certified legal partners, and a complaint system to protect all parties.',
    },
]

const STEPS = [
    {
        title: 'Create Your Free Account',
        desc:  'Fill in the registration form below. Takes less than 2 minutes.',
    },
    {
        title: 'Get Validated & Activate',
        desc:  'Our team reviews and activates your account. Your 4 free publications are unlocked instantly.',
    },
    {
        title: 'Publish & Grow',
        desc:  'Upload your listings with photos or video. Track clicks and connect with serious buyers.',
    },
]

const inputCls = `
  w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm
  rounded-xl px-4 py-3 placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-brand-400
  focus:border-brand-400 hover:border-gray-300
  transition-colors duration-150
`
