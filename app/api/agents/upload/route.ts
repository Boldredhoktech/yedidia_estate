// app/api/agents/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/db'
import { getSession }                from '@/lib/auth'
import { siteConfig }                from '@/config/siteconfig'

// ─────────────────────────────────────────────
// POST /api/agents/upload
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        // ── Auth check ──
        const session = await getSession()
        if (!session || !['agent_immobilier', 'agent_validator', 'superadmin']
            .includes(session.role)) {
            return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
        }

        const formData  = await req.formData()
        const file      = formData.get('file')      as File | null
        const agentId   = formData.get('agentId')   as string | null
        const mediaType = formData.get('mediaType') as 'photo' | 'video' | null

        if (!file || !agentId || !mediaType) {
            return NextResponse.json(
                { error: 'Missing file, agentId or mediaType.' },
                { status: 400 }
            )
        }

        // ── Server-side size validation ──
        const maxBytes = mediaType === 'video'
            ? siteConfig.media.video.maxSizeBytes
            : siteConfig.media.photo.maxSizeBytes

        if (file.size > maxBytes) {
            return NextResponse.json(
                { error: `File exceeds the maximum allowed size of ${mediaType === 'video'
                        ? siteConfig.media.video.maxSizeMB
                        : siteConfig.media.photo.maxSizeMB} MB.` },
                { status: 400 }
            )
        }

        // ── Validate MIME type server-side ──
        const allowed = mediaType === 'video'
            ? siteConfig.media.video.acceptedFormats
            : siteConfig.media.photo.acceptedFormats

        if (!allowed.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}` },
                { status: 400 }
            )
        }

        // ── Build storage path ──
        // listings/{agentId}/{mediaType}/{timestamp}-{filename}
        const ext       = file.name.split('.').pop() ?? 'bin'
        const timestamp = Date.now()
        const safeName  = file.name
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .slice(0, 80)
        const storagePath = `listings/${agentId}/${mediaType}/${timestamp}-${safeName}`

        // ── Upload to Supabase Storage ──
        const arrayBuffer = await file.arrayBuffer()
        const buffer      = Buffer.from(arrayBuffer)

        const { error: uploadError } = await supabaseAdmin.storage
            .from('yedidia-media')
            .upload(storagePath, buffer, {
                contentType:  file.type,
                cacheControl: '3600',
                upsert:       false,
            })

        if (uploadError) {
            console.error('[upload/route] Storage error:', uploadError)
            return NextResponse.json(
                { error: 'Upload failed. Please try again.' },
                { status: 500 }
            )
        }

        // ── Get public URL ──
        const { data: urlData } = supabaseAdmin.storage
            .from('yedidia-media')
            .getPublicUrl(storagePath)

        return NextResponse.json({ ok: true, url: urlData.publicUrl }, { status: 201 })

    } catch (err) {
        console.error('[upload/route] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}