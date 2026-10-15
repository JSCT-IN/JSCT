import { chromium } from 'playwright';

async function captureDashboard() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });

  const adminUser = JSON.stringify({
    id: 'admin-seed-id',
    email: 'Ambrish@jsct.com',
    fullName: 'Ambrish Kumar',
    role: 'admin',
  });

  await context.addCookies([
    {
      name: 'jsct_admin_token',
      value: 'admin_secure_mock_token',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'jsct_admin_role',
      value: 'admin',
      domain: 'localhost',
      path: '/',
    },
    {
      name: 'jsct_admin_user',
      value: encodeURIComponent(adminUser),
      domain: 'localhost',
      path: '/',
    },
  ]);

  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000/console-secure-admin/dashboard ...');
  await page.goto('http://localhost:3000/console-secure-admin/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll to Master Member Directory
  const directoryHeader = page.locator('text=मास्टर सदस्य डायरेक्टरी व सत्यापन कंसोल');
  await directoryHeader.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const targetPath = 'C:/Users/dell/.gemini/antigravity/brain/a896c48b-fab2-4abd-8391-47ecd4944f06/admin-dashboard-table.png';
  await page.screenshot({ path: targetPath, fullPage: false });
  console.log('✅ Screenshot saved to:', targetPath);

  await browser.close();
}

captureDashboard().catch(console.error);
