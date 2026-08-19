const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, 'cnc-data');
const pages = ['home', 'produktion', 'unternehmen', 'maschinenpark', 'kontakt', 'impressum', 'datenschutz'];
const RE = /uploads\\?\/[0-9]{4}\\?\/[0-9]{2}\\?\/[A-Za-z0-9_\-.%]+?\.(?:jpe?g|png|webp|svg|gif|mp4|webm|pdf)/gi;
const out = {};
const global = new Set();
for (const p of pages) {
  const f = path.join(DIR, p + '.dom.html');
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  const m = (h.match(RE) || []).map(s => s.split('\\').join(''));
  const u = [...new Set(m.map(x => x.replace(/-\d+x\d+(\.\w+)$/, '$1')))].sort();
  out[p] = u.map(x => 'https://cnc-schoebel.de/wp-content/' + x);
  out[p].forEach(x => global.add(x));
  console.log('### ' + p + ' (' + u.length + ')');
  out[p].forEach(x => console.log('   ' + x));
}
console.log('\n### GLOBAL (' + global.size + ')');
[...global].sort().forEach(x => console.log('  ' + x));
fs.writeFileSync(path.join(DIR, '_uploads_all.json'), JSON.stringify({ perPage: out, all: [...global].sort() }, null, 2));
