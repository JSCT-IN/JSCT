// Let's test the logic functions directly
function simulateMiddleware(pathname, cookies = {}) {
  const adminToken = cookies['jsct_admin_token'];
  const adminRole = cookies['jsct_admin_role'];

  if (pathname.startsWith('/console-secure-admin')) {
    const isLoginPage = pathname === '/console-secure-admin/login';

    if (isLoginPage) {
      if (adminToken && adminRole === 'admin') {
        return { redirect: '/console-secure-admin/dashboard' };
      }
      return { pass: true };
    }

    if (!adminToken) {
      return { redirect: `/console-secure-admin/login?redirect=${pathname}` };
    }

    if (adminRole !== 'admin') {
      return { redirect: '/login?error=access_denied' };
    }

    return { pass: true };
  }

  return { pass: true };
}

console.log('--- TESTING ROUTE & MIDDLEWARE GUARDS ---');

// Test 1: Unauthenticated visit to /console-secure-admin/dashboard
const res1 = simulateMiddleware('/console-secure-admin/dashboard', {});
const pass1 = res1.redirect === '/console-secure-admin/login?redirect=/console-secure-admin/dashboard';
console.log(`Test 1 (Unauthenticated -> Login): ${pass1 ? 'PASS' : 'FAIL'} (Result: ${JSON.stringify(res1)})`);

// Test 2: Standard member token visit to /console-secure-admin/dashboard
const res2 = simulateMiddleware('/console-secure-admin/dashboard', { jsct_admin_token: 'valid_tok', jsct_admin_role: 'member' });
const pass2 = res2.redirect === '/login?error=access_denied';
console.log(`Test 2 (Standard Member -> Access Denied): ${pass2 ? 'PASS' : 'FAIL'} (Result: ${JSON.stringify(res2)})`);

// Test 3: Authenticated Admin visit to /console-secure-admin/login
const res3 = simulateMiddleware('/console-secure-admin/login', { jsct_admin_token: 'valid_tok', jsct_admin_role: 'admin' });
const pass3 = res3.redirect === '/console-secure-admin/dashboard';
console.log(`Test 3 (Authenticated Admin at Login -> Dashboard): ${pass3 ? 'PASS' : 'FAIL'} (Result: ${JSON.stringify(res3)})`);
