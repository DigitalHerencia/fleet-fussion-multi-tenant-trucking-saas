import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"

export const metadata: Metadata = {
    title: "FleetFusion - Enterprise-Grade Fleet Management",
    description: "Modern transportation management system for small-to-mid-size trucking fleets",
    icons: {
        icon: "/map-pinned.png",
        shortcut: "/map-pinned.png",
        apple: "/map-pinned.png"
    }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body>
                <ClerkProvider>
                    <ThemeProvider>
                        <Toaster position="top-right" />
                        {children}
                    </ThemeProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
