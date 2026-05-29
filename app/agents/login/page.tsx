// app/agents/login/page.tsx

import { supabaseAdmin }   from '@/lib/db'
import AgentLandingPage    from '@/components/agents/AgentLandingPage'

// ─────────────────────────────────────────────
// Fetch live formula prices from DB
// ─────────────────────────────────────────────

async function getFormulas() {
    const { data } = await supabaseAdmin
        .from('formulas')
        .select('formula_key, name, pub_count, pub_duration_days, validity_days, price_ghs, is_active')
        .neq('formula_key', 'FREE')
        .eq('is_active', true)
        .order('pub_count', { ascending: true })

    return data ?? []
}

export default async function AgentLoginPageWrapper() {
    const formulas = await getFormulas()
    return <AgentLandingPage formulas={formulas} />
}
