// app/comptable/layout.tsx

import { headers }       from 'next/headers'
import ComptableSidebar  from '@/components/comptable/ComptableSidebar'
import type { SessionPayload, UserRole } from '@/lib/token'

export default async function ComptableLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const h        = await headers()
    const userId   = h.get('x-user-id')
    const userRole = h.get('x-user-role')
    const email    = h.get('x-user-email')
    const fullName = h.get('x-user-fullname') ?? 'Comptable'

    // No session headers = login page — render without protected layout
    if (!userId || !userRole || !email) {
        return <>{children}</>
    }

    const session: SessionPayload = {
        userId,
        role:     userRole as UserRole,
        email,
        fullName,
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">

            {/* Kente top strip */}
            <div className="h-1 w-full flex flex-shrink-0">
                <div className="flex-1 bg-[#CE1126]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-black" />
                <div className="flex-1 bg-[#006B3F]" />
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#CE1126]" />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <ComptableSidebar session={session} />
                <main className="flex-1 overflow-y-auto bg-slate-950">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    )
}
