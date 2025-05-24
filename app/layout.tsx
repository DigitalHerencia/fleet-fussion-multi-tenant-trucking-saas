import type React from "react"
import "@/app/globals.css"
import { AuthProvider } from "@/lib/auth/context"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata, Viewport } from "next"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "FleetFusion - Enterprise-Grade Fleet Management",
  description: "Modern transportation management system for small-to-mid-size trucking fleets",
  generator: 'v0.dev',
  icons: { icon: "/white_logo.png" }, // Assuming white_logo.png is suitable for dark theme
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--color-bg))" }, // Using CSS variable
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--color-bg))" }, // Forcing dark theme appearance
  ],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable // Ensure this variable is correctly applied
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false} // Explicitly disable system theme preference
            disableTransitionOnChange
          >
            <AuthProvider>
              {/*
                Navigation is now handled in feature layouts (e.g., /dashboard/layout.tsx) or per-page as needed.
                Do not render MobileNav or PublicNav globally here.
              */}
              {children}
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
