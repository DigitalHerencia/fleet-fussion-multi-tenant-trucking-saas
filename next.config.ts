import path from 'path';

const nextConfig = {
  reactStrictMode: true,  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fleet-fusion.vercel.app',
      },
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
      '@': path.resolve(__dirname),
    };
    if (isServer) {
      // Ensure Prisma client is bundled only for the server
      config.externals = [...(config.externals || []), '@prisma/client'];
    }
    return config;
  },
} satisfies import('next').NextConfig;

export default nextConfig;
