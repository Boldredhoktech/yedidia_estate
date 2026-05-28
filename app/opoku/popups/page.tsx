// app/opoku/popups/page.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import PopupManager    from '@/components/opoku/PopupManager'

export default async function OpokuPopupsPage() {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') redirect('/opoku/login')

    return (
        <div className="flex flex-col gap-6 max-w-3xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Popup Management</h1>
                <p className="text-yellow-700 text-sm mt-1">
                    Upload flyers and promotional popups shown to visitors on the homepage.
                </p>
            </div>

            {/* Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="text-gray-300 font-bold">How it works: </span>
                    Only one popup can be active at a time. When you activate a popup,
                    all others are automatically deactivated. The popup appears to visitors
                    on their first page load and can be dismissed. It does not reappear
                    in the same browser session once closed.
                    Upload images to Supabase Storage first and paste the public URL here.
                </p>
            </div>

            {/* Manager */}
            <PopupManager />

        </div>
    )
}