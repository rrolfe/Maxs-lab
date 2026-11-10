// Max's Ballpark, arcade version: costs pearls, plays whole games by tapping SWING at the right moment and CATCH on defense, and reaches the end screen.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land', theme = process.argv[4] || 'day';
const { page, browser, errors } = await open({ lang, device, theme });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await page.emulateMedia({ reducedMotion: 'reduce' });            // short animations so a whole game takes seconds
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 100, earned: 100, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; const e = await import('./js/baseball/engine.js'); e.CFG.opp.rockets.ms = 500; e.CFG.opp.rockets.curve = 0.3; e.CFG.opp.rockets.change = 0.3; });
ok((await page.$$('.tile')).length === 8, 'home has 8 tiles');
await page.evaluate(() => { location.hash = '#/baseball'; }); await w(600);
ok(!!(await page.$('.bbmenu')), 'menu shows');
ok(await page.locator('.bbmenu .notice').count() > 0, 'not enough pearls message at 100');
ok(!/question/i.test(await page.locator('.bbmenu').innerText()) || lang === 'es', 'no mention of answering questions in the menu');
await shot(page, `bb-menu-poor-${lang}-${device}-${theme}`);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls.balance = 1000; });
await page.evaluate(() => { location.hash = '#/home'; }); await w(200); await page.evaluate(() => { location.hash = '#/baseball'; }); await w(500);
await shot(page, `bb-menu-${lang}-${device}-${theme}`);
const before = await page.evaluate(() => window.__lab.S.pearls.balance);
await page.locator('.bbmenu .btn.gold.go').click(); await w(500);
const after = await page.evaluate(() => window.__lab.S.pearls.balance);
ok(before - after === 150, 'spent 150 pearls, got ' + (before - after));
ok(!!(await page.$('.bbfield svg')), 'field shown');
ok(await page.locator('.bbopts, .swingbtn, .waitbtn').count() === 0, 'no question or choose-your-swing buttons any more');
let shotDone = {}, guard = 0, swings = 0, catches = 0;
while (guard++ < 600) {
  if (await page.$('.summary')) break;
  const sn = page.locator('.swingnow:not([disabled])');
  if (await sn.count()) {
    const label = (await sn.innerText()).trim();
    if (/CATCH|ATRAPAR/i.test(label)) { await w(1900 * 0.9 * 0.9); catches++; await sn.click().catch(() => {}); await w(400); continue; }
    if (!shotDone.s) { await w(150); await shot(page, `bb-swing-${lang}-${device}-${theme}`); shotDone.s = 1; }
    await w(350 + (guard % 3) * 40); swings++; await sn.click().catch(() => {}); await w(300); continue;
  }
  const nx = page.locator('.bbpanel .btn.gold:not(.swingnow)');
  if (await nx.count()) { if (!shotDone.r) { await shot(page, `bb-result-${lang}-${device}-${theme}`); shotDone.r = 1; } await nx.first().click(); await w(250); continue; }
  await w(200);
}
ok(!!(await page.$('.summary')), 'game reached the end screen after ' + guard + ' steps (' + swings + ' swings, ' + catches + ' catches)');
ok(swings > 3, 'he swung several times');
await shot(page, `bb-end-${lang}-${device}-${theme}`);
const st = await page.evaluate(() => window.__lab.S.baseball);
ok(st.games === 1, 'game counted: ' + JSON.stringify({ g: st.games, w: st.wins }));
await page.locator('.summary .btn.ghost').first().click(); await w(300);
ok(!!(await page.$('.bbmenu')), 'back to menu');
ok(errors.length === 0, 'console clean ' + errors.join(' / '));
await browser.close(); console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);
