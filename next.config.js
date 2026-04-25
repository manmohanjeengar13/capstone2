/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bull', 'ioredis', 'winston', '@prisma/client', '@octokit/rest'],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    }];
  },
  images: { domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'] },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;