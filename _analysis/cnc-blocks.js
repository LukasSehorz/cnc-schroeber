const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PAGES = {
  home: 'https://cnc-schoebel.de/',
  produktion: 'https://cnc-schoebel.de/produktion/',
  unternehmen: 'https://cnc-schoebel.de/unternehmen/',
  maschinenpark: 'https://cnc-schoebel.de/maschinenpark/',
  kontakt: 'https://cnc-schoebel.de/kontakt/',
};
const ONLY = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const all = {};
  for (const [name, url] of Object.entries(PAGES)) {
    if (ONLY.length && !ONLY.includes(name)) continue;
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
    const p = await ctx.newPage();
    try { await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
    catch (e) { console.log(name, 'FAIL'); await ctx.close(); continue; }
    try { await p.waitForLoadState('networkidle', { timeout: 25000 }); } catch (e) {}
    await p.waitForTimeout(2500);
    const blocks = await p.evaluate(() => {
      const t = e => (e.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      const main = document.querySelector('main, .site-main, #content') || document.body;
      return [...main.querySelectorAll('[data-widget_type]')].map(w => {
        const type = w.getAttribute('data-widget_type');
        const r = w.getBoundingClientRect();
        const o = { type, y: Math.round(r.top + window.scrollY), text: t(w).slice(0, 1400) };
        const img = w.querySelector('img');
        if (img) o.img = { src: img.currentSrc || img.src, alt: img.alt };
        const link = w.querySelector('a[href]');
        if (link) o.link = { text: t(link), href: link.href };
        const gal = [...w.querySelectorAll('.e-gallery-item, .elementor-gallery-item, .swiper-slide')];
        if (gal.length) {
          o.items = gal.map(g => {
            const bg = getComputedStyle(g.querySelector('.e-gallery-image, .swiper-slide-bg') || g).backgroundImage;
            const im = g.querySelector('img');
            return { title: t(g).slice(0, 120), bg: bg && bg !== 'none' ? bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : '', img: im ? im.currentSrc || im.src : '' };
          });
        }
        return o;
      });
    });
    all[name] = blocks;
    console.log('\n########## ' + name.toUpperCase() + ' (' + blocks.length + ' widgets) ##########');
    blocks.forEach((b, i) => {
      console.log('\n--- [' + (i + 1) + '] ' + b.type + '  @y=' + b.y);
      if (b.text) console.log(b.text.split('\n').map(l => '    ' + l).join('\n'));
      if (b.img) console.log('    IMG: ' + b.img.src + '  alt=' + JSON.stringify(b.img.alt));
      if (b.link) console.log('    LINK: ' + JSON.stringify(b.link.text) + ' -> ' + b.link.href);
      if (b.items) b.items.forEach((it, j) => console.log('    ITEM' + (j + 1) + ': ' + (it.title || '') + ' | bg=' + it.bg + ' | img=' + it.img));
    });
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'cnc-data', '_blocks' + (ONLY.length ? '_' + ONLY.join('-') : '') + '.json'), JSON.stringify(all, null, 2));
  await browser.close();
})();
