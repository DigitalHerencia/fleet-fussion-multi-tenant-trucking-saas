import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { BillingManagement } from '@/components/admin/BillingManagement';
import UserManagementDashboard from '@/features/admin/users/UserManagementDashboard';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';

export default async function AdminPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <AdminOverview orgId={orgId} />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <Suspense>
            <UserManagementDashboard orgId={orgId} />
          </Suspense>
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingManagement orgId={orgId} />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <AuditLogViewer orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
