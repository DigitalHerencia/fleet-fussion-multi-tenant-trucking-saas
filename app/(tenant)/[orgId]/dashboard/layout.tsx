/**
 * Dashboard Layout
 * 
 * Main tenant dashboard layout with navigation and content area
 */

import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    // Assuming ThemeProvider is already wrapping your app in a higher-level layout
    // The `dark` class will be applied to <html> by next-themes
    <div className="min-h-screen bg-neutral-900 text-shadow-white">
      {/* Mobile Header */}
      <div className="lg:hidden">
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
        </div>

        <div className="flex-1 lg:ml-0">
          {/* Main content area */}
          <main className="p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
      </div>
    </div>
  );
}
