'use client';

import { useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { TopNavBar } from '@/components/shared/TopNavBar';
import { MainNav } from '@/components/shared/MainNav';
import { MobileNav } from '@/components/shared/MobileNav';
import { useUserContext } from '@/components/auth/context';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          {' '}
          {/* Height of header */}
          <MobileNav />
          <main className="mx-auto w-full max-w-3xl p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? 80 : 256; // 80px (w-20) or 256px (w-64)

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="fixed top-0 left-0 z-50 w-full">
        {/* Top Navigation Bar */}
        <TopNavBar />
      </header>
      {/* Sidebar */}
      <MainNav
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        orgId={orgId}
        userId={userId}
      />
      {/* Main content area */}
      <div
        className="flex min-w-0 flex-1 flex-col transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
