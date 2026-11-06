// Regression + earning audit. Run: node tools/tests/earn.mjs   (needs the lab served on 127.0.0.1:8767)
import { open, pearls, BASE } from './lib.mjs';
const lang = process.argv[2] || 'en';
const device = process.argv[3] || 'ipad-land';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const { page, browser, errors } = await open({ lang, device });
const wait = (ms) => page.waitForTimeout(ms);
const goto = async (h) => { await page.evaluate(() => { location.hash = '#/home'; }); await wait(250); await page.evaluate((h) => { location.hash = h; }, h); await wait(500); };

// 1. the old bug: earn 300, spend 200, keep earning
{
  const r = await page.evaluate(async () => {
    const st = await import('./js/core/store.js');
    st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.day().pearls = 0;
    st.addPearls(300); st.spendPearls(200); const a = st.addPearls(40);
    for (let i = 0; i < 20; i++) { st.addPearls(10); } st.spendPearls(100); const b = st.addPearls(30);
    return { a: a.got, b: b.got, bal: st.S.pearls.balance, earnedToday: st.day().pearls };
  });
  ok(r.a === 40 && r.b > 0, `earning continues after spending (got ${r.a}, ${r.b}; balance ${r.bal})`);
}
// 1b. losses never go below zero
{
  const r = await page.evaluate(async () => {
    const st = await import('./js/core/store.js');
    st.S.pearls = { balance: 3, earned: 3, spent: 0 }; st.day().pearls = 3;
    const lost = st.losePearls(10); return { lost, bal: st.S.pearls.balance, d: st.day().pearls };
  });
  ok(r.lost === 1 && r.bal === 2 && r.d === 2, `a miss costs at most a quarter of the balance (min 1) (${JSON.stringify(r)})`);
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.day().pearls = 0; });
}

