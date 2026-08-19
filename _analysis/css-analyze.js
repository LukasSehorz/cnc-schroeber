const fs = require('fs');
const css = fs.readFileSync(__dirname + '/site.css', 'utf8');

// Count hex colors
const hexes = {};
for (const m of css.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
  const h = '#' + m[1].toLowerCase();
  hexes[h] = (hexes[h] || 0) + 1;
}
const sorted = Object.entries(hexes).sort((a,b)=>b[1]-a[1]);
console.log('=== TOP HEX COLORS (count) ===');
console.log(sorted.slice(0, 45).map(([h,c])=>`${h}  x${c}`).join('\n'));

// font families
console.log('\n=== FONT-FAMILY DECLARATIONS ===');
const ffs = new Set();
for (const m of css.matchAll(/font-family:([^;}]+)/g)) ffs.add(m[1].trim());
console.log([...ffs].join('\n'));

// @font-face
console.log('\n=== @font-face ===');
for (const m of css.matchAll(/@font-face\{[^}]*\}/g)) console.log(m[0].slice(0,400));

// custom classes with colors - find named tailwind color utilities
console.log('\n=== BRAND COLOR UTILITY CLASSES ===');
const brand = new Set();
for (const m of css.matchAll(/\.(?:bg|text|border|from|to|via|fill|stroke|ring|decoration|shadow)-([a-z][a-z0-9-]*)(?:\\\/[0-9]+)?[,{ :]/g)) {
  brand.add(m[1]);
}
console.log([...brand].sort().join(' '));

// rules that define brandish colors
console.log('\n=== RULE SAMPLES for non-tailwind-default names ===');
const names = ['uptive','brand','primary','secondary','accent','navy','charcoal','steel','ink','graphite','orange','gold','lime','cyan','teal','sky','slate','zinc','neutral','stone','gray'];
for (const n of names) {
  const re = new RegExp('\\.(?:bg|text|border)-' + n + '(?:-\\d+)?(?:\\\\\\/\\d+)?[,{][^}]{0,160}\\}', 'g');
  const ms = [...css.matchAll(re)].slice(0, 6);
  if (ms.length) { console.log('--- ' + n); ms.forEach(x=>console.log('   ' + x[0].slice(0,200))); }
}

// container / max-width
console.log('\n=== CONTAINER / MAX-WIDTH ===');
for (const m of css.matchAll(/\.container[^{]*\{[^}]*\}/g)) console.log(m[0].slice(0,300));
for (const m of css.matchAll(/@media[^{]*\{\.container\{[^}]*\}\}/g)) console.log(m[0].slice(0,200));

// custom keyframes
console.log('\n=== KEYFRAMES ===');
for (const m of css.matchAll(/@keyframes ([a-zA-Z0-9_-]+)/g)) console.log(m[1]);

// custom (non-utility) selectors near end of file - the theme's own CSS
const tailIdx = css.lastIndexOf('@media (min-width:1536px)');
console.log('\n=== TAIL OF CSS (custom theme rules), last 6000 chars ===');
console.log(css.slice(-6000));
