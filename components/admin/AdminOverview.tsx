import { Suspense } from 'react';

import { OrganizationStats } from './OrganizationStats';
import { SystemHealth } from './SystemHealth';
import { AuditLogViewer } from './AuditLogViewer';
import { BulkUserActions } from './BulkUserActions';

export function AdminOverview({ orgId }: { orgId: string }) {
  return (
    <div className="space-y-6">
      <Suspense>
        <OrganizationStats orgId={orgId} />
      </Suspense>
      <Suspense>
        <SystemHealth />
      </Suspense>
      <BulkUserActions orgId={orgId} />
      <Suspense>
        <AuditLogViewer orgId={orgId} />
      </Suspense>
    </div>
  );
}
