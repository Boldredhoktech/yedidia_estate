// app/agents/layout.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import AgentSidebar      from '@/components/agents/AgentSidebar'
import KenteStrip        from '@/components/public/KenteStrip'

export default async function AgentsLayout({
                                               children,
                                           }: {
    children: React.ReactNode
}) {
    const session = await getSession()

    // Middleware handles redirects but we double-check here
    if (!session || !['agent_immobilier', 'agent_validator', 'superadmin'].includes(session.role)) {
        redirect('/agents/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <KenteStrip position="top" height="thin" />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <AgentSidebar session={session} />

                {/* Main content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}