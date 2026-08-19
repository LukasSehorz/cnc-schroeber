const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = "https://www.wendt-maschinenbau.de/ueber-uns/";
const OUT = __dirname;

async function killCookies(page) {
  for (const t of ["Alle akzeptieren", "Akzeptieren"]) {
    try {
      const btn = page.getByRole("button", { name: new RegExp("^\\s*" + t + "\\s*$", "i") }).first();
      if (await btn.isVisible({ timeout: 700 }).catch(() => false)) {
        await btn.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(700);
      }
    } catch (e) {}
  }
}
async function prep(page) {
  await page.goto(URL, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(2500);
  await killCookies(page);
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
    window.scrollTo(0, h()); await new Promise(r => setTimeout(r, 900));
    window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 700));
  });
  await page.waitForTimeout(1000);
}

const TREE_FN = function (rootSel) {
  const px = v => Math.round(parseFloat(v) * 100) / 100;
  const root = document.querySelector(rootSel);
  if (!root) return null;
  const lines = [];
  function line(el, d) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").replace(/\s+/g, " ");
    const bits = [];
    bits.push("  ".repeat(d) + el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
      (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).join(".") : ""));
    bits.push(`box[y${Math.round(r.top + scrollY)}..${Math.round(r.bottom + scrollY)} h${Math.round(r.height)} w${Math.round(r.width)} x${Math.round(r.left)}]`);
    bits.push(`disp:${cs.display}`);
    if (cs.position !== "static") bits.push(`pos:${cs.position}(t${cs.top} r${cs.right} b${cs.bottom} l${cs.left} z${cs.zIndex})`);
    if (cs.gridTemplateColumns !== "none") bits.push(`cols[${cs.gridTemplateColumns}]`);
    if (cs.gap && cs.gap !== "normal") bits.push(`gap:${cs.gap}`);
    if (cs.flexDirection !== "row" && cs.display.includes("flex")) bits.push(`fdir:${cs.flexDirection}`);
    if (cs.alignItems !== "normal") bits.push(`ai:${cs.alignItems}`);
    if (cs.justifyContent !== "normal") bits.push(`jc:${cs.justifyContent}`);
    if (cs.gridColumn !== "auto") bits.push(`gcol:${cs.gridColumn}`);
    const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px);
    if (pad.some(v => v)) bits.push(`pad:${pad.join("/")}`);
    const mar = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].map(px);
    if (mar.some(v => v)) bits.push(`mar:${mar.join("/")}`);
    if (cs.backgroundColor !== "rgba(0, 0, 0, 0)") bits.push(`bg:${cs.backgroundColor}`);
    if (cs.backgroundImage !== "none") bits.push(`bgimg:${cs.backgroundImage.slice(0, 70)}`);
    if (cs.maxWidth !== "none") bits.push(`maxW:${cs.maxWidth}`);
    if (cs.width !== "auto" && el.style.width) bits.push(`cssW:${cs.width}`);
    if (cs.aspectRatio !== "auto") bits.push(`ar:${cs.aspectRatio}`);
    if (cs.objectFit && el.tagName === "IMG") bits.push(`fit:${cs.objectFit}`);
    if (cs.borderTopWidth !== "0px" || cs.borderLeftWidth !== "0px" || cs.borderBottomWidth !== "0px" || cs.borderRightWidth !== "0px")
      bits.push(`bord:${cs.borderTopWidth}/${cs.borderRightWidth}/${cs.borderBottomWidth}/${cs.borderLeftWidth} ${cs.borderTopColor}`);
    if (cs.borderRadius !== "0px") bits.push(`radius:${cs.borderRadius}`);
    if (cs.boxShadow !== "none") bits.push(`shadow:${cs.boxShadow.slice(0, 60)}`);
    if (cs.opacity !== "1") bits.push(`op:${cs.opacity}`);
    if (cs.transform !== "none") bits.push(`tf:${cs.transform}`);
    if (cs.mixBlendMode !== "normal") bits.push(`blend:${cs.mixBlendMode}`);
    if (cs.transitionDuration !== "0s") bits.push(`trans:${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction} ${cs.transitionDelay}`);
    if (cs.animationName !== "none") bits.push(`anim:${cs.animationName} ${cs.animationDuration} ${cs.animationTimingFunction}`);
    if (own) bits.push(`FONT[${cs.fontSize}/${cs.fontWeight}/${cs.lineHeight}/ls${cs.letterSpacing}/${cs.color}/${cs.fontFamily.split(",")[0].replace(/["']/g, "")}${cs.textTransform !== "none" ? "/" + cs.textTransform : ""}]`);
    if (own) bits.push(`TXT:"${own.slice(0, 80)}"`);
    if (el.tagName === "IMG") bits.push(`SRC:${(el.currentSrc || el.src || "").split("/").pop().slice(0, 60)} nat:${el.naturalWidth}x${el.naturalHeight}`);
    for (const a of el.attributes) if (a.name.startsWith("data-")) bits.push(`@${a.name}=${a.value.slice(0, 40)}`);
    lines.push(bits.join(" "));
  }
  function walk(el, d) {
    if (d > 8) return;
    for (const c of el.children) {
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(c.tagName)) continue;
      line(c, d);
      if (c.tagName !== "SVG" && c.tagName !== "svg") walk(c, d + 1);
    }
  }
  line(root, 0);
  walk(root, 1);
  return lines.join("\n");
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = {};

  // ================= DESKTOP 1440 =================
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "de-DE" });
  const page = await ctx.newPage();
  await prep(page);

  const targets = [
    ["HEADER", "header.page-header"],
    ["HERO_BANNER", "figure.image.cover.banner"],
    ["S1_TEXTTEASER", "#item-66"],
    ["S2_TEXTPIC50", "#item-206"],
    ["S3_CARD_A", "#item-72"],
    ["S3_CARD_B", "#item-73"],
    ["S3_CARD_C", "#item-74"],
    ["S4_CTA_TEASER", "#item-465"],
    ["S4_FORM", "#item-467"],
    ["FOOTER", "footer.page-footer"],
  ];
  const trees = {};
  for (const [name, sel] of targets) {
    trees[name] = await page.evaluate(TREE_FN, sel);
  }
  fs.writeFileSync(path.join(OUT, "wendt-trees-1440.txt"),
    Object.entries(trees).map(([k, v]) => "\n\n===================== " + k + " =====================\n" + (v || "NOT FOUND")).join(""), "utf8");

  // Grid / rhythm measurements
  report.grid1440 = await page.evaluate(() => {
    const g = document.querySelector("main section.grid");
    const cs = getComputedStyle(g);
    const r = g.getBoundingClientRect();
    const pw = document.querySelector(".page-wrapper");
    const pcs = getComputedStyle(pw);
    const items = Array.from(g.children).map(c => {
      const cr = c.getBoundingClientRect();
      const ccs = getComputedStyle(c);
      return {
        id: c.id, cls: c.className,
        y: Math.round(cr.top + scrollY), y2: Math.round(cr.bottom + scrollY),
        h: Math.round(cr.height), w: Math.round(cr.width), x: Math.round(cr.left),
        gcol: ccs.gridColumn, mt: ccs.marginTop, mb: ccs.marginBottom,
        pt: ccs.paddingTop, pb: ccs.paddingBottom, pl: ccs.paddingLeft, pr: ccs.paddingRight,
      };
    });
    return {
      docW: document.documentElement.clientWidth,
      scrollH: document.documentElement.scrollHeight,
      bodyScrollW: document.body.scrollWidth,
      pageWrapper: { maxW: pcs.maxWidth, w: Math.round(pw.getBoundingClientRect().width), ml: pcs.marginLeft, mr: pcs.marginRight, ov: pcs.overflow, ovx: pcs.overflowX },
      section: {
        w: Math.round(r.width), x: Math.round(r.left),
        cols: cs.gridTemplateColumns, gap: cs.gap, rowGap: cs.rowGap, colGap: cs.columnGap,
        ml: cs.marginLeft, mr: cs.marginRight, pl: cs.paddingLeft, pr: cs.paddingRight,
      },
      items,
    };
  });

  // spacing utility classes from CSS
  report.spaceRules = await page.evaluate(() => {
    const out = [];
    for (const sh of document.styleSheets) {
      let rules;
      try { rules = sh.cssRules; } catch (e) { continue; }
      if (!rules) continue;
      const scan = (rl, media) => {
        for (const r of rl) {
          if (r.type === 4) { scan(r.cssRules, r.conditionText); continue; }
          if (r.type !== 1) continue;
          const s = r.selectorText || "";
          if (/frame-space|\.grid|\.col-|page-wrapper|\.frame-indented|--reference|\.inner|\.banner|\.image-left|\.image-right/.test(s)) {
            out.push((media ? "@media " + media + " { " : "") + s + " { " + r.style.cssText + " }" + (media ? " }" : ""));
          }
        }
      };
      scan(rules, null);
    }
    return out;
  });

  // typography sample per section
  report.typoBySection = await page.evaluate(() => {
    const secs = [
      ["HERO", "figure.banner"],
      ["S1", "#item-66"],
      ["S2", "#item-206"],
      ["S3a", "#item-72"],
      ["S4cta", "#item-465"],
      ["S4form", "#item-467"],
      ["FOOTER", "footer.page-footer"],
      ["NAV", "header.page-header"],
    ];
    const res = {};
    for (const [k, sel] of secs) {
      const root = document.querySelector(sel);
      if (!root) continue;
      const arr = [];
      root.querySelectorAll("*").forEach(el => {
        const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
        if (!own) return;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        arr.push({
          role: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/)[0] : ""),
          fs: cs.fontSize, fw: cs.fontWeight, lh: cs.lineHeight, ls: cs.letterSpacing,
          tt: cs.textTransform, color: cs.color, ff: cs.fontFamily.split(",")[0].replace(/["']/g, ""),
          w: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top + scrollY),
          txt: own.replace(/\s+/g, " ").slice(0, 55),
        });
      });
      res[k] = arr;
    }
    return res;
  });

  // fonts loaded
  report.fonts = await page.evaluate(() => {
    const out = new Set();
    document.fonts.forEach(f => out.add(`${f.family} ${f.weight} ${f.style} ${f.status}`));
    return [...out];
  });

  // ---- scroll animation probe: watch class/style mutations while scrolling ----
  report.scrollMutations = await page.evaluate(async () => {
    const log = [];
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        const el = m.target;
        const cn = typeof el.className === "string" ? el.className : "";
        log.push({
          attr: m.attributeName,
          tag: el.tagName.toLowerCase(),
          cls: cn.slice(0, 90),
          old: (m.oldValue || "").slice(0, 90),
          now: (m.attributeName === "class" ? cn : el.getAttribute(m.attributeName) || "").slice(0, 120),
        });
      });
    });
    obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "style"], attributeOldValue: true });
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
    for (let y = 0; y < document.documentElement.scrollHeight; y += 200) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    await new Promise(r => setTimeout(r, 600));
    obs.disconnect();
    window.scrollTo(0, 0);
    // dedupe
    const seen = new Set(); const out = [];
    for (const l of log) { const k = l.tag + "|" + l.attr + "|" + l.old + "|" + l.now; if (seen.has(k)) continue; seen.add(k); out.push(l); }
    return out.slice(0, 100);
  });

  await page.waitForTimeout(500);

  // ================= DESKTOP 1920 (gutter check) =================
  const ctx19 = await browser.newContext({ viewport: { width: 1920, height: 1000 }, locale: "de-DE" });
  const p19 = await ctx19.newPage();
  await prep(p19);
  report.grid1920 = await p19.evaluate(() => {
    const pw = document.querySelector(".page-wrapper");
    const g = document.querySelector("main section.grid");
    const cs = getComputedStyle(g);
    return {
      docW: document.documentElement.clientWidth,
      pw: { w: Math.round(pw.getBoundingClientRect().width), x: Math.round(pw.getBoundingClientRect().left), maxW: getComputedStyle(pw).maxWidth },
      sec: { w: Math.round(g.getBoundingClientRect().width), x: Math.round(g.getBoundingClientRect().left), cols: cs.gridTemplateColumns, gap: cs.gap, ml: cs.marginLeft },
      scrollH: document.documentElement.scrollHeight,
    };
  });

  // ================= TABLET 1024 & 768 =================
  for (const w of [1200, 1024, 768]) {
    const c = await browser.newContext({ viewport: { width: w, height: 900 }, locale: "de-DE" });
    const p = await c.newPage();
    await prep(p);
    report["grid" + w] = await p.evaluate(() => {
      const g = document.querySelector("main section.grid");
      const cs = getComputedStyle(g);
      const items = Array.from(g.children).map(ch => {
        const r = ch.getBoundingClientRect();
        return { id: ch.id, w: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top + scrollY), h: Math.round(r.height), gcol: getComputedStyle(ch).gridColumn };
      });
      return { docW: document.documentElement.clientWidth, cols: cs.gridTemplateColumns, gap: cs.gap, secW: Math.round(g.getBoundingClientRect().width), secX: Math.round(g.getBoundingClientRect().left), scrollH: document.documentElement.scrollHeight, items };
    });
    await c.close();
  }

  // ================= MOBILE 390 =================
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "de-DE" });
  const mp = await mctx.newPage();
  await prep(mp);
  report.mobile = await mp.evaluate(() => {
    const g = document.querySelector("main section.grid");
    const cs = getComputedStyle(g);
    const pw = document.querySelector(".page-wrapper");
    const items = Array.from(g.children).map(ch => {
      const r = ch.getBoundingClientRect();
      const ccs = getComputedStyle(ch);
      return { id: ch.id, cls: ch.className.slice(0, 80), w: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top + scrollY), h: Math.round(r.height), gcol: ccs.gridColumn, mt: ccs.marginTop, mb: ccs.marginBottom, pl: ccs.paddingLeft, pr: ccs.paddingRight };
    });
    const hero = document.querySelector("figure.banner");
    const hr = hero ? hero.getBoundingClientRect() : null;
    return {
      docW: document.documentElement.clientWidth, scrollH: document.documentElement.scrollHeight,
      pw: { w: Math.round(pw.getBoundingClientRect().width), maxW: getComputedStyle(pw).maxWidth },
      sec: { w: Math.round(g.getBoundingClientRect().width), x: Math.round(g.getBoundingClientRect().left), cols: cs.gridTemplateColumns, gap: cs.gap, ml: cs.marginLeft, pl: cs.paddingLeft },
      hero: hr ? { h: Math.round(hr.height), w: Math.round(hr.width), y: Math.round(hr.top + scrollY) } : null,
      headerH: Math.round(document.querySelector("header.page-header").getBoundingClientRect().height),
      items,
    };
  });
  report.mobileTrees = {};
  for (const [name, sel] of [["S2_TEXTPIC50", "#item-206"], ["S3_CARD_A", "#item-72"], ["HERO", "figure.banner"], ["HEADER", "header.page-header"]]) {
    report.mobileTrees[name] = await mp.evaluate(TREE_FN, sel);
  }
  fs.writeFileSync(path.join(OUT, "wendt-trees-390.txt"),
    Object.entries(report.mobileTrees).map(([k, v]) => "\n\n===================== M " + k + " =====================\n" + (v || "NOT FOUND")).join(""), "utf8");
  delete report.mobileTrees;

  fs.writeFileSync(path.join(OUT, "wendt-deep.json"), JSON.stringify(report, null, 1), "utf8");
  console.log("GRID1440:", JSON.stringify(report.grid1440, null, 1));
  console.log("\nGRID1920:", JSON.stringify(report.grid1920, null, 1));
  console.log("\nFONTS:", JSON.stringify(report.fonts));
  console.log("\nMUTATIONS:", report.scrollMutations.length);
  console.log(JSON.stringify(report.scrollMutations.slice(0, 30), null, 1));

  await browser.close();
})();
