import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile Viewport (iPhone 14)
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  // 1. Visit /login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 2. Type registered mobile number 8290224742
  await page.locator('input[type="tel"]').fill('8290224742');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'public/section-screenshots/suraj-step1-real.png' });
  console.log('✅ Captured suraj-step1-real.png');

  // 3. Click Send OTP
  await page.locator('button:has-text("ओटीपी प्राप्त करें")').click();
  await page.waitForSelector('button[title="क्लिक करके कोड स्वतः भरें"]', { timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/section-screenshots/suraj-step2-real.png' });
  console.log('✅ Captured suraj-step2-real.png');

  // 4. Click code button to fill OTP
  await page.locator('button[title="क्लिक करके कोड स्वतः भरें"]').click();
  await page.waitForTimeout(400);

  // 5. Submit OTP verification
  await page.locator('button:has-text("सत्यापित करें")').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'public/section-screenshots/suraj-login-success-real.png' });
  console.log('✅ Captured suraj-login-success-real.png');

  // 6. Test Desktop Viewport
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desktop.newPage();
  await dPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(500);
  await dPage.screenshot({ path: 'public/section-screenshots/login-desktop-real.png' });
  console.log('✅ Captured login-desktop-real.png');

  await browser.close();
  console.log('🎉 All real UI tests and screenshots completed successfully!');
}

run();
