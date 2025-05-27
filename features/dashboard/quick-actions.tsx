/**
 * Quick Actions Component
 * 
 * Displays commonly used action buttons for fleet managers
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Plus, 
  Truck, 
  User, 
  FileText, 
  MapPin,
  DollarSign 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/context'
import { hasPermission } from '@/lib/auth/permissions'
import type { Permission } from '@/types/auth'

export function QuickActions() {
  const router = useRouter()
  const auth = useAuth()

  const actions = [
    {
      title: 'New Load',
      description: 'Create a new dispatch assignment',
      icon: Plus,
      href: '/dashboard/dispatch/loads/new',
      permission: 'dispatch:create',
      variant: 'default' as const
    },
    {
      title: 'Add Vehicle',
      description: 'Register a new vehicle',
      icon: Truck,
      href: '/dashboard/fleet/vehicles/new',
      permission: 'fleet:write',
      variant: 'outline' as const
    },
    {
      title: 'Add Driver',
      description: 'Onboard a new driver',
      icon: User,
      href: '/dashboard/fleet/drivers/new',
      permission: 'fleet:write',
      variant: 'outline' as const
    },
    {
      title: 'Track Shipment',
      description: 'Check shipment location',
      icon: MapPin,
      href: '/dashboard/dispatch/tracking',
      permission: 'dispatch:read',
      variant: 'outline' as const
    },
    {
      title: 'Generate Report',
      description: 'Create analytics report',
      icon: FileText,
      href: '/dashboard/analytics/reports/new',
      permission: 'analytics:read',
      variant: 'outline' as const
    },
    {
      title: 'IFTA Report',
      description: 'Quarterly tax filing',
      icon: DollarSign,
      href: '/dashboard/ifta/reports',
      permission: 'ifta:read',
      variant: 'outline' as const
    }
  ]

  const visibleActions = actions.filter(action => 
    hasPermission(auth.user, action.permission as Permission)
  )

  if (visibleActions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.href}
                variant={action.variant}
                className="h-auto p-4 justify-start"
                onClick={() => router.push(action.href)}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
