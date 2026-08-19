const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'https://uptivemfg.com/';
const TAG = process.argv[3] || 'home';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  try { await page.goto(URL, { waitUntil: 'load', timeout: 45000 }); }
  catch(e){ await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 40000 }); }
  await page.waitForTimeout(3000);

  const res = await page.evaluate(() => {
    const cs = el => getComputedStyle(el);
    const hex = c => {
      if (!c || c === 'transparent') return c;
      const m = c.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?/);
      if (!m) return c;
      const h = '#' + [m[1],m[2],m[3]].map(x=>Math.round(+x).toString(16).padStart(2,'0')).join('');
      return (m[4] !== undefined && +m[4] < 1) ? h + ' a=' + m[4] : h;
    };
    const T = el => {
      if (!el) return null;
      const s = cs(el), r = el.getBoundingClientRect();
      return {
        sel: el.tagName.toLowerCase() + (el.id?'#'+el.id:'') + (el.className && typeof el.className==='string' ? '.'+el.className.trim().split(/\s+/).slice(0,6).join('.') : ''),
        text: (el.innerText||'').trim().replace(/\s+/g,' ').slice(0,70),
        fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
        lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform,
        color: hex(s.color), bg: hex(s.backgroundColor), bgImage: s.backgroundImage === 'none' ? null : s.backgroundImage.slice(0,140),
        padding: s.padding, margin: s.margin, borderRadius: s.borderRadius,
        border: s.borderTopWidth !== '0px' || s.borderBottomWidth !== '0px' || s.borderLeftWidth !== '0px' ? `${s.borderTopWidth} ${s.borderRightWidth} ${s.borderBottomWidth} ${s.borderLeftWidth} ${s.borderStyle} ${hex(s.borderTopColor)}` : null,
        boxShadow: s.boxShadow === 'none' ? null : s.boxShadow,
        display: s.display, gap: s.gap, gridCols: s.gridTemplateColumns,
        w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top + window.scrollY),
        maxWidth: s.maxWidth, position: s.position, textAlign: s.textAlign,
        objectFit: s.objectFit, aspectRatio: s.aspectRatio, overflow: s.overflow, opacity: s.opacity
      };
    };
    const q = s => T(document.querySelector(s));
    const qa = (s, n=6) => [...document.querySelectorAll(s)].slice(0, n).map(T);

    // --- SECTIONS: walk top-level children of main
    const main = document.querySelector('main') || document.body;
    const sections = [...main.children].map((el, i) => {
      const t = T(el);
      const inner = [...el.querySelectorAll('h1,h2,h3,.h2,.headline')].slice(0,4).map(h => ({ tag: h.tagName, text:(h.innerText||'').trim().replace(/\s+/g,' ').slice(0,80), size: cs(h).fontSize, weight: cs(h).fontWeight, color: hex(cs(h).color), lh: cs(h).lineHeight, ls: cs(h).letterSpacing, tt: cs(h).textTransform, ta: cs(h).textAlign, ff: cs(h).fontFamily.split(',')[0] }));
      const imgs = [...el.querySelectorAll('img')].slice(0,4).map(im => ({ w: Math.round(im.getBoundingClientRect().width), h: Math.round(im.getBoundingClientRect().height), r: cs(im).borderRadius, fit: cs(im).objectFit, src:(im.currentSrc||im.src||'').split('/').pop().slice(0,50) }));
      const grids = [...el.querySelectorAll('*')].filter(x => { const d = cs(x).display; return d==='grid'||d==='flex'; }).slice(0,5).map(g => ({ sel: g.tagName.toLowerCase()+'.'+(typeof g.className==='string'?g.className.trim().split(/\s+/).slice(0,5).join('.'):''), display: cs(g).display, cols: cs(g).gridTemplateColumns, gap: cs(g).gap, w: Math.round(g.getBoundingClientRect().width) }));
      return { i, ...t, headings: inner, images: imgs, flexgrids: grids, id: el.id, cls: (typeof el.className==='string'?el.className:'') };
    });

    // typographic probes
    const probe = {};
    const findByText = (tag, frag) => [...document.querySelectorAll(tag)].find(e => (e.innerText||'').includes(frag));
    probe.html = T(document.documentElement);
    probe.body = T(document.body);
    probe.h1 = q('h1');
    probe.h2s = qa('h2, .h2', 5);
    probe.h3s = qa('h3, .h3', 5);
    probe.h4s = qa('h4', 3);
    probe.p = qa('main p', 5);
    probe.li = qa('main li', 3);
    probe.smalls = qa('small, .text-sm, figcaption', 3);
    probe.btn = qa('.btn', 5);
    probe.btnArrow = q('.btn .btn-arrow');
    probe.navLink = qa('#nav .nav-link.lv-1', 3);
    probe.header = q('#site-header');
    probe.headerInner = q('#site-header > *');
    probe.topbar = T(document.querySelector('#site-header')?.previousElementSibling) || q('.top-bar, #top-bar');
    probe.logo = q('#site-logo');
    probe.hero = q('#hero');
    probe.heroContent = q('#hero .hero-content, #hero .container');
    probe.heroCopy = q('#hero-copy');
    probe.footer = q('footer');
    probe.footerNav = q('#footer-nav');
    probe.footerNavA = q('#footer-nav > * > * > a');
    probe.footerSubA = q('#footer-nav .sub-menu a');
    probe.containers = qa('.container', 4);
    probe.inputs = qa('input[type=text], input[type=email], input:not([type=hidden]), textarea', 4);
    probe.cards = qa('.flip-card, .card, [class*="card"]', 4);
    probe.eyebrow = qa('.eyebrow, .kicker, [class*="uppercase"]', 5);

    // header stack heights
    const hdr = document.querySelector('#site-header');
    probe.headerBox = hdr ? { h: hdr.getBoundingClientRect().height, bg: hex(cs(hdr).backgroundColor), pos: cs(hdr).position, border: cs(hdr).borderBottom, shadow: cs(hdr).boxShadow, z: cs(hdr).zIndex } : null;

    // all distinct section background colors + heights, in order
    const sectionBgs = sections.map(s => ({ i: s.i, id: s.id, cls: s.cls.slice(0,90), bg: s.bg, bgImg: s.bgImage, h: s.h, pad: s.padding, y: s.y }));

    return { probe, sections, sectionBgs, docHeight: document.body.scrollHeight, title: document.title };
  });

  fs.writeFileSync(__dirname + '/measure-' + TAG + '.json', JSON.stringify(res, null, 2));
  console.log('== ' + TAG + ' == docHeight ' + res.docHeight);
  console.log(JSON.stringify(res.sectionBgs, null, 1));
  await browser.close();
})();
