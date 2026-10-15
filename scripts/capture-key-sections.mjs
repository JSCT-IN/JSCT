import { chromium } from 'playwright';

async function captureKeySections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // 1. Hero Section screenshot
  const hero = page.locator('main section').first();
  await hero.screenshot({ path: 'public/audit-screenshots/section-hero-375.png' });
  console.log('✅ Captured section-hero-375.png');

  // 2. Metrics Section
  const metrics = page.locator('main section').nth(1);
  await metrics.screenshot({ path: 'public/audit-screenshots/section-metrics-375.png' });
  console.log('✅ Captured section-metrics-375.png');

  // 3. Flagship Schemes Section
  const schemes = page.locator('main section').nth(3);
  await schemes.screenshot({ path: 'public/audit-screenshots/section-schemes-375.png' });
  console.log('✅ Captured section-schemes-375.png');

  // 4. Simulator Section
  const simulator = page.locator('main section:has-text("75% अनुपालन सिम्युलेटर")');
  await simulator.screenshot({ path: 'public/audit-screenshots/section-simulator-375.png' });
  console.log('✅ Captured section-simulator-375.png');

  // 5. Leadership Section
  const team = page.locator('main section:has-text("प्रदेश कोर टीम")');
  await team.screenshot({ path: 'public/audit-screenshots/section-team-375.png' });
  console.log('✅ Captured section-team-375.png');

  await browser.close();
}

captureKeySections().catch(err => console.error(err));
