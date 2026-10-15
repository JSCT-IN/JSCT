async function verify() {
  const res = await fetch('http://localhost:3000/');
  const html = await res.text();

  console.log('--- VERIFYING HOMEPAGE HTML ---');
  console.log('Contains /admin:', html.includes('/admin'));
  console.log('Contains /console-secure-admin:', html.includes('/console-secure-admin'));
  console.log('Contains >Admin<:', html.includes('>Admin<'));
  console.log('Contains प्रशासन (Admin):', html.includes('प्रशासन (Admin)'));
  console.log('Contains >प्रशासन<:', html.includes('>प्रशासन<'));
  
  // Extract all hrefs
  const hrefMatches = html.match(/href="[^"]*"/g) || [];
  const uniqueHrefs = [...new Set(hrefMatches)];
  console.log('\nAll unique href attributes found in homepage:');
  uniqueHrefs.forEach(h => console.log('  ' + h));

  const adminHrefs = uniqueHrefs.filter(h => h.toLowerCase().includes('admin'));
  console.log('\nAdmin hrefs found:', adminHrefs.length);
  if (adminHrefs.length > 0) {
    console.error('FAILED: Admin links leaked!', adminHrefs);
    process.exit(1);
  } else {
    console.log('SUCCESS: Zero admin links leaked to unauthenticated visitors!');
  }
}

verify();
