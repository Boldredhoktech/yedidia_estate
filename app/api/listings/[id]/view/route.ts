// app/api/listings/[id]/view/route.ts
// Called client-side on every property page load to increment view_count.
// Fire and forget — errors are silently ignored.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        if (!id) return NextResponse.json({ ok: false }, { status: 400 })

        await supabaseAdmin.rpc('increment_view_count', { p_listing_id: id })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false }, { status: 200 }) // silent fail
    }
}
