/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "**"
            },
            {
                protocol: "https",
                hostname: "**"
            }
        ]
    },
    experimental: {
        serverActions: {
            allowedOrigins: ["localhost:3000", "fleet-fusion.vercel.app"]
        }
    }
}

export default nextConfig
