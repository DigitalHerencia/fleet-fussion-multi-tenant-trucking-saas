import type React from "react"
import "@/app/globals.css"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

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
            <body className={inter.className} suppressHydrationWarning={true}>
                <ClerkProvider 
                    appearance={{
                        variables: {
                            colorPrimary: "hsl(var(--primary))",
                            colorBackground: "hsl(var(--background))",
                            colorText: "hsl(var(--foreground))",
                            colorInputText: "hsl(var(--foreground))",
                            colorInputBackground: "hsl(var(--background))"
                        }
                    }}
                >
                    <AuthProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="dark"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <Toaster position="top-right" />
                            {children}
                        </ThemeProvider>
                    </AuthProvider>
                </ClerkProvider>
            </body>
        </html>
    )
}
