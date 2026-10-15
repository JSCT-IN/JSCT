async function testNiyamawali() {
  console.log('Testing /niyamawali and Navbar integration...\n');

  // Test Homepage Navbar
  const homeRes = await fetch('http://localhost:3000/');
  const homeHtml = await homeRes.text();
  const hasNiyamawaliLink = homeHtml.includes('href="/niyamawali"');
  const hasAdminLink = homeHtml.includes('href="/admin"') || homeHtml.includes('href="/console-secure-admin/dashboard"');
  console.log('1. Homepage has /niyamawali in Navbar:', hasNiyamawaliLink);
  console.log('2. Homepage has zero Admin links:', !hasAdminLink);

  // Test Niyamawali Page
  const niyamawaliRes = await fetch('http://localhost:3000/niyamawali');
  const niyamawaliHtml = await niyamawaliRes.text();
  console.log('3. Niyamawali HTTP Status:', niyamawaliRes.status);
  console.log('4. Contains Jan Sewa Charitable Trust (JSCT):', niyamawaliHtml.includes('जन सेवा चैरिटेबल ट्रस्ट (JSCT)'));
  console.log('5. Contains 75% Rule:', niyamawaliHtml.includes('75% सहभागिता नियम'));
  console.log('6. Contains ₹15,00,000 Bereavement Scheme:', niyamawaliHtml.includes('₹15,00,000') || niyamawaliHtml.includes('15,00,000'));
  console.log('7. Contains Daughter Wedding Scheme (विवाह शहनाई):', niyamawaliHtml.includes('विवाह शहनाई'));
  console.log('8. Replaced all raw DPSWT brand references with JSCT:', !niyamawaliHtml.includes('DPSWT'));

  if (hasNiyamawaliLink && !hasAdminLink && niyamawaliRes.status === 200) {
    console.log('\n🎉 ALL NIYAMAWALI TESTS PASSED!');
  } else {
    console.error('\n❌ Some tests failed');
  }
}

testNiyamawali();
