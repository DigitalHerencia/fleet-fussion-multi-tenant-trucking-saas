import path from 'path';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev https://api.mapbox.com wss://*.clerk.dev",
              "frame-src 'self' https://*.clerk.dev https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ];  },
  
  images: {
    // Remove unoptimized: true - Next.js 15 uses Sharp by default for better optimization
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fleet-fusion.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.accounts.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    // Enhanced image optimization settings for Next.js 15
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    // Enable Turbo for faster builds (optional)
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  
  experimental: {
    // Next.js 15 specific features
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'fleet-fusion.vercel.app',
        'liberal-gull-quietly.ngrok-free.app:3000',
      ],
      bodySizeLimit: '2mb',
    },
    // PPR (Partial Prerendering) requires Next.js canary version
    // ppr: 'incremental',
    // Optimized package imports
    optimizePackageImports: ['lucide-react', '@clerk/nextjs'],
  },
  
  // Next.js 15 specific configurations
  typescript: {
    // Type-check during builds
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Lint during builds
    ignoreDuringBuilds: false,
  },
  
  // Compiler options for Next.js 15
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
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
