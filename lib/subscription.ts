// lib/subscription.ts

import { supabaseAdmin } from '@/lib/db'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ActiveSubscription {
    id:             string
    agent_id:       string
    formula_id:     string
    status:         'active' | 'expired' | 'suspended'
    pubs_remaining: number
    purchased_at:   string
    expires_at:     string
    activated_by:   string | null
    formulas: {
        id:                 string
        formula_key:        string
        name:               string
        pub_count:          number
        pub_duration_days:  number
        validity_days:      number
        price_ghs:          number
    } | null
}

// ─────────────────────────────────────────────
// getActiveSubscription
// Returns the agent's current active subscription (with credits),
// or null if none exists.
// ─────────────────────────────────────────────

export async function getActiveSubscription(
    agentId: string
): Promise<ActiveSubscription | null> {
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select(`
            id,
            agent_id,
            formula_id,
            status,
            pubs_remaining,
            purchased_at,
            expires_at,
            activated_by,
            formulas (
                id,
                formula_key,
                name,
                pub_count,
                pub_duration_days,
                validity_days,
                price_ghs
            )
        `)
        .eq('agent_id', agentId)
        .eq('status', 'active')
        .gt('expires_at', now)
        .gt('pubs_remaining', 0)
        .order('purchased_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error || !data) return null
    return data as ActiveSubscription
}

// ─────────────────────────────────────────────
// hasUsedFreeOffer
// Returns true if the agent already received the FREE formula once.
// Prevents assigning the free offer a second time via manual activation.
// ─────────────────────────────────────────────

export async function hasUsedFreeOffer(agentId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('id, formulas!inner(formula_key)')
        .eq('agent_id', agentId)
        .eq('formulas.formula_key', 'FREE')
        .limit(1)
        .maybeSingle()

    if (error) return false
    return data !== null
}

// ─────────────────────────────────────────────
// getRemainingPublications
// Returns pubs_remaining from the active subscription, or 0.
// ─────────────────────────────────────────────

export async function getRemainingPublications(agentId: string): Promise<number> {
    const sub = await getActiveSubscription(agentId)
    return sub?.pubs_remaining ?? 0
}

// ─────────────────────────────────────────────
// canPublish
// True if agent has an active subscription with at least 1 credit.
// ─────────────────────────────────────────────

export async function canPublish(agentId: string): Promise<boolean> {
    const sub = await getActiveSubscription(agentId)
    return sub !== null
}

// ─────────────────────────────────────────────
// expireOldSubscriptions
// Marks as 'expired' all active subscriptions whose expires_at
// has passed. Called by the daily cron job.
// ─────────────────────────────────────────────

export async function expireOldSubscriptions(): Promise<{ expired: number }> {
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('status', 'active')
        .lt('expires_at', now)
        .select('id')

    if (error) {
        console.error('[subscription] expireOldSubscriptions error:', error)
        return { expired: 0 }
    }

    return { expired: data?.length ?? 0 }
}
