const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);

  const inline = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent || '')
      .filter(t => t.trim().length > 40 && !/gtm|dataLayer|googletag|gtag|clarity|_linkedin|hbspt|gform|recaptcha|wp\.i18n/i.test(t.slice(0, 300)))
      .map(t => t.slice(0, 6000));
  });
  console.log('=== INLINE SCRIPTS (' + inline.length + ') ===');
  inline.forEach((t, i) => { console.log('--- #' + i + ' ---'); console.log(t); console.log(''); });

  // hero markup
  const heroHtml = await page.evaluate(() => {
    const h = document.querySelector('#hero');
    return h ? h.outerHTML.slice(0, 6000) : null;
  });
  console.log('=== HERO HTML ===');
  console.log(heroHtml);

  const headerHtml = await page.evaluate(() => {
    const h = document.querySelector('#site-header');
    return h ? h.outerHTML.slice(0, 5000) : null;
  });
  console.log('=== HEADER HTML (5k) ===');
  console.log(headerHtml);

  // header behaviour across scroll positions
  const positions = [0, 200, 400, 800, 1500, 3000, 6000];
  const headerStates = [];
  for (const p of positions) {
    await page.evaluate(y => window.scrollTo(0, y), p);
    await page.waitForTimeout(700);
    const st = await page.evaluate(() => {
      const h = document.querySelector('#site-header');
      const cs = getComputedStyle(h);
      const r = h.getBoundingClientRect();
      const ann = document.getElementById('announcment-banner');
      return {
        y: window.scrollY,
        cls: h.className,
        bodyCls: document.body.className,
        htmlCls: document.documentElement.className,
        position: cs.position, top: cs.top, transform: cs.transform,
        height: Math.round(r.height), rectTop: Math.round(r.top),
        bg: cs.backgroundColor, boxShadow: cs.boxShadow, transition: cs.transition,
        annH: ann ? Math.round(ann.getBoundingClientRect().height) : null,
        annTop: ann ? Math.round(ann.getBoundingClientRect().top) : null,
        heroImgSrc: (document.getElementById('hero-img') || {}).currentSrc,
        heroImgOpacity: document.getElementById('hero-img') ? getComputedStyle(document.getElementById('hero-img')).opacity : null,
        heroTransform: document.getElementById('hero-img') ? getComputedStyle(document.getElementById('hero-img')).transform : null,
        heroRectTop: document.getElementById('hero-img') ? Math.round(document.getElementById('hero-img').getBoundingClientRect().top) : null,
      };
    });
    headerStates.push(st);
  }
  console.log('=== HEADER ACROSS SCROLL ===');
  headerStates.forEach(s => console.log(JSON.stringify(s)));

  // hero image cycle observation
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  console.log('=== HERO IMG CYCLE (sample every 900ms x 16) ===');
  for (let i = 0; i < 16; i++) {
    const s = await page.evaluate(() => {
      const img = document.getElementById('hero-img');
      if (!img) return null;
      return { t: Date.now(), src: (img.currentSrc || img.src || '').split('/').pop(), op: getComputedStyle(img).opacity, srcset: (img.srcset||'').slice(0,120) };
    });
    console.log(JSON.stringify(s));
    await page.waitForTimeout(900);
  }

  await browser.close();
})();
