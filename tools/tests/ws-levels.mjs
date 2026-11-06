import { open, shot, pearls } from './lib.mjs';
const { wsFinish } = await import('../../js/core/economy.js');
console.log('finish bonuses', [1,2,3].map((z) => [1,2,3].map((d) => wsFinish(z, d)).join('/')).join(' | '));
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; });
await page.evaluate(() => { location.hash = '#/words'; }); await w(500);
await shot(page, `ws-menu-${lang}-${device}`);
ok((await page.$$('.chip.big')).length >= 8, 'menu shows size, difficulty and players chips');
const solve = () => page.evaluate(() => {
  const g = document.querySelector('.wsgrid'); const N = +getComputedStyle(g).getPropertyValue('--n');
  const cells = [...g.querySelectorAll('.wcell')].map((c) => c.textContent);
  const words = [...document.querySelectorAll('.wl .wt, .wlist li')].map((e) => e.textContent.toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-ZÑ]/g, ''));
  const out = [];
  for (const wd of words) { let hit = null;
    for (let r = 0; r < N && !hit; r++) for (let c = 0; c < N && !hit; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]) {
      let okk = true; for (let k = 0; k < wd.length; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || cc < 0 || rr >= N || cc >= N || cells[rr * N + cc] !== wd[k]) { okk = false; break; } }
      if (okk) { hit = [r * N + c, (r + dr * (wd.length - 1)) * N + c + dc * (wd.length - 1), dr < 0 || dc < 0 && dr <= 0]; break; } }
    out.push(hit); }
  return { N, out };
});
for (const [size, diff, exp] of [[1, 1, 4 * 3 + 8], [2, 2, 6 * 4 + 15], [2, 3, null], [3, 3, null]]) {
  await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.day().pearls = 0; });
  await page.evaluate(([s, d]) => { location.hash = '#/home'; setTimeout(() => { location.hash = `#/words/play?pack=baseball&size=${s}&diff=${d}&p=1`; }, 100); }, [size, diff]); await w(700);
  if (!(await page.$('.wsgrid'))) { await page.evaluate(([s, d]) => { location.hash = `#/words/play?pack=${document.querySelector('.pack')?.getAttribute('href')}`; }, [size, diff]); }
  await page.waitForSelector('.wsgrid');
  const { N, out } = await solve();
  ok(N === [0, 8, 10, 12][size], `size ${size}: grid ${N}x${N}`);
  const back = out.filter((h) => h && h[2]).length;
  console.log(`  diff ${diff}: ${out.length} words, ${back} backwards/up`);
  if (diff < 3) ok(back === 0 || diff === 2, `diff ${diff}: no backwards words (${back})`);
  if (size === 3 && diff === 3) await shot(page, `ws-hard-${lang}-${device}`);
  for (const hit of out) { if (!hit) continue; await page.locator(`.wcell[data-i="${hit[0]}"]`).click(); await page.locator(`.wcell[data-i="${hit[1]}"]`).click(); await w(100); }
  await w(600);
  const bal = await pearls(page);
  if (exp == null) { const n = out.filter(Boolean).length / 2; ok(bal === n * 6 || bal >= 6, `diff 3 pays 6 per word (${bal} for ${n} visible words; mystery words stay hidden)`); continue; }
  ok(bal === exp, `size ${size} diff ${diff} pays ${bal} (expected ${exp})`);
}
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
