// app/agents/layout.tsx

import { headers }    from 'next/headers'
import AgentSidebar   from '@/components/agents/AgentSidebar'
import KenteStrip     from '@/components/public/KenteStrip'
import type { SessionPayload, UserRole } from '@/lib/token'

export default async function AgentsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const h        = await headers()
    const userId   = h.get('x-user-id')
    const userRole = h.get('x-user-role')
    const email    = h.get('x-user-email')
    const fullName = h.get('x-user-fullname') ?? 'Agent'

    // No session headers = login/register page — render without protected layout
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <KenteStrip position="top" height="thin" />

            <div className="flex flex-1 overflow-hidden">
                <AgentSidebar session={session} />
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
