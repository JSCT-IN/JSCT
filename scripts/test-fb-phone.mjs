import { chromium } from 'playwright';

async function testFirebasePhoneAuth() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen to browser console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  // Evaluate Firebase signInWithPhoneNumber inside the browser
  const result = await page.evaluate(async () => {
    try {
      const { auth, setupRecaptcha, sendFirebasePhoneOtp } = await import('/src/lib/firebase.ts');
      const verifier = setupRecaptcha('recaptcha-container');
      if (!verifier) return { error: 'No verifier' };
      
      console.log('Sending phone OTP via Firebase client SDK to +91 8290224742...');
      const confirmation = await sendFirebasePhoneOtp('+918290224742', verifier);
      return { success: true, verificationId: confirmation.verificationId };
    } catch (e) {
      return { error: e.code || e.message, details: e.toString() };
    }
  });

  console.log('Client Firebase Test Result:', result);
  await browser.close();
}

testFirebasePhoneAuth();
