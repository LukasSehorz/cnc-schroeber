const fs = require('fs');
const css = fs.readFileSync(__dirname + '/site.css', 'utf8');
const rgb2hex = (r,g,b) => '#' + [r,g,b].map(x=>(+x).toString(16).padStart(2,'0')).join('');

console.log('=== BRAND COLOR TOKEN VALUES ===');
const tokens = ['brand-accent-2','brand-accent','brand-black','brand-copy','brand-primary-1','brand-primary-2','brand-primary-3','brand-secondary-2','brand-secondary','gradient-accent-2','uptive-pattern','neutral-50','neutral-100','neutral-400'];
for (const t of tokens) {
  const re = new RegExp('\\.(bg|text|border|from|to|via|fill|stroke)-' + t.replace(/-/g,'\\-') + '(?:\\\\\\/(\\d+))?\\s*[,{][^}]{0,240}\\}', 'g');
  const found = new Set();
  for (const m of [...css.matchAll(re)]) {
    const rm = m[0].match(/rgb\((\d+)\s+(\d+)\s+(\d+)/);
    if (rm) found.add(rgb2hex(rm[1],rm[2],rm[3]) + '  (rgb ' + rm[1]+','+rm[2]+','+rm[3] + ')  via .' + m[1] + '-' + t + (m[2]?'/'+m[2]:''));
    else found.add('RAW: ' + m[0].slice(0,180));
  }
  if (found.size) { console.log('\n### ' + t); [...found].forEach(f=>console.log('   ' + f)); }
}

console.log('\n\n=== TYPOGRAPHY: heading & text rules ===');
const typeSel = /(^|\})([^{}]*?(?:\bh1\b|\bh2\b|\bh3\b|\bh4\b|\bh5\b|\bh6\b|heading|\btitle\b|eyebrow|kicker|subtitle|\.lead|body-copy)[^{}]*?)\{([^}]{0,400})\}/g;
let n = 0;
for (const m of css.matchAll(typeSel)) {
  const sel = m[2].trim(), body = m[3];
  if (!/font-size|font-family|letter-spacing|line-height|text-transform|font-weight/.test(body)) continue;
  if (sel.length > 220) continue;
  console.log('\n' + sel + ' {');
  console.log('   ' + body.replace(/;/g,';\n   '));
  console.log('}');
  if (++n > 60) break;
}

console.log('\n\n=== BUTTONS ===');
for (const m of css.matchAll(/(^|\})([^{}]*?(?:\bbtn\b|button|\.cta)[^{}]*?)\{([^}]{0,400})\}/g)) {
  const sel = m[2].trim(), body = m[3];
  if (sel.length > 200) continue;
  if (!/padding|border-radius|background|font|color|border/.test(body)) continue;
  console.log('\n' + sel + ' { ' + body + ' }');
}
