const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  try { await page.goto('https://uptivemfg.com/', { waitUntil: 'load', timeout: 45000 }); }
  catch(e){ await page.goto('https://uptivemfg.com/', { waitUntil: 'domcontentloaded', timeout: 40000 }); }
  await page.waitForTimeout(3000);
  await page.evaluate(async()=>{const H=document.body.scrollHeight;for(let y=0;y<H;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);});
  await page.waitForTimeout(1500);

  const r = await page.evaluate(() => {
    const cs = e => getComputedStyle(e);
    const hx = c => { const m=(c||'').match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/); if(!m)return c;
      if(m[4]!==undefined&&+m[4]===0)return 'transparent';
      return '#'+[m[1],m[2],m[3]].map(x=>Math.round(+x).toString(16).padStart(2,'0')).join('')+(m[4]!==undefined&&+m[4]<1?`/${m[4]}`:''); };
    const o = {};
    const g = (label, sel, fn) => { const el = document.querySelector(sel); if(!el){o[label]='NOT FOUND '+sel; return;} const s=cs(el),b=el.getBoundingClientRect();
      o[label] = { sel, box:`${Math.round(b.width)}x${Math.round(b.height)} @x${Math.round(b.left)}`, bg:hx(s.backgroundColor), color:hx(s.color),
        font:`${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ls:${s.letterSpacing} ${s.textTransform}`,
        pad:s.padding, r:s.borderRadius, bd:`${s.borderTopWidth} ${s.borderStyle} ${hx(s.borderTopColor)}`, sh:s.boxShadow, bgi:s.backgroundImage.slice(0,120),
        extra: fn ? fn(el, s) : undefined }; };

    // newsletter band (blue strip above footer)
    const bands = [...document.querySelectorAll('div,section')].filter(e => { const c = cs(e).backgroundColor; return /rgb\(1[0-9][0-9], 20[0-9]/.test(c) || /rgb\(15[0-9]/.test(c); });
    o.blueBands = bands.slice(0,6).map(e=>({ cls:(typeof e.className==='string'?e.className:'').slice(0,110), bg:hx(cs(e).backgroundColor), box:`${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`, pad:cs(e).padding }));

    g('newsletterWrap', '[class*="hs_cos"], .newsletter, [id*="hbspt"], [class*="subscribe"]');
    // find band by text
    const nlEl = [...document.querySelectorAll('div,section')].find(e => (e.innerText||'').startsWith('Stay Up to Date'));
    if (nlEl) { const s=cs(nlEl), b=nlEl.getBoundingClientRect(); o.newsletterBand = { cls:(typeof nlEl.className==='string'?nlEl.className:''), bg:hx(s.backgroundColor), box:`${Math.round(b.width)}x${Math.round(b.height)}`, pad:s.padding, disp:s.display };
      const h = nlEl.querySelector('h2,h3,h4,span,p,div'); if(h){const hs=cs(h); o.newsletterHeading={text:(h.innerText||'').slice(0,50), font:`${hs.fontFamily.split(',')[0]} ${hs.fontSize}/${hs.lineHeight} w${hs.fontWeight} ls:${hs.letterSpacing}`, color:hx(hs.color)};} }

    // flip card front/back
    g('flipCard', '.flip-card');
    g('flipFront', '.flip-card-front');
    g('flipInner', '.flip-card-inner');
    g('cardBottom', '.card-bottom');
    const fF = document.querySelector('.flip-card-front'); if (fF) { const t = fF.querySelector('h3,h4,p,div,span'); if(t){const s=cs(t); o.flipFrontText={text:(t.innerText||'').replace(/\s+/g,' ').slice(0,60), font:`${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ls:${s.letterSpacing} ${s.textTransform}`, color:hx(s.color)};} }
    const num = document.querySelector('.flip-card [class*="absolute"], .flip-card-front > :first-child');
    if (num) { const s=cs(num); o.flipNumber = { text:(num.innerText||'').slice(0,10), cls:(typeof num.className==='string'?num.className:'').slice(0,110), bg:hx(s.backgroundColor), color:hx(s.color), font:`${s.fontFamily.split(',')[0]} ${s.fontSize} w${s.fontWeight}`, box:`${Math.round(num.getBoundingClientRect().width)}x${Math.round(num.getBoundingClientRect().height)}`, r:s.borderRadius }; }

    // more-link
    g('moreLink', '.more-link');
    // section nav in hero
    g('sectionNavLink', '.section-nav-link');
    // trusted-by cert box
    const cert = [...document.querySelectorAll('div')].find(e=>(e.innerText||'').includes('*Please note that each of our locations'));
    if (cert) { const s=cs(cert); o.certBox = { cls:(typeof cert.className==='string'?cert.className:'').slice(0,110), bg:hx(s.backgroundColor), pad:s.padding, r:s.borderRadius, box:`${Math.round(cert.getBoundingClientRect().width)}x${Math.round(cert.getBoundingClientRect().height)}` }; }

    // comparison table header
    g('compareHeader', '.bg-brand-primary-1.text-white.uppercase');
    // pattern bg
    g('pattern', '.bg-uptive-pattern');

    // list bullets
    const li = document.querySelector('.prose ul li'); if (li) { const s=cs(li); const ms=cs(li,'::marker'); o.listItem={font:`${s.fontSize}/${s.lineHeight}`, pad:s.padding, marginLeft:s.marginLeft, markerColor:'#8dc6e8 (from CSS)', listStyle:s.listStyleType}; }

    // breakpoint check of container widths
    o.pContainer = (()=>{ const e=document.querySelector('.p-container'); const s=cs(e); return { maxWidth:s.maxWidth, padding:s.padding, margin:s.margin, width:Math.round(e.getBoundingClientRect().width) }; })();

    // link color in prose
    const pl = document.querySelector('.prose a'); if (pl){const s=cs(pl); o.proseLink={color:hx(s.color), deco:s.textDecorationLine, weight:s.fontWeight};}

    // header on scroll behaviour
    window.scrollTo(0, 1200);
    return o;
  });
  await page.waitForTimeout(800);
  const scrolled = await page.evaluate(() => {
    const h = document.querySelector('#site-header'); const s = getComputedStyle(h); const b = h.getBoundingClientRect();
    const banner = document.querySelector('#announcment-banner');
    return { headerHeightAfterScroll: Math.round(b.height), headerTop: Math.round(b.top), bg: s.backgroundColor, shadow: s.boxShadow,
      bannerDisplay: banner ? getComputedStyle(banner).display : 'none', bannerH: banner ? Math.round(banner.getBoundingClientRect().height) : 0,
      headerClasses: h.className };
  });
  fs.writeFileSync(__dirname + '/measure2.json', JSON.stringify({ ...r, scrolled }, null, 2));
  console.log(JSON.stringify({ ...r, scrolled }, null, 2));
  await browser.close();
})();
