const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'shots', 'uptive-motion');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();

  // ---- PAGE TRANSITION ----
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(4000);
  console.log('=== PAGE TRANSITION TEST ===');
  let navCount = 0;
  page.on('framenavigated', f => { if (f === page.mainFrame()) { navCount++; console.log('  framenavigated ->', f.url()); } });

  // capture frames right after click
  const clickP = page.click('#nav-menu a[href*="/materials"], #nav-menu > li:nth-child(2) > a').catch(e => console.log('click err', e.message));
  for (let i = 0; i < 5; i++) {
    try { await page.screenshot({ path: path.join(OUT, 'pagetrans-' + i + '.jpg'), type: 'jpeg', quality: 55 }); } catch (e) {}
    await page.waitForTimeout(90);
  }
  await clickP;
  await page.waitForTimeout(3000);
  console.log('  full page nav count:', navCount, ' url now:', page.url());
  const isSPA = await page.evaluate(() => ({ hasBarba: typeof window.barba !== 'undefined', hasTurbo: typeof window.Turbo !== 'undefined', hasSwup: typeof window.Swup !== 'undefined', viewTransition: 'startViewTransition' in document, vtCSS: !!Array.from(document.styleSheets).some(s => { try { return Array.from(s.cssRules).some(r => (r.cssText||'').includes('view-transition')); } catch(e){return false;} }) }));
  console.log('  SPA libs:', JSON.stringify(isSPA));

  // ---- SUBPAGE: solutions / cnc-machining ----
  console.log('\n=== SUBPAGE: /solutions/cnc-machining/ ===');
  await page.goto('https://uptivemfg.com/solutions/cnc-machining/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  const sub = await page.evaluate(() => {
    const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ((el.getAttribute('class')||'') ? '.' + (el.getAttribute('class')||'').trim().split(/\s+/).slice(0,6).join('.') : '');
    return {
      h: document.documentElement.scrollHeight,
      onView: Array.from(document.querySelectorAll('[data-on-view]')).map(e => ({ sel: desc(e), add: e.dataset.cssAdd, rem: e.dataset.cssRemove, dur: e.dataset.cssDuration, js: e.dataset.js, play: e.dataset.play })),
      videos: Array.from(document.querySelectorAll('video')).map(v => ({ sel: desc(v), autoplay: v.autoplay, loop: v.loop, muted: v.muted, src: (v.querySelector('source')||{}).src || v.src })),
      splide: Array.from(document.querySelectorAll('.splide')).map(e => ({ sel: desc(e), slides: e.querySelectorAll('.splide__slide').length })),
      sticky: Array.from(document.querySelectorAll('*')).filter(e => getComputedStyle(e).position === 'sticky').map(e => ({ sel: desc(e), top: getComputedStyle(e).top })),
      sectionNav: !!document.querySelector('.section-nav'),
      dataSection: Array.from(document.querySelectorAll('[data-section]')).map(e => e.dataset.section),
      faq: document.querySelectorAll('.faq-item').length,
      flipCards: document.querySelectorAll('.flip-card').length,
      details: document.querySelectorAll('details').length,
    };
  });
  console.log(JSON.stringify(sub, null, 1));

  // ---- SUBPAGE 2: /about or /solutions ----
  for (const url of ['https://uptivemfg.com/solutions/', 'https://uptivemfg.com/about/']) {
    try {
      console.log('\n=== ' + url + ' ===');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(4500);
      const s = await page.evaluate(() => {
        const desc = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ((el.getAttribute('class')||'') ? '.' + (el.getAttribute('class')||'').trim().split(/\s+/).slice(0,6).join('.') : '');
        return {
          onViewClasses: Array.from(new Set(Array.from(document.querySelectorAll('[data-on-view]')).map(e => (e.getAttribute('class')||'').split(/\s+/).filter(c => /fade|slide|zoom|scale/.test(c)).join(' ')))),
          count: document.querySelectorAll('[data-on-view]').length,
          videos: document.querySelectorAll('video').length,
          splide: document.querySelectorAll('.splide').length,
          sticky: Array.from(document.querySelectorAll('*')).filter(e => getComputedStyle(e).position === 'sticky').map(e => desc(e) + ' top:' + getComputedStyle(e).top),
          play: Array.from(document.querySelectorAll('[data-play]')).map(e => e.dataset.play),
          jsHooks: Array.from(document.querySelectorAll('[data-js]')).map(e => e.dataset.js),
          durations: Array.from(document.querySelectorAll('[data-css-duration]')).map(e => e.dataset.cssDuration),
          removes: Array.from(new Set(Array.from(document.querySelectorAll('[data-css-remove]')).map(e => e.dataset.cssRemove))),
        };
      });
      console.log(JSON.stringify(s, null, 1));
    } catch (e) { console.log('ERR', url, e.message); }
  }

  await browser.close();
})();
