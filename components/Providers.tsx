// Centralized Providers component for all context and theme providers
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { CompanyProvider } from "@/context/company-context";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <CompanyProvider>
          {children}
          <Toaster />
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
