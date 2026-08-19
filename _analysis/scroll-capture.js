const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots', 'uptive-motion');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  // hide the sticky search form + recaptcha badge noise
  await page.addStyleTag({ content: '.grecaptcha-badge{display:none!important}' });

  const STEP = 150;
  const MAX = 4200;
  const log = [];
  for (let y = 0; y <= MAX; y += STEP) {
    await page.evaluate(v => window.scrollTo(0, v), y);
    await page.waitForTimeout(280); // mid-transition capture (transitions are 0.5s / 1.3s)
    const name = 'scroll-' + String(y).padStart(5, '0') + '.jpg';
    await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 62 });
    const state = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-on-view]'));
      return {
        y: window.scrollY,
        active: els.filter(e => e.classList.contains('active')).length,
        total: els.length,
        inflight: els.filter(e => {
          const cs = getComputedStyle(e);
          const o = parseFloat(cs.opacity);
          return o > 0.001 && o < 0.999;
        }).map(e => {
          const cs = getComputedStyle(e);
          return { cls: (e.className || '').split(/\s+/).filter(c => /fade/.test(c)).join(','), op: cs.opacity, tr: cs.transform, txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40) };
        })
      };
    });
    log.push({ file: name, ...state });
    console.log(y, 'active', state.active + '/' + state.total, state.inflight.length ? JSON.stringify(state.inflight) : '');
  }
  fs.writeFileSync(path.join(__dirname, 'scroll-log.json'), JSON.stringify(log, null, 2));
  await browser.close();
})();
