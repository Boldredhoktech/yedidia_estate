// app/opoku/layout.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import OpokuSidebar    from '@/components/opoku/OpokuSidebar'

export default async function OpokuLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session || session.role !== 'superadmin') {
        redirect('/opoku/login')
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