import { chromium } from 'playwright';

async function testLangToggle() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);

  // Initial text
  const initialText = await page.locator('header').innerText();
  console.log('Initial text contains "सीधा P2P":', initialText.includes('सीधा P2P'));

  // Click Language button
  const langBtn = page.locator('header button[title*="Language"]');
  await langBtn.click();
  await page.waitForTimeout(400);

  const englishText = await page.locator('header').innerText();
  console.log('After toggle to EN contains "Direct P2P Aid":', englishText.includes('Direct P2P Aid'));

  // Click Language button again to toggle back
  await langBtn.click();
  await page.waitForTimeout(400);

  const hindiText = await page.locator('header').innerText();
  console.log('After toggle back to HI contains "सीधा P2P":', hindiText.includes('सीधा P2P'));

  await browser.close();
}

testLangToggle().catch(err => {
  console.error(err);
  process.exit(1);
});
