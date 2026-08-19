const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'shots', 'barrier');
fs.mkdirSync(OUT, { recursive: true });

const MEASURE = () => {
  const q = s => document.querySelector(s);
  const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), t: +r.top.toFixed(1), l: +r.left.toFixed(1), b: +r.bottom.toFixed(1) }; };
  const C = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const o = {}; props.forEach(p => o[p] = cs[p]); return o; };

  const logo   = q('.header__logo');
  const header = q('.header');
  const hcont  = q('.header__container');
  const svg    = logo && logo.querySelector('svg');
  const sub    = q('.header__logo__subtext');
  const bg     = q('.header__logo__background');
  const hero   = q('.primary-hero');
  const hcon   = q('.primary-hero__container');
  const video  = q('video');
  const h1     = hero && hero.querySelector('h1');
  const nav    = q('.barrier-navigation.header__navigation');

  const P = ['position','top','left','width','height','opacity','transform','fontSize','zIndex','backgroundColor','color','transition','display','visibility'];
  return {
    scrollY: +window.scrollY.toFixed(1),
    dataPrimaryHero: header && header.getAttribute('data-primary-hero'),
    logo:      { rect: R(logo),   cs: C(logo, P),   inline: logo && logo.getAttribute('style') },
    svg:       { rect: R(svg),    cs: C(svg, ['width','height','transform','opacity']) },
    header:    { rect: R(header), cs: C(header, P) },
    hcont:     { rect: R(hcont) },
    subtext:   { rect: R(sub),    cs: C(sub, ['opacity','transform','display','fontSize','letterSpacing','color','fontWeight']), inline: sub && sub.getAttribute('style') },
    logoBg:    { rect: R(bg),     cs: C(bg, ['width','height','backgroundColor','position','top','left']), inline: bg && bg.getAttribute('style') },
    nav:       { rect: R(nav),    cs: C(nav, ['opacity','color','transform']) },
    hero:      { rect: R(hero),   cs: C(hero, ['position','paddingTop','minHeight','backgroundColor']) },
    heroCont:  { rect: R(hcon),   cs: C(hcon, ['paddingTop','paddingLeft','paddingRight','maxWidth','width']) },
    video:     { rect: R(video),  cs: C(video, ['position','top','left','width','height','objectFit','transform','opacity','filter']),
                 parentCs: video && video.parentElement ? C(video.parentElement, ['position','top','left','width','height','transform','zIndex']) : null,
                 parentRect: video ? R(video.parentElement) : null },
    h1:        { rect: R(h1) },
  };
};

