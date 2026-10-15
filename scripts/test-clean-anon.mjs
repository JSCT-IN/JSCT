import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kghwzliszsfcmzhpcjpu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// A strictly unauthenticated client (no session, persistSession: false)
const unauthenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function testAnon() {
  const { data, error } = await unauthenticatedClient
    .from('members')
    .select('id, full_name, mobile');

  console.log('Unauthenticated Client query response:');
  console.log('Error:', error);
  console.log('Data count:', data?.length);
  console.log('Data:', data);
}

testAnon();
