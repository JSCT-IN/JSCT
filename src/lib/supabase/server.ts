import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kghwzliszsfcmzhpcjpu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaHd6bGlzenNmY216aHBjanB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDMxNTMsImV4cCI6MjEwNzU3OTE1M30.cA-p2cMUYsf3Kqq5eZgPVTPNTMexJUicEDFFaMhNBk0';

export function createServerClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
