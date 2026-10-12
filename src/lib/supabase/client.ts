import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ahxldlrxpejnyekeiajw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoeGxkbHJ4cGVqbnlla2VpYWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzU1MzQsImV4cCI6MjEwNzMxMTUzNH0.V-dPyqQqbkULXQ3YkXTK8QpfkBzONfTPXUVuPVAOfaY';

export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = createBrowserClient();
