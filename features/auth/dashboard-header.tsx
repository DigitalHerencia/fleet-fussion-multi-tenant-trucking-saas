/**
 * Dashboard Header Component
 * 
 * Top navigation bar with user menu and organization switcher
 */

'use client'

import { Bell, Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import { useAuth } from '@/lib/auth/context'

type OrganizationMetadata = {
  subscriptionTier?: string
  dotNumber?: string
  // ...add other custom fields if needed
}

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void
}

export function DashboardHeader({ onMobileMenuToggle }: DashboardHeaderProps) {
  const { user, organization } = useAuth()
  const metadata = organization?.metadata as OrganizationMetadata | undefined

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Organization Info */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold">{organization?.name}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {metadata?.subscriptionTier || 'Free'}
              </Badge>
              {metadata?.dotNumber && (
                <span className="text-xs text-muted-foreground">
                  DOT: {metadata.dotNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vehicles, drivers, loads..."
              className="pl-8"
            />
          </div>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2">
          {/* Organization Switcher */}
          <OrganizationSwitcher
            appearance={{
              elements: {
                organizationSwitcherTrigger: 'border-0 shadow-none',
              },
            }}
          />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Vehicle inspection due</p>
                  <p className="text-xs text-muted-foreground">
                    Unit #TRK-001 inspection expires in 3 days
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Driver license expiring</p>
                  <p className="text-xs text-muted-foreground">
                    James Wilson&apos;s CDL expires next month
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Load assignment ready</p>
                  <p className="text-xs text-muted-foreground">
                    New load available for dispatch
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}
