// lib/db.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Public client — uses anon key.
 * Safe for client components and public API routes.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon)

/**
 * Admin client — uses service role key.
 * NEVER import in client components.
 * Use only in Server Actions, API routes, middleware.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
    auth: {
        autoRefreshToken:  false,
        persistSession:    false,
    },
})