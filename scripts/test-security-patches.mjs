const BASE_URL = 'http://localhost:3000';

async function testSecurity() {
  console.log('================================================================');
  console.log('🔒 EXECUTING COMPREHENSIVE SECURITY & AUTHORIZATION AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, details) {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${title}`);
    } else {
      console.error(`❌ [FAIL] ${title}`);
    }
    if (details) console.log(`   ${details}`);
    console.log('');
  }

  // Test 1: Unauthenticated request to /admin
  try {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    const isRedirect = [301, 302, 307, 308].includes(res.status);
    const targetsLogin = location.includes('/console-secure-admin/login');
    assert(
      'Test 1: Unauthenticated GET /admin',
      isRedirect && targetsLogin,
      `Status: ${res.status}, Location: ${location}`
    );
  } catch (e) {
    assert('Test 1: Unauthenticated GET /admin', false, e.message);
  }

  // Test 2: Unauthenticated request to /console-secure-admin/dashboard
  try {
    const res = await fetch(`${BASE_URL}/console-secure-admin/dashboard`, { redirect: 'manual' });
    const location = res.headers.get('location') || '';
    const isRedirect = [301, 302, 307, 308].includes(res.status);
    const targetsLogin = location.includes('/console-secure-admin/login');
    assert(
      'Test 2: Unauthenticated GET /console-secure-admin/dashboard',
      isRedirect && targetsLogin,
      `Status: ${res.status}, Location: ${location}`
    );
  } catch (e) {
    assert('Test 2: Unauthenticated GET /console-secure-admin/dashboard', false, e.message);
  }

  // Test 3: Standard Member attempting to access /console-secure-admin/dashboard
  try {
    const res = await fetch(`${BASE_URL}/console-secure-admin/dashboard`, {
      redirect: 'manual',
      headers: {
        cookie: 'jsct_session=valid_member_token; jsct_role=MEMBER',
      },
    });
    const location = res.headers.get('location') || '';
    const isRedirect = [301, 302, 307, 308].includes(res.status);
    const targetsAccessDenied = location.includes('/login') && location.includes('error=access_denied');
    assert(
      'Test 3: Standard Member GET /console-secure-admin/dashboard (Access Denied)',
      isRedirect && targetsAccessDenied,
      `Status: ${res.status}, Location: ${location}`
    );
  } catch (e) {
    assert('Test 3: Standard Member GET /console-secure-admin/dashboard', false, e.message);
  }

  // Test 4: Authenticated Admin accessing /console-secure-admin/dashboard
  try {
    const adminUser = JSON.stringify({
      id: 'admin-seed-id',
      email: 'Ambrish@jsct.com',
      full_name: 'Ambrish Kumar',
      role: 'admin',
    });
    const res = await fetch(`${BASE_URL}/console-secure-admin/dashboard`, {
      headers: {
        cookie: `jsct_admin_token=admin_secure_mock_token; jsct_admin_role=admin; jsct_admin_user=${encodeURIComponent(adminUser)}`,
      },
    });
    assert(
      'Test 4: Authenticated Admin GET /console-secure-admin/dashboard (Allowed)',
      res.status === 200,
      `Status: ${res.status}`
    );
  } catch (e) {
    assert('Test 4: Authenticated Admin GET /console-secure-admin/dashboard', false, e.message);
  }

  // Test 5: Authenticated Admin visiting Login Gate -> Direct redirect to Dashboard
  try {
    const res = await fetch(`${BASE_URL}/console-secure-admin/login`, {
      redirect: 'manual',
      headers: {
        cookie: 'jsct_admin_token=admin_secure_mock_token; jsct_admin_role=admin',
      },
    });
    const location = res.headers.get('location') || '';
    const isRedirect = [301, 302, 307, 308].includes(res.status);
    const targetsDashboard = location.includes('/console-secure-admin/dashboard');
    assert(
      'Test 5: Authenticated Admin GET /console-secure-admin/login (Redirects to Dashboard)',
      isRedirect && targetsDashboard,
      `Status: ${res.status}, Location: ${location}`
    );
  } catch (e) {
    assert('Test 5: Authenticated Admin visiting Login Gate', false, e.message);
  }

  // Test 6: Public Homepage Header (Admin link 100% hidden for unauthenticated visitor)
  try {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();
    const hasAdminNav =
      html.includes('href="/console-secure-admin/dashboard"') ||
      html.includes('href="/admin"') ||
      html.includes('>Admin<') ||
      html.includes('>प्रशासन<');
    assert(
      'Test 6: Public Homepage GET / (Admin Tab Completely Hidden)',
      !hasAdminNav,
      `Contains Admin Navigation: ${hasAdminNav}`
    );
  } catch (e) {
    assert('Test 6: Public Homepage GET /', false, e.message);
  }

  // Test 7: Public Member Card Page (No admin leak)
  try {
    const res = await fetch(`${BASE_URL}/member-card`);
    const html = await res.text();
    const hasAdminLink = html.includes('href="/admin"') || html.includes('href="/console-secure-admin/dashboard"');
    assert(
      'Test 7: Public Member Card GET /member-card (No Admin Link Leaks)',
      !hasAdminLink,
      `Contains Admin Link: ${hasAdminLink}`
    );
  } catch (e) {
    assert('Test 7: Public Member Card', false, e.message);
  }

  // Test 8: Admin Login Page (Zero mock / seed credentials or fast-login buttons)
  try {
    const res = await fetch(`${BASE_URL}/console-secure-admin/login`);
    const html = await res.text();
    const hasMockButtons = 
      html.includes('सीडेड व्यवस्थापक क्रेडेंशियल') ||
      html.includes('Fast Login') ||
      html.includes('fillCredentials') ||
      html.includes('SECURE COMMAND GATE');
    assert(
      'Test 8: Admin Login Page /console-secure-admin/login (Zero Mock / Fast-Login Buttons)',
      !hasMockButtons && res.status === 200,
      `Has Mock Buttons/Fast-Login: ${hasMockButtons}, Status: ${res.status}`
    );
  } catch (e) {
    assert('Test 8: Admin Login Page Mock Check', false, e.message);
  }

  console.log('================================================================');
  console.log(`SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');
}

testSecurity();