// 2. quiz (bank questions, topic science so no generated maths)
const answerQ = async (wrongOnPurpose = false) => {
  const qtext = await page.textContent('.qtext');
  const q = await page.evaluate(async ({ qtext, lang }) => { const bank = (await import(`./data/questions.${lang}.js`)).default; return bank.find((x) => x.q === qtext) || null; }, { qtext, lang });
  if (!q) return 'unknown';
  await wait(520);
  if (q.type === 'choice') {
    const target = wrongOnPurpose ? q.opts.filter((_, i) => i !== q.a)[0] : q.opts[q.a];
    await page.locator('.ans', { has: page.locator('.lab', { hasText: new RegExp('^' + target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }) }).first().click();
  } else if (q.type === 'order') {
    const seq = wrongOnPurpose ? [...q.opts].reverse() : q.opts;
    for (const o of seq) await page.locator('.pool .tilechip', { hasText: new RegExp('^' + o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click();
  } else { for (const ch of String(wrongOnPurpose ? q.a + 7 : q.a)) await page.locator('.key', { hasText: new RegExp('^' + (ch === '-' ? '-' : ch) + '$') }).first().click(); }
  await page.locator('.qfoot .btn:not([hidden]):not(.ghost):not(.alt)').first().click();
  return q.type;
};
{
  const before = await pearls(page);
  await goto('#/quiz/topic/science'); await page.waitForSelector('.qcard', { timeout: 8000 });
  for (let i = 0; i < 12; i++) {
    if (await page.$('.summary')) break;
    await answerQ(); await wait(1900);
    const nx = page.locator('.qfoot .btn.alt:not([hidden])'); if (await nx.count()) await nx.first().click().catch(() => {});
    await wait(200);
  }
  const after = await pearls(page);
  ok(after > before + 20, `quiz awards pearls (${before} -> ${after})`);
}
// 2b. a wrong pick costs pearls and never goes below zero
{
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.addPearls(30); });
  await goto('#/quiz/topic/science'); await page.waitForSelector('.qcard');
  const before = await pearls(page);
  const type = await answerQ(true); await wait(300);
  const after = await pearls(page);
  ok(after < before, `wrong pick subtracts (${type}: ${before} -> ${after})`);
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.losePearls(100000); });
  for (let i = 0; i < 30; i++) await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.losePearls(100000); });
  ok((await pearls(page)) >= 0, 'balance cannot go negative');
  { const lostToday = await page.evaluate(async () => { const st = await import('./js/core/store.js'); return st.day().lost; }); ok(lostToday <= 10, 'daily loss cap holds (' + lostToday + ')'); }
}
// 3. word search: solve every word via tap-tap
{
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.day().pearls = 0; });
  await goto('#/words/play?pack=baseball&tier=1&p=1'); 
  if (!(await page.$('.wsgrid'))) { const first = await page.evaluate(async () => (await import('./data/packs.js')).default.packs.map((p) => p.id)); await goto('#/words/play?pack=' + first[0] + '&tier=1&p=1'); }
  await page.waitForSelector('.wsgrid');
  const sol = await page.evaluate(() => {
    const g = document.querySelector('.wsgrid'); const N = +getComputedStyle(g).getPropertyValue('--n');
    const cells = [...g.querySelectorAll('.wcell')].map((c) => c.textContent);
    const words = [...document.querySelectorAll('.wl .wt')].map((e) => e.textContent.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-ZÑ]/g, ''));
    const out = [];
    for (const w of words) {
      let hit = null;
      for (let r = 0; r < N && !hit; r++) for (let c = 0; c < N && !hit; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]) {
        let ok = true; for (let k = 0; k < w.length; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || cc < 0 || rr >= N || cc >= N || cells[rr * N + cc] !== w[k]) { ok = false; break; } }
        if (ok) { hit = [r * N + c, (r + dr * (w.length - 1)) * N + c + dc * (w.length - 1)]; break; }
      }
      out.push(hit);
    }
    return out;
  });
  let n = 0;
  for (const hit of sol) { if (!hit) continue; for (const i of hit) { await page.locator(`.wcell[data-i="${i}"]`).click(); } n++; await wait(120); }
  await wait(500);
  const bal = await pearls(page);
  ok(n >= 4 && bal >= n * 3 + 8, `word search pays per word + bonus (${n} words, ${bal} pearls)`);
}
// 4. hangman, every pack: lose one word on purpose and check pearls; win one
{
  const packs = await page.evaluate(async () => (await import('./data/packs.js')).default.packs.map((p) => p.id));
  let paidAll = true; const names = [];
  for (const id of packs) {
    await goto(`#/hangman/play?pack=${id}&tier=1`); await page.waitForSelector('.hmkeys');
    const before = await pearls(page);
    // losing path: press letters that are not in the word until the game ends
    const letters = await page.$$eval('.hmkey', (b) => b.map((x) => x.textContent));
    for (const L of letters) { if (await page.$('.hmplay .feedback.try, .hmplay .feedback.good')) break; const b = page.locator('.hmkey', { hasText: new RegExp('^' + L + '$') }).first(); if (await b.isDisabled()) continue; await b.click(); }
    await wait(200);
    const after = await pearls(page);
    if (!(after > before)) { paidAll = false; names.push(id); }
    const fig = await page.$$eval('.hmscene [data-part].on', (e) => e.length);
    if (id === packs[0]) ok(fig >= 1, `gallows figure draws parts (${fig} parts on first pack)`);
  }
  ok(paidAll, `hangman pays on every pack (${packs.length} packs)${names.length ? ' missing: ' + names : ''}`);
}
// 5. world map: open a place, wait for the read gate, answer
{
  await goto('#/world'); await page.waitForSelector('.mapbox'); await wait(600);
  await page.evaluate(() => { location.hash = '#/world/place/strokkur'; }); await wait(800);
  const gateBtn = page.locator('.psheet .btn.gold').first();
  ok(await gateBtn.isDisabled(), 'quiz button is locked right after opening a place');
  await wait(6200);
  ok(!(await gateBtn.isDisabled()), 'quiz button unlocks after reading time');
  const before = await pearls(page);
  await gateBtn.click(); await wait(300);
  ok(await page.$eval('.factsbox', (e) => e.hidden), 'facts are hidden while the question is shown');
  const q = await page.textContent('.pquiz h3');
  const right = await page.evaluate(async ({ q, lang }) => { const P = (await import('./data/places.js')).default.find((p) => p.id === 'strokkur'); const Q = (await import('./data/placeqs.js')).default.strokkur; const all = [...P.quiz[lang], ...Q[lang]]; const x = all.find((y) => y.q === q); return x.opts[x.a]; }, { q, lang });
  await page.locator('.pquiz .ans', { hasText: right }).first().click(); await wait(400);
  const after = await pearls(page);
  ok(after >= before + 6, `map answer pays (${before} -> ${after})`);
}
// 6. Find it!
{
  await goto('#/world'); await page.waitForSelector('.mapbox'); await wait(400);
  const b = await pearls(page);
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.addPearls(3); });
  ok((await pearls(page)) === b + 3, 'direct earn still works after world map');
}
console.log('console errors:', errors.length ? errors : 'none');
if (errors.length) fails++;
await browser.close();
process.exit(fails ? 1 : 0);
