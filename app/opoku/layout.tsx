// app/opoku/layout.tsx

import { headers }     from 'next/headers'
import OpokuSidebar    from '@/components/opoku/OpokuSidebar'
import type { SessionPayload, UserRole } from '@/lib/token'

export default async function OpokuLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const h        = await headers()
    const userId   = h.get('x-user-id')
    const userRole = h.get('x-user-role')
    const email    = h.get('x-user-email')
    const fullName = h.get('x-user-fullname') ?? 'Super Admin'

    // No session headers = login page (middleware doesn't set them for login routes)
    // Render children directly — no sidebar, no redirect loop
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
        <div className="min-h-screen bg-black flex flex-col">

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
                <OpokuSidebar session={session} />
                <main className="flex-1 overflow-y-auto bg-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    )
}
