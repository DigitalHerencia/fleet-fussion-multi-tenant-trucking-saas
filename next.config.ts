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
      allowedOrigins: [
        'localhost:3000', 
        'fleet-fusion.vercel.app',
        'liberal-gull-quietly.ngrok-free.app:3000',
      ],
    },
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.1.236:3000',
    'http://192.168.1.236',
    'https://liberal-gull-quietly.ngrok-free.app',
    'https://liberal-gull-quietly.ngrok-free.app:3000',
  ],
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