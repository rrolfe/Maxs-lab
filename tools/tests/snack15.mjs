// The Snack Shack season is 15 days (the other stands stay at 10).
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en';
const { page, browser, errors } = await open({ lang, state: { schema: 2, pearls: { balance: 900, earned: 900, spent: 0 }, unlocked: { snack: true, lemonade: true } } });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const days = await page.evaluate(async () => { const m = await import('./js/stands/sims.js'); return { snack: m.seasonDays('snack'), lemonade: m.seasonDays('lemonade'), icecream: m.seasonDays('icecream') }; });
ok(days.snack === 15 && days.lemonade === 10 && days.icecream === 10, 'season lengths ' + JSON.stringify(days));
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.stands.snack = { tickets: 1, bank: 100, up: {} }; });
await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(800);
const chip = async () => (await page.textContent('.chip.on')).replace(/\s+/g, ' ');
ok(/1 of 15|1 de 15/.test(await chip()), 'plan screen says day 1 of 15: ' + (await chip()));
// day 14 of 15: playing it must not end the season; day 15 must
const play = async () => { await page.locator('.openrow .btn.go').click(); await w(400); await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(700); };
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.stands.snack.season.day = 13; st.flush(); });
await page.reload(); await page.waitForSelector('.hud'); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(800);
ok(/14 of 15|14 de 15/.test(await chip()), 'day 14 of 15 shown: ' + (await chip()));
await play();
let btn = (await page.textContent('.openrow .btn.go')).trim();
ok(!/^(Done|Listo)$/.test(btn), 'after day 14 the season is NOT over (button: ' + btn + ')');
await page.locator('.openrow .btn.go').click(); await w(500);
await play();
btn = (await page.textContent('.openrow .btn.go')).trim();
ok(/^(Done|Listo)$/.test(btn), 'after day 15 the season is over (button: ' + btn + ')');
await page.locator('.openrow .btn.go').click(); await w(800);
ok((await page.evaluate(() => document.body.innerText)).match(/Season 1 complete|Temporada 1 completa/i) !== null, 'season summary appears');
// after the season: the next one is offered with upgrades and cash carried over
const gateTxt = async () => (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
if (!/carry over|pasan a la próxima/i.test(await gateTxt())) { await page.locator('.btn.go, .btn.gold').last().click().catch(() => {}); await w(600); }
ok(/carry over|pasan a la próxima/i.test(await gateTxt()), 'the new-season screen says upgrades and cash carry over');
const prices = await page.evaluate(async () => { const m = await import('./js/stands/sims.js'); return m.upgradeList('snack').filter((u) => /^field/.test(u.id)).map((u) => u.price).join(','); });
ok(prices === '90,220,500,4000,20000,100000,500000', 'ball field prices ' + prices);
const s1 = await page.evaluate(async () => { const m = await import('./js/stands/sims.js'); return m.visibleUpgrades('snack', 1).map((u) => u.id).filter((i) => /^field/.test(i)).join(','); });
ok(s1 === 'field2,field3,field4,fields56', 'season 1 shop shows ball fields 2-4 and the first pair (' + s1 + ')');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
