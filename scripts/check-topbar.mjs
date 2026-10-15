import { chromium } from 'playwright';

async function checkTopBar() {
  const browser = await chromium.launch({ headless: true });
  for (const w of [320, 360, 375, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 600 }, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => {
      const topBar = document.querySelector('header > div:first-child');
      const inner = topBar.querySelector('div');
      const left = inner.children[0];
      const right = inner.children[1];
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      return {
        topBarHeight: topBar.getBoundingClientRect().height,
        leftRect: { left: Math.round(leftRect.left), right: Math.round(leftRect.right), width: Math.round(leftRect.width) },
        rightRect: { left: Math.round(rightRect.left), right: Math.round(rightRect.right), width: Math.round(rightRect.width) },
        overlapping: leftRect.right > rightRect.left
      };
    });

    console.log(`Width ${w}px -> Top bar height: ${info.topBarHeight}px, Left right-edge: ${info.leftRect.right}px, Right left-edge: ${info.rightRect.left}px, Overlapping: ${info.overlapping}`);
    await page.close();
  }
  await browser.close();
}

checkTopBar();
