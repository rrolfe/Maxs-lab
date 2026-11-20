// Word Search Peek costs 3 pearls (Rob, Nov 20 2026): only in a puzzle that pays pearls, only on Max's turn, never below zero,
// never charged twice for one tap, free when there is nothing to lose, and counted in the Grown-up corner.
// Usage: node tools/tests/ws-peek.mjs [en|es] [ipad-land|phone]
import { open, pearls, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const T = lang === 'es' ? { peek: 'Pista', free: 'gratis', cost: /cuesta 3 perlas/, used: /−3 perlas/, grown: /Pistas en Sopa de letras esta semana: 3 \(costaron 9 perlas\)/ }
  : { peek: 'Peek', free: 'free', cost: /costs 3 pearls/, used: /−3 pearls/, grown: /Word Search peeks this week: 3 \(cost 9 pearls\)/ };
const setPearls = (n) => page.evaluate(async (n) => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: n, earned: Math.max(n, 100), spent: 0 }; st.day().pearls = 0; st.save(); }, n);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.save(); });
const play = async (q) => { await page.evaluate(() => { location.hash = '#/home'; }); await w(150); await page.evaluate((q) => { location.hash = '#/words/play?' + q; }, q); await page.waitForSelector('.wsgrid'); await w(300); };
const solve = () => page.evaluate(() => {
  const g = document.querySelector('.wsgrid'); const N = +getComputedStyle(g).getPropertyValue('--n');
  const cells = [...g.querySelectorAll('.wcell')].map((c) => c.textContent);
  const words = [...document.querySelectorAll('.wlist li .wt')].map((e) => e.textContent.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-ZÑ]/g, ''));
  const out = [];
  for (const wd of words) { let hit = null;
    for (let r = 0; r < N && !hit; r++) for (let c = 0; c < N && !hit; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]) {
      let okk = true; for (let k = 0; k < wd.length; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || cc < 0 || rr >= N || cc >= N || cells[rr * N + cc] !== wd[k]) { okk = false; break; } }
      if (okk) { hit = [r * N + c, (r + dr * (wd.length - 1)) * N + c + dc * (wd.length - 1)]; break; } }
    out.push(hit); }
  return out.filter(Boolean);
});
const find = async (hit) => { await page.locator(`.wcell[data-i="${hit[0]}"]`).click(); await page.locator(`.wcell[data-i="${hit[1]}"]`).click(); await w(150); };
const btn = () => page.locator('.peekbtn');
const day = () => page.evaluate(async () => { const st = await import('./js/core/store.js'); const d = st.day(); return { peeks: d.peeks || 0, cost: d.peekCost || 0 }; });

// ---- 1. a paying puzzle: the button shows the price and a peek takes it
await setPearls(50); await play('pack=baseball&size=1&diff=1&p=1');
let txt = await btn().innerText();
ok(txt.includes(T.peek) && txt.includes('−3'), `the button shows the price (“${txt.replace(/\n/g, ' ')}”)`);
await btn().click(); await w(150);
ok(await pearls(page) === 47, 'one peek costs 3 pearls (50 → ' + await pearls(page) + ')');
ok(await page.locator('.wcell.peek').count() === 1, 'the first letter of a word glows');
ok(T.used.test(await page.locator('.wsmsg').innerText()), 'the message says what it cost');
await btn().click(); await btn().click({ force: true }).catch(() => {}); await w(150);
ok(await pearls(page) === 47, 'tapping again while it glows is not charged twice');
await w(1900);
ok(await page.locator('.wcell.peek').count() === 0, 'the glow goes away');
await btn().click(); await w(2000);
ok(await pearls(page) === 44, 'a second peek costs 3 more (44)');
const dd = await day(); ok(dd.peeks === 2 && dd.cost === 6, `the day counts ${dd.peeks} peeks costing ${dd.cost}`);
await shot(page, `ws-peek-${lang}-${device}`);
if (device === 'phone') {
  ok(await page.evaluate(() => innerWidth <= 392 && document.documentElement.scrollWidth <= 392), 'phone: the page is not wider than the screen (innerWidth ' + await page.evaluate(() => innerWidth) + ')');
  ok(await page.evaluate(() => { const b = document.querySelector('.peekbtn').getBoundingClientRect(), o = document.querySelector('.wside .row .btn:last-child').getBoundingClientRect(); return b.right <= 392 && o.right <= 392; }), 'phone: Peek and Other theme both fit on screen');
}

