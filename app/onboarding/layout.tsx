/**
 * Onboarding Layout
 * 
 * Layout for onboarding flow pages
 */

import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

interface OnboardingLayoutProps {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 lg:bg-primary lg:flex-col lg:justify-center lg:px-12">
          <div className="text-primary-foreground">
            <h1 className="text-4xl font-bold mb-4">Welcome to FleetFusion</h1>
            <p className="text-xl mb-8 opacity-90">
              The modern transportation management system built for freight and logistics companies.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Comprehensive fleet management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Real-time dispatch and tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Automated compliance management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>IFTA reporting and analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-12">
          <div className="w-full max-w-md mx-auto">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
