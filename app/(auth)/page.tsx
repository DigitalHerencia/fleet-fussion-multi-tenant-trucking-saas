import { requireRole } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function AuthPage() {
  // Example: redirect based on role
  // You can customize this logic as needed
  try {
    await requireRole(['admin', 'manager', 'driver', 'viewer']);
    // Redirect to dashboard or onboarding as needed
    redirect('/dashboard');
  } catch {
    redirect('/unauthorized');
  }
  return null;
}
