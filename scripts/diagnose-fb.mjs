import { chromium } from 'playwright';

async function diagnoseFirebase() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    logs.push(msg.text());
  });

  page.on('response', async res => {
    if (res.url().includes('identitytoolkit') || res.url().includes('firebase') || res.url().includes('recaptcha')) {
      console.log(`[NETWORK ${res.status()}]`, res.url());
      try {
        const text = await res.text();
        console.log(`[NETWORK BODY]`, text.slice(0, 300));
      } catch {}
    }
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  
  // Fill 8290224742
  await page.locator('input[type="text"]').first().fill('8290224742');
  await page.waitForTimeout(500);

  // Click Send OTP
  console.log('Clicking Send OTP button...');
  await page.locator('button:has-text("ओटीपी प्राप्त करें")').click();

  await page.waitForTimeout(6000);
  await browser.close();
  console.log('Diagnostic finished.');
}

diagnoseFirebase();
