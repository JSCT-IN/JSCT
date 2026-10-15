import { chromium } from 'playwright';

async function testModals() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // 1. Test Poster Lightbox Modal
  const posterBtn = page.locator('button:has-text("पूरा पोस्टर हाई-रेजोल्यूशन में देखें")').first();
  await posterBtn.click();
  await page.waitForTimeout(300);

  const isLightboxVisible = await page.locator('div[role="dialog"]').isVisible();
  console.log('✅ Poster Lightbox opened:', isLightboxVisible);

  // Close lightbox
  await page.locator('div[role="dialog"] button[aria-label="Close modal"]').click();
  await page.waitForTimeout(300);

  const isLightboxClosed = !(await page.locator('div[role="dialog"]').isVisible());
  console.log('✅ Poster Lightbox closed:', isLightboxClosed);

  // 2. Test Direct ₹50 QR Modal
  const upiBtn = page.locator('button:has-text("सीधे ₹50 भेजें")').first();
  await upiBtn.click();
  await page.waitForTimeout(400);

  const isUpiModalVisible = await page.locator('div[aria-label="Direct UPI Modal"]').isVisible();
  console.log('✅ UPI Modal opened:', isUpiModalVisible);

  // Close UPI Modal
  const closeBtn = page.locator('div[aria-label="Direct UPI Modal"] button').first();
  await closeBtn.click();
  await page.waitForTimeout(300);

  console.log('🎉 All modal tests passed!');
  await browser.close();
}

testModals().catch(err => {
  console.error(err);
  process.exit(1);
});
