import type React from "react"
import "@/app/globals.css"
import { AuthProvider } from "@/lib/auth/context"
import { ThemeProvider } from "@/components/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FleetFusion - Enterprise-Grade Fleet Management",
  description: "Modern transportation management system for small-to-mid-size trucking fleets",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
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
