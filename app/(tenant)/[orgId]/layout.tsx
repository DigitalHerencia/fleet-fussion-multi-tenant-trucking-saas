import type React from 'react';

import { TenantLayoutClient } from '@/components/shared/TenantLayoutClient';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TenantLayoutClient>{children}</TenantLayoutClient>;
}
