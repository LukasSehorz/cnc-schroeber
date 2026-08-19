const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto('https://uptivemfg.com/', { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(2500);

  const data = await page.evaluate(() => {
    const abs = (h) => { try { return new URL(h, location.href).href; } catch(e) { return null; } };
    const links = [...document.querySelectorAll('a[href]')].map(a => ({
      href: abs(a.getAttribute('href')),
      text: (a.innerText||'').trim().replace(/\s+/g,' ').slice(0,60),
      inNav: !!a.closest('header,nav,[class*=nav],[class*=Nav],[class*=header],[class*=Header]'),
      inFooter: !!a.closest('footer,[class*=footer],[class*=Footer]')
    })).filter(l => l.href && l.href.includes('uptivemfg.com'));
    return {
      title: document.title,
      html: document.documentElement.outerHTML.length,
      links,
      fontLinks: [...document.querySelectorAll('link[rel=stylesheet],link[rel=preload],link[href*=font]')].map(l=>l.href),
      styleSheets: [...document.styleSheets].map(s=>{try{return s.href}catch(e){return null}}).filter(Boolean),
      generator: (document.querySelector('meta[name=generator]')||{}).content || null,
      bodyClass: document.body.className,
      htmlClass: document.documentElement.className
    };
  });

  // dedupe
  const seen = new Map();
  for (const l of data.links) {
    const u = l.href.split('#')[0].replace(/\/$/, '') || l.href;
    if (!seen.has(u)) seen.set(u, l);
  }
  const out = { title: data.title, generator: data.generator, bodyClass: data.bodyClass, htmlClass: data.htmlClass, fontLinks: data.fontLinks, styleSheets: data.styleSheets, urls: [...seen.entries()].map(([u,l])=>({url:u, text:l.text, nav:l.inNav, footer:l.inFooter})) };
  fs.writeFileSync(__dirname + '/map.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));

  // try sitemap
  try {
    const r = await ctx.request.get('https://uptivemfg.com/sitemap.xml');
    if (r.ok()) fs.writeFileSync(__dirname + '/sitemap.xml', await r.text());
    console.log('sitemap status', r.status());
  } catch(e) { console.log('sitemap err', e.message); }

  await browser.close();
})();
