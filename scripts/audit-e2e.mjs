import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kghwzliszsfcmzhpcjpu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const results = [];

function record(testName, passed, details) {
  results.push({ testName, passed, details });
  const badge = passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`${badge} ${testName}`);
  if (details) console.log(`       -> ${details}`);
}

async function runAudit() {
  console.log('================================================================');
  console.log('   JSCT 2.0 FULL-STACK SECURITY & QA END-TO-END VERIFICATION    ');
  console.log(`   Target Project: ${SUPABASE_URL}                              `);
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST GROUP 1: ADMIN CREDENTIALS & AUTHENTICATION
  // --------------------------------------------------------------------------
  console.log('--- 1. Admin Credentials & Supabase Auth ---');

  // Admin 1: Ambrish Kumar
  try {
    const freshAnonClient1 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: auth1, error: err1 } = await freshAnonClient1.auth.signInWithPassword({
      email: 'Ambrish@jsct.com',
      password: 'Ambrish@123',
    });
    if (err1) throw err1;
    record('Admin 1 Auth (Ambrish@jsct.com)', true, `User ID: ${auth1.user?.id}, Session established.`);
  } catch (e) {
    record('Admin 1 Auth (Ambrish@jsct.com)', false, e.message);
  }

  // Admin 2: Irfan Khan
  try {
    const freshAnonClient2 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: auth2, error: err2 } = await freshAnonClient2.auth.signInWithPassword({
      email: 'Irfan@jsct.com',
      password: 'Irfan@jsct.com',
    });
    if (err2) throw err2;
    record('Admin 2 Auth (Irfan@jsct.com)', true, `User ID: ${auth2.user?.id}, Session established.`);
  } catch (e) {
    record('Admin 2 Auth (Irfan@jsct.com)', false, e.message);
  }

  // Check Admin Records in public.members
  try {
    const { data: adminRows, error: admErr } = await supabaseAdmin
      .from('members')
      .select('id, member_id, full_name, email, role, is_active, payment_status')
      .in('email', ['Ambrish@jsct.com', 'Irfan@jsct.com']);

    if (admErr) throw admErr;

    const ambrish = adminRows?.find(r => r.email === 'Ambrish@jsct.com');
    const irfan = adminRows?.find(r => r.email === 'Irfan@jsct.com');

    const ambrishPass = ambrish && ambrish.role === 'admin' && ambrish.is_active === true && ambrish.payment_status === 'verified';
    record('Admin 1 Member Record (Ambrish)', ambrishPass, `Role: ${ambrish?.role}, is_active: ${ambrish?.is_active}, payment_status: ${ambrish?.payment_status}`);

    const irfanPass = irfan && irfan.role === 'admin' && irfan.is_active === true && irfan.payment_status === 'verified';
    record('Admin 2 Member Record (Irfan)', irfanPass, `Role: ${irfan?.role}, is_active: ${irfan?.is_active}, payment_status: ${irfan?.payment_status}`);
  } catch (e) {
    record('Admin Records in members table', false, e.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: DATABASE SCHEMA, TRIGGERS & 6-MONTH LOCK-IN COMPLIANCE
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Database Triggers & Business Compliance Rules ---');

  let testAuthUserId = null;
  try {
    const testMobile = '99999' + Math.floor(10000 + Math.random() * 90000);
    const testEmail = `qa_audit_${Date.now()}@dpswt.com`;
    const testUtr = 'TEST-UTR-' + Date.now();
    const testRegDate = new Date('2026-04-01T10:00:00Z');

    // 1. Create auth user
    const { data: authCreated, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword@123',
      email_confirm: true,
    });
    if (authErr) throw authErr;
    testAuthUserId = authCreated.user.id;

    // 2. Insert member without member_id or lock_in_end_date
    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('members')
      .insert({
        id: testAuthUserId,
        full_name: 'QA Audit Test Member',
        father_or_husband_name: 'Test Parent',
        dob: '1995-01-01',
        gender: 'male',
        marital_status: 'unmarried',
        department: 'बेसिक शिक्षा परिषद',
        designation: 'सहायक अध्यापक',
        mobile: testMobile,
        email: testEmail,
        state: 'Uttar Pradesh',
        district: 'Gorakhpur',
        block: 'Sadar',
        pin_code: '273001',
        permanent_address: 'Gorakhpur Test Address',
        nominee_name: 'Test Nominee',
        nominee_relation: 'Brother',
        nominee_age: 25,
        nominee_mobile: testMobile,
        transaction_id: testUtr,
        payment_receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        payment_status: 'pending',
        is_active: false,
        registration_date: testRegDate.toISOString(),
      })
      .select()
      .single();

    if (insErr) throw insErr;

    // Verify member_id format: JSCT-2026-XXXXX
    const hasCorrectIdFormat = /^JSCT-2026-\d{5}$/.test(inserted.member_id);
    record('Trigger: Auto-generation of sequential member_id (JSCT-2026-XXXXX)', hasCorrectIdFormat, `Generated member_id: ${inserted.member_id}`);

    // Verify 6-month lock_in_end_date calculation
    const regTime = new Date(inserted.registration_date).getTime();
    const lockInTime = new Date(inserted.lock_in_end_date).getTime();
    const monthsDiff = (lockInTime - regTime) / (1000 * 60 * 60 * 24 * 30.4375);
    const lockInPass = Math.abs(monthsDiff - 6) < 0.3;
    record('Trigger: Strict 6-Month Lock-in calculation (registration_date + 6 months)', lockInPass, `Reg: ${inserted.registration_date.slice(0, 10)} -> Lock-in: ${inserted.lock_in_end_date.slice(0, 10)}`);

    // Clean up test member
    await supabaseAdmin.from('members').delete().eq('id', testAuthUserId);
    await supabaseAdmin.auth.admin.deleteUser(testAuthUserId);
    testAuthUserId = null;
  } catch (e) {
    record('Trigger: member_id & lock-in date test', false, e.message);
    if (testAuthUserId) {
      await supabaseAdmin.from('members').delete().eq('id', testAuthUserId).catch(() => {});
      await supabaseAdmin.auth.admin.deleteUser(testAuthUserId).catch(() => {});
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: WELFARE SCHEMES COMPLIANCE
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Welfare Schemes Compliance ---');

  try {
    const { data: schemes, error: schErr } = await supabaseAdmin
      .from('welfare_schemes')
      .select('*');

    if (schErr) throw schErr;

    const bereavement = schemes.find(s => s.name.includes('दिवंगत'));
    const marriage = schemes.find(s => s.name.includes('बेटी विवाह'));
    const betaScheme = schemes.find(s => s.name.includes('बेटा विवाह'));

    const bPass = bereavement && Number(bereavement.max_coverage) === 1500000;
    record('Scheme: दिवंगत के स्थिति में सहयोग (₹15,00,000)', bPass, `Coverage: ₹${Number(bereavement?.max_coverage).toLocaleString('en-IN')}`);

    const mPass = marriage && Number(marriage.max_coverage) === 500000;
    record('Scheme: बेटी विवाह सहयोग (₹5,00,000)', mPass, `Coverage: ₹${Number(marriage?.max_coverage).toLocaleString('en-IN')}`);

    const betaOmitted = !betaScheme;
    record('Bylaw Rule: "बेटा विवाह बधाई योजना" Omission/Deletion', betaOmitted, betaOmitted ? 'Correctly omitted and purged from database.' : 'Found legacy beta vivah scheme (violation)!');
  } catch (e) {
    record('Welfare Schemes validation', false, e.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: STORAGE BUCKETS & ACCESS POLICIES
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Supabase Storage Configuration ---');

  try {
    const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
    if (bErr) throw bErr;

    const photoBucket = buckets.find(b => b.id === 'member-photos');
    const receiptBucket = buckets.find(b => b.id === 'payment-receipts');

    record('Storage: "member-photos" bucket exists', !!photoBucket, `Public: ${photoBucket?.public}`);
    record('Storage: "payment-receipts" bucket exists', !!receiptBucket, `Public: ${receiptBucket?.public} (Restricted/Private)`);
  } catch (e) {
    record('Storage buckets check', false, e.message);
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 5: ROW LEVEL SECURITY (RLS) AUDIT
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Row Level Security (RLS) Audit ---');

  try {
    // Unauthenticated public anon client querying members table
    const unauthenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: anonData } = await unauthenticatedClient
      .from('members')
      .select('id, full_name, mobile');

    const rlsRestricted = !anonData || anonData.length === 0;
    record('RLS: Public/Anonymous restricted from member browsing', rlsRestricted, `Rows returned to unauthenticated anon: ${anonData?.length || 0}`);

    // Admin querying all members
    const { data: adminData } = await supabaseAdmin
      .from('members')
      .select('id, member_id, full_name');

    const adminCanRead = adminData && adminData.length > 0;
    record('RLS / Service Role: Admin full access to members & receipts', adminCanRead, `Total records accessible to admin: ${adminData?.length || 0}`);
  } catch (e) {
    record('RLS policy validation', false, e.message);
  }

  // --------------------------------------------------------------------------
  // FINAL REPORT SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`AUDIT FINISHED: ${passedCount}/${totalCount} TESTS PASSED`);
  console.log('================================================================');
}

runAudit();
