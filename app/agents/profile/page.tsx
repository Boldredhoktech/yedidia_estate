// app/agents/profile/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import ProfileForm       from '@/components/agents/ProfileForm'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface AgentProfile {
    id:              string
    full_name:       string
    email:           string
    phone_call:      string | null
    phone_whatsapp:  string | null
    status:          string
    role:            string
    created_at:      string
    last_login_at:   string | null
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

async function getAgentProfile(userId: string): Promise<AgentProfile | null> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
      id, full_name, email, phone_call,
      phone_whatsapp, status, role,
      created_at, last_login_at
    `)
        .eq('id', userId)
        .single()

    if (error || !data) return null
    return data as AgentProfile
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default async function ProfilePage() {
    const session = await getSession()
    if (!session) redirect('/agents/login')

    const profile = await getAgentProfile(session.userId)
    if (!profile) redirect('/agents/login')

    return (
        <div className="flex flex-col gap-6 max-w-2xl">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Update your contact details and account password.
                </p>
            </div>

            {/* Account summary card */}
            <div className="bg-gradient-to-br from-brand-500 to-brand-700
                      rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center
                          justify-center flex-shrink-0">
            <span className="text-white font-extrabold text-xl">
              {profile.full_name.charAt(0).toUpperCase()}
            </span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-extrabold text-lg leading-none truncate">
                            {profile.full_name}
                        </p>
                        <p className="text-brand-200 text-sm mt-1 truncate">{profile.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-bold
                               px-2.5 py-1 rounded-full capitalize">
                {profile.role.replace('_', ' ')}
              </span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                ${profile.status === 'active'
                                ? 'bg-emerald-400/30 text-emerald-100'
                                : 'bg-red-400/30 text-red-100'
                            }`}>
                {profile.status}
              </span>
                        </div>
                    </div>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/20">
                    <div>
                        <p className="text-brand-200 text-xs">Member since</p>
                        <p className="text-white font-semibold text-sm mt-0.5">
                            {new Date(profile.created_at).toLocaleDateString('en-GH', {
                                day: 'numeric', month: 'short', year: 'numeric',
                            })}
                        </p>
                    </div>
                    <div>
                        <p className="text-brand-200 text-xs">Last login</p>
                        <p className="text-white font-semibold text-sm mt-0.5">
                            {profile.last_login_at
                                ? new Date(profile.last_login_at).toLocaleDateString('en-GH', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })
                                : '—'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit form */}
            <ProfileForm profile={profile} />

        </div>
    )
}