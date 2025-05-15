import type React from "react";
import "../app/globals.css";
import type { Metadata } from "next";
import { Providers } from "../components/providers/client-providers";
import { ClerkProvider } from "@clerk/nextjs";

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
    return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
