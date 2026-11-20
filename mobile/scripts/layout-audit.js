const { chromium } = require('playwright');
const BASE = 'http://localhost:8090';
const SIZES = [[360, 640], [390, 844], [412, 915]];
const ROUTES = [
  ['home', '/'],
  ['home-bottom', '/', async (p) => { await p.mouse.move(180, 400); await p.mouse.wheel(0, 4000); }],
  ['duas', '/duas'],
  ['dua-sneeze', '/duas/sneeze'],
  ['dua-newclothes', '/duas/new-clothes'],
  ['explain-menu', '/children/explain-it'],
  ['explain-setup', '/children/explain-it/setup'],
  ['explain-play', '/children/explain-it/play?teamA=Böyük%20Aslanlar%20Komandası&teamB=Uçan%20Qartallar%20Komandası'],
  ['quiz-lobby', '/children/quiz'],
  ['quiz-solo', '/children/quiz/solo'],
  ['memory-menu', '/children/memory'],
  ['memory-learn', '/children/memory/stories'],
  ['crossword', '/children/crossword'],
  ['word-search', '/children/word-search'],
  ['coloring', '/children/coloring'],
  ['coloring-free', '/children/coloring/free/alhamdulillah'],
  ['balloons', '/children/balloons'],
  ['word-guess', '/children/word-guess'],
  ['word-guess-play', '/children/word-guess/play'],
  ['letter-ring', '/children/letter-ring'],
  ['letter-ring-play', '/children/letter-ring/play'],
  ['math-stars', '/children/math-stars', async (p) => { await p.getByText('▶️ Başla').click(); await p.waitForTimeout(9000); }],
  ['tile-memory', '/children/tile-memory', async (p) => { await p.getByText('▶️ Başla').click(); await p.waitForTimeout(1500); }],
];
const probe = () => {
  const vw = innerWidth, vh = innerHeight;
  const scrollable = (el, axis) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const o = getComputedStyle(a)[axis === 'x' ? 'overflowX' : 'overflowY'];
      if (o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  const label = (el) => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40);
  const issues = [];
  const flagged = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.pointerEvents === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    if ([...flagged].some((f) => f.contains(el))) continue;
    if ((r.right > vw + 1 || r.left < -1) && !scrollable(el, 'x')) {
      issues.push(`X  ${Math.round(r.left)}..${Math.round(r.right)} "${label(el)}"`); flagged.add(el); continue;
    }
    if (r.bottom > vh + 1 && !scrollable(el, 'y')) {
      issues.push(`Y  bottom ${Math.round(r.bottom)} > ${vh} "${label(el)}"`); flagged.add(el); continue;
    }
    if (el.getAttribute('dir') === 'auto' && el.children.length === 0 && el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') {
      issues.push(`T  text clipped "${label(el)}"`); flagged.add(el);
    }
  }
  return issues.slice(0, 8);
};
(async () => {
  const S = process.argv[2];
  const b = await chromium.launch();
  for (const [w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    for (const [name, url, act] of ROUTES) {
      errs.length = 0;
      await p.goto(BASE + url); await p.waitForTimeout(3500);
      try { if (act) await act(p); } catch (e) { errs.push('action: ' + e.message.split('\n')[0]); }
      await p.waitForTimeout(500);
      const issues = await p.evaluate(probe);
      await p.screenshot({ path: `${S}/audit/${w}-${name}.png` });
      if (issues.length || errs.length) console.log(`${w}x${h} ${name}:\n   ${[...issues, ...errs.map((e) => 'ERR ' + e)].join('\n   ')}`);
    }
    await ctx.close();
  }
  await b.close();
})();
