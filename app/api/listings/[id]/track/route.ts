// app/api/listings/[id]/track/route.ts
// Called client-side when a visitor clicks WhatsApp or Call button.
// Increments whatsapp_clicks or call_clicks atomically.

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id }   = await params
        const { type } = await req.json() as { type: 'whatsapp' | 'call' }

        if (!id || !['whatsapp', 'call'].includes(type)) {
            return NextResponse.json({ ok: false }, { status: 400 })
        }

        await supabaseAdmin.rpc('increment_click_count', {
            p_listing_id: id,
            p_type:       type,
        })

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false }, { status: 200 }) // silent fail
    }
}
