// lib/auth.ts
// Node.js server runtime only — do NOT import in middleware.ts.
// Types are defined in lib/token.ts and re-exported from here
// so existing imports across the codebase stay unchanged.

import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/db'
import { getSuperAdminCredentials, isSuperAdminUsername } from '@/config/superadmin'

// ─────────────────────────────────────────────
// TYPES — re-exported from lib/token.ts
// (single source of truth, Edge-compatible)
// ─────────────────────────────────────────────

export type { UserRole, SessionPayload } from '@/lib/token'
import type { UserRole, SessionPayload } from '@/lib/token'

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const JWT_SECRET      = process.env.JWT_SECRET!
const COOKIE_NAME     = 'ye_session'
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours in seconds

// ─────────────────────────────────────────────
// PASSWORD — ARGON2
// ─────────────────────────────────────────────

/**
 * Hash a plain-text password using Argon2id.
 * Use when creating or updating a user's password.
 */
export async function hashPassword(plain: string): Promise<string> {
    return argon2.hash(plain, {
        type:        argon2.argon2id,
        memoryCost:  65536,   // 64 MB
        timeCost:    3,
        parallelism: 4,
    })
}

/**
 * Verify a plain-text password against a stored Argon2 hash.
 */
export async function verifyPassword(
    plain: string,
    hash:  string
): Promise<boolean> {
    try {
        return await argon2.verify(hash, plain)
    } catch {
        return false
    }
}

// ─────────────────────────────────────────────
// JWT — SIGN & VERIFY
// ─────────────────────────────────────────────

/**
 * Sign a JWT containing the session payload.
 * Expires in SESSION_MAX_AGE seconds.
 */
export function signToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_MAX_AGE })
}

/**
 * Verify and decode a JWT.
 * Returns null if invalid or expired.
 */
export function verifyToken(token: string): SessionPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as SessionPayload
    } catch {
        return null
    }
}

// ─────────────────────────────────────────────
// COOKIE SESSION
// ─────────────────────────────────────────────

/**
 * Write the session JWT into an HttpOnly cookie.
 * Call this after a successful login.
 */
export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>) {
    const token       = signToken(payload)
    const cookieStore = await cookies()

    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   SESSION_MAX_AGE,
        path:     '/',
    })
}

/**
 * Read and verify the current session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const token       = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null
    return verifyToken(token)
}

/**
 * Destroy the current session cookie.
 * Call this on logout.
 */
export async function destroySession() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

// ─────────────────────────────────────────────
// LOGIN — unified login handler
// ─────────────────────────────────────────────

export type LoginResult =
    | { success: true;  session: SessionPayload }
    | { success: false; error: string }

/**
 * Unified login function used by all admin login pages.
 * Handles SuperAdmin (from .env) and all DB users.
 */
export async function loginUser(
    email:    string,
    password: string
): Promise<LoginResult> {

    const trimEmail    = email.trim().toLowerCase()
    const trimPassword = password.trim()

    // ── SuperAdmin check (credentials from .env, not DB) ──
    try {
        const sa = getSuperAdminCredentials()
        if (isSuperAdminUsername(trimEmail) || trimEmail === sa.username.toLowerCase()) {
            const match = trimPassword === sa.password
            if (!match) return { success: false, error: 'Invalid credentials.' }

            const session: SessionPayload = {
                userId:   'superadmin',
                role:     'superadmin',
                email:    sa.username,
                fullName: 'Super Admin',
            }
            await createSession(session)
            return { success: true, session }
        }
    } catch {
        // SUPERADMIN_USERNAME not set — skip superadmin check
    }

    // ── DB users ──
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, role, email, full_name, password_hash, status')
        .eq('email', trimEmail)
        .single()

    if (error || !user) {
        return { success: false, error: 'Invalid credentials.' }
    }

    if (user.status === 'blocked') {
        return { success: false, error: 'Your account has been suspended. Please contact support.' }
    }

    if (user.status === 'pending') {
        return { success: false, error: 'Your account is pending validation. Please wait for approval.' }
    }

    const passwordMatch = await verifyPassword(trimPassword, user.password_hash)
    if (!passwordMatch) {
        return { success: false, error: 'Invalid credentials.' }
    }

    // Update last login timestamp
    await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

    const session: SessionPayload = {
        userId:   user.id,
        role:     user.role as UserRole,
        email:    user.email,
        fullName: user.full_name,
    }

    await createSession(session)
    return { success: true, session }
}

// ─────────────────────────────────────────────
// ROUTE GUARD — use in Server Components / Actions
// ─────────────────────────────────────────────

/**
 * Require a valid session with an allowed role.
 * Throws a redirect-friendly error if unauthorized.
 * Use at the top of protected Server Components.
 *
 * @example
 * const session = await requireAuth(['agent_validator', 'superadmin'])
 */
export async function requireAuth(allowedRoles: UserRole[]): Promise<SessionPayload> {
    const session = await getSession()

    if (!session) {
        throw new Error('UNAUTHORIZED')
    }

    if (!allowedRoles.includes(session.role)) {
        throw new Error('FORBIDDEN')
    }

    return session
}