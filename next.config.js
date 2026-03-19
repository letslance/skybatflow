/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Note: NEXT_PUBLIC_* vars are already exposed to the browser automatically.
  // Only add server-side vars here if they need a fallback default.
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.paisaexch.com' },
    ],
  },
}

module.exports = nextConfig
