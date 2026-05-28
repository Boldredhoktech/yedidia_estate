// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    serverExternalPackages: ['argon2'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '25mb',
        },
    },
}

export default nextConfig