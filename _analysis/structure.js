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
  // trigger reveals
  await page.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));} window.scrollTo(0,0); });
  await page.waitForTimeout(1500);

  const out = await page.evaluate(() => {
    const cs = e => getComputedStyle(e);
    const hex = c => { if(!c) return c; const m=c.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s\/]+([\d.]+))?/); if(!m) return c;
      if (m[4] !== undefined && +m[4] === 0) return 'transparent';
      return '#'+[m[1],m[2],m[3]].map(x=>Math.round(+x).toString(16).padStart(2,'0')).join('') + (m[4]!==undefined&&+m[4]<1?`/${m[4]}`:''); };
    const lines = [];
    const main = document.querySelector('main') || document.body;

    function desc(el, d, prefix) {
      const s = cs(el), r = el.getBoundingClientRect();
      const cls = (typeof el.className==='string'?el.className:'').trim().replace(/\s+/g,' ');
      const txt = (el.innerText||'').trim().replace(/\s+/g,' ');
      let bits = [];
      bits.push(`${el.tagName.toLowerCase()}${el.id?'#'+el.id:''}`);
      if (cls) bits.push('.' + cls.split(' ').join('.'));
      bits.push(`[${Math.round(r.width)}x${Math.round(r.height)} @x${Math.round(r.left)} y${Math.round(r.top+scrollY)}]`);
      if (s.display!=='block') bits.push('disp:'+s.display);
      if (s.display==='grid') bits.push('cols:'+s.gridTemplateColumns);
      if (s.gap!=='normal' && s.gap!=='0px') bits.push('gap:'+s.gap);
      if (s.padding!=='0px') bits.push('pad:'+s.padding);
      if (s.margin!=='0px') bits.push('mar:'+s.margin);
      const bg = hex(s.backgroundColor); if (bg!=='transparent') bits.push('bg:'+bg);
      if (s.backgroundImage!=='none') bits.push('bgimg:'+s.backgroundImage.slice(0,80));
      if (s.maxWidth!=='none') bits.push('maxw:'+s.maxWidth);
      if (s.borderRadius!=='0px') bits.push('r:'+s.borderRadius);
      if (parseFloat(s.borderTopWidth)||parseFloat(s.borderBottomWidth)||parseFloat(s.borderLeftWidth)) bits.push('bd:'+s.borderTopWidth+'/'+s.borderRightWidth+'/'+s.borderBottomWidth+'/'+s.borderLeftWidth+' '+hex(s.borderTopColor));
      if (s.boxShadow!=='none') bits.push('sh:'+s.boxShadow.slice(0,60));
      if (/^(h1|h2|h3|h4|h5|p|a|span|li|button)$/.test(el.tagName.toLowerCase()) || (el.children.length===0&&txt))
        bits.push(`{${s.fontFamily.split(',')[0]} ${s.fontSize}/${s.lineHeight} w${s.fontWeight} ls:${s.letterSpacing} ${s.textTransform} ${hex(s.color)} ta:${s.textAlign}}`);
      if (el.tagName==='IMG') bits.push('IMG fit:'+s.objectFit+' src:'+(el.currentSrc||el.src||'').split('/').pop().slice(0,44));
      if (txt && el.children.length===0) bits.push('"' + txt.slice(0,70) + '"');
      lines.push(prefix + bits.join(' '));
    }

    function walk(el, d, maxd, prefix) {
      if (d > maxd) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      desc(el, d, prefix);
      for (const c of el.children) {
        if (['SCRIPT','STYLE','NOSCRIPT','SVG','PATH'].includes(c.tagName)) continue;
        walk(c, d+1, maxd, prefix + '  ');
      }
    }
    // header
    lines.push('===== HEADER =====');
    const hdr = document.querySelector('#site-header'); if (hdr) walk(hdr, 0, 4, '');
    lines.push('\n===== HERO =====');
    const hero = document.querySelector('#hero'); if (hero) walk(hero, 0, 5, '');
    lines.push('\n===== MAIN SECTIONS =====');
    [...main.children].forEach((el,i) => { lines.push('\n--- SECTION ' + i + ' ---'); walk(el, 0, 4, ''); });
    lines.push('\n===== FOOTER =====');
    const f = document.querySelector('footer'); if (f) walk(f, 0, 4, '');
    return lines.join('\n');
  });

  fs.writeFileSync(__dirname + '/structure-' + TAG + '.txt', out);
  console.log('written structure-' + TAG + '.txt, ' + out.split('\n').length + ' lines');
  await browser.close();
})();
