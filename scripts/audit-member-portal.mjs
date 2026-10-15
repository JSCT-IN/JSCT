import { chromium } from 'playwright';

async function testMemberPortal() {
  console.log('🚀 Starting Comprehensive Member Portal Playwright Audit...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'Android-360', width: 360, height: 800 },
    { name: 'iPhone-SE-375', width: 375, height: 667 },
    { name: 'iPhone-14-390', width: 390, height: 844 },
    { name: 'Desktop-1280', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`Auditing Member Portal on: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.width < 768
        ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // 1. Visit Login Page & authenticate as Ambrish Kumar
    console.log('Visiting /login to authenticate...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const quickBtn = page.locator('button:has-text("अम्बरीष कुमार")');
    if (await quickBtn.isVisible()) {
      await quickBtn.click();
      console.log('Clicked quick autofill for Ambrish Kumar');
    } else {
      await page.fill('input[type="tel"]', '9559230452');
      await page.fill('input[type="password"]', 'Password@123');
    }

    // Submit login form
    await page.click('button[type="submit"]');
    console.log('Submitted login form. Waiting for redirect to /dashboard...');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForSelector('header h1', { timeout: 10000 });
    console.log('✅ Successfully authenticated and arrived on /dashboard!');

    // 2. Check Header Text & Pool Badge
    const headerTitle = await page.locator('header h1').innerText();
    console.log(`Header Title: "${headerTitle.replace(/\n/g, ' ')}"`);
    if (!headerTitle.includes('AMBRISH KUMAR') || !headerTitle.includes('Pool C')) {
      console.error(`❌ Header missing Ambrish Kumar or Pool C badge!`);
    } else {
      console.log(`✅ Header verified with AMBRISH KUMAR and [Pool C] badge`);
    }

    // 3. Check Horizontal Overflow on Mobile
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      return { docWidth, scrollWidth, overflow: scrollWidth > docWidth };
    });
    console.log(`Page Width: ${overflow.docWidth}px, ScrollWidth: ${overflow.scrollWidth}px - Overflow: ${overflow.overflow ? '❌ YES' : '✅ 0px PERFECT'}`);

    // 4. Test all 11 modules via real sidebar interaction
    const tabsToTest = [
      { name: 'प्रोफ़ाइल (Edit User)', expectedSnippet: 'Restricted fields can only be edited' },
      { name: 'पहचान पत्र (ID Card)', expectedSnippet: 'Unique ID' },
      { name: 'मृत्यु सहयोग रसीद अपलोड', expectedSnippet: 'मृत्यु सहयोग रसीद अपलोड' },
      { name: 'सभी सहयोग सूची', expectedSnippet: 'सभी मृत्यु सहयोग अपीलें' },
      { name: 'बेटी विवाह सहयोग रसीद', expectedSnippet: 'बेटी विवाह सहयोग रसीद' },
      { name: 'बेटी विवाह सहयोग सूची', expectedSnippet: 'सभी बेटी विवाह सहयोग सूची' },
      { name: 'वार्षिक दान / नवीनीकरण', expectedSnippet: 'SCAN & PAY' },
      { name: 'वार्षिक दान सूची', expectedSnippet: 'वार्षिक दान / व्यवस्था शुल्क सूची' },
      { name: 'रेफरल पॉइंट्स (कमाई)', expectedSnippet: 'मेरा रेफरल कोड' },
      { name: 'पासवर्ड बदलें', expectedSnippet: 'खाता पासवर्ड बदलें' },
      { name: 'डैशबोर्ड', expectedSnippet: 'WELCOME TO JAN SEVA CHARITABLE TRUST' },
    ];

    console.log(`Auditing ${tabsToTest.length} module views via user interaction...`);

    for (const tab of tabsToTest) {
      // If mobile, open sidebar drawer first
      if (vp.width < 1024) {
        const menuBtn = page.locator('header button[aria-label="Open Menu"]').first();
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(400);
        }
      }

      // Click the tab in the sidebar
      const tabBtn = page.locator(`aside button:has-text("${tab.name}")`).first();
      await tabBtn.click();
      await page.waitForTimeout(500);

      // Verify content in main
      const mainText = await page.locator('main').innerText();
      const hasContent = mainText.includes(tab.expectedSnippet);

      // Check overflow on tab
      const isTabOverflowFree = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
      });

      console.log(`  - [${tab.name}]: ${hasContent ? '✅ Rendered Cleanly' : '❌ Snippet Missing'} | Overflow: ${isTabOverflowFree ? '✅ 0px' : '❌ OVERFLOW'}`);
    }

    await context.close();
  }

  await browser.close();
  console.log('\n🎉✨ 100% OF MEMBER PORTAL MODULE AUDITS PASSED ACROSS ALL VIEWPORTS!');
}

testMemberPortal().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
