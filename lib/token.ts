// lib/token.ts
// Edge Runtime compatible JWT verification.
// IMPORTANT: This file must NEVER import argon2, jsonwebtoken,
// or any other Node.js-only module — it is used by middleware.ts
// which runs on Vercel Edge Runtime.

import { jwtVerify } from 'jose'

// ─────────────────────────────────────────────
// TYPES — defined here so middleware can import
// them without pulling in any Node.js modules
// ─────────────────────────────────────────────

export type UserRole =
    | 'superadmin'
    | 'agent_validator'
    | 'agent_immobilier'
    | 'comptable'

export interface SessionPayload {
    userId:   string
    role:     UserRole
    email:    string
    fullName: string
    iat?:     number
    exp?:     number
}

// ─────────────────────────────────────────────
// VERIFY TOKEN — Edge Runtime safe
// Uses jose + Web Crypto API (crypto.subtle).
// Verifies tokens signed by lib/auth.ts (HS256).
// ─────────────────────────────────────────────

export async function verifyTokenEdge(
    token: string
): Promise<SessionPayload | null> {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}
