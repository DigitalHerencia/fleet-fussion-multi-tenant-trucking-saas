import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, AlertCircle, Truck, BarChart3, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
  permission: string[];
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap = {
  Plus,
  UserPlus,
  AlertCircle,
  Truck,
  BarChart3,
  FileText,
} as const;

export default function QuickActions({ actions }: QuickActionsProps) {
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
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon as keyof typeof iconMap] || Plus;
          
          return (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-3">
                  <div className={cn('p-2 rounded-lg text-white', action.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}