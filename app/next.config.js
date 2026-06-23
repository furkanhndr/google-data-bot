/** @type {import('next').NextConfig} */

// Fail fast at build time if required env vars are missing
const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]
for (const key of REQUIRED_ENV) {
  if (!process.env[key] || process.env[key] === `placeholder_${key.toLowerCase()}`) {
    console.warn(`[env] WARNING: ${key} is not configured. Set it in .env.local before deploying.`)
  }
}

const nextConfig = {
  transpilePackages: ['@googlebusinessdata/shared-types', '@googlebusinessdata/shared-utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
