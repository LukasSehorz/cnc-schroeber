const fs = require('fs');
const css = fs.readFileSync(__dirname + '/site.css', 'utf8');

// Split into rules (naive but works for minified tailwind)
const rules = [];
let depth = 0, start = 0, cur = '';
// simple tokenizer preserving @media context
function walk(str) {
  let i = 0;
  while (i < str.length) {
    let braceIdx = str.indexOf('{', i);
    if (braceIdx === -1) break;
    let sel = str.slice(i, braceIdx).trim();
    // find matching close
    let d = 1, j = braceIdx + 1;
    while (j < str.length && d > 0) {
      if (str[j] === '{') d++;
      else if (str[j] === '}') d--;
      j++;
    }
    const body = str.slice(braceIdx + 1, j - 1);
    if (sel.startsWith('@media') || sel.startsWith('@supports')) {
      rules.push({ sel: sel, body: '', media: true });
      walk(body);
      rules.push({ sel: '/* end ' + sel + ' */', body: '', media: true });
    } else {
      rules.push({ sel, body });
    }
    i = j;
  }
}
walk(css);

const KEYS = process.argv.slice(2);
const out = [];
for (const r of rules) {
  if (r.media) continue;
  const s = r.sel;
  if (KEYS.some(k => s.toLowerCase().includes(k.toLowerCase()))) {
    out.push(s + ' {\n  ' + r.body.replace(/;/g, ';\n  ') + '\n}');
  }
}
console.log(out.join('\n'));
console.log('\n/* total rules parsed: ' + rules.length + ', matched: ' + out.length + ' */');
