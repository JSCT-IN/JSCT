const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID || 'kghwzliszsfcmzhpcjpu';

async function executeSql(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  const data = await res.json();
  return data;
}

async function fix() {
  console.log('1. Checking sequence and table RLS...');
  const check = await executeSql(`
    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'members';
  `);
  console.log('Rowsecurity:', check);

  const policies = await executeSql(`
    SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'members';
  `);
  console.log('Policies:', policies);

  console.log('2. Fixing sequence member_seq so nextval never collides...');
  const seqFix = await executeSql(`
    SELECT setval('public.member_seq', 100, true);
  `);
  console.log('Sequence set to 100:', seqFix);

  console.log('3. Ensuring strict RLS on members...');
  const rlsFix = await executeSql(`
    ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
    
    -- Drop any lingering permissive public policy
    DROP POLICY IF EXISTS "Public Read Members" ON public.members;
    DROP POLICY IF EXISTS "Allow anon select" ON public.members;
    DROP POLICY IF EXISTS "Public can view members" ON public.members;
    DROP POLICY IF EXISTS "Anyone can select members" ON public.members;

    -- Strict member RLS:
    DROP POLICY IF EXISTS "Members can view own profile" ON public.members;
    CREATE POLICY "Members can view own profile"
      ON public.members FOR SELECT
      USING (auth.uid() = id OR public.is_trust_admin() OR auth.role() = 'service_role');
  `);
  console.log('RLS fixed:', rlsFix);
}

fix();
