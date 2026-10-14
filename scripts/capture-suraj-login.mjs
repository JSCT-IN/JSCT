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

  // 2. Click the 'Suraj (8290224742)' chip
  await page.locator('button:has-text("Suraj (8290224742)")').click();
  await page.waitForTimeout(300);

  // 3. Click Send OTP
  await page.locator('button:has-text("ओटीपी प्राप्त करें")').click();
  await page.waitForSelector('button:has-text("ओटीपी भरें")', { timeout: 15000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/section-screenshots/suraj-step2-otp.png' });
  console.log('✅ Captured suraj-step2-otp.png');

  // 4. Click the demo OTP button to auto-fill
  await page.locator('button:has-text("ओटीपी भरें")').click();
  await page.waitForTimeout(400);


  // 5. Submit OTP verification
  await page.locator('button:has-text("सत्यापित करें")').click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'public/section-screenshots/suraj-login-success.png' });
  console.log('✅ Captured suraj-login-success.png');

  await browser.close();
  console.log('🎉 Suraj login verification test complete!');
}

run();
