const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const W = parseInt(process.argv[2] || '1440', 10), H = parseInt(process.argv[3] || '900', 10);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
  await page.waitForTimeout(4500);

  // Sample logo/header every animation frame while triggering the transition
  const trace = await page.evaluate(() => new Promise(resolve => {
    const logo = document.querySelector('.header__logo');
    const header = document.querySelector('.header');
    const sub = document.querySelector('.header__logo__subtext');
    const bg = document.querySelector('.header__logo__background');
    const samples = [];
    const t0 = performance.now();
    function tick() {
      const lr = logo.getBoundingClientRect(), hr = header.getBoundingClientRect();
      samples.push({
        t: +(performance.now() - t0).toFixed(1),
        sy: +window.scrollY.toFixed(1),
        lw: +lr.width.toFixed(2), lt: +lr.top.toFixed(2), ll: +lr.left.toFixed(2),
        logoTopCss: getComputedStyle(logo).top,
        hdrTop: getComputedStyle(header).top,
        subOp: getComputedStyle(sub).opacity, subTf: getComputedStyle(sub).transform,
        bgW: getComputedStyle(bg).width, bgH: getComputedStyle(bg).height,
        inline: logo.getAttribute('style')
      });
      if (performance.now() - t0 < 1400) requestAnimationFrame(tick);
      else resolve(samples);
    }
    // jump just past scroll_range to fire showNavigation()
    if (window.lenis) window.lenis.scrollTo(200, { immediate: true, force: true }); else window.scrollTo(0, 200);
    requestAnimationFrame(tick);
  }));

  fs.writeFileSync(__dirname + `/b-tween-${W}.json`, JSON.stringify(trace, null, 1));
  console.log(`### FORWARD TWEEN (showNavigation) @ ${W}x${H} — jump to scrollY 200 ###`);
  console.log('t(ms)  scrollY  logoW    logoTop  logoLeft  logo.css.top  hdr.css.top  sub.opacity  sub.transform            bg.w x bg.h');
  trace.filter((s, i) => i % 2 === 0 || s.t < 60).forEach(s => {
    console.log([String(s.t).padStart(6), String(s.sy).padStart(7), String(s.lw).padStart(8), String(s.lt).padStart(8), String(s.ll).padStart(8),
      s.logoTopCss.padStart(12), s.hdrTop.padStart(12), s.subOp.padStart(11), (s.subTf||'').slice(0,26).padStart(26), (s.bgW + ' x ' + s.bgH).padStart(16)].join(' '));
  });

  // now the REVERSE (resetLogo) -- scroll back to 0
  const trace2 = await page.evaluate(() => new Promise(resolve => {
    const logo = document.querySelector('.header__logo');
    const header = document.querySelector('.header');
    const sub = document.querySelector('.header__logo__subtext');
    const samples = [];
    const t0 = performance.now();
    function tick() {
      const lr = logo.getBoundingClientRect();
      samples.push({ t: +(performance.now() - t0).toFixed(1), sy: +window.scrollY.toFixed(1),
        lw: +lr.width.toFixed(2), lt: +lr.top.toFixed(2),
        logoTopCss: getComputedStyle(logo).top, hdrTop: getComputedStyle(header).top,
        subOp: getComputedStyle(sub).opacity });
      if (performance.now() - t0 < 1000) requestAnimationFrame(tick); else resolve(samples);
    }
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0);
    requestAnimationFrame(tick);
  }));
  console.log(`\n### REVERSE TWEEN (resetLogo) — jump back to scrollY 0 ###`);
  console.log('t(ms)  scrollY  logoW    logoTop  logo.css.top  hdr.css.top  sub.opacity');
  trace2.filter((s,i)=>i%3===0).forEach(s => console.log([String(s.t).padStart(6), String(s.sy).padStart(7), String(s.lw).padStart(8), String(s.lt).padStart(8), s.logoTopCss.padStart(12), s.hdrTop.padStart(12), s.subOp.padStart(11)].join(' ')));
  fs.writeFileSync(__dirname + `/b-tween-rev-${W}.json`, JSON.stringify(trace2, null, 1));

  await browser.close();
})();
