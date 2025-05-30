import { requireRole } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function FunnelPage() {
  // Example: redirect based on role
  try {
    await requireRole(['admin', 'manager', 'driver', 'viewer']);
    redirect('/dashboard');
  } catch {
    redirect('/unauthorized');
  }
  return null;
}
