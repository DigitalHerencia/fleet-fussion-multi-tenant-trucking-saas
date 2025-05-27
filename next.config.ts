/** @type {import('next').NextConfig} */
import path from "path"

const nextConfig: import( 'next' ).NextConfig = {
  reactStrictMode: true,
  images: {
    // Add domains for remote images here if you use them (example below):
    // domains: ['images.unsplash.com', 'cdn.example.com'],
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
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'fleet-fusion.vercel.app'],
    },
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname),
    }
    if (isServer) {
      // Ensure Prisma client is bundled only for the server
      config.externals = [...(config.externals || []), '@prisma/client']
    }
    return config
  },
}

export default nextConfig