import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktopPage = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(600);
  await desktopPage.screenshot({ path: 'public/test-audit/hero-image-desktop.png' });
  console.log('✅ Captured hero-image-desktop.png');

  // Mobile
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: 'public/test-audit/hero-image-mobile.png' });
  console.log('✅ Captured hero-image-mobile.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
