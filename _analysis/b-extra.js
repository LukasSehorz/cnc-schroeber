const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'shots', 'barrier');

(async () => {
  const browser = await chromium.launch();

  // ---------- 1. MID-TWEEN FRAMES @1440 ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
    await page.waitForTimeout(4500);
    // freeze video for repeatable frames
    await page.evaluate(() => { const v = document.querySelector('video'); if (v) { v.pause(); v.currentTime = 2; } });

    // fire the transition, then screenshot at intervals
    await page.evaluate(() => { window.__t0 = performance.now(); if (window.lenis) window.lenis.scrollTo(200, { immediate: true, force: true }); else window.scrollTo(0, 200); });
    const marks = [0, 80, 160, 240, 320, 400, 480, 560, 700];
    let prev = 0;
    for (const ms of marks) {
      const wait = ms - prev; prev = ms;
      if (wait > 0) await page.waitForTimeout(wait);
      const st = await page.evaluate(() => { const l = document.querySelector('.header__logo'); const r = l.getBoundingClientRect(); return { t: +(performance.now() - window.__t0).toFixed(0), w: +r.width.toFixed(0), top: +r.top.toFixed(0), hdr: getComputedStyle(document.querySelector('.header')).top }; });
      await page.screenshot({ path: path.join(OUT, `barrier-tween-${String(ms).padStart(3, '0')}ms.png`) });
      console.log(`tween ${String(ms).padStart(3)}ms -> actual ${st.t}ms  logoW=${st.w}  logoTop=${st.top}  headerTop=${st.hdr}`);
    }
    await ctx.close();
  }

  // ---------- 2. MOBILE 390x844 ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    const page = await ctx.newPage();
    await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
    await page.waitForTimeout(4500);
    const m = await page.evaluate(() => {
      const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), t: +r.top.toFixed(1), l: +r.left.toFixed(1) }; };
      const CS = (el, p) => { const c = getComputedStyle(el); const o = {}; p.forEach(k => o[k] = c[k]); return o; };
      const hero = document.querySelector('.primary-hero'); const hcon = hero.querySelector('.primary-hero__container');
      const logo = document.querySelector('.header__logo'); const hcont = document.querySelector('.header__container');
      const h1 = hero.querySelector('h1');
      const spacer = parseFloat(getComputedStyle(hcon).paddingTop) / 1.5;
      return {
        vw: innerWidth, vh: innerHeight,
        header: { rect: R(document.querySelector('.header')), cs: CS(document.querySelector('.header'), ['position','top','height','paddingTop','paddingBottom','backgroundColor']) },
        logo: { rect: R(logo), inline: logo.getAttribute('style'), cs: CS(logo, ['position','top','left','width','transform']) },
        h1: { rect: R(h1), cs: CS(h1, ['fontSize','lineHeight','letterSpacing','marginBottom','fontWeight']) },
        desc: { rect: R(hero.querySelector('.primary-hero__description')), cs: CS(hero.querySelector('.primary-hero__description'), ['fontSize','maxWidth']) },
        btn: { rect: R(hero.querySelector('.primary-hero__button a')) },
        hamburger: { rect: R(document.querySelector('.header__hamburger')), cs: CS(document.querySelector('.header__hamburger'), ['display','width','height','backgroundColor']) },
        navUl: CS(document.querySelector('.barrier-navigation.header__navigation'), ['display']),
        subtextSpan: CS(document.querySelector('.header__logo__subtext span'), ['fontSize','letterSpacing']),
        heroCont: { rect: R(hcon), cs: CS(hcon, ['paddingTop','paddingLeft','maxWidth']) },
        header_container_offsetWidth: hcont.offsetWidth,
        primary_hero_container_offsetWidth: hcon.offsetWidth,
        scroll_range: h1.getBoundingClientRect().top + window.scrollY - logo.offsetHeight - spacer,
        heroCS: CS(hero, ['minHeight','paddingTop','paddingBottom'])
      };
    });
    console.log('\n### MOBILE 390x844 ###');
    console.log(JSON.stringify(m, null, 1));
    await page.screenshot({ path: path.join(OUT, 'barrier-mobile-390-scroll0.png') });
    await page.evaluate(() => { if (window.lenis) window.lenis.scrollTo(400, { immediate: true, force: true }); else window.scrollTo(0, 400); });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, 'barrier-mobile-390-scroll400.png') });
    const m2 = await page.evaluate(() => { const l = document.querySelector('.header__logo'); const r = l.getBoundingClientRect(); return { logoRect: { w: +r.width.toFixed(1), t: +r.top.toFixed(1), l: +r.left.toFixed(1) }, headerTop: getComputedStyle(document.querySelector('.header')).top, hamburgerVisible: getComputedStyle(document.querySelector('.header__hamburger')).display }; });
    console.log('mobile @400:', JSON.stringify(m2));
    await ctx.close();
  }

  // ---------- 3. 1920 hero shot + settled navbar shot ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(3000);
    await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
    await page.waitForTimeout(4500);
    await page.screenshot({ path: path.join(OUT, 'barrier-1920-hero.png') });
    // hover the LEARN MORE cta, capture before/after box position
    const before = await page.evaluate(() => { const b = document.querySelector('.primary-hero__button .barrier-box-title__box'); const t = document.querySelector('.primary-hero__button .barrier-box-title__title'); const cs = getComputedStyle(b); return { boxLeft: cs.left, boxW: cs.width, boxH: cs.height, boxBg: cs.backgroundColor, transition: cs.transition, titleLeft: getComputedStyle(t).left, titleCls: t.className.slice(0,300) }; });
    await page.hover('.primary-hero__button a');
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => { const b = document.querySelector('.primary-hero__button .barrier-box-title__box'); const t = document.querySelector('.primary-hero__button .barrier-box-title__title'); const cs = getComputedStyle(b); return { boxLeft: cs.left, boxW: cs.width, boxBg: cs.backgroundColor, titleLeft: getComputedStyle(t).left }; });
    console.log('\n### CTA HOVER (1920) ###'); console.log('before:', JSON.stringify(before)); console.log('after :', JSON.stringify(after));
    await ctx.close();
  }

  await browser.close();
})();
