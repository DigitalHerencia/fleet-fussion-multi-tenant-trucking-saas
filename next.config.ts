
const nextConfig = {
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
                hostname: "localhost",
                port: "3000"
            },
            {
                protocol: "https",
                hostname: "fleet-fusion.vercel.app"
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
