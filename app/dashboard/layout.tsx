/**
 * Dashboard Layout
 * 
 * Main tenant dashboard layout with navigation and content area
 */

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/features/auth/components/dashboard-nav'
import { DashboardSidebar } from '@/features/auth/components/dashboard-sidebar'
import { DashboardHeader } from '@/features/auth/components/dashboard-header'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <DashboardHeader />
      </div>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <DashboardHeader />
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
        <DashboardNav />
      </div>
    </div>
  )
}
