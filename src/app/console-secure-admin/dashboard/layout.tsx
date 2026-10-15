import { redirect } from 'next/navigation';
import { verifyAdminServerGuard } from '@/lib/supabase-server';

/**
 * Server Component Route-Level Enforcement for /console-secure-admin/dashboard
 * Strictly validates active admin session on the server before rendering any dashboard UI or analytics.
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const guard = await verifyAdminServerGuard();

  if (!guard.authorized) {
    if (guard.reason === 'unauthorized') {
      redirect('/login?error=access_denied');
    }
    redirect('/console-secure-admin/login');
  }

  return <>{children}</>;
}
