const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'cnc-data', 'maschinenpark.dom.html'), 'utf8');

function strip(s) {
  return s.replace(/<br\s*\/?>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&#8222;/g, '„').replace(/&#039;|&#8217;/g, "'")
    .replace(/&Oslash;|&oslash;/g, 'Ø')
    .replace(/\s+/g, ' ').trim();
}

// dedupe by content, skip swiper duplicates
const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map(m => m[0]);
console.log('raw tables found:', tables.length);
const seen = new Set();
let n = 0;
const result = [];
for (const t of tables) {
  const rows = [...t.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map(r =>
    [...r[0].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c => strip(c[1]))
  ).filter(r => r.some(c => c));
  if (!rows.length) continue;
  const key = JSON.stringify(rows);
  if (seen.has(key)) continue;
  seen.add(key);
  n++;
  result.push(rows);
  console.log('\n===== TABLE ' + n);
  rows.forEach(r => console.log('  ' + r.join('  ||  ')));
}
fs.writeFileSync(path.join(__dirname, 'cnc-data', 'maschinenpark-tables-parsed.json'), JSON.stringify(result, null, 2));
