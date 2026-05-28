// app/kwaku/agents/page.tsx

import { redirect }      from 'next/navigation'
import { getSession }    from '@/lib/auth'
import { supabaseAdmin } from '@/lib/db'
import AgentManagementTable from '@/components/kwaku/AgentManagementTable'

export interface ManagedAgent {
    id:             string
    full_name:      string
    email:          string
    phone_call:     string | null
    phone_whatsapp: string | null
    status:         string
    created_at:     string
    last_login_at:  string | null
    listing_count:  number
    active_sub:     { formula_key: string; expires_at: string } | null
}

async function getAgents(): Promise<ManagedAgent[]> {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
      id, full_name, email, phone_call,
      phone_whatsapp, status, created_at, last_login_at
    `)
        .eq('role', 'agent_immobilier')
        .order('created_at', { ascending: false })

    if (error || !data) return []

    // Enrich with listing counts and active subscriptions
    const enriched = await Promise.all(
        data.map(async (agent: any) => {
            const [listingsRes, subRes] = await Promise.all([
                supabaseAdmin
                    .from('listings')
                    .select('id', { count: 'exact', head: true })
                    .eq('agent_id', agent.id),
                supabaseAdmin
                    .from('subscriptions')
                    .select('formulas(formula_key), expires_at')
                    .eq('agent_id', agent.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
            ])

            return {
                ...agent,
                listing_count: listingsRes.count ?? 0,
                active_sub:    subRes.data
                    ? {
                        formula_key: (subRes.data.formulas as any)?.formula_key ?? '—',
                        expires_at:  subRes.data.expires_at,
                    }
                    : null,
            }
        })
    )

    return enriched
}

export default async function KwakuAgentsPage() {
    const session = await getSession()
    if (!session) redirect('/kwaku/login')

    const agents = await getAgents()

    const counts = {
        total:   agents.length,
        active:  agents.filter(a => a.status === 'active').length,
        pending: agents.filter(a => a.status === 'pending').length,
        blocked: agents.filter(a => a.status === 'blocked').length,
    }

    return (
        <div className="flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-white">Agent Management</h1>
                <p className="text-gray-400 text-sm mt-1">
                    Validate, block and manage real estate agent accounts.
                </p>
            </div>

            {/* Summary pills */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: 'Total',   count: counts.total,   color: 'bg-gray-800 text-gray-300'         },
                    { label: 'Active',  count: counts.active,  color: 'bg-emerald-900 text-emerald-400'   },
                    { label: 'Pending', count: counts.pending, color: 'bg-amber-900 text-amber-400'       },
                    { label: 'Blocked', count: counts.blocked, color: 'bg-red-950 text-red-400'           },
                ].map(pill => (
                    <span key={pill.label}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full ${pill.color}`}>
            {pill.label}: {pill.count}
          </span>
                ))}
            </div>

            {/* Table */}
            <AgentManagementTable agents={agents} />

        </div>
    )
}