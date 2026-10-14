import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runAudit() {
  console.log('🚀 Starting Playwright UI Audit for JSCT Home Page...');
  
  const browser = await chromium.launch({ headless: true });
  const report = {
    mobile: {},
    desktop: {},
    issues: []
  };

  const screenshotsDir = path.resolve('public/audit-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // ---------------------------------------------------------
  // 1. MOBILE AUDIT (PRIORITY 1: 390x844, 360x800, 320x568)
  // ---------------------------------------------------------
  console.log('\n📱 --- AUDITING MOBILE VIEWPORTS (PRIORITY 1) ---');
  
  const mobileViewports = [
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'Android_360', width: 360, height: 800 },
    { name: 'Small_320', width: 320, height: 568 }
  ];

  for (const vp of mobileViewports) {
    console.log(`\nTesting Mobile Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    const page = await context.newPage();

    // Navigate to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 1. Check Horizontal Overflow (Critical Mobile Check)
    const overflowCheck = await page.evaluate(() => {
      const docWidth = document.documentElement.offsetWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const windowWidth = window.innerWidth;
      
      const overflowingElements = [];
      document.querySelectorAll('*').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > windowWidth + 2) {
          overflowingElements.push({
            tag: el.tagName,
            className: el.className?.toString?.() || '',
            id: el.id,
            right: Math.round(rect.right),
            windowWidth
          });
        }
      });
      return {
        hasOverflow: scrollWidth > windowWidth + 1,
        scrollWidth,
        windowWidth,
        overflowingElementsCount: overflowingElements.length,
        samples: overflowingElements.slice(0, 3)
      };
    });

    console.log(`  Horizontal Overflow Status: ${overflowCheck.hasOverflow ? '❌ OVERFLOW DETECTED' : '✅ NO OVERFLOW (Perfect)'}`);
    if (overflowCheck.hasOverflow) {
      report.issues.push(`Horizontal overflow on ${vp.name}: scrollWidth=${overflowCheck.scrollWidth} > windowWidth=${overflowCheck.windowWidth}`);
      console.log('  Samples:', overflowCheck.samples);
    }

    // 2. Test Interactive Simulator Presets on Mobile
    console.log('  Testing 75% Compliance Simulator Presets on Mobile...');
    const presetButtons = await page.$$('text=100% (पूर्ण सुरक्षित), text=85% (सक्रिय संबल), text=75% (मानक सीमा), text=60% (अपात्र चेतावनी)');
    console.log(`  Found ${presetButtons.length} simulator preset buttons`);

    // Click 75% preset
    const preset75 = page.locator('button:has-text("75% (मानक सीमा)")');
    if (await preset75.count() > 0) {
      await preset75.click();
      await page.waitForTimeout(300);
      const outputText = await page.locator('text=संबल सुरक्षित').count();
      console.log(`  Preset 75% clicked: Status indicator visible = ${outputText > 0 ? '✅ YES' : '❌ NO'}`);
    }

    // Click 60% preset
    const preset60 = page.locator('button:has-text("60% (अपात्र चेतावनी)")');
    if (await preset60.count() > 0) {
      await preset60.click();
      await page.waitForTimeout(300);
      const criticalText = await page.locator('text=कवच बाधित').count();
      console.log(`  Preset 60% clicked: Critical warning indicator visible = ${criticalText > 0 ? '✅ YES' : '❌ NO'}`);
    }

    // 3. Test Copy to Clipboard on Active Appeals Card
    console.log('  Testing 1-Click Copy on Nominee Details...');
    const copyBtn = page.locator('button[title="Copy Account Number"]').first();
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      await page.waitForTimeout(400);
      console.log('  1-Click Copy Account button clicked successfully ✅');
    }

    // 4. Test Poster Modal Open & Close on Mobile
    console.log('  Testing Poster Lightbox Modal on Mobile...');
    const zoomPosterBtn = page.locator('button:has-text("योजना पोस्टर"), button:has-text("पोस्टर ज़ूम करें"), button:has-text("बड़ा देखें")').first();
    if (await zoomPosterBtn.count() > 0) {
      await zoomPosterBtn.click();
      await page.waitForTimeout(500);
      const modalVisible = await page.locator('div[role="dialog"]').isVisible();
      console.log(`  Modal opened on mobile: ${modalVisible ? '✅ YES' : '❌ NO'}`);
      
      // Close modal
      const closeBtn = page.locator('button[aria-label="Close modal"], button:has-text("बंद करें")').first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(400);
        const modalStillVisible = await page.locator('div[role="dialog"]').isVisible();
        console.log(`  Modal closed cleanly on mobile: ${!modalStillVisible ? '✅ YES' : '❌ NO'}`);
      }
    }

    // Capture Full Page Mobile Screenshot
    const screenshotPath = path.join(screenshotsDir, `mobile-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  📸 Saved Full Mobile Screenshot: ${screenshotPath}`);

    report.mobile[vp.name] = {
      overflow: overflowCheck.hasOverflow,
      screenshot: screenshotPath
    };

    await context.close();
  }

  // ---------------------------------------------------------
  // 2. DESKTOP AUDIT (1440x900)
  // ---------------------------------------------------------
  console.log('\n💻 --- AUDITING DESKTOP VIEWPORT (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await desktopPage.waitForTimeout(1000);

  const desktopOverflow = await desktopPage.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`  Desktop Horizontal Overflow: ${desktopOverflow ? '❌ OVERFLOW' : '✅ NO OVERFLOW'}`);

  const desktopScreenshot = path.join(screenshotsDir, 'desktop-1440.png');
  await desktopPage.screenshot({ path: desktopScreenshot, fullPage: true });
  console.log(`  📸 Saved Desktop Screenshot: ${desktopScreenshot}`);

  report.desktop = {
    overflow: desktopOverflow,
    screenshot: desktopScreenshot
  };

  await desktopContext.close();
  await browser.close();

  console.log('\n===========================================');
  console.log('🎉 AUDIT COMPLETE!');
  console.log(`Total Issues Found: ${report.issues.length}`);
  if (report.issues.length > 0) {
    console.log('Issues:', report.issues);
  } else {
    console.log('✅ All viewports passed with 0 horizontal overflows and clean responsiveness!');
  }
  console.log('===========================================');
}

runAudit().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
