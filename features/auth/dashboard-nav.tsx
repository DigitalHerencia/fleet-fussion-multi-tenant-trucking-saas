/**
 * Dashboard Mobile Navigation Component
 * 
 * Bottom navigation for mobile devices
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Truck,
  MapPin,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react'
import { usePermission, useRole } from '@/lib/auth/context'
import { hasPermission } from '@/lib/auth/permissions'
import { useAuth } from '@/lib/auth/context'
import type { Permission } from '@/types/auth'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

const mobileNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Dispatch',
    href: '/dispatch',
    icon: MapPin,
    permission: 'dispatch:read',
  },
  {
    title: 'Fleet',
    href: '/fleet',
    icon: Truck,
    permission: 'fleet:read',
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: ClipboardCheck,
    permission: 'compliance:read',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics:read',
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const isAdmin = useRole('admin')

  const { user } = useAuth()

  const visibleItems = mobileNavItems.filter(item => hasPermission(user, item.permission as Permission))

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around px-4 py-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
