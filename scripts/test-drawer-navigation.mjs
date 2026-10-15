import { chromium } from 'playwright';

async function testDrawerNav() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Open mobile drawer
  await page.locator('header button[aria-label="Toggle navigation menu"]').click();
  await page.waitForTimeout(300);

  // Click Niyamawali link
  const niyamawaliLink = page.locator('header a[href="/niyamawali"]').last();
  await niyamawaliLink.click();
  await page.waitForTimeout(600);

  console.log('Current URL is /niyamawali:', page.url().includes('/niyamawali'));

  // Verify mobile drawer closed automatically upon navigation
  const drawerVisible = await page.locator('header div[role="dialog"], header div.overflow-y-auto').count() > 0;
  console.log('Drawer auto-closed after navigation:', !drawerVisible);

  await browser.close();
}

testDrawerNav().catch(err => {
  console.error(err);
  process.exit(1);
});
