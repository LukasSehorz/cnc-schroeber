const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_SHOTS = path.join(__dirname, 'shots', 'cnc');
const OUT_DATA = path.join(__dirname, 'cnc-data');
fs.mkdirSync(OUT_SHOTS, { recursive: true });
fs.mkdirSync(OUT_DATA, { recursive: true });

const PAGES = [
  { name: 'home', url: 'https://cnc-schoebel.de/', deep: true },
  { name: 'produktion', url: 'https://cnc-schoebel.de/produktion/', deep: true },
  { name: 'unternehmen', url: 'https://cnc-schoebel.de/unternehmen/', deep: true },
  { name: 'maschinenpark', url: 'https://cnc-schoebel.de/maschinenpark/', deep: true },
  { name: 'kontakt', url: 'https://cnc-schoebel.de/kontakt/', deep: true },
  { name: 'impressum', url: 'https://cnc-schoebel.de/impressum/', deep: false },
  { name: 'datenschutz', url: 'https://cnc-schoebel.de/datenschutz/', deep: false },
];

async function gotoRetry(page, url, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); return; }
    catch (e) { last = e; console.log('  goto retry ' + (i + 1) + ': ' + e.message.split('\n')[0]); await page.waitForTimeout(4000 * (i + 1)); }
  }
  throw last;
}

async function settle(page, ms = 2500) {
  try { await page.waitForLoadState('networkidle', { timeout: 25000 }); } catch (e) {}
  await page.waitForTimeout(ms);
  // trigger lazy load: scroll through
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  try { await page.waitForLoadState('networkidle', { timeout: 12000 }); } catch (e) {}
}

async function dismissCookies(page) {
  const sels = [
    'button.brlbs-btn-accept-all',
    '.brlbs-btn-accept-all',
    '#BorlabsCookieBox a[data-cookie-accept-all]',
    '[data-borlabs-cookie-handle="accept-all"]',
    'button:has-text("Ich akzeptiere alle")',
    'button:has-text("Alle akzeptieren")',
  ];
  // banner is a Vue app that mounts late -> wait for it
  try { await page.waitForSelector('.brlbs-btn-accept-all', { state: 'visible', timeout: 20000 }); } catch (e) {}
  for (const s of sels) {
    try {
      const el = await page.$(s);
      if (el && await el.isVisible()) {
        await el.click({ timeout: 5000 });
        await page.waitForTimeout(1500);
        // remove any leftover overlay
        await page.evaluate(() => {
          document.querySelectorAll('#BorlabsCookieBox,.brlbs-cmpnt-container,#brlbs-cookie-box,.brlbs-cmpnt-cb-main-box,[id^="brlbs-"]').forEach(n => {
            const t = (n.innerText || '');
            if (t.includes('Datenschutz-Präferenz') || t.includes('Borlabs')) n.remove();
          });
        });
        return s;
      }
    } catch (e) {}
  }
  // fallback: nuke the banner DOM
  await page.evaluate(() => {
    document.querySelectorAll('#BorlabsCookieBox,#brlbs-cookie-box,.brlbs-cmpnt-container,[class*="brlbs-cmpnt-cb"]').forEach(n => n.remove());
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });
  return null;
}

