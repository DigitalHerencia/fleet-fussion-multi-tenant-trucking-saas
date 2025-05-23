/**
 * Dashboard Sidebar Component
 * 
 * Left navigation sidebar for desktop
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  ClipboardCheck,
  BarChart3,
  Calculator,
  Settings,
  ChevronRight,
  FileText,
  Shield,
  Fuel,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { usePermission, useRole } from '@/lib/auth/context'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  permission?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
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
    children: [
      { title: 'Load Board', href: '/dispatch/loads', icon: FileText },
      { title: 'Assignments', href: '/dispatch/assignments', icon: Calendar },
      { title: 'Route Planning', href: '/dispatch/routes', icon: MapPin },
    ],
  },
  {
    title: 'Fleet',
    href: '/fleet',
    icon: Truck,
    permission: 'fleet:read',
    children: [
      { title: 'Vehicles', href: '/fleet/vehicles', icon: Truck },
      { title: 'Maintenance', href: '/fleet/maintenance', icon: ClipboardCheck },
      { title: 'Inspections', href: '/fleet/inspections', icon: Shield },
    ],
  },
  {
    title: 'Drivers',
    href: '/drivers',
    icon: Users,
    permission: 'fleet:read',
    children: [
      { title: 'Driver List', href: '/drivers/list', icon: Users },
      { title: 'Qualifications', href: '/drivers/qualifications', icon: ClipboardCheck },
      { title: 'Time & HOS', href: '/drivers/hours', icon: Calendar },
    ],
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: ClipboardCheck,
    permission: 'compliance:read',
    children: [
      { title: 'DOT Files', href: '/compliance/dot', icon: FileText },
      { title: 'Inspections', href: '/compliance/inspections', icon: Shield },
      { title: 'Violations', href: '/compliance/violations', icon: ClipboardCheck },
    ],
  },
  {
    title: 'IFTA',
    href: '/ifta',
    icon: Calculator,
    permission: 'ifta:read',
    children: [
      { title: 'Reports', href: '/ifta/reports', icon: FileText },
      { title: 'Fuel Records', href: '/ifta/fuel', icon: Fuel },
      { title: 'Mileage', href: '/ifta/mileage', icon: BarChart3 },
    ],
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'analytics:read',
    children: [
      { title: 'Performance', href: '/analytics/performance', icon: BarChart3 },
      { title: 'Financials', href: '/analytics/financials', icon: DollarSign },
      { title: 'Compliance', href: '/analytics/compliance', icon: Shield },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'settings:read',
    children: [
      { title: 'Organization', href: '/settings/organization', icon: Settings },
      { title: 'Users', href: '/settings/users', icon: Users },
      { title: 'Billing', href: '/settings/billing', icon: DollarSign },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])
  const isAdmin = useRole('admin')

  const toggleItem = (href: string) => {
    setOpenItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const hasPermission = (permission?: string) => {
    if (!permission) return true
    if (isAdmin) return true
    return usePermission(permission as any)
  }

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    const isOpen = openItems.includes(item.href)
    const hasChildren = item.children && item.children.length > 0

    if (!hasPermission(item.permission)) {
      return null
    }

    if (hasChildren) {
      return (
        <Collapsible
          open={isOpen}
          onOpenChange={() => toggleItem(item.href)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start h-10',
                level > 0 && 'ml-4'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto mr-2">
                  {item.badge}
                </Badge>
              )}
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isOpen && 'rotate-90'
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent
                key={child.href}
                item={child}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start h-10',
          level > 0 && 'ml-4'
        )}
        asChild
      >
        <Link href={item.href}>
          <item.icon className="mr-2 h-4 w-4" />
          <span className="flex-1 text-left">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Link>
      </Button>
    )
  }

  return (
    <div className="w-64 border-r bg-background">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-2">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">FleetFusion</h1>
            <p className="text-xs text-muted-foreground">TMS Platform</p>
          </div>
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>
    </div>
  )
}
