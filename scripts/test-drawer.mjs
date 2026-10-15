import { chromium } from 'playwright';

async function testDrawer() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(500);

  // Trigger click on mobile menu button via evaluate
  await p.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Toggle navigation menu"]');
    if (btn) btn.click();
  });
  await p.waitForTimeout(400);

  // Check drawer items
  const drawerData = await p.evaluate(() => {
    const header = document.querySelector('header');
    const drawer = header ? header.children[2] : null;
    if (!drawer) return { found: false };
    const rect = drawer.getBoundingClientRect();
    const links = Array.from(drawer.querySelectorAll('a, button')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        text: (el.textContent || '').trim().replace(/\s+/g, ' '),
        tag: el.tagName,
        href: el.getAttribute('href'),
        height: Math.round(r.height),
        width: Math.round(r.width),
        top: Math.round(r.top),
        left: Math.round(r.left)
      };
    });
    return {
      found: true,
      rect: { top: rect.top, height: rect.height, width: rect.width },
      links
    };
  });

  console.log('Drawer data:', JSON.stringify(drawerData, null, 2));
  await p.screenshot({ path: 'public/audit-screenshots/drawer-opened-375.png' });
  await b.close();
}

testDrawer();
