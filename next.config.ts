/** @type {import('next').NextConfig} */

const nextConfig: import( 'next' ).NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'fleet-fusion.vercel.app'],
    },
  },
  
}

export default nextConfig