const EXTRACT = () => {
  const txt = (e) => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim();
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return !(cs.display === 'none' || cs.visibility === 'hidden' || (r.width === 0 && r.height === 0));
  };
  const abs = (u) => { try { return new URL(u, location.href).href; } catch (e) { return u; } };

  // ---- DOM ordered walk of content elements
  const order = [];
  const sel = 'h1,h2,h3,h4,h5,h6,p,li,a,button,span.elementor-button-text,figcaption,blockquote,td,th,label,summary,strong';
  document.querySelectorAll(sel).forEach(el => {
    if (!vis(el)) return;
    const t = txt(el);
    if (!t) return;
    order.push({ tag: el.tagName.toLowerCase(), text: t, href: el.getAttribute('href') ? abs(el.getAttribute('href')) : null, cls: el.className && typeof el.className === 'string' ? el.className.slice(0, 120) : '' });
  });

  // ---- Headings only, in order
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(h => ({ level: +h.tagName[1], text: txt(h) })).filter(h => h.text);

  // ---- Paragraphs
  const paragraphs = [...document.querySelectorAll('p')].filter(vis).map(txt).filter(Boolean);

  // ---- List items
  const listItems = [...document.querySelectorAll('li')].filter(vis).map(li => ({ text: txt(li), inNav: !!li.closest('nav,.elementor-nav-menu,ul.menu') })).filter(x => x.text);

  // ---- Links
  const links = [...document.querySelectorAll('a[href]')].filter(vis).map(a => ({ text: txt(a), href: abs(a.getAttribute('href')), title: a.getAttribute('title') || '', aria: a.getAttribute('aria-label') || '', cls: (a.className || '').toString().slice(0, 140) }));

  // ---- Buttons
  const buttons = [...document.querySelectorAll('button,.elementor-button,input[type=submit],[role=button]')].filter(vis).map(b => ({ text: txt(b) || b.value || '', tag: b.tagName.toLowerCase(), href: b.getAttribute('href') ? abs(b.getAttribute('href')) : null, cls: (b.className || '').toString().slice(0, 140) }));

  // ---- Nav
  const navs = [...document.querySelectorAll('nav, .elementor-nav-menu--main, ul.elementor-nav-menu')].map(n => ({
    cls: (n.className || '').toString().slice(0, 160),
    items: [...n.querySelectorAll('a[href]')].map(a => ({ text: txt(a), href: abs(a.getAttribute('href')) }))
  }));

  // ---- Images
  const images = [...document.querySelectorAll('img')].map(i => ({
    src: abs(i.currentSrc || i.src || i.getAttribute('data-src') || ''),
    attrSrc: i.getAttribute('src') || '',
    srcset: (i.getAttribute('srcset') || '').slice(0, 400),
    alt: i.getAttribute('alt') || '',
    title: i.getAttribute('title') || '',
    w: i.naturalWidth, h: i.naturalHeight,
    dw: Math.round(i.getBoundingClientRect().width), dh: Math.round(i.getBoundingClientRect().height),
    loading: i.getAttribute('loading') || '',
    cls: (i.className || '').toString().slice(0, 140),
    visible: vis(i),
    y: Math.round(i.getBoundingClientRect().top + window.scrollY)
  }));

  // ---- Videos
  const videos = [...document.querySelectorAll('video')].map(v => ({
    src: v.currentSrc || v.getAttribute('src') || '',
    sources: [...v.querySelectorAll('source')].map(s => ({ src: abs(s.getAttribute('src') || ''), type: s.getAttribute('type') || '' })),
    poster: v.getAttribute('poster') ? abs(v.getAttribute('poster')) : '',
    autoplay: v.hasAttribute('autoplay'), loop: v.hasAttribute('loop'), muted: v.hasAttribute('muted') || v.muted,
    controls: v.hasAttribute('controls'), playsinline: v.hasAttribute('playsinline'),
    preload: v.getAttribute('preload') || '',
    cls: (v.className || '').toString().slice(0, 160),
    dw: Math.round(v.getBoundingClientRect().width), dh: Math.round(v.getBoundingClientRect().height),
    duration: isFinite(v.duration) ? v.duration : null,
    vw: v.videoWidth, vh: v.videoHeight,
    y: Math.round(v.getBoundingClientRect().top + window.scrollY)
  }));

  // ---- iframes
  const iframes = [...document.querySelectorAll('iframe')].map(f => ({ src: f.getAttribute('src') || f.getAttribute('data-src') || '', title: f.getAttribute('title') || '', cls: (f.className || '').toString().slice(0, 120) }));

  // ---- CSS background images
  const bgs = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    const bi = cs.backgroundImage;
    if (bi && bi !== 'none' && bi.includes('url(')) {
      const urls = [...bi.matchAll(/url\((["']?)(.*?)\1\)/g)].map(m => m[2]).filter(u => !u.startsWith('data:'));
      urls.forEach(u => bgs.push({
        url: abs(u),
        selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''),
        size: cs.backgroundSize, pos: cs.backgroundPosition, repeat: cs.backgroundRepeat, attach: cs.backgroundAttachment,
        y: Math.round(el.getBoundingClientRect().top + window.scrollY),
        w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height)
      }));
    }
  });

  // ---- Forms
  const forms = [...document.querySelectorAll('form')].map(f => ({
    action: f.getAttribute('action') || '', method: f.getAttribute('method') || '',
    cls: (f.className || '').toString().slice(0, 140),
    fields: [...f.querySelectorAll('input,textarea,select')].map(i => ({
      type: i.type || i.tagName.toLowerCase(), name: i.getAttribute('name') || '',
      placeholder: i.getAttribute('placeholder') || '', required: i.hasAttribute('required') || (i.className || '').toString().includes('required'),
      value: i.type === 'submit' ? i.value : '',
      label: (() => { const l = f.querySelector('label[for="' + i.id + '"]'); return l ? l.innerText.trim() : ''; })(),
      options: i.tagName.toLowerCase() === 'select' ? [...i.options].map(o => o.text) : undefined
    })),
    labels: [...f.querySelectorAll('label')].map(l => l.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean),
    submitText: (() => { const b = f.querySelector('button[type=submit],input[type=submit],.elementor-button'); return b ? (b.innerText || b.value || '').trim() : ''; })()
  }));

  // ---- Colors & fonts used
  const colorCount = {}, bgCount = {}, fontCount = {}, fsCount = {};
  document.querySelectorAll('body *').forEach(el => {
    if (!vis(el)) return;
    const cs = getComputedStyle(el);
    const t = (el.innerText || '').trim();
    if (t) { colorCount[cs.color] = (colorCount[cs.color] || 0) + 1; fontCount[cs.fontFamily] = (fontCount[cs.fontFamily] || 0) + 1; fsCount[cs.fontSize + '/' + cs.fontWeight] = (fsCount[cs.fontSize + '/' + cs.fontWeight] || 0) + 1; }
    const bc = cs.backgroundColor;
    if (bc && bc !== 'rgba(0, 0, 0, 0)' && bc !== 'transparent') bgCount[bc] = (bgCount[bc] || 0) + 1;
  });
  const top = (o, n = 20) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

  // ---- Section structure (elementor top-level sections)
  const sections = [...document.querySelectorAll('body .elementor-section, body section, body .e-con, body .elementor-top-section')].filter(s => {
    const r = s.getBoundingClientRect(); return r.height > 40;
  }).map(s => {
    const r = s.getBoundingClientRect();
    const cs = getComputedStyle(s);
    return {
      id: s.id || '', cls: (s.className || '').toString().slice(0, 180),
      y: Math.round(r.top + window.scrollY), h: Math.round(r.height),
      bg: cs.backgroundColor, bgImage: cs.backgroundImage === 'none' ? '' : cs.backgroundImage.slice(0, 200),
      heading: (() => { const h = s.querySelector('h1,h2,h3,h4'); return h ? h.innerText.replace(/\s+/g, ' ').trim() : ''; })(),
      text: (s.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 300)
    };
  });

  // ---- Meta
  const meta = {};
  document.querySelectorAll('meta[name],meta[property]').forEach(m => {
    const k = m.getAttribute('name') || m.getAttribute('property');
    if (k) meta[k] = m.getAttribute('content') || '';
  });

  return {
    url: location.href, title: document.title, meta,
    lang: document.documentElement.lang,
    bodyText: document.body.innerText,
    order, headings, paragraphs, listItems, links, buttons, navs, images, videos, iframes, bgs, forms, sections,
    colors: top(colorCount), backgrounds: top(bgCount), fonts: top(fontCount, 10), fontSizes: top(fsCount, 25),
    docHeight: document.body.scrollHeight
  };
};

