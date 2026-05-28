// middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken }               from '@/lib/auth'
import type { UserRole }             from '@/lib/auth'
import { trackVisit }                from '@/lib/analytics'

// ─────────────────────────────────────────────
// ROUTE → ALLOWED ROLES MAP
// ─────────────────────────────────────────────

const PROTECTED_ROUTES: Record<string, UserRole[]> = {
    '/opoku':     ['superadmin'],
    '/kwaku':     ['agent_validator', 'superadmin'],
    '/agents':    ['agent_immobilier', 'agent_validator', 'superadmin'],
    '/comptable': ['comptable', 'superadmin'],
}

// Login pages — skip protection so users can actually log in
const LOGIN_PAGES = [
    '/opoku/login',
    '/kwaku/login',
    '/agents/login',
    '/comptable/login',
]

// ─────────────────────────────────────────────
// RATE LIMITING — simple in-memory store
// For production use Upstash Redis instead
// ─────────────────────────────────────────────

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>()
const RATE_LIMIT_MAX      = 10   // max attempts
const RATE_LIMIT_WINDOW   = 60 * 15 * 1000  // 15 minutes in ms

function isRateLimited(ip: string): boolean {
    const now  = Date.now()
    const entry = loginAttempts.get(ip)

    if (!entry) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now })
        return false
    }

    // Reset window if expired
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
        loginAttempts.set(ip, { count: 1, firstAttempt: now })
        return false
    }

    entry.count++
    if (entry.count > RATE_LIMIT_MAX) return true

    return false
}

// ─────────────────────────────────────────────
// COOKIE NAME (must match lib/auth.ts)
// ─────────────────────────────────────────────

const COOKIE_NAME = 'ye_session'

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // ── Analytics — public page visits (fire and forget) ──
    if (
        request.method === 'GET' &&
        (pathname === '/' || pathname.startsWith('/property/'))
    ) {
        trackVisit(request) // intentionally not awaited — must not block response
        return NextResponse.next()
    }

    // ── Apply rate limiting on login pages ──
    if (LOGIN_PAGES.some(p => pathname === p)) {
        if (request.method === 'POST') {
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                ?? request.headers.get('x-real-ip')
                ?? 'unknown'

            if (isRateLimited(ip)) {
                return new NextResponse(
                    JSON.stringify({ error: 'Too many login attempts. Please try again in 15 minutes.' }),
                    { status: 429, headers: { 'Content-Type': 'application/json' } }
                )
            }
        }
        return NextResponse.next()
    }

    // ── Check if route needs protection ──
    const protectedEntry = Object.entries(PROTECTED_ROUTES).find(([route]) =>
        pathname.startsWith(route)
    )

    if (!protectedEntry) {
        // Public route — pass through
        return NextResponse.next()
    }

    const [baseRoute, allowedRoles] = protectedEntry

    // ── Read and verify session cookie ──
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token) {
        return redirectToLogin(request, baseRoute)
    }

    const session = verifyToken(token)

    if (!session) {
        return redirectToLogin(request, baseRoute)
    }

    if (!allowedRoles.includes(session.role)) {
        // Logged in but wrong role — redirect to their own area
        const correctBase = getRoleBase(session.role)
        return NextResponse.redirect(new URL(`${correctBase}/dashboard`, request.url))
    }

    // ── Attach session info to request headers (readable by Server Components) ──
    const response = NextResponse.next()
    response.headers.set('x-user-id',   session.userId)
    response.headers.set('x-user-role', session.role)
    response.headers.set('x-user-email',session.email)

    return response
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function redirectToLogin(request: NextRequest, baseRoute: string): NextResponse {
    const loginUrl = new URL(`${baseRoute}/login`, request.url)
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
}

function getRoleBase(role: UserRole): string {
    switch (role) {
        case 'superadmin':        return '/opoku'
        case 'agent_validator':   return '/kwaku'
        case 'agent_immobilier':  return '/agents'
        case 'comptable':         return '/comptable'
    }
}

// ─────────────────────────────────────────────
// MATCHER — which paths trigger this middleware
// ─────────────────────────────────────────────

export const config = {
    matcher: [
        // Admin portals — auth protection + rate limiting
        '/opoku/:path*',
        '/kwaku/:path*',
        '/agents/:path*',
        '/comptable/:path*',
        // Public pages — analytics tracking
        '/',
        '/property/:path*',
    ],
}