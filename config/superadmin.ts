// config/superadmin.ts

/**
 * SuperAdmin credentials are NEVER stored in the database.
 * They live exclusively in .env.local (local) and Vercel
 * environment variables (production).
 *
 * This file is the single read point for those credentials.
 * Import getSuperAdminCredentials() only in server-side code
 * (API routes, Server Actions, middleware).
 */

export function getSuperAdminCredentials() {
    const username = process.env.SUPERADMIN_USERNAME
    const password = process.env.SUPERADMIN_PASSWORD

    if (!username || !password) {
        throw new Error(
            '[Yedidia] SUPERADMIN_USERNAME or SUPERADMIN_PASSWORD is not set in environment variables.'
        )
    }

    return { username, password }
}

/**
 * Returns true if the provided username matches
 * the configured superadmin username.
 * Password comparison (with Argon2) is handled in lib/auth.ts.
 */
export function isSuperAdminUsername(input: string): boolean {
    const { username } = getSuperAdminCredentials()
    return input.trim().toLowerCase() === username.trim().toLowerCase()
}