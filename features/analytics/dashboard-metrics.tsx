/**
 * Dashboard Metrics Component
 * 
 * Displays key performance indicators and metrics cards
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Truck, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, change, changeType, icon: Icon }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground'
  }[changeType]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor} flex items-center gap-1`}>
          <TrendingUp className="h-3 w-3" />
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics() {
  // In a real app, this data would come from your API
  const metrics = [
    {
      title: 'Active Vehicles',
      value: '24',
      change: '+2 from last month',
      changeType: 'positive' as const,
      icon: Truck
    },
    {
      title: 'Active Drivers',
      value: '18',
      change: '+1 from last month',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Active Loads',
      value: '12',
      change: '+3 from yesterday',
      changeType: 'positive' as const,
      icon: Package
    },
    {
      title: 'Revenue (MTD)',
      value: '$47,250',
      change: '+12% from last month',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'On-Time Delivery',
      value: '94%',
      change: '+2% from last month',
      changeType: 'positive' as const,
      icon: CheckCircle
    },
    {
      title: 'Avg Delivery Time',
      value: '2.4 days',
      change: '-0.2 days',
      changeType: 'positive' as const,
      icon: Clock
    },
    {
      title: 'Fuel Efficiency',
      value: '6.8 MPG',
      change: '+0.3 from last month',
      changeType: 'positive' as const,
      icon: TrendingUp
    },
    {
      title: 'Open Violations',
      value: '3',
      change: '-2 from last week',
      changeType: 'positive' as const,
      icon: AlertTriangle
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeType={metric.changeType}
          icon={metric.icon}
        />
      ))}
    </div>
  )
}
