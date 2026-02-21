/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pub-881a1c06b6ba43b398a94343f2256cbb.r2.dev'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
