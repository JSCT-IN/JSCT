import { redirect } from 'next/navigation';
import { verifyAdminServerGuard } from '@/lib/supabase-server';

/**
 * Server Component Route-Level Enforcement for /admin
 * Intercepts requests on the server before ANY HTML or client JavaScript is rendered.
 */
export default async function AdminDashboardPage() {
  const guard = await verifyAdminServerGuard();

  if (!guard.authorized) {
    if (guard.reason === 'unauthorized') {
      redirect('/login?error=access_denied');
    }
    redirect('/console-secure-admin/login');
  }

  redirect('/console-secure-admin/dashboard');
}
