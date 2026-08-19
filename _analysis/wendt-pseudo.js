const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ headless: true });
  const c = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto("https://www.wendt-maschinenbau.de/ueber-uns/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const btn = p.getByRole("button", { name: /^\s*Alle akzeptieren\s*$/i }).first();
  if (await btn.isVisible({ timeout: 800 }).catch(() => 0)) { await btn.click().catch(() => {}); await p.waitForTimeout(800); }

  const r = await p.evaluate(() => {
    function g(sel, pseudo) {
      const e = document.querySelector(sel);
      if (!e) return "MISSING " + sel;
      const cs = getComputedStyle(e, pseudo || null);
      const bb = e.getBoundingClientRect();
      const o = {
        w: cs.width, h: cs.height, top: cs.top, left: cs.left, right: cs.right, bottom: cs.bottom,
        bg: cs.backgroundColor, blend: cs.mixBlendMode, z: cs.zIndex, pos: cs.position,
        bL: cs.borderLeftWidth + " " + cs.borderLeftColor,
        bR: cs.borderRightWidth + " " + cs.borderRightColor,
        pad: cs.padding, mar: cs.margin, fs: cs.fontSize, content: cs.content,
      };
      if (!pseudo) o.box = { y: Math.round(bb.top + scrollY), h: Math.round(bb.height), w: Math.round(bb.width), x: Math.round(bb.left) };
      return o;
    }
    const cs = getComputedStyle(document.documentElement);
    return {
      root: { fs: cs.fontSize, rv: cs.getPropertyValue("--referenceValue"), rl: cs.getPropertyValue("--referenceLine") },
      introInner: g("#item-66 .inner"),
      introPlate: g("#item-66 .inner", "::before"),
      heroCap: g("figure.banner figcaption"),
      heroCapBar: g("figure.banner figcaption", "::before"),
      cardInner: g("#item-72 .inner"),
      cardPlate: g("#item-72 .inner", "::before"),
      cardBody: g("#item-72 .bodytext"),
      cardBar: g("#item-72 .bodytext", "::before"),
      picLeft: g("#item-206 .image.left"),
      picAfter: g("#item-206 .image.left", "::after"),
      picBody: g("#item-206 .bodytext"),
      ctaFrame: g("#item-465"),
      ctaAfter: g("#item-465", "::after"),
      ctaBefore: g("#item-465", "::before"),
      formFrame: g("#item-467"),
      formBefore: g("#item-467", "::before"),
      formAfter: g("#item-467", "::after"),
      formInner: g("#item-467 .inner"),
      formInnerAfter: g("#item-467 .inner", "::after"),
      mainAfter: g("main.page-main", "::after"),
      logo: g("#logo"),
      logoAfter: g("#logo", "::after"),
      h1intro: g("#item-66 h1"),
      navRight: g("nav#mainNavigation"),
      socialsUl: g("header .socials"),
      socialLi: g("header .socials li"),
    };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
