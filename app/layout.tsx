import { ThemeProvider } from "@/components/theme-provider";
import { CompanyProvider } from "@/context/company-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";
import type { Metadata } from "next";
import "../app/globals.css";

export const metadata: Metadata = {
  title: "FleetFusion - Enterprise-Grade Fleet Management",
  description:
    "Modern transportation management system for small-to-mid-size trucking fleets",
  icons: {
    icon: "/map-pinned.png",
    shortcut: "/map-pinned.png",
    apple: "/map-pinned.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <CompanyProvider>
                {children}
                <Toaster />
              </CompanyProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

