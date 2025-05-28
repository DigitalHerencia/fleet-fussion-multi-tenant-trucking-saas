/**
 * Dashboard Layout
 * 
 * Main tenant dashboard layout with navigation and content area
 */

import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className="hidden lg:block">
          </div>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
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
  )
}
