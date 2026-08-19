const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, 'cnc-data');
const pages = ['home', 'produktion', 'unternehmen', 'maschinenpark', 'kontakt', 'impressum', 'datenschutz'];
const RE = /https:\/\/cnc-schoebel\.de\/wp-content\/uploads\/[^"'\s)\\<>]+?\.(?:jpe?g|png|webp|svg|gif|mp4|webm|pdf)/gi;
const all = {};
const global = new Set();
for (const p of pages) {
  const f = path.join(DIR, p + '.dom.html');
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  const urls = (h.match(RE) || []);
  const base = urls.map(u => u.replace(/-\d+x\d+(\.\w+)$/, '$1'));
  all[p] = [...new Set(base)].sort();
  all[p].forEach(u => global.add(u));
  console.log('\n### ' + p + ' (' + all[p].length + ' unique originals)');
  all[p].forEach(u => console.log('  ' + u));
}
console.log('\n### GLOBAL UNIQUE (' + global.size + ')');
[...global].sort().forEach(u => console.log('  ' + u));
fs.writeFileSync(path.join(DIR, '_uploads.json'), JSON.stringify({ perPage: all, all: [...global].sort() }, null, 2));