// ---- 2. finding words still pays in full, and the peek cost is not refunded or double counted
const hits = await solve(); ok(hits.length >= 4, `solved ${hits.length} words`);
for (const hh of hits) await find(hh);
await w(700);
ok(await pearls(page) === 44 + 12 + 8, `finding all words pays 12 + 8 bonus on top of the 44 (${await pearls(page)})`);
ok(await btn().evaluate((e) => getComputedStyle(e).display) === 'none', 'the Peek button goes away when the puzzle is finished');

// the biggest grid (12x12) fits the screen, on a phone too
await setPearls(50); await play('pack=baseball&size=3&diff=1&p=1');
ok(await page.evaluate(() => { const g = document.querySelector('.wsgrid').getBoundingClientRect(); return g.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; }), '12x12 grid fits the screen (no sideways scrolling)');

// ---- 3. not enough pearls: the peek is refused kindly, nothing is taken
await setPearls(2); await play('pack=baseball&size=1&diff=1&p=1');
ok(await btn().evaluate((e) => e.classList.contains('poor')), 'with 2 pearls the button looks dimmed');
await btn().click(); await w(150);
ok(await pearls(page) === 2 && await page.locator('.wcell.peek').count() === 0, 'no peek and nothing taken when he has fewer than 3');
ok(T.cost.test(await page.locator('.wsmsg').innerText()), 'the message explains: find a word first');
await setPearls(0); await btn().click(); await w(150);
ok(await pearls(page) === 0 && await page.locator('.wcell.peek').count() === 0, 'with 0 pearls: still no peek, still 0 (never negative)');
const h1 = (await solve())[0]; await find(h1); await w(300);
ok(await pearls(page) === 3 && !(await btn().evaluate((e) => e.classList.contains('poor'))), 'finding a word earns 3, and the button is bright again');
await btn().click(); await w(150);
ok(await pearls(page) === 0, 'now he can peek (3 → 0)');
await w(1900);

// ---- 4. nothing to lose: today's puzzle already paid, so a peek is free
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.words.daily = { date: st.today(), done: true }; st.save(); });
await setPearls(0); await play('daily=1&size=2&diff=2');
ok((await btn().innerText()).includes(T.free), 'a puzzle that pays nothing says the peek is free');
await btn().click(); await w(150);
ok(await page.locator('.wcell.peek').count() === 1 && await pearls(page) === 0, 'the free peek works with 0 pearls');
await w(1900);

// ---- 5. racing Dad: Max's turn costs, Dad's turn is free
await setPearls(20); await play('pack=baseball&size=1&diff=1&p=2');
ok((await btn().innerText()).includes('−3'), 'race: on Max’s turn the peek shows the price');
await find((await solve())[0]); await w(300);
ok((await btn().innerText()).includes(T.free), 'race: on Dad’s turn the peek is free');
const b0 = await pearls(page); await btn().click(); await w(150);
ok(await pearls(page) === b0 && await page.locator('.wcell.peek').count() === 1, 'race: Dad’s peek takes nothing');

// ---- 6. the Grown-up corner counts the paid peeks only (2 in step 1 + 1 in step 3 = 3 peeks, 9 pearls; the free ones are not counted)
await page.evaluate(() => { location.hash = '#/grownup'; }); await page.waitForSelector('.gsec'); await w(600);
ok(T.grown.test(await page.evaluate(() => document.body.innerText)), 'the Grown-up corner shows the peeks this week');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); console.log(fails ? `\n${fails} FAILED` : '\nALL OK'); process.exit(fails ? 1 : 0);
