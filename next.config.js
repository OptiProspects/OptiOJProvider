/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'localhost:3000').split(',')
    }
  }
}

module.exports = nextConfig
