/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'localhost:3000').split(',')
    }
  }
}

console.log('\x1b[36m%s\x1b[0m', '🚀 Environment Info:');
console.log('\x1b[36m%s\x1b[0m', '   API Endpoint:', process.env.NEXT_PUBLIC_API_ENDPOINT || '未设置');
console.log('\x1b[36m%s\x1b[0m', '   Allowed Origins:', process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || 'localhost:3000');

module.exports = nextConfig 