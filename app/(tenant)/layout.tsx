import { requireAuth } from '@/lib/auth/auth';

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}
