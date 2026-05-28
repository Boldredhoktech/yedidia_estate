// app/kwaku/legal-partners/page.tsx

import { redirect }          from 'next/navigation'
import { getSession }        from '@/lib/auth'
import LegalPartnersManager  from '@/components/kwaku/LegalPartnersManager'

export default async function KwakuLegalPartnersPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Legal Partners</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Manage certified notaries, lawyers and bailiffs that appear
                    on the public legal partners page.
                </p>
            </div>

            {/* Info box */}
            <div className="bg-amber-950 border border-amber-800 rounded-2xl p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75
                     0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9
                     -3.75h.008v.008H12V8.25z"/>
                    </svg>
                    <div className="flex flex-col gap-1">
                        <p className="text-amber-300 font-bold text-sm">
                            Public visibility
                        </p>
                        <p className="text-amber-400 text-xs leading-relaxed">
                            Only <span className="font-bold">active</span> partners are shown on the
                            public legal partners page. Partners you add here will replace the
                            "Coming Soon" message on the site. Deactivated partners remain in this
                            panel but are hidden from visitors.
                        </p>
                    </div>
                </div>
            </div>

            {/* Manager component */}
            <LegalPartnersManager />

        </div>
    )
}