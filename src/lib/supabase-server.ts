import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseAdminClient } from './supabase';

/**
 * Creates a server-side Supabase client with Next.js cookie handling
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored if called from a Server Component
        }
      },
    },
  });
}

/**
 * Server-side guard to strictly verify admin privileges before rendering.
 * Returns authorization status without throwing Next.js redirect errors.
 */
export async function verifyAdminServerGuard(): Promise<{
  authorized: boolean;
  reason?: 'unauthenticated' | 'unauthorized';
  user?: any;
  role?: string;
}> {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('jsct_admin_token')?.value;
    const adminRole = cookieStore.get('jsct_admin_role')?.value;
    const adminUserJson = cookieStore.get('jsct_admin_user')?.value;

    // 1. Check administrative session cookie
    if (adminToken && adminRole === 'admin' && adminUserJson) {
      try {
        const user = JSON.parse(adminUserJson);
        return { authorized: true, user, role: 'admin' };
      } catch {
        // Fallback to supabase auth check
      }
    }

    // 2. Check Supabase Auth SSR session
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, reason: 'unauthenticated' };
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: member } = await supabaseAdmin
      .from('members')
      .select('id, full_name, email, role')
      .eq('id', user.id)
      .single();

    if (!member || member.role !== 'admin') {
      return { authorized: false, reason: 'unauthorized', user };
    }

    return { authorized: true, user: member, role: 'admin' };
  } catch (err) {
    return { authorized: false, reason: 'unauthenticated' };
  }
}
