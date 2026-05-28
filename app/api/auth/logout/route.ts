// app/api/auth/logout/route.ts

import { NextResponse }  from 'next/server'
import { destroySession } from '@/lib/auth'

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────

export async function POST() {
    try {
        await destroySession()
        return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('[auth/logout/route] Error:', err)
        return NextResponse.json({ ok: true }) // always succeed on logout
    }
}