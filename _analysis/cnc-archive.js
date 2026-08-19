const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'shots', 'cnc');
fs.mkdirSync(OUT, { recursive: true });

// Wayback "id_" = raw original resource (no toolbar rewriting of the banner)
const PAGES = [
  { name: 'produktion', url: 'https://web.archive.org/web/20260509193726/https://cnc-schoebel.de/produktion/' },
  { name: 'unternehmen', url: 'https://web.archive.org/web/2026/https://cnc-schoebel.de/unternehmen/' },
  { name: 'maschinenpark', url: 'https://web.archive.org/web/2026/https://cnc-schoebel.de/maschinenpark/' },
  { name: 'kontakt', url: 'https://web.archive.org/web/2026/https://cnc-schoebel.de/kontakt/' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const P of PAGES) {
    console.log('=== ' + P.name);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'de-DE' });
    const page = await ctx.newPage();
    try {
      await page.goto(P.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    } catch (e) { console.log('  navfail', e.message.split('\n')[0]); await ctx.close(); continue; }
    try { await page.waitForLoadState('networkidle', { timeout: 40000 }); } catch (e) {}
    await page.waitForTimeout(3000);
    // remove wayback toolbar + cookie banner
    await page.evaluate(() => {
      ['#wm-ipp-base', '#wm-ipp', '#donato', '.wb-autocomplete-suggestions'].forEach(s => document.querySelectorAll(s).forEach(n => n.remove()));
      document.querySelectorAll('[class*="brlbs-cmpnt"],#BorlabsCookieBox,#brlbs-cookie-box').forEach(n => n.remove());
      document.documentElement.style.overflow = ''; document.body.style.overflow = '';
      document.body.style.marginTop = '0';
    });
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2500);
    const h = await page.evaluate(() => document.body.scrollHeight);
    console.log('  docHeight', h);
    await page.screenshot({ path: path.join(OUT, `cnc-${P.name}-ARCHIVED-full.png`), fullPage: true });
    const steps = Math.min(Math.ceil(h / 900), 20);
    for (let i = 0; i < steps; i++) {
      await page.evaluate(y => window.scrollTo(0, y), i * 900);
      await page.waitForTimeout(650);
      await page.screenshot({ path: path.join(OUT, `cnc-${P.name}-ARCHIVED-${String(i + 1).padStart(2, '0')}.png`) });
    }
    await ctx.close();
  }
  await browser.close();
  console.log('DONE');
})();