(async () => {
  const args = process.argv.slice(2);
  const W = parseInt(args[0] || '1440', 10), H = parseInt(args[1] || '900', 10);
  const doShots = args[2] !== 'nomshots';
  const tag = `${W}x${H}`;

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);

  // kill cookie banner + recaptcha badge so shots are clean
  await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge,#cmplz-manage-consent{display:none!important}' });
  await page.waitForTimeout(4500); // let 1.2s intro + startAnimation settle

  // library detection
  const libs = await page.evaluate(() => {
    const found = {};
    ['gsap','ScrollTrigger','Motion','motion','Lenis','lenis','Swiper','jQuery','LocomotiveScroll','ScrollSmoother'].forEach(k => {
      try { found[k] = typeof window[k]; } catch(e) { found[k] = 'err'; }
    });
    if (window.Motion) found.MotionKeys = Object.keys(window.Motion).slice(0, 40);
    if (window.lenis) { try { found.lenisOpts = { duration: window.lenis.options && window.lenis.options.duration, smoothWheel: window.lenis.options && window.lenis.options.smoothWheel, lerp: window.lenis.options && window.lenis.options.lerp }; } catch(e){} }
    // native scroll-driven animation support usage
    let scrollTimelineUse = 0, viewTimelineUse = 0;
    for (const sh of document.styleSheets) {
      try { for (const r of sh.cssRules) { const t = r.cssText || ''; if (/animation-timeline/.test(t)) scrollTimelineUse++; if (/view-timeline|scroll-timeline/.test(t)) viewTimelineUse++; } } catch(e) {}
    }
    found.cssAnimationTimelineRules = scrollTimelineUse;
    found.cssViewScrollTimelineRules = viewTimelineUse;
    found.scriptSrcs = [...document.querySelectorAll('script[src]')].map(s => s.src);
    return found;
  });
  console.log('### LIBS ###');
  console.log(JSON.stringify(libs, null, 1));

  // internal JS state
  const heroConst = await page.evaluate(() => {
    const hero = document.querySelector('.primary-hero');
    const hcon = hero.querySelector('.primary-hero__container');
    const h1 = hero.querySelector('h1');
    const logo = document.querySelector('.header__logo');
    const hcont = document.querySelector('.header__container');
    const spacer = parseFloat(getComputedStyle(hcon).paddingTop) / 1.5;
    const scroll_range = h1.getBoundingClientRect().top + window.scrollY - logo.offsetHeight - spacer;
    return {
      header_container_offsetWidth: hcont.offsetWidth,
      primary_hero_container_offsetWidth: hcon.offsetWidth,
      widthFrom: hcont.offsetWidth,
      widthTo: hcon.offsetWidth - 50,
      logo_offsetHeight: logo.offsetHeight,
      hcon_paddingTop: getComputedStyle(hcon).paddingTop,
      spacer,
      h1_docTop: h1.getBoundingClientRect().top + window.scrollY,
      scroll_range,
      hero_offsetHeight: hero.offsetHeight,
      hero_paddingTop: getComputedStyle(hero).paddingTop,
      docHeight: document.documentElement.scrollHeight,
      vh: innerHeight
    };
  });
  console.log('### HERO CONSTANTS (' + tag + ') ###');
  console.log(JSON.stringify(heroConst, null, 1));

  const rows = [];
  for (let y = 0; y <= 1200; y += 60) {
    await page.evaluate((yy) => {
      if (window.lenis && window.lenis.scrollTo) window.lenis.scrollTo(yy, { immediate: true, force: true });
      else window.scrollTo(0, yy);
    }, y);
    await page.waitForTimeout(130);
    const m = await page.evaluate(MEASURE);
    rows.push(m);
    if (doShots) {
      const name = `barrier-scroll-${String(y).padStart(4, '0')}${W === 1440 ? '' : '-' + tag}.png`;
      await page.screenshot({ path: path.join(OUT, name) });
    }
  }

  fs.writeFileSync(path.join(__dirname, `b-scroll-${tag}.json`), JSON.stringify({ libs, heroConst, rows }, null, 2));

  const f = (v, d = 1) => v == null ? '-' : (typeof v === 'number' ? v.toFixed(d) : String(v));
  console.log('\n### SCROLL TABLE (' + tag + ') ###');
  console.log('scrollY | phero | logoW   logoH  logoT  logoL | logo.pos logo.top logo.tf | hdr.pos hdr.top hdr.rectT hdr.h | sub.op sub.tf | bg.w  bg.h | vid.t vid.h vid.pos vid.tf | h1.top');
  rows.forEach(r => {
    console.log([
      String(r.scrollY).padStart(6),
      String(r.dataPrimaryHero).padStart(5),
      f(r.logo.rect.w).padStart(7), f(r.logo.rect.h).padStart(6), f(r.logo.rect.t).padStart(6), f(r.logo.rect.l).padStart(6),
      (r.logo.cs.position + ' ' + r.logo.cs.top).padStart(16), (r.logo.cs.transform || '').slice(0, 30).padStart(30),
      (r.header.cs.position + ' ' + r.header.cs.top).padStart(12), f(r.header.rect.t).padStart(7), f(r.header.rect.h).padStart(5),
      f(parseFloat(r.subtext.cs.opacity), 2).padStart(5), (r.subtext.cs.transform || '').slice(0, 26).padStart(26),
      f(parseFloat(r.logoBg.cs.width)).padStart(6), f(parseFloat(r.logoBg.cs.height)).padStart(5),
      f(r.video.rect.t).padStart(6), f(r.video.rect.h).padStart(6), (r.video.cs.position).padStart(8), (r.video.cs.transform || '').slice(0, 22).padStart(22),
      f(r.h1.rect.t).padStart(7)
    ].join(' | '));
  });

  await browser.close();
})();
