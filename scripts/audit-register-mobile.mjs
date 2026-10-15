import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Capture Step 1 initial
  await page.screenshot({ path: 'public/test-audit/register-step1-mobile.png', fullPage: true });
  console.log('✅ Captured register-step1-mobile.png');

  // Fill Step 1
  await page.locator('input[name="fullName"]').fill('राम प्रकाश वर्मा');
  await page.locator('input[name="fatherOrHusbandName"]').fill('हरि शरण वर्मा');
  await page.locator('input[name="dob"]').fill('1985-05-15');
  await page.locator('input[name="department"]').fill('बेसिक शिक्षा परिषद');
  await page.locator('input[name="designation"]').fill('सहायक अध्यापक');
  await page.locator('input[name="mobile"]').fill('9876543210');
  
  // Click Next Step
  await page.locator('button:has-text("अगला चरण")').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/test-audit/register-step2-mobile.png', fullPage: true });
  console.log('✅ Captured register-step2-mobile.png');

  // Fill Step 2
  await page.locator('input[name="district"]').fill('गोरखपुर');
  await page.locator('input[name="block"]').fill('सरदारनगर');
  await page.locator('textarea[name="permanentAddress"]').fill('ग्राम व पोस्ट हरपुर, गोरखपुर');
  await page.locator('input[name="pinCode"]').fill('273152');
  await page.locator('input[name="nomineeName"]').fill('सुनीता देवी');
  await page.locator('input[name="nomineeRelation"]').fill('पत्नी (Wife)');
  await page.locator('input[name="nomineeAge"]').fill('38');
  await page.locator('input[name="nomineeMobile"]').fill('9876543211');

  // Add a family member to test mobile card layout
  await page.locator('button:has-text("सदस्य जोड़ें")').click();
  await page.waitForTimeout(300);
  await page.locator('input[name="familyMembers.0.name"]').fill('रोहन वर्मा');
  await page.locator('input[name="familyMembers.0.relation"]').fill('पुत्र');
  await page.locator('input[name="familyMembers.0.age"]').fill('12');

  // Take screenshot of step 2 with family member card
  await page.screenshot({ path: 'public/test-audit/register-step2-family-mobile.png', fullPage: true });
  console.log('✅ Captured register-step2-family-mobile.png');

  // Click Next Step
  await page.locator('button:has-text("अगला चरण")').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'public/test-audit/register-step3-mobile.png', fullPage: true });
  console.log('✅ Captured register-step3-mobile.png');

  await browser.close();
}

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
