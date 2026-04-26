import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Allow images served from Supabase Storage (used in Phase 4+)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
}

export default nextConfig
