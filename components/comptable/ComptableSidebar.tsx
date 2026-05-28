// components/comptable/ComptableSidebar.tsx

'use client'

import Link             from 'next/link'
import { usePathname }  from 'next/navigation'
import { agencyConfig } from '@/config/agency'
import type { SessionPayload } from '@/lib/auth'

interface ComptableSidebarProps {
    session: SessionPayload
}

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href:  '/comptable/dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25
                 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25
                 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25
                 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18
                 A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0
                 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0
                 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
            </svg>
        ),
    },
    {
        label: 'Payment Logs',
        href:  '/comptable/payments',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75
                 4.5h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75
                 a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/>
            </svg>
        ),
    },
    {
        label: 'Revenue',
        href:  '/comptable/revenue',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125
                 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013
                 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0
                 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25
                 a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125
                 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504
                 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
        ),
    },
]

export default function ComptableSidebar({ session }: ComptableSidebarProps) {
    const pathname = usePathname()

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/comptable/login'
    }

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800
                      flex flex-col flex-shrink-0 hidden md:flex">

            {/* Brand */}
            <div className="px-5 py-5 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-sm">
              {agencyConfig.shortName}
            </span>
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm leading-none
                          group-hover:text-teal-400 transition-colors">
                            {agencyConfig.name}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">Accounting Portal</p>
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="px-5 py-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-900 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-teal-400 font-bold text-sm">
              {session.fullName.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                            {session.fullName}
                        </p>
                        <p className="text-slate-500 text-xs">Accountant</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4">
                <ul className="flex flex-col gap-1">
                    {NAV_ITEMS.map(item => {
                        const isActive = pathname === item.href ||
                            pathname.startsWith(`${item.href}/`)
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                              text-sm font-semibold transition-all duration-150
                              ${isActive
                                        ? 'bg-teal-700 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                  <span className={isActive ? 'text-white' : 'text-slate-600'}>
                    {item.icon}
                  </span>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-slate-800 flex flex-col gap-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-slate-600 hover:bg-slate-800 hover:text-slate-300
                     transition-colors duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21
                     h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                    </svg>
                    View website
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-red-700 hover:bg-red-950 hover:text-red-400
                     transition-colors duration-150 text-left"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25
                     2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15
                     M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
                    </svg>
                    Sign out
                </button>
            </div>
        </aside>
    )
}