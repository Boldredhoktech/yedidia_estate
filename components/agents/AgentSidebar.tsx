// components/agents/AgentSidebar.tsx

'use client'

import Link               from 'next/link'
import Image              from 'next/image'
import { usePathname }    from 'next/navigation'
import { agencyConfig }   from '@/config/agency'
import { siteConfig }     from '@/config/siteconfig'
import type { SessionPayload } from '@/lib/auth'

interface AgentSidebarProps {
    session: SessionPayload
}

const NAV_ITEMS = [
    {
        label: 'Dashboard',
        href:  '/agents/dashboard',
        icon:  (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25
                 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25
                 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25
                 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18
                 A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0
                 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0
                 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5
                 18v-2.25z"/>
            </svg>
        ),
    },
    {
        label: 'Publish Listing',
        href:  '/agents/publish',
        icon:  (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
        ),
    },
    {
        label: 'My Listings',
        href:  '/agents/my-listings',
        icon:  (
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
        label: 'Subscription',
        href:  '/agents/billing',
        icon:  (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75
                 4.5h16.5a1.5 1.5 0 001.5-1.5v-15a1.5 1.5 0 00-1.5-1.5H3.75a1.5
                 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z"/>
            </svg>
        ),
    },
    {
        label: 'My Profile',
        href:  '/agents/profile',
        icon:  (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5
                 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499
                 -1.632z"/>
            </svg>
        ),
    },
]

export default function AgentSidebar({ session }: AgentSidebarProps) {
    const pathname = usePathname()

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/agents/login'
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col
                      shadow-sm flex-shrink-0 hidden md:flex">

            {/* Brand header */}
            <div className="px-5 py-5 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative w-9 h-9 rounded-xl overflow-hidden
                          bg-brand-500 flex-shrink-0">
                        <Image src="/logo.png" alt="Yedidia Estate" fill
                               className="object-contain p-0.5" unoptimized />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-none
                          group-hover:text-brand-600 transition-colors">
                            {agencyConfig.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">Agent Portal</p>
                    </div>
                </Link>
            </div>

            {/* User info */}
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-brand-600 font-bold text-sm">
              {session.fullName.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                            {session.fullName}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{session.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
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
                                        ? 'bg-brand-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                  <span className={isActive ? 'text-white' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer — logout + site link */}
            <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                     font-semibold text-gray-500 hover:bg-gray-100
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
                     font-semibold text-red-500 hover:bg-red-50
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