const ONLY = process.argv.slice(2);
const RUN = ONLY.length ? PAGES.filter(p => ONLY.includes(p.name)) : PAGES;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = {};
  const netAssets = {};

  for (const P of RUN) {
    console.log('=== ' + P.name + ' ' + P.url);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-DE', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' });
    const page = await ctx.newPage();
    netAssets[P.name] = [];
    page.on('response', r => {
      const u = r.url();
      const ct = r.headers()['content-type'] || '';
      if (/\.(mp4|webm|ogv|mov|jpe?g|png|webp|avif|svg|gif)(\?|$)/i.test(u) || /^(video|image)\//.test(ct)) {
        netAssets[P.name].push({ url: u, type: ct, status: r.status(), len: r.headers()['content-length'] || '' });
      }
    });

    await gotoRetry(page, P.url);
    const clicked = await dismissCookies(page);
    console.log('  cookie banner:', clicked);
    await settle(page, 2500);

    // full page
    await page.screenshot({ path: path.join(OUT_SHOTS, `cnc-${P.name}-full.png`), fullPage: true });
    const h = await page.evaluate(() => document.body.scrollHeight);
    console.log('  docHeight', h);

    // segments
    if (P.deep) {
      const steps = Math.min(Math.ceil(h / 900), 30);
      for (let i = 0; i < steps; i++) {
        await page.evaluate(y => window.scrollTo(0, y), i * 900);
        await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(OUT_SHOTS, `cnc-${P.name}-${String(i + 1).padStart(2, '0')}.png`) });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
    }

    const data = await page.evaluate(EXTRACT);
    results[P.name] = data;
    fs.writeFileSync(path.join(OUT_DATA, P.name + '.json'), JSON.stringify(data, null, 2), 'utf8');
    fs.writeFileSync(path.join(OUT_DATA, P.name + '.txt'), data.bodyText, 'utf8');
    fs.writeFileSync(path.join(OUT_DATA, P.name + '.dom.html'), await page.content(), 'utf8');

    await ctx.close();

    // mobile
    const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    const mpage = await mctx.newPage();
    await gotoRetry(mpage, P.url);
    await dismissCookies(mpage);
    await settle(mpage, 2000);
    await mpage.screenshot({ path: path.join(OUT_SHOTS, `cnc-${P.name}-mobile-full.png`), fullPage: true });
    await mctx.close();
  }

  const sfx = ONLY.length ? '_' + ONLY.join('-') : '';
  fs.writeFileSync(path.join(OUT_DATA, '_netassets' + sfx + '.json'), JSON.stringify(netAssets, null, 2), 'utf8');
  await browser.close();
  console.log('DONE');
})();
