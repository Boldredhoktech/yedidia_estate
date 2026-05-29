// app/api/agents/upload/route.ts

import { NextRequest, NextResponse }   from 'next/server'
import { v2 as cloudinary }            from 'cloudinary'
import { getSession }                  from '@/lib/auth'
import { siteConfig }                  from '@/config/siteconfig'

// ─────────────────────────────────────────────
// CLOUDINARY CONFIG — lazy (avoids build-time errors when keys absent)
// ─────────────────────────────────────────────

function getCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
        api_key:    process.env.CLOUDINARY_API_KEY!,
        api_secret: process.env.CLOUDINARY_API_SECRET!,
        secure:     true,
    })
    return cloudinary
}

// ─────────────────────────────────────────────
// POST /api/agents/upload
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        // ── Auth ──
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

        // ── Size validation ──
        const maxBytes = mediaType === 'video'
            ? siteConfig.media.video.maxSizeBytes
            : siteConfig.media.photo.maxSizeBytes

        if (file.size > maxBytes) {
            return NextResponse.json(
                { error: `File exceeds the ${mediaType === 'video'
                    ? siteConfig.media.video.maxSizeMB
                    : siteConfig.media.photo.maxSizeMB} MB limit.` },
                { status: 400 }
            )
        }

        // ── MIME type validation ──
        const allowed = mediaType === 'video'
            ? siteConfig.media.video.acceptedFormats
            : siteConfig.media.photo.acceptedFormats

        if (!(allowed as readonly string[]).includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported format: ${file.type}` },
                { status: 400 }
            )
        }

        // ── Convert to base64 data URI for Cloudinary ──
        const arrayBuffer = await file.arrayBuffer()
        const base64      = Buffer.from(arrayBuffer).toString('base64')
        const dataURI     = `data:${file.type};base64,${base64}`

        // ── Upload to Cloudinary ──
        const cld          = getCloudinary()
        const resourceType = mediaType === 'video' ? 'video' : 'image'
        const folder       = `yedidia-estate/listings/${agentId}`
        const publicId     = `${mediaType === 'video' ? 'vid' : 'img'}_${Date.now()}`

        const result = await cld.uploader.upload(dataURI, {
            resource_type: resourceType,
            folder,
            public_id:     publicId,
            overwrite:     false,
        })

        // ── For photos: build an optimised URL (f_auto + q_auto) ──
        // Cloudinary automatically serves WebP/AVIF to supporting browsers
        // and applies intelligent compression — no extra storage cost.
        const url = mediaType === 'photo'
            ? result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/')
            : result.secure_url

        return NextResponse.json({ ok: true, url }, { status: 201 })

    } catch (err) {
        console.error('[upload/route] Cloudinary error:', err)
        return NextResponse.json(
            { error: 'Upload failed. Please try again.' },
            { status: 500 }
        )
    }
}
