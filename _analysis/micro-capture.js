const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'shots', 'uptive-motion');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);
  await page.addStyleTag({ content: '.grecaptcha-badge{display:none!important}' });

  // ---------- A) SUB-FRAME CAPTURE OF A SECTION ENTERING ----------
  // Jump straight to just before "What Drives Us to be Different" (docY 3549) so it is untriggered
  await page.evaluate(() => window.scrollTo(0, 2600));
  await page.waitForTimeout(2500);
  console.log('=== ENTER SEQUENCE (section at docY 3522/3549, scroll 2600 -> 3150) ===');
  await page.evaluate(() => window.scrollTo(0, 3150));
  const t0 = Date.now();
  for (let i = 0; i < 12; i++) {
    const name = 'enter-' + String(i).padStart(2, '0') + '.jpg';
    await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 60 });
    const st = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-on-view]'))
        .filter(e => { const o = parseFloat(getComputedStyle(e).opacity); return o < 0.999; })
        .map(e => { const cs = getComputedStyle(e); return { c: (e.className||'').split(/\s+/).filter(x=>/fade|break-out/.test(x)).join(','), op: +(+cs.opacity).toFixed(3), tr: cs.transform, txt: (e.innerText||'').replace(/\s+/g,' ').slice(0,30) }; });
    });
    console.log('t+' + (Date.now() - t0) + 'ms', JSON.stringify(st));
    await page.waitForTimeout(55);
  }

  // ---------- B) HOVER STATES ----------
  console.log('\n=== HOVER TESTS ===');
  const hoverTargets = [
    { name: 'btn-primary', sel: 'a.btn', scroll: 0 },
    { name: 'nav-link', sel: '#nav-menu > li:nth-child(1) > a.nav-link', scroll: 0 },
    { name: 'nav-link-2', sel: '#nav-menu > li:nth-child(2) > a.nav-link', scroll: 0 },
    { name: 'section-nav-link', sel: '.section-nav-link', scroll: 0 },
    { name: 'flip-card', sel: '.flip-card', scroll: 1500 },
    { name: 'body-link', sel: 'main a:not(.btn)', scroll: 3300 },
    { name: 'search-trigger', sel: '[data-search-trigger]', scroll: 0 },
    { name: 'banner-logo', sel: '.banner-logo-item a', scroll: 0 },
  ];

  for (const t of hoverTargets) {
    try {
      await page.evaluate(y => window.scrollTo(0, y), t.scroll);
      await page.waitForTimeout(900);
      const el = await page.$(t.sel);
      if (!el) { console.log('MISS', t.name, t.sel); continue; }
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      const before = await el.evaluate(e => {
        const cs = getComputedStyle(e);
        return { transition: cs.transition, bg: cs.backgroundColor, color: cs.color, transform: cs.transform, opacity: cs.opacity, borderColor: cs.borderColor, boxShadow: cs.boxShadow, textDecoration: cs.textDecorationLine, filter: cs.filter };
      });
      const box = await el.boundingBox();
      if (box) await page.screenshot({ path: path.join(OUT, 'hover-' + t.name + '-before.jpg'), type: 'jpeg', quality: 70, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 30), width: Math.min(1600, box.width + 120), height: Math.min(900, box.height + 90) } });
      await el.hover({ force: true });
      await page.waitForTimeout(700);
      const after = await el.evaluate(e => {
        const cs = getComputedStyle(e);
        return { transition: cs.transition, bg: cs.backgroundColor, color: cs.color, transform: cs.transform, opacity: cs.opacity, borderColor: cs.borderColor, boxShadow: cs.boxShadow, textDecoration: cs.textDecorationLine, filter: cs.filter };
      });
      // also check the arrow child / inner
      const inner = await el.evaluate(e => {
        const child = e.querySelector('.btn-arrow, svg, .flip-card-inner, img');
        if (!child) return null;
        const cs = getComputedStyle(child);
        return { tag: child.tagName, cls: (child.className||'').toString().slice(0,60), transform: cs.transform, transition: cs.transition, bg: cs.backgroundColor, fill: cs.fill, opacity: cs.opacity };
      });
      if (box) await page.screenshot({ path: path.join(OUT, 'hover-' + t.name + '-after.jpg'), type: 'jpeg', quality: 70, clip: { x: Math.max(0, box.x - 40), y: Math.max(0, box.y - 30), width: Math.min(1600, box.width + 120), height: Math.min(900, box.height + 90) } });
      const diff = {};
      for (const k in before) if (before[k] !== after[k]) diff[k] = before[k] + '  ->  ' + after[k];
      console.log('\n[' + t.name + '] ' + t.sel);
      console.log('  transition:', after.transition);
      console.log('  DIFF:', JSON.stringify(diff, null, 2));
      console.log('  inner(after):', JSON.stringify(inner));
      await page.mouse.move(5, 5);
      await page.waitForTimeout(400);
    } catch (e) { console.log('ERR', t.name, e.message); }
  }

  // ---------- C) NAV SUBMENU OPEN ----------
  console.log('\n=== NAV SUBMENU ===');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const subBefore = await page.evaluate(() => {
    const sm = document.querySelector('.sub-menu.lv-1');
    if (!sm) return null;
    const cs = getComputedStyle(sm);
    return { display: cs.display, opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform, animation: cs.animation, transition: cs.transition, height: cs.height, maxHeight: cs.maxHeight, pointerEvents: cs.pointerEvents };
  });
  console.log('submenu BEFORE:', JSON.stringify(subBefore));
  await page.hover('#nav-menu > li:nth-child(1)');
  await page.waitForTimeout(900);
  const subAfter = await page.evaluate(() => {
    const sm = document.querySelector('.sub-menu.lv-1');
    if (!sm) return null;
    const cs = getComputedStyle(sm);
    return { display: cs.display, opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform, animation: cs.animation, transition: cs.transition, height: cs.height, maxHeight: cs.maxHeight, pointerEvents: cs.pointerEvents };
  });
  console.log('submenu AFTER: ', JSON.stringify(subAfter));
  await page.screenshot({ path: path.join(OUT, 'nav-submenu-open.jpg'), type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1600, height: 620 } });

  // mid-animation frames of the submenu
  await page.mouse.move(5, 600); await page.waitForTimeout(800);
  await page.hover('#nav-menu > li:nth-child(1)');
  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: path.join(OUT, 'submenu-' + i + '.jpg'), type: 'jpeg', quality: 60, clip: { x: 400, y: 60, width: 800, height: 520 } });
    await page.waitForTimeout(60);
  }

  // ---------- D) SEARCH OVERLAY ----------
  console.log('\n=== SEARCH OVERLAY ===');
  await page.mouse.move(5, 600); await page.waitForTimeout(400);
  const sBefore = await page.evaluate(() => { const f = document.getElementById('search-form'); const cs = getComputedStyle(f); return { cls: f.className, transform: cs.transform, opacity: cs.opacity, top: cs.top, transition: cs.transition, height: cs.height, position: cs.position, zIndex: cs.zIndex }; });
  console.log('search BEFORE:', JSON.stringify(sBefore));
  await page.click('[data-search-trigger]');
  await page.waitForTimeout(800);
  const sAfter = await page.evaluate(() => { const f = document.getElementById('search-form'); const cs = getComputedStyle(f); return { cls: f.className, transform: cs.transform, opacity: cs.opacity, top: cs.top, transition: cs.transition, height: cs.height, position: cs.position, zIndex: cs.zIndex }; });
  console.log('search AFTER: ', JSON.stringify(sAfter));
  await page.screenshot({ path: path.join(OUT, 'search-open.jpg'), type: 'jpeg', quality: 70, clip: { x: 0, y: 0, width: 1600, height: 400 } });

  await browser.close();
})();
