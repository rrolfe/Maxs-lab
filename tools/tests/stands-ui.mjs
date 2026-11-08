import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const nav = async (h) => { await page.evaluate(() => { location.hash = '#/home'; }); await w(200); await page.evaluate((h) => { location.hash = h; }, h); await w(600); };
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 2000, earned: 2000, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; });
await nav('#/stands');
ok((await page.$$('.stcard')).length === 4, 'hub lists 4 stands');
const costs = await page.$$eval('.stcard.locked .btn.gold', (b) => b.map((x) => x.textContent));
console.log('  unlock buttons:', costs.join(' | '));
await shot(page, `stands-hub-${lang}-${device}`);
for (const id of ['lemonade', 'snack', 'icecream']) {
  await page.evaluate(async (id) => { const st = await import('./js/core/store.js'); st.S.unlocked[id] = true; (st.S.stands[id] ||= {}).tickets = 1; }, id);
  await nav('#/stands/' + id);
  ok(!!(await page.$('.forecast')), `${id}: plan screen shows`);
  // play a full season
  const DAYS = id === 'snack' ? 15 : 10;
  for (let d = 0; d < DAYS; d++) {
    // buy the first affordable upgrade on day 3 to exercise the shop
    if (d === 3) { await page.evaluate(async (id) => { const st = await import('./js/core/store.js'); const x = st.S.stands[id]; if (x) x.bank = (x.bank || 0) + 500; }, id); const b = page.locator('.upg:not([disabled]):not(.own)').first(); if (await b.count()) { await b.click(); await w(200); } }
    if (d === 0 && id === 'lemonade') await shot(page, `lemonade-plan-${lang}-${device}`);
    if (d === 0 && id === 'snack') await shot(page, `snack-plan-${lang}-${device}`);
    await page.locator('.openrow .btn.go').click(); await w(300);
    await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(400);
    if (d === 0) await shot(page, `${id}-receipt-${lang}-${device}`);
    await page.locator('.openrow .btn.go').click(); await w(400);
  }
  ok(!!(await page.$('.summary .stars')), `${id}: season summary with stars after a full season`);
  await shot(page, `${id}-season-${lang}-${device}`);
  const gate = await page.locator('.btn.gold.go').count();
  ok(gate === 1, `${id}: start-a-new-season button appears`);
  await page.locator('.btn.gold.go').click(); await w(400);
  ok(!!(await page.$('.forecast')), `${id}: new season starts, upgrades kept`);
  const ups = await page.evaluate(async (id) => Object.keys((await import('./js/core/store.js')).S.stands[id].up).length, id);
  ok(ups >= 1, `${id}: upgrades kept between seasons (${ups})`);
}
console.log('errors', errors); await browser.close(); process.exit(fails ? 1 : 0);
