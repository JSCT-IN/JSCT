import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile Viewport (iPhone 14)
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await mobile.newPage();

  // 1. Visit /login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/section-screenshots/login-step1-mobile.png' });
  console.log('✅ Captured login-step1-mobile.png');

  // 2. Type Aadhaar number and click Send OTP
  await page.locator('input[type="text"]').first().fill('8912');
  await page.locator('button:has-text("ओटीपी प्राप्त करें")').click();
  await page.waitForSelector('input[inputmode="numeric"]', { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/section-screenshots/login-step2-mobile.png' });
  console.log('✅ Captured login-step2-mobile.png');

  // 3. Desktop Viewport
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desktop.newPage();
  await dPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(500);
  await dPage.screenshot({ path: 'public/section-screenshots/login-desktop.png' });
  console.log('✅ Captured login-desktop.png');

  await browser.close();
  console.log('🎉 Login screenshots complete!');
}

run();
