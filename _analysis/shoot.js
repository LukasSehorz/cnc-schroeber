const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots', 'uptive');
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['home',        'https://uptivemfg.com/'],
  ['cnc',         'https://uptivemfg.com/solutions/cnc-machining'],
  ['solutions',   'https://uptivemfg.com/solutions'],
  ['about',       'https://uptivemfg.com/about-uptive-manufacturing'],
  ['industries',  'https://uptivemfg.com/industries-served'],
  ['contact',     'https://uptivemfg.com/contact'],
  ['aerospace',   'https://uptivemfg.com/industries-served/aerospace-manufacturing'],
  ['materials',   'https://uptivemfg.com/materials'],
];

// slow scroll to trigger reveal animations, then back to top
async function primeScroll(page) {
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    const step = 400;
    for (let y = 0; y < H; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 700));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  });
  await page.waitForTimeout(1200);
}

// kill animations so fullPage capture is stable & everything visible
async function forceVisible(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}
    [data-aos],.aos-init,.fade-in,.reveal,[class*="animate"]{opacity:1!important;transform:none!important;visibility:visible!important}
  `});
}

(async () => {
  const browser = await chromium.launch();
  const results = {};

  for (const [name, url] of PAGES) {
    console.log('=== ' + name + ' ' + url);
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    } catch (e) {
      console.log('  nav warn: ' + e.message.slice(0,80));
      try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); } catch(e2) { console.log('  FAIL ' + name); await ctx.close(); continue; }
    }
    await page.waitForTimeout(2500);
    await primeScroll(page);
    await forceVisible(page);
    await page.waitForTimeout(600);

    const h = await page.evaluate(() => document.body.scrollHeight);
    results[name] = { url, height: h };
    console.log('  height ' + h);

    // full page
    await page.screenshot({ path: path.join(OUT, `uptive-${name}-full.png`), fullPage: true });

    // segmented viewport shots, 850px steps
    const step = 850;
    let i = 1;
    for (let y = 0; y < h - 100; y += step) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(500);
      const idx = String(i).padStart(2, '0');
      await page.screenshot({ path: path.join(OUT, `uptive-${name}-${idx}.png`) });
      i++;
      if (i > 24) break;
    }
    results[name].segments = i - 1;
    await ctx.close();

    // mobile
    const mctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });
    const mp = await mctx.newPage();
    try {
      await mp.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
      await mp.waitForTimeout(2500);
      await primeScroll(mp);
      await forceVisible(mp);
      await mp.waitForTimeout(600);
      await mp.screenshot({ path: path.join(OUT, `uptive-${name}-mobile-full.png`), fullPage: true });
      // mobile top viewport + one open-menu shot for home
      await mp.evaluate(() => window.scrollTo(0,0));
      await mp.waitForTimeout(300);
      await mp.screenshot({ path: path.join(OUT, `uptive-${name}-mobile-top.png`) });
      if (name === 'home') {
        const btn = await mp.$('button[class*="menu"], [class*="hamburger"], header button, [aria-label*="menu" i], [class*="toggle"]');
        if (btn) { await btn.click({ timeout: 5000 }).catch(()=>{}); await mp.waitForTimeout(1200);
          await mp.screenshot({ path: path.join(OUT, `uptive-home-mobile-menu.png`) }); }
      }
    } catch(e) { console.log('  mobile warn ' + e.message.slice(0,80)); }
    await mctx.close();
  }

  fs.writeFileSync(path.join(__dirname, 'shots-index.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
