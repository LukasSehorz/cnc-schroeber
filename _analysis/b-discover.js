const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await ctx.newPage();

  const scripts = [];
  page.on('response', r => {
    const u = r.url();
    if (/\.js(\?|$)/i.test(u) || /\.css(\?|$)/i.test(u) || /\.(mp4|webm|woff2?)(\?|$)/i.test(u)) {
      scripts.push({ url: u, status: r.status(), type: (r.headers()['content-type']||'').split(';')[0] });
    }
  });

  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);

  const info = await page.evaluate(() => {
    const out = {};
    out.title = document.title;
    out.generator = (document.querySelector('meta[name=generator]')||{}).content || null;
    out.htmlClass = document.documentElement.className;
    out.bodyClass = document.body.className;
    out.docHeight = document.documentElement.scrollHeight;
    out.vh = innerHeight; out.vw = innerWidth;

    // libraries on window
    const libs = {};
    ['gsap','ScrollTrigger','ScrollSmoother','Lenis','lenis','locomotive','LocomotiveScroll','barba','Swiper','THREE','SplitType','SplitText','Alpine','React','__NEXT_DATA__','__NUXT__','Webflow','$','jQuery','Framer','motion','ScrollMagic','anime','Rellax','AOS','matter','lottie'].forEach(k => {
      try { libs[k] = typeof window[k] !== 'undefined' ? (typeof window[k]) : false; } catch(e){ libs[k]='err'; }
    });
    try { if (window.gsap) { libs.gsapVersion = window.gsap.version; libs.gsapPlugins = Object.keys(window.gsap.plugins||{}); } } catch(e){}
    try { if (window.ScrollTrigger) { libs.stVersion = window.ScrollTrigger.version; } } catch(e){}
    try { if (window.gsap && window.gsap.globalTimeline) { libs.gsapTweenCount = window.gsap.globalTimeline.getChildren(true,true,true).length; } } catch(e){}
    out.libs = libs;

    out.scriptSrcs = [...document.querySelectorAll('script[src]')].map(s => s.src);
    out.inlineScriptHeads = [...document.querySelectorAll('script:not([src])')].map(s => (s.textContent||'').slice(0,300));
    out.styleLinks = [...document.querySelectorAll('link[rel=stylesheet]')].map(l => l.href);

    // Find any element whose trimmed text is exactly BARRIER-ish
    const cands = [];
    document.querySelectorAll('*').forEach(el => {
      const t = (el.textContent||'').trim();
      if (/^barrier$/i.test(t) && el.children.length <= 3) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        cands.push({
          tag: el.tagName, cls: el.className && el.className.toString ? el.className.toString().slice(0,120) : '', id: el.id,
          text: t, rect: {w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left)},
          fontSize: cs.fontSize, fontFamily: cs.fontFamily, position: cs.position,
          path: (function(e){ const p=[]; while(e && e.tagName && p.length<8){ p.unshift(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&e.className.toString?'.'+e.className.toString().trim().split(/\s+/).slice(0,3).join('.'):'')); e=e.parentElement;} return p.join(' > ');})(el)
        });
      }
    });
    out.barrierTextCands = cands;

    // SVGs
    out.svgs = [...document.querySelectorAll('svg')].map(s => {
      const r = s.getBoundingClientRect();
      return { cls: (s.getAttribute('class')||''), vb: s.getAttribute('viewBox'), w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left), parentCls: (s.parentElement && s.parentElement.className||'').toString().slice(0,120), inner: (s.innerHTML||'').slice(0,160) };
    }).filter(s => s.w > 0);

    // videos
    out.videos = [...document.querySelectorAll('video')].map(v => {
      const r = v.getBoundingClientRect(); const cs = getComputedStyle(v);
      return { src: v.currentSrc || v.src || [...v.querySelectorAll('source')].map(s=>s.src).join(','), w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), position: cs.position, objectFit: cs.objectFit, parentPos: v.parentElement?getComputedStyle(v.parentElement).position:null };
    });

    // header / nav
    out.headers = [...document.querySelectorAll('header, nav, [class*=header], [class*=Header], [class*=nav], [class*=Nav]')].slice(0,20).map(h => {
      const r = h.getBoundingClientRect(); const cs = getComputedStyle(h);
      return { tag: h.tagName, cls: (h.className||'').toString().slice(0,140), rect:{w:Math.round(r.width),h:Math.round(r.height),t:Math.round(r.top),l:Math.round(r.left)}, position: cs.position, zIndex: cs.zIndex, bg: cs.backgroundColor, backdrop: cs.backdropFilter, mixBlend: cs.mixBlendMode };
    });

    // sticky/fixed elements
    out.stickyFixed = [];
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.position === 'sticky' || cs.position === 'fixed') {
        const r = el.getBoundingClientRect();
        out.stickyFixed.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,120), position: cs.position, top: cs.top, zIndex: cs.zIndex, w: Math.round(r.width), h: Math.round(r.height), rt: Math.round(r.top) });
      }
    });

    // full body structure, 3 levels
    function tree(el, d, max) {
      if (d > max) return null;
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(), id: el.id||undefined,
        cls: (el.className && el.className.toString ? el.className.toString().trim().slice(0,150) : '') || undefined,
        rect: `${Math.round(r.width)}x${Math.round(r.height)} @${Math.round(r.left)},${Math.round(r.top)}`,
        pos: cs.position !== 'static' ? cs.position : undefined,
        txt: el.children.length === 0 ? (el.textContent||'').trim().slice(0,60) : undefined,
        kids: d < max ? [...el.children].map(c => tree(c, d+1, max)).filter(Boolean) : undefined
      };
    }
    out.tree = tree(document.body, 0, 5);
    return out;
  });

  fs.writeFileSync(__dirname + '/b-discover.json', JSON.stringify({ info, network: scripts }, null, 2));
  console.log('TITLE:', info.title, '| gen:', info.generator, '| docH:', info.docHeight);
  console.log('LIBS:', JSON.stringify(info.libs));
  console.log('SCRIPTS:'); info.scriptSrcs.forEach(s => console.log('  ', s));
  console.log('CSS:'); info.styleLinks.forEach(s => console.log('  ', s));
  console.log('BARRIER TEXT CANDS:', JSON.stringify(info.barrierTextCands, null, 1));
  console.log('SVGS:', JSON.stringify(info.svgs, null, 1));
  console.log('VIDEOS:', JSON.stringify(info.videos, null, 1));
  console.log('HEADERS:', JSON.stringify(info.headers, null, 1));
  console.log('STICKY/FIXED:', JSON.stringify(info.stickyFixed, null, 1));

  await browser.close();
})();
