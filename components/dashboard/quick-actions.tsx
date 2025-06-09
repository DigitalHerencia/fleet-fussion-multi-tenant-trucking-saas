import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuickAction } from '@/types/dashboard';

interface QuickActionCardProps {
  action: QuickAction;
}

const iconMap = {
  Plus: '➕',
  UserPlus: '👤➕',
  AlertCircle: '🚨',
  Truck: '🚛',
  BarChart3: '📊',
} as const;

export function QuickActionCard({ action }: QuickActionCardProps) {
  return (
    <Card className="transition-all hover:shadow-md hover:scale-105">
      <CardContent className="p-4">
        <Link href={action.href}>
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg text-white', action.color)}>
              <span className="text-lg">
                {iconMap[action.icon as keyof typeof iconMap] || '⚡'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No actions available for your role.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <QuickActionCard key={index} action={action} />
        ))}
      </CardContent>
    </Card>
  );
}