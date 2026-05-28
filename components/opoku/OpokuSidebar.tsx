// components/opoku/OpokuSidebar.tsx

'use client'

import Link             from 'next/link'
import Image            from 'next/image'
import { usePathname }  from 'next/navigation'
import { agencyConfig } from '@/config/agency'
import { siteConfig }   from '@/config/siteconfig'
import type { SessionPayload } from '@/lib/auth'

interface OpokuSidebarProps {
    session: SessionPayload
}

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href:  '/opoku/dashboard',
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
        label: 'User Management',
        href:  '/opoku/users',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952
                 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16
                 -.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0
                 -4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12
                 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625
                 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
        ),
    },
    {
        label: 'Formula Pricing',
        href:  '/opoku/formulas',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 3.12-2.347
                 3.307-6.227.872-9.123a5.002 5.002 0 00-6.824 0C2.693 9.955 2.88
                 13.835 6 16.182L6.88 15.522M12 6V3.75"/>
            </svg>
        ),
    },
    {
        label: 'Analytics',
        href:  '/opoku/analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125
                 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013
                 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0
                 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125
                 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125
                 -1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125
                 -1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
        ),
    },
    {
        label: 'Popup Management',
        href:  '/opoku/popups',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5
                 -1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5
                 a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25
                 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0
                 a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
            </svg>
        ),
    },
]

export default function OpokuSidebar({ session }: OpokuSidebarProps) {
    const pathname = usePathname()

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/opoku/login'
    }

    return (
        <aside className="w-64 bg-black border-r border-yellow-900/30
                      flex flex-col flex-shrink-0 hidden md:flex">

            {/* Brand */}
            <div className="px-5 py-5 border-b border-yellow-900/30">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden
                          bg-gradient-to-br from-yellow-500 to-yellow-700 flex-shrink-0">
                        <Image src="/logo.png" alt="Yedidia Estate" fill
                               className="object-contain p-0.5" unoptimized />
                    </div>
                    <div>
                        <p className="font-bold text-yellow-500 text-sm leading-none
                          group-hover:text-yellow-400 transition-colors">
                            {agencyConfig.name}
                        </p>
                        <p className="text-yellow-900 text-xs mt-0.5 font-bold uppercase
                          tracking-wider">
                            SuperAdmin
                        </p>
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="px-5 py-4 border-b border-yellow-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-yellow-900/50 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-yellow-500 font-bold text-sm">
              {session.fullName.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                            {session.fullName}
                        </p>
                        <p className="text-yellow-700 text-xs truncate font-semibold">
                            Super Administrator
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
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
                                        ? 'bg-yellow-600 text-black'
                                        : 'text-gray-500 hover:bg-gray-900 hover:text-yellow-400'
                                    }`}
                                >
                  <span className={isActive ? 'text-black' : 'text-gray-700'}>
                    {item.icon}
                  </span>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                {/* Separator */}
                <div className="border-t border-yellow-900/20 my-4" />

                {/* Quick links to other portals */}
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider
                      px-3 mb-2">
                    Other Portals
                </p>
                <ul className="flex flex-col gap-1">
                    {[
                        { label: 'Validator Panel', href: '/kwaku/dashboard' },
                        { label: 'Agent Portal',    href: '/agents/dashboard' },
                        { label: 'Accounting',      href: '/comptable/dashboard' },
                    ].map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs
                           font-semibold text-gray-600 hover:text-yellow-500
                           hover:bg-gray-900 transition-colors duration-150"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                                     stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25
                           21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25
                           M21 3v5.25"/>
                                </svg>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-yellow-900/20 flex flex-col gap-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-gray-600 hover:bg-gray-900 hover:text-gray-400
                     transition-colors duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5
                     A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                    </svg>
                    View website
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-red-800 hover:bg-red-950 hover:text-red-500
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