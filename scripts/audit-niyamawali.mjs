import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop
  const desktopPage = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });
  await desktopPage.goto('http://localhost:3000/niyamawali', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({ path: 'public/test-audit/niyamawali-desktop.png', fullPage: true });
  console.log('✅ Captured niyamawali-desktop.png');

  // Mobile
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  await mobilePage.goto('http://localhost:3000/niyamawali', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: 'public/test-audit/niyamawali-mobile.png', fullPage: true });
  console.log('✅ Captured niyamawali-mobile.png');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
