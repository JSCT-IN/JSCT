import { chromium } from 'playwright';

async function inspectHeaderGeometry() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'iPhone-14-390', width: 390, height: 844 },
    { name: 'iPhone-SE-375', width: 375, height: 667 },
    { name: 'Android-360', width: 360, height: 800 },
    { name: 'Narrow-320', width: 320, height: 568 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const header = document.querySelector('header');
      const topBar = header ? header.children[0] : null;
      const mainBar = header ? header.children[1] : null;

      const topBarText = topBar ? topBar.innerText.replace(/\s+/g, ' ') : '';
      const topBarRect = topBar ? topBar.getBoundingClientRect() : null;

      const elements = [];
      if (mainBar) {
        const logo = mainBar.querySelector('a[href="/"]');
        if (logo) {
          const r = logo.getBoundingClientRect();
          elements.push({ name: 'Logo', left: r.left, right: r.right, width: r.width, visible: r.right <= docW });
        }

        const buttons = mainBar.querySelectorAll('a, button');
        buttons.forEach(b => {
          if (b.getAttribute('href') === '/') return;
          const r = b.getBoundingClientRect();
          const text = (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
          elements.push({
            name: text.slice(0, 25),
            tag: b.tagName,
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            visibleInViewport: r.right <= docW,
            offScreenByPx: Math.max(0, Math.round(r.right - docW))
          });
        });
      }

      return {
        viewportWidth: docW,
        topBar: { text: topBarText, rect: topBarRect },
        elements
      };
    });

    console.log(`\n================ Viewport: ${vp.name} (${vp.width}px) ================`);
    console.log(`Top announcement: "${data.topBar.text}" (height: ${Math.round(data.topBar.rect?.height)}px)`);
    console.log('Header elements geometry:');
    data.elements.forEach(el => {
      const status = el.visibleInViewport ? '✅ ON-SCREEN' : `❌ OFF-SCREEN by ${el.offScreenByPx}px!`;
      console.log(`  - [${el.name}] width: ${el.width}px, left: ${el.left}px, right: ${el.right}px -> ${status}`);
    });

    await page.screenshot({ path: `public/audit-screenshots/inspect-${vp.name}.png` });
    await page.close();
  }

  await browser.close();
}

inspectHeaderGeometry();
