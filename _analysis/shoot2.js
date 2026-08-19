const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots', 'uptive');
fs.mkdirSync(OUT, { recursive: true });

const ALL = {
  home:       'https://uptivemfg.com/',
  cnc:        'https://uptivemfg.com/solutions/cnc-machining',
  solutions:  'https://uptivemfg.com/solutions',
  about:      'https://uptivemfg.com/about-uptive-manufacturing',
  industries: 'https://uptivemfg.com/industries-served',
  contact:    'https://uptivemfg.com/contact',
  aerospace:  'https://uptivemfg.com/industries-served/aerospace-manufacturing',
  materials:  'https://uptivemfg.com/materials',
};

const args = process.argv.slice(2);
const mode = args[0] || 'both';           // desktop | mobile | both
const names = args.slice(1).length ? args.slice(1) : Object.keys(ALL);

async function goto(page, url) {
  try { await page.goto(url, { waitUntil: 'load', timeout: 45000 }); }
  catch (e) { try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }); } catch(e2) { return false; } }
  return true;
}
async function primeScroll(page) {
  await page.evaluate(async () => {
    const H = document.body.scrollHeight, step = 500;
    for (let y = 0; y < H; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
    window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 600));
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(1000);
}
async function forceVisible(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}
    [data-aos],.aos-init,.fade-in,.reveal,[class*="animate"],[class*="fade"]{opacity:1!important;transform:none!important;visibility:visible!important}
  `}).catch(()=>{});
  // force all lazy images to load
  await page.evaluate(() => {
    document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
    document.querySelectorAll('img[data-src]').forEach(i => { if(!i.src||i.src.startsWith('data:')) i.src = i.dataset.src; });
  }).catch(()=>{});
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch();
  const results = {};
  for (const name of names) {
    const url = ALL[name];
    if (!url) continue;
    console.log('=== ' + name + ' ' + url);

    if (mode === 'desktop' || mode === 'both') {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
      const page = await ctx.newPage();
      if (await goto(page, url)) {
        await page.waitForTimeout(2500);
        await primeScroll(page); await forceVisible(page);
        const h = await page.evaluate(() => document.body.scrollHeight);
        results[name] = { url, height: h };
        console.log('  desktop height ' + h);
        await page.screenshot({ path: path.join(OUT, `uptive-${name}-full.png`), fullPage: true });
        let i = 1;
        for (let y = 0; y < h - 100; y += 850) {
          await page.evaluate(yy => window.scrollTo(0, yy), y);
          await page.waitForTimeout(450);
          await page.screenshot({ path: path.join(OUT, `uptive-${name}-${String(i).padStart(2,'0')}.png`) });
          if (++i > 24) break;
        }
        console.log('  segments ' + (i-1));
      } else console.log('  DESKTOP FAIL');
      await ctx.close();
    }

    if (mode === 'mobile' || mode === 'both') {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
      const mp = await mctx.newPage();
      if (await goto(mp, url)) {
        await mp.waitForTimeout(2500);
        await primeScroll(mp); await forceVisible(mp);
        await mp.screenshot({ path: path.join(OUT, `uptive-${name}-mobile-full.png`), fullPage: true });
        await mp.evaluate(() => window.scrollTo(0,0)); await mp.waitForTimeout(400);
        await mp.screenshot({ path: path.join(OUT, `uptive-${name}-mobile-top.png`) });
        console.log('  mobile ok');
        if (name === 'home') {
          for (const sel of ['#nav-toggle','[aria-label*="menu" i]','button[class*="menu"]','[class*="hamburger"]','#site-header button','header button']) {
            const b = await mp.$(sel);
            if (b) { await b.click({ timeout: 4000 }).catch(()=>{}); await mp.waitForTimeout(1200);
              await mp.screenshot({ path: path.join(OUT, `uptive-home-mobile-menu.png`) });
              console.log('  menu shot via ' + sel); break; }
          }
        }
      } else console.log('  MOBILE FAIL');
      await mctx.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, 'shots-index-' + mode + '.json'), JSON.stringify(results, null, 2));
  console.log('DONE');
  await browser.close();
})();
