const fs = require('fs');
const text = fs.readFileSync('scripts/extracted_about.txt', 'utf8');

// Find all rules and about contents
fs.writeFileSync('scripts/formatted_about.txt', '', 'utf8');

const log = (msg) => {
  fs.appendFileSync('scripts/formatted_about.txt', msg + '\n', 'utf8');
};

// Search for about descriptions
const aboutIdx = text.indexOf('aboutFrct__para');
if (aboutIdx !== -1) {
  log('--- ABOUT INTRO ---');
  log(text.substring(aboutIdx - 200, aboutIdx + 1500));
}

// Find title:... body:...
const titleMatches = [...text.matchAll(/title:\s*"([^"]+)",\s*body:\s*(\[[^\]]+\])/g)];
log('\n--- FOUND ' + titleMatches.length + ' SECTIONS ---');
titleMatches.forEach((m, idx) => {
  log(`\n### [${idx + 1}] ${m[1]}`);
  try {
    const list = JSON.parse(m[2]);
    list.forEach(item => log(`- ${item}`));
  } catch (e) {
    log(m[2]);
  }
});
