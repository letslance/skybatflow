/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.paisaexch.com' },
    ],
  },
  /**
   * Proxy all /api/* requests that don't match a local BFF route handler
   * through the Next.js server to the backend gateway.
   *
   * This keeps every request same-origin from the browser — no CORS, and
   * httpOnly cookies (access_token) are sent automatically.
   *
   * BACKEND_URL is a server-side runtime env var (never baked into the bundle):
   *   - Local dev : http://187.127.135.139:7080  (set in .env.local)
   *   - Docker    : http://api-gateway:7080       (set in .env.staging.runtime)
   *
   * Next.js App Router route handlers (/api/auth/*, /api/health) always take
   * precedence over rewrites, so BFF routes are unaffected.
   */
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:7080'
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
