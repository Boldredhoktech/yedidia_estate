// components/kwaku/KwakuSidebar.tsx

'use client'

import Link             from 'next/link'
import Image            from 'next/image'
import { usePathname }  from 'next/navigation'
import { agencyConfig } from '@/config/agency'
import { siteConfig }   from '@/config/siteconfig'
import type { SessionPayload } from '@/lib/auth'

interface KwakuSidebarProps {
    session: SessionPayload
}

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href:  '/kwaku/dashboard',
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
        label: 'Agent Management',
        href:  '/kwaku/agents',
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
        label: 'Listings',
        href:  '/kwaku/listings',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm
                 .375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm
                 .375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v
                 -.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
            </svg>
        ),
    },
    {
        label: 'Publish Listing',
        href:  '/kwaku/publish',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
        ),
    },
    {
        label: 'Subscriptions',
        href:  '/kwaku/subscriptions',
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
        label: 'Analytics',
        href:  '/kwaku/analytics',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125
                 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013
                 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0
                 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125
                 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125
                 h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125
                 h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
        ),
    },
    {
        label: 'Legal Partners',
        href:  '/kwaku/legal-partners',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265
                 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47
                 m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028
                 -.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483
                 -.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52
                 m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031
                 .352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"/>
            </svg>
        ),
    },
]

export default function KwakuSidebar({ session }: KwakuSidebarProps) {
    const pathname = usePathname()

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/kwaku/login'
    }

    return (
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col
                      flex-shrink-0 hidden md:flex">

            {/* Brand */}
            <div className="px-5 py-5 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden
                          bg-indigo-600 flex-shrink-0">
                        <Image src="/logo.png" alt="Yedidia Estate" fill
                               className="object-contain p-0.5" unoptimized />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm leading-none
                          group-hover:text-indigo-300 transition-colors">
                            {agencyConfig.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">Validator Portal</p>
                    </div>
                </Link>
            </div>

            {/* User */}
            <div className="px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-900 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-indigo-300 font-bold text-sm">
              {session.fullName.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">
                            {session.fullName}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                            {session.role === 'superadmin' ? 'Super Admin' : 'Agent Validator'}
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
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                  <span className={isActive ? 'text-white' : 'text-gray-600'}>
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
            <div className="px-3 py-4 border-t border-gray-800 flex flex-col gap-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-gray-500 hover:bg-gray-800 hover:text-gray-300
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
                     font-semibold text-red-500 hover:bg-red-950 hover:text-red-400
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