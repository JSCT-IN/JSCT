async function verifyLoginPage() {
  console.log('--- VERIFYING PASSWORD-BASED LOGIN PAGE ---');

  const res = await fetch('http://localhost:3000/login');
  const html = await res.text();

  const hasPasswordInput = html.includes('type="password"');
  const hasLoginButton = html.includes('लॉगिन करें') || html.includes('Log In');
  const hasSendOtp = html.includes('ओटीपी प्राप्त करें') || html.includes('Send OTP');
  const hasOtpBoxes = html.includes('otp-input') || html.includes('6-digit OTP');

  console.log('1. Contains password input field:', hasPasswordInput);
  console.log('2. Contains "Log In" button:', hasLoginButton);
  console.log('3. Has "Send OTP" button:', hasSendOtp);
  console.log('4. Has OTP boxes:', hasOtpBoxes);

  if (hasPasswordInput && hasLoginButton && !hasSendOtp && !hasOtpBoxes) {
    console.log('\n✅ SUCCESS: Login page is 100% password-based! OTP has been completely removed.');
  } else {
    console.error('\n❌ FAILED: OTP remnants detected on login page.');
    process.exit(1);
  }
}

verifyLoginPage();
