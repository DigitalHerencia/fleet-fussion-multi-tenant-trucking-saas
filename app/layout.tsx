import type React from "react"
import "@/app/globals.css"
import { AuthProvider } from "@/components/auth/context"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FleetFusion - Enterprise-Grade Fleet Management",
  description: "Modern transportation management system for small-to-mid-size trucking fleets",
  icons:  "map-pinned_icon.png"
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
        <body>
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
