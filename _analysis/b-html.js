const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  // dismiss cookie banner
  try { await page.click('.cmplz-accept, #cmplz-accept, [data-cmplz-action=accept]', { timeout: 3000 }); } catch(e) { console.log('no accept btn'); }
  try { await page.click('.cmplz-close', { timeout: 2000 }); } catch(e) {}
  await page.waitForTimeout(1200);

  const out = await page.evaluate(() => {
    const res = {};
    const header = document.querySelector('header.header, header.barrier-topbar, header');
    res.headerHTML = header ? header.outerHTML : null;
    res.headerOuterClass = header ? header.className : null;
    // ancestors of header carrying data attributes
    res.headerAncestors = [];
    let e = header;
    while (e && e !== document.documentElement) {
      const attrs = {};
      [...e.attributes].forEach(a => attrs[a.name] = a.value.slice(0, 400));
      res.headerAncestors.push({ tag: e.tagName, attrs });
      e = e.parentElement;
    }
    // Anything with data-primary-hero
    res.dataPrimaryHero = [...document.querySelectorAll('[data-primary-hero]')].map(el => ({
      tag: el.tagName, cls: (el.className||'').toString().slice(0,300), val: el.getAttribute('data-primary-hero')
    }));
    // the hero section
    const hero = document.querySelector('.primary-hero, [class*=primary-hero], section');
    res.heroClassGuess = hero ? (hero.className||'').toString() : null;
    // first two direct children of main / body
    const main = document.querySelector('main') || document.body;
    res.mainChildren = [...main.children].map(c => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0,300), id: c.id, h: Math.round(c.getBoundingClientRect().height) }));
    res.mainCls = (main.className||'').toString();
    res.mainAttrs = {}; [...main.attributes].forEach(a=>res.mainAttrs[a.name]=a.value.slice(0,300));
    res.bodyAttrs = {}; [...document.body.attributes].forEach(a=>res.bodyAttrs[a.name]=a.value.slice(0,300));
    return res;
  });

  fs.writeFileSync(__dirname + '/b-header.html', out.headerHTML || '');
  fs.writeFileSync(__dirname + '/b-header-meta.json', JSON.stringify(out, null, 2));

  // grab first hero block html
  const heroHTML = await page.evaluate(() => {
    const el = document.querySelector('.primary-hero') || document.querySelector('[class*="primary-hero"]');
    if (el) return el.outerHTML;
    const main = document.querySelector('main') || document.body;
    return main.children[0] ? main.children[0].outerHTML : '';
  });
  fs.writeFileSync(__dirname + '/b-hero.html', heroHTML);

  console.log('data-primary-hero elements:', JSON.stringify(out.dataPrimaryHero, null, 1));
  console.log('main children:', JSON.stringify(out.mainChildren, null, 1));
  console.log('body attrs:', JSON.stringify(out.bodyAttrs, null, 1));
  console.log('header ancestors:', JSON.stringify(out.headerAncestors, null, 1));
  console.log('headerHTML len', (out.headerHTML||'').length, 'heroHTML len', heroHTML.length);

  await browser.close();
})();
