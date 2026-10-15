import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/test-audit');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function audit() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    homepage: { desktop: {}, mobile: {}, errors: [] },
    login: { desktop: {}, mobile: {}, errors: [] }
  };

  console.log('🚀 Starting Playwright UI Audit...');

  // ----------------------------------------------------
  // 1. HOMEPAGE AUDIT
  // ----------------------------------------------------
  console.log('\n--- 1. Testing Homepage ---');
  
  // Desktop
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desktopContext.newPage();
  
  dPage.on('console', msg => {
    if (msg.type() === 'error') {
      results.homepage.errors.push(`Console error: ${msg.text()}`);
    }
  });

  await dPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await dPage.waitForTimeout(1000);

  // Check horizontal overflow
  const dBodyWidth = await dPage.evaluate(() => document.body.scrollWidth);
  const dWindowWidth = await dPage.evaluate(() => window.innerWidth);
  results.homepage.desktop.hasHorizontalScroll = dBodyWidth > dWindowWidth;
  console.log(`Desktop Body Width: ${dBodyWidth}, Window Width: ${dWindowWidth} (Scroll: ${results.homepage.desktop.hasHorizontalScroll})`);

  await dPage.screenshot({ path: path.join(outDir, 'homepage-desktop.png') });
  console.log('📸 Captured homepage-desktop.png');

  // Test language toggle
  const langToggleBtn = dPage.locator('button:has-text("हिन्दी"), button:has-text("English")').first();
  if (await langToggleBtn.isVisible()) {
    console.log('Testing Language Toggle on Desktop...');
    await langToggleBtn.click();
    await dPage.waitForTimeout(500);
    await dPage.screenshot({ path: path.join(outDir, 'homepage-desktop-lang-toggled.png') });
    // Toggle back
    await langToggleBtn.click();
    await dPage.waitForTimeout(300);
  }

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  const mPage = await mobileContext.newPage();
  
  mPage.on('console', msg => {
    if (msg.type() === 'error') {
      results.homepage.errors.push(`Mobile Console error: ${msg.text()}`);
    }
  });

  await mPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(1000);

  const mBodyWidth = await mPage.evaluate(() => document.body.scrollWidth);
  const mWindowWidth = await mPage.evaluate(() => window.innerWidth);
  results.homepage.mobile.hasHorizontalScroll = mBodyWidth > mWindowWidth;
  console.log(`Mobile Body Width: ${mBodyWidth}, Window Width: ${mWindowWidth} (Scroll: ${results.homepage.mobile.hasHorizontalScroll})`);

  await mPage.screenshot({ path: path.join(outDir, 'homepage-mobile.png') });
  console.log('📸 Captured homepage-mobile.png');

  // ----------------------------------------------------
  // 2. LOGIN PAGE AUDIT
  // ----------------------------------------------------
  console.log('\n--- 2. Testing Login Page ---');

  // Desktop Login
  const dLoginPage = await desktopContext.newPage();
  dLoginPage.on('console', msg => {
    if (msg.type() === 'error') {
      results.login.errors.push(`Desktop Login error: ${msg.text()}`);
    }
  });

  await dLoginPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await dLoginPage.waitForTimeout(800);
  await dLoginPage.screenshot({ path: path.join(outDir, 'login-desktop-initial.png') });
  console.log('📸 Captured login-desktop-initial.png');

  // Test Switching to Aadhaar / ID tab
  const aadhaarTab = dLoginPage.locator('button:has-text("आधार / सदस्य ID"), button:has-text("Aadhaar")');
  await aadhaarTab.click();
  await dLoginPage.waitForTimeout(300);
  await dLoginPage.screenshot({ path: path.join(outDir, 'login-desktop-aadhaar-tab.png') });
  console.log('📸 Captured login-desktop-aadhaar-tab.png');

  // Test Switch back to Mobile
  const mobileTab = dLoginPage.locator('button:has-text("मोबाइल नंबर"), button:has-text("Mobile")');
  await mobileTab.click();
  await dLoginPage.waitForTimeout(300);

  // Test Forgot Password notice
  const forgotBtn = dLoginPage.locator('button:has-text("पासवर्ड भूल गए?"), button:has-text("Forgot password?")');
  if (await forgotBtn.isVisible()) {
    await forgotBtn.click();
    await dLoginPage.waitForTimeout(300);
    await dLoginPage.screenshot({ path: path.join(outDir, 'login-desktop-forgot-notice.png') });
    console.log('📸 Captured login-desktop-forgot-notice.png');
  }

  // Test form validation error state
  const submitBtn = dLoginPage.locator('button[type="submit"]');
  await submitBtn.click();
  await dLoginPage.waitForTimeout(500);
  await dLoginPage.screenshot({ path: path.join(outDir, 'login-desktop-validation.png') });
  console.log('📸 Captured login-desktop-validation.png');

  // Mobile Login
  const mLoginPage = await mobileContext.newPage();
  mLoginPage.on('console', msg => {
    if (msg.type() === 'error') {
      results.login.errors.push(`Mobile Login error: ${msg.text()}`);
    }
  });

  await mLoginPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await mLoginPage.waitForTimeout(800);

  const mLoginBodyWidth = await mLoginPage.evaluate(() => document.body.scrollWidth);
  const mLoginWindowWidth = await mLoginPage.evaluate(() => window.innerWidth);
  results.login.mobile.hasHorizontalScroll = mLoginBodyWidth > mLoginWindowWidth;
  console.log(`Mobile Login Body Width: ${mLoginBodyWidth}, Window Width: ${mLoginWindowWidth} (Scroll: ${results.login.mobile.hasHorizontalScroll})`);

  await mLoginPage.screenshot({ path: path.join(outDir, 'login-mobile.png') });
  console.log('📸 Captured login-mobile.png');

  await browser.close();

  console.log('\n📋 Audit Summary:');
  console.log(JSON.stringify(results, null, 2));
}

audit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
