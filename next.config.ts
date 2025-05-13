import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only disable during early development or CI — restore before prod
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

};

export default nextConfig;
