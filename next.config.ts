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
    // Optional but recommended with server components
    typedRoutes: true,
  },
  webpack: (config) => {
    config.resolve = {
      ...(config.resolve || {}),
      alias: {
        ...(config.resolve?.alias || {}),
        "@/components": path.resolve(__dirname, "components"),
        "@/lib": path.resolve(__dirname, "lib"),
        "@/hooks": path.resolve(__dirname, "hooks"),
        "@/features": path.resolve(__dirname, "features"),
        "@/types": path.resolve(__dirname, "types"),
        "@/utils": path.resolve(__dirname, "utils"),
        "@/docs": path.resolve(__dirname, "docs"),
        "@/public": path.resolve(__dirname, "public"),
        "@/context": path.resolve(__dirname, "context"),
        "@/settings": path.resolve(__dirname, "settings"),
        "@/dashboard": path.resolve(__dirname, "app/dashboard"),
        "@/ui": path.resolve(__dirname, "components/ui"),
        "@/db": path.resolve(__dirname, "db"),
        "@/actions": path.resolve(__dirname, "lib/actions"),
        "@/constants": path.resolve(__dirname, "lib/constants"),
        "@/fetchers": path.resolve(__dirname, "lib/fetchers"),
        "@/validations": path.resolve(__dirname, "lib/validations"),
        "@/app": path.resolve(__dirname, "app"), 
      },
    };
    return config;
  },
};

export default nextConfig;
