/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "fleet-fusion.vercel.app",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "http://localhost:3000",
        "https://fleet-fusion.vercel.app",
      ],
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['@'] = __dirname;
    return config;
  },
} satisfies import("next").NextConfig;

export default nextConfig;
