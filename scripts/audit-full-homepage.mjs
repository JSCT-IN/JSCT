import { chromium } from 'playwright';
import fs from 'fs';

async function auditFullHomePage() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'Android-360', width: 360, height: 800 },
    { name: 'iPhone-SE-375', width: 375, height: 667 },
    { name: 'iPhone-14-390', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`Auditing Full Home Page on: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // 1. Overall Page Overflow
    const pageMetrics = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const docScrollW = document.documentElement.scrollWidth;
      const bodyScrollW = document.body.scrollWidth;

      // Find any overflowing elements across the entire page
      const overflowingElements = [];
      const allEls = document.querySelectorAll('body *');
      for (const el of allEls) {
        // Skip script, style, svg paths
        if (['SCRIPT', 'STYLE', 'path', 'defs', 'linearGradient', 'stop'].includes(el.tagName)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.right > docW + 1.5) {
          overflowingElements.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className || '').toString().slice(0, 50),
            text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30),
            rect: { right: Math.round(rect.right), width: Math.round(rect.width) },
            overflowPx: Math.round(rect.right - docW)
          });
        }
      }

      return {
        docW,
        docScrollW,
        bodyScrollW,
        hasOverflow: docScrollW > docW || bodyScrollW > docW,
        overflowCount: overflowingElements.length,
        overflowingElements: overflowingElements.slice(0, 10)
      };
    });

    console.log(`Page width: ${pageMetrics.docW}px, ScrollWidth: ${pageMetrics.docScrollW}px`);
    console.log(`Horizontal overflow: ${pageMetrics.hasOverflow ? `⚠️ YES (${pageMetrics.overflowCount} elements)` : '✅ PERFECT (0px)'}`);
    if (pageMetrics.overflowCount > 0) {
      console.log('Sample overflowing elements:', JSON.stringify(pageMetrics.overflowingElements, null, 2));
    }

    // 2. Audit Each Section / Module
    const sectionsData = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('main section, main > div > div:first-child'));
      const docW = document.documentElement.clientWidth;

      return sections.map((sec, idx) => {
        const rect = sec.getBoundingClientRect();
        const heading = sec.querySelector('h1, h2, h3');
        const headingText = heading ? heading.textContent.trim().replace(/\s+/g, ' ').slice(0, 35) : 'Section ' + (idx + 1);
        
        // Font sizes inside section
        const headings = Array.from(sec.querySelectorAll('h1, h2, h3, h4')).map(h => {
          const style = window.getComputedStyle(h);
          return {
            tag: h.tagName,
            text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 25),
            fontSize: style.fontSize,
            lineHeight: style.lineHeight
          };
        });

        // Smallest body fonts
        const pTags = Array.from(sec.querySelectorAll('p, span, div')).filter(el => el.children.length === 0 && el.textContent.trim().length > 0);
        let minFontSize = 999;
        pTags.forEach(el => {
          const size = parseFloat(window.getComputedStyle(el).fontSize);
          if (size > 0 && size < minFontSize) minFontSize = size;
        });

        // Check if section itself overflows
        const overflows = rect.right > docW + 1;

        // Interactive buttons touch targets
        const buttons = Array.from(sec.querySelectorAll('a, button')).map(b => {
          const bRect = b.getBoundingClientRect();
          return {
            text: (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 20),
            height: Math.round(bRect.height),
            touchCompliant: bRect.height >= 38
          };
        });

        return {
          index: idx + 1,
          heading: headingText,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          overflows,
          headings,
          minFontSize: minFontSize === 999 ? 'N/A' : minFontSize + 'px',
          buttonCount: buttons.length,
          buttonsBelow40px: buttons.filter(b => !b.touchCompliant)
        };
      });
    });

    console.log(`\nAudited ${sectionsData.length} sections on ${vp.name}:`);
    sectionsData.forEach(s => {
      const status = s.overflows ? '⚠️ OVERFLOWS' : '✅ OK';
      const btnsIssue = s.buttonsBelow40px.length > 0 ? ` [${s.buttonsBelow40px.length} buttons < 38px]` : '';
      console.log(`  ${s.index}. [${s.heading}] w:${s.width}px, h:${s.height}px, minFont:${s.minFontSize} ${status}${btnsIssue}`);
      if (s.buttonsBelow40px.length > 0) {
        console.log(`     Small buttons:`, s.buttonsBelow40px.map(b => `"${b.text}" (${b.height}px)`).join(', '));
      }
    });

    // 3. Audit Footer and Bottom Nav
    const shellData = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const footer = document.querySelector('footer');
      const bottomNav = document.querySelector('nav[aria-label="Mobile Navigation"]');

      const footerRect = footer ? footer.getBoundingClientRect() : null;
      const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null;

      return {
        footer: footerRect ? {
          width: Math.round(footerRect.width),
          height: Math.round(footerRect.height),
          overflows: footerRect.right > docW + 1
        } : null,
        bottomNav: bottomNavRect ? {
          visible: bottomNavRect.height > 0,
          width: Math.round(bottomNavRect.width),
          height: Math.round(bottomNavRect.height)
        } : null
      };
    });

    console.log(`\nFooter: ${shellData.footer?.overflows ? '⚠️ OVERFLOWS' : '✅ OK'} (w: ${shellData.footer?.width}px, h: ${shellData.footer?.height}px)`);
    console.log(`BottomNav: Visible: ${shellData.bottomNav?.visible}, Height: ${shellData.bottomNav?.height}px`);

    await page.screenshot({ path: `public/audit-screenshots/full-home-${vp.name}.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
}

auditFullHomePage().catch(err => {
  console.error(err);
  process.exit(1);
});
