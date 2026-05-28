// app/api/popup/route.ts

import { NextResponse }   from 'next/server'
import { supabaseAdmin }  from '@/lib/db'

export const revalidate = 60 // revalidate every 60 seconds

export async function GET() {
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
        .from('popups')
        .select('id, title, image_url, link_url, display_from, display_until')
        .eq('is_active', true)
        .or(`display_from.is.null,display_from.lte.${now}`)
        .or(`display_until.is.null,display_until.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !data) {
        return NextResponse.json({ popup: null })
    }

    return NextResponse.json({ popup: data })
}