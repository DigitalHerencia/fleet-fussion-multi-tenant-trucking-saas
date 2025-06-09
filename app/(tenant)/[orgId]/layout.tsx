"use client";

import type React from 'react';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TopNavBar } from '@/components/shared/TopNavBar';
import { MainNav } from '@/components/shared/MainNav';
import { MobileNav } from '@/components/shared/MobileNav';
import { useUserContext } from '@/components/auth/context';

interface TenantLayoutClientProps {
  children: React.ReactNode;
}

export function TenantLayoutClient({ children }: TenantLayoutClientProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const userContext = useUserContext();
  const orgId = userContext?.organizationId || '';
  const userId = userContext?.userId || '';

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="fixed top-0 left-0 z-50 w-full border-b border-gray-700 bg-gray-800 shadow-lg">
          <TopNavBar />
        </header>
        <div className="pt-[64px]">
          <MobileNav />
          <main className="mx-auto w-full max-w-3xl p-4 md:p-8">{children}</main>
        </div>
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="fixed top-0 left-0 z-50 w-full">
        <TopNavBar />
      </header>
      <MainNav
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        orgId={orgId}
        userId={userId}
      />
      <div
        className="flex min-w-0 flex-1 flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}

// Default export required by Next.js for layout files
export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return <TenantLayoutClient>{children}</TenantLayoutClient>;
}

