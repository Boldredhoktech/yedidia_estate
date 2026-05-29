// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    serverExternalPackages: ['argon2'],
    images: {
        remotePatterns: [
            // Cloudinary — media storage for listings
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            // Supabase — kept for backward compatibility
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/**',
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