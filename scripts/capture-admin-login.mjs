import { chromium } from 'playwright';

async function captureAdminLogin() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Capture in Default / Hindi
  console.log('Navigating to http://localhost:3000/console-secure-admin/login (Hindi)...');
  await page.goto('http://localhost:3000/console-secure-admin/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('dpswt_language', 'hi');
    window.dispatchEvent(new Event('dpswt_lang_change'));
  });
  await page.waitForTimeout(500);

  const targetPathHindi = 'C:/Users/dell/.gemini/antigravity/brain/a896c48b-fab2-4abd-8391-47ecd4944f06/admin-login-hindi.png';
  await page.screenshot({ path: targetPathHindi });
  console.log('✅ Screenshot (Hindi) saved to:', targetPathHindi);

  // 2. Capture in English
  console.log('Switching to English...');
  await page.evaluate(() => {
    localStorage.setItem('dpswt_language', 'en');
    window.dispatchEvent(new Event('dpswt_lang_change'));
  });
  await page.waitForTimeout(500);

  const targetPathEnglish = 'C:/Users/dell/.gemini/antigravity/brain/a896c48b-fab2-4abd-8391-47ecd4944f06/admin-login-english.png';
  await page.screenshot({ path: targetPathEnglish });
  console.log('✅ Screenshot (English) saved to:', targetPathEnglish);

  await browser.close();
}

captureAdminLogin().catch(console.error);
