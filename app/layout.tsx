import type React from "react";
import "../app/globals.css";
import type { Metadata } from "next";
import { Providers } from "../components/providers/client-providers";
import { ClerkProvider } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const routerPush = (href: string) => {
    router.push(href);
  };

  const routerReplace = (href: string) => {
    router.replace(href);
  };
    // Determine environment and configure the domain settings appropriately
  const isDevelopment = process.env.NODE_ENV === 'development';
  const prodDomain = process.env.NEXT_PUBLIC_APP_URL || 'https://fleet-fusion.vercel.app';
  
  // Configuration for both development and production environments
  const clerkConfig = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // In development with ngrok tunneling, we need specific domain settings
    // In production, we use the app's URL domain
    domain: isDevelopment ? 'http://localhost:3000' : new URL(prodDomain).host,
    // If using ngrok for development, set cookie domain to .ngrok-free.app
    cookieDomain: isDevelopment ? '.ngrok-free.app' : undefined,
    routerPush,
    routerReplace,
    isSatellite: false,
    proxyUrl: undefined,
  };

  return (
    <html lang="en">
      <body>
        <ClerkProvider {...clerkConfig}>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
