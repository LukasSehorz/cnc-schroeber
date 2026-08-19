const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const toHex = (c) => {
  if (!c) return c;
  const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return c;
  const h = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('').toUpperCase();
  return m[4] !== undefined && +m[4] !== 1 ? `${h} @${m[4]}` : h;
};

(async () => {
  const W = parseInt(process.argv[2] || '1440', 10), H = parseInt(process.argv[3] || '900', 10);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto('https://barriergroup.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3000);
  await page.addStyleTag({ content: '.cmplz-cookiebanner,#cmplz-cookiebanner-container,.grecaptcha-badge{display:none!important}' });
  await page.waitForTimeout(4500);

  const d = await page.evaluate(() => {
    const R = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: +r.width.toFixed(1), h: +r.height.toFixed(1), t: +r.top.toFixed(1), l: +r.left.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) }; };
    const CS = (el, props) => { if (!el) return null; const cs = getComputedStyle(el); const o = {}; props.forEach(p => o[p] = cs[p]); return o; };
    const TYPO = ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','color','margin','padding','maxWidth','width','opacity','position','top','left','right','bottom','display','gap','backgroundColor','borderRadius','transition','transform','mixBlendMode','textAlign','fontStyle'];

    const out = {};
    const hero = document.querySelector('.primary-hero');
    out.heroClass = hero.className;
    out.hero = { rect: R(hero), cs: CS(hero, ['position','minHeight','paddingTop','paddingBottom','backgroundColor','backgroundImage','overflow','display']) };
    // ::after overlay
    const af = getComputedStyle(hero, '::after');
    out.heroAfter = { content: af.content, background: af.backgroundColor, bgImage: af.backgroundImage, w: af.width, h: af.height, zIndex: af.zIndex, position: af.position, top: af.top, left: af.left };

    out.heroKids = [...hero.children].map(c => ({ tag: c.tagName, cls: (c.className||'').toString(), rect: R(c), cs: CS(c, ['position','top','left','width','height','zIndex','opacity','backgroundColor','overflow']) }));

    const cont = hero.querySelector('.primary-hero__container');
    out.heroContainer = { cls: cont && cont.className, rect: R(cont), cs: CS(cont, ['maxWidth','width','paddingTop','paddingBottom','paddingLeft','paddingRight','margin','display','flexDirection','justifyContent','gap','position','zIndex']) };

    const vid = hero.querySelector('video');
    out.video = { rect: R(vid), src: vid && (vid.currentSrc||vid.src), cs: CS(vid, ['position','top','left','width','height','objectFit','objectPosition','opacity','filter','transform','zIndex']),
      attrs: vid ? Object.fromEntries([...vid.attributes].map(a=>[a.name, a.value.slice(0,120)])) : null,
      parentCls: vid && vid.parentElement.className, parentRect: vid && R(vid.parentElement),
      parentCs: vid && CS(vid.parentElement, ['position','top','left','width','height','zIndex','overflow','opacity','backgroundColor']) };

    const ov = hero.querySelector('.primary-hero__overlay');
    out.overlay = { cls: ov && ov.className, rect: R(ov), cs: CS(ov, ['position','top','left','width','height','backgroundColor','backgroundImage','opacity','zIndex','transition']) };

    const h1 = hero.querySelector('h1');
    out.h1 = { cls: h1 && h1.className, text: h1 && h1.innerText, html: h1 && h1.innerHTML.slice(0,400), rect: R(h1), cs: CS(h1, TYPO) };
    const desc = hero.querySelector('.primary-hero__description');
    out.desc = { cls: desc && desc.className, text: desc && desc.innerText, rect: R(desc), cs: CS(desc, TYPO) };
    const btn = hero.querySelector('.primary-hero__button');
    out.btn = { cls: btn && btn.className, html: btn && btn.outerHTML.slice(0,1500), text: btn && btn.innerText, rect: R(btn), cs: CS(btn, TYPO) };
    if (btn) {
      out.btnKids = [...btn.children].map(c => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0,300), rect: R(c), cs: CS(c, TYPO) }));
      out.btnAfter = (()=>{const a=getComputedStyle(btn,'::after');return {content:a.content,bg:a.backgroundColor,w:a.width,h:a.height,position:a.position,top:a.top,right:a.right,transition:a.transition};})();
    }

    // logo + wordmark
    const logo = document.querySelector('.header__logo');
    const svg = logo.querySelector('svg');
    out.logo = { cls: logo.className, rect: R(logo), cs: CS(logo, ['position','top','left','width','height','transform','zIndex','opacity','transformOrigin']), inline: logo.getAttribute('style') };
    out.svg = { rect: R(svg), viewBox: svg.getAttribute('viewBox'), wAttr: svg.getAttribute('width'), hAttr: svg.getAttribute('height'), cs: CS(svg, ['width','height','fill','color']),
      pathFills: [...svg.querySelectorAll('path')].map(p => p.getAttribute('fill')).filter((v,i,a)=>a.indexOf(v)===i), pathCount: svg.querySelectorAll('path').length };
    const sub = document.querySelector('.header__logo__subtext');
    out.subtext = { cls: sub.className, rect: R(sub), cs: CS(sub, TYPO), spans: [...sub.children].map(s => ({ text: s.innerText, cls: s.className, rect: R(s), cs: CS(s, TYPO) })) };
    const lbg = document.querySelector('.header__logo__background');
    out.logoBg = { cls: lbg.className, rect: R(lbg), cs: CS(lbg, ['position','top','left','width','height','backgroundColor','zIndex']), inline: lbg.getAttribute('style') };

    // header
    const hdr = document.querySelector('.header');
    out.header = { cls: hdr.className, rect: R(hdr), cs: CS(hdr, ['position','top','left','width','height','paddingTop','paddingBottom','paddingLeft','paddingRight','backgroundColor','borderBottom','zIndex','backdropFilter','transition']) };
    const hc = document.querySelector('.header__container');
    out.headerContainer = { cls: hc.className, rect: R(hc), cs: CS(hc, ['maxWidth','width','margin','display','justifyContent','alignItems','height']) };
    const navLinks = [...document.querySelectorAll('.header__navigation a, .header__navigation button')].slice(0, 12);
    out.navLinks = navLinks.map(a => ({ tag: a.tagName, text: a.innerText.trim().slice(0,40), cls: (a.className||'').toString().slice(0,220), rect: R(a), cs: CS(a, TYPO) }));
    const hamb = document.querySelector('.header__hamburger');
    out.hamburger = { cls: hamb && hamb.className, rect: R(hamb), cs: CS(hamb, ['width','height','backgroundColor','display','gap']) };
    const sideline = document.querySelector('.header__navigation__sideLine');
    out.sideline = { rect: R(sideline), cs: CS(sideline, ['position','left','top','width','height','backgroundColor']) };
    const ctaHdr = document.querySelector('.header .barrier-box-title');
    out.headerCta = { html: ctaHdr && ctaHdr.outerHTML.slice(0,900), text: ctaHdr && ctaHdr.innerText, rect: R(ctaHdr), cs: CS(ctaHdr, TYPO) };

    // fonts loaded
    out.fonts = [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status }));
    out.bodyCs = CS(document.body, ['fontFamily','fontSize','lineHeight','color','backgroundColor']);
    // css vars
    const rs = getComputedStyle(document.documentElement);
    out.cssVars = {};
    for (let i = 0; i < rs.length; i++) { const p = rs[i]; if (p.startsWith('--')) out.cssVars[p] = rs.getPropertyValue(p).trim(); }
    out.vw = innerWidth; out.vh = innerHeight;
    return out;
  });

  // hover state of the CTA
  let hoverInfo = null;
  try {
    await page.hover('.primary-hero__button');
    await page.waitForTimeout(600);
    hoverInfo = await page.evaluate(() => {
      const R = el => { const r = el.getBoundingClientRect(); return { w:+r.width.toFixed(1),h:+r.height.toFixed(1),t:+r.top.toFixed(1),l:+r.left.toFixed(1) }; };
      const btn = document.querySelector('.primary-hero__button');
      return { rect: R(btn), kids: [...btn.querySelectorAll('*')].slice(0,10).map(c=>({cls:(c.className||'').toString().slice(0,160), rect:R(c), cs:{transform:getComputedStyle(c).transform, opacity:getComputedStyle(c).opacity, backgroundColor:getComputedStyle(c).backgroundColor, left:getComputedStyle(c).left, width:getComputedStyle(c).width}})) };
    });
  } catch(e) { hoverInfo = { err: e.message }; }
  d.ctaHover = hoverInfo;

  fs.writeFileSync(path.join(__dirname, `b-design-${W}.json`), JSON.stringify(d, null, 2));

  const P = (label, o) => { console.log('\n### ' + label + ' ###'); console.log(JSON.stringify(o, null, 1)); };
  console.log('VIEWPORT', d.vw + 'x' + d.vh);
  P('HERO', { class: d.heroClass, rect: d.hero.rect, cs: d.hero.cs, after: d.heroAfter });
  P('HERO CHILDREN', d.heroKids);
  P('HERO CONTAINER', d.heroContainer);
  P('VIDEO', d.video);
  P('OVERLAY', d.overlay);
  P('H1', d.h1);
  P('DESC', d.desc);
  P('BUTTON', d.btn);
  P('BUTTON KIDS', d.btnKids);
  P('BUTTON ::after', d.btnAfter);
  P('CTA HOVER', d.ctaHover);
  P('LOGO', d.logo);
  P('SVG', d.svg);
  P('SUBTEXT', d.subtext);
  P('LOGO BG', d.logoBg);
  P('HEADER', d.header);
  P('HEADER CONTAINER', d.headerContainer);
  P('NAV LINKS', d.navLinks);
  P('HAMBURGER', d.hamburger);
  P('SIDELINE', d.sideline);
  P('HEADER CTA', d.headerCta);
  P('FONTS', d.fonts);
  P('BODY', d.bodyCs);
  P('CSS VARS', d.cssVars);

  console.log('\n### HEX COLORS ###');
  const hexOf = { heroBg: d.hero.cs.backgroundColor, heroAfter: d.heroAfter.background, h1: d.h1.cs.color, desc: d.desc && d.desc.cs.color,
    btnColor: d.btn && d.btn.cs.color, headerBg: d.header.cs.backgroundColor, logoBg: d.logoBg.cs.backgroundColor,
    subtext: d.subtext.spans[0] && d.subtext.spans[0].cs.color, navLink: d.navLinks[0] && d.navLinks[0].cs.color, hamburger: d.hamburger.cs && d.hamburger.cs.backgroundColor,
    overlay: d.overlay && d.overlay.cs.backgroundColor };
  Object.entries(hexOf).forEach(([k,v]) => console.log(('  '+k).padEnd(16), String(v).padEnd(28), toHex(v)));
  console.log('  svg path fills:', JSON.stringify(d.svg.pathFills));

  await browser.close();
})();
