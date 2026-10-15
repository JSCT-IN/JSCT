import { chromium } from 'playwright';

async function testBottomNav() {
  const browser = await chromium.launch({ headless: true });
  for (const w of [320, 360, 375, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 700 }, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    const navInfo = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Mobile Navigation"]');
      if (!nav) return null;
      const rect = nav.getBoundingClientRect();
      const items = Array.from(nav.querySelectorAll('a')).map(a => {
        const r = a.getBoundingClientRect();
        return {
          text: (a.textContent || '').trim().replace(/\s+/g, ' '),
          width: Math.round(r.width),
          height: Math.round(r.height),
          left: Math.round(r.left),
          right: Math.round(r.right)
        };
      });
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        items
      };
    });

    console.log(`\nWidth: ${w}px -> BottomNav height: ${navInfo?.height}px`);
    navInfo?.items.forEach((item, idx) => {
      console.log(`  Tab ${idx + 1}: "${item.text}" width:${item.width}px, [${item.left} - ${item.right}]`);
    });

    await page.close();
  }
  await browser.close();
}

testBottomNav();
