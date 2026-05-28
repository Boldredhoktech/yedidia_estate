// app/kwaku/layout.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import KwakuSidebar    from '@/components/kwaku/KwakuSidebar'

export default async function KwakuLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || !['agent_validator', 'superadmin'].includes(session.role)) {
        redirect('/kwaku/login')
    }

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col">

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
                <KwakuSidebar session={session} />
                <main className="flex-1 overflow-y-auto bg-gray-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    )
}