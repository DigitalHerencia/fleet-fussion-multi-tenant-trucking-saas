// Company Switcher using Clerk's OrganizationSwitcher
'use client';
import { OrganizationSwitcher } from '@clerk/nextjs';
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function CompanySwitcherNav() {
  return (
    <div className="flex items-center space-x-2">
      <OrganizationSwitcher
        appearance={{
          elements: {
            organizationSwitcherTrigger: 'px-2 py-1 rounded border border-input bg-background hover:bg-muted transition',
          },
        }}
      />
      <NotificationCenter />
    </div>
  );
}
