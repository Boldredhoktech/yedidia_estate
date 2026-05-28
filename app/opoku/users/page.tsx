// app/opoku/users/page.tsx

import { redirect }    from 'next/navigation'
import { getSession }  from '@/lib/auth'
import UsersManager    from '@/components/opoku/UsersManager'

export default async function OpokuUsersPage() {
    const session = await getSession()
    if (!session || session.role !== 'superadmin') redirect('/opoku/login')

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">User Management</h1>
                <p className="text-yellow-700 text-sm mt-1">
                    Create and manage Agent Validators and Accountants.
                    Agent Immobilier accounts are managed by Validators.
                </p>
            </div>

            {/* Info box */}
            <div className="bg-yellow-950 border border-yellow-800 rounded-2xl p-4">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598
                     6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176
                     -1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c
                     -3.196 0-6.1-1.248-8.25-3.285z"/>
                    </svg>
                    <div className="flex flex-col gap-1">
                        <p className="text-yellow-400 font-bold text-sm">
                            SuperAdmin accounts
                        </p>
                        <p className="text-yellow-600 text-xs leading-relaxed">
                            The SuperAdmin account is configured exclusively via environment
                            variables and cannot be created or modified from this panel.
                            Only Agent Validators and Accountants can be managed here.
                            Passwords are hashed with Argon2id and never stored in plain text.
                        </p>
                    </div>
                </div>
            </div>

            {/* Manager */}
            <UsersManager />

        </div>
    )
}