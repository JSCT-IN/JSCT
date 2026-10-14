import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureSections() {
  console.log('📸 Starting Section-by-Section Playwright Capture...');
  
  const browser = await chromium.launch({ headless: true });
  const outDir = path.resolve('public/section-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Mobile Context (390x844 - iPhone 14)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });
  const page = await mobileContext.newPage();

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);

  // 1. Hero Section
  const heroSection = page.locator('section').first();
  await heroSection.screenshot({ path: path.join(outDir, '01-hero-mobile.png') });
  console.log('✅ Captured 01-hero-mobile.png');

  // 2. Metrics Section
  const metricsSection = page.locator('section').nth(1);
  await metricsSection.screenshot({ path: path.join(outDir, '02-metrics-mobile.png') });
  console.log('✅ Captured 02-metrics-mobile.png');

  // 3. Flagship Scheme Section
  const flagshipSection = page.locator('section').nth(3);
  await flagshipSection.screenshot({ path: path.join(outDir, '03-flagship-scheme-mobile.png') });
  console.log('✅ Captured 03-flagship-scheme-mobile.png');

  // 4. Current Sahyog Appeals Section
  const appealsSection = page.locator('section').nth(4);
  await appealsSection.screenshot({ path: path.join(outDir, '04-appeals-mobile.png') });
  console.log('✅ Captured 04-appeals-mobile.png');

  // 5. Trustees Section
  const trusteesSection = page.locator('section').nth(5);
  await trusteesSection.screenshot({ path: path.join(outDir, '05-trustees-mobile.png') });
  console.log('✅ Captured 05-trustees-mobile.png');

  // 6. About & Pillars & Safety Cycle
  const safetySection = page.locator('section').nth(8);
  await safetySection.screenshot({ path: path.join(outDir, '06-safety-cycle-mobile.png') });
  console.log('✅ Captured 06-safety-cycle-mobile.png');

  // 7. Compliance Simulator
  const simSection = page.locator('section').nth(9);
  await simSection.screenshot({ path: path.join(outDir, '07-simulator-mobile.png') });
  console.log('✅ Captured 07-simulator-mobile.png');

  // 8. Test UPI Modal
  const upiButton = page.locator('button:has-text("सीधे ₹50 भेजें (UPI & QR)")').first();
  if (await upiButton.count() > 0) {
    await upiButton.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '08-upi-modal-mobile.png') });
    console.log('✅ Captured 08-upi-modal-mobile.png');
    // Close modal
    const closeBtn = page.locator('button[aria-label="Close"]').first();
    if (await closeBtn.count() > 0) await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // 9. Test Slip Upload Modal
  const slipButton = page.locator('button:has-text("रसीद अपलोड करें")').first();
  if (await slipButton.count() > 0) {
    await slipButton.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '09-slip-modal-mobile.png') });
    console.log('✅ Captured 09-slip-modal-mobile.png');
    // Close modal
    const closeSlipBtn = page.locator('button[aria-label="Close"]').first();
    if (await closeSlipBtn.count() > 0) await closeSlipBtn.click();
    await page.waitForTimeout(400);
  }

  // 10. Poster Lightbox Modal
  const posterBtn = page.locator('button:has-text("योजना पोस्टर")').first();
  if (await posterBtn.count() > 0) {
    await posterBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, '10-poster-modal-mobile.png') });
    console.log('✅ Captured 10-poster-modal-mobile.png');
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // Desktop Context (1440x900)
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);

  const desktopHero = desktopPage.locator('section').first();
  await desktopHero.screenshot({ path: path.join(outDir, '01-hero-desktop.png') });
  console.log('✅ Captured 01-hero-desktop.png');

  await browser.close();
  console.log('🎉 Section capture complete!');
}

captureSections().catch(err => {
  console.error('Error capturing sections:', err);
  process.exit(1);
});
