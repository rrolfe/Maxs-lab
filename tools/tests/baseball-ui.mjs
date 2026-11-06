import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land', theme = process.argv[4] || 'day';
const { page, browser, errors } = await open({ lang, device, theme });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 100, earned: 100, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; });
ok((await page.$$('.tile')).length === 7, 'home has 7 tiles');
await shot(page, `home7-${lang}-${device}-${theme}`);
await page.evaluate(() => { location.hash = '#/baseball'; }); await w(600);
ok(!!(await page.$('.bbmenu')), 'menu shows');
ok(await page.locator('.bbmenu .notice').count() > 0, 'not enough pearls message at 100');
await shot(page, `bb-menu-poor-${lang}-${device}-${theme}`);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls.balance = 1000; });
await page.evaluate(() => { location.hash = '#/home'; }); await w(200); await page.evaluate(() => { location.hash = '#/baseball'; }); await w(500);
await shot(page, `bb-menu-${lang}-${device}-${theme}`);
const before = await page.evaluate(() => window.__lab.S.pearls.balance);
await page.locator('.bbmenu .btn.gold.go').click(); await w(500);
const after = await page.evaluate(() => window.__lab.S.pearls.balance);
ok(before - after === 150, 'spent 150 pearls, got ' + (before - after));
ok(!!(await page.$('.bbfield svg')), 'field shown');
let shotDone = {};
let guard = 0;
while (guard++ < 1500) {
  if (await page.$('.summary')) break;
  // choose swing
  const sw = page.locator('.swingbtn');
  if (await sw.count()) { if (!shotDone.choose) { await shot(page, `bb-choose-${lang}-${device}-${theme}`); shotDone.choose = 1; } await sw.nth(guard % 2 ? 1 : 0).click(); await w(300); continue; }
  const ans = page.locator('.bbopts .ans:not([disabled])');
  if (await ans.count()) {
    if (!shotDone.q) { await shot(page, `bb-q-${lang}-${device}-${theme}`); shotDone.q = 1; }
    // click the right one via DOM knowledge: try each until right
    await ans.first().click(); await w(250); continue;
  }
  const sn = page.locator('.swingnow:not([disabled])');
  if (await sn.count()) { if (!shotDone.s) { await w(500); await shot(page, `bb-swing-${lang}-${device}-${theme}`); shotDone.s = 1; await w(350); } else await w(850); await sn.click().catch(() => {}); await w(300); continue; }
  const nx = page.locator('.bbpanel .btn.gold:not(.swingnow), .bbpanel .btn.alt');
  if (await nx.count()) { if (!shotDone.r) { await shot(page, `bb-result-${lang}-${device}-${theme}`); shotDone.r = 1; } await nx.first().click(); await w(300); continue; }
  await w(300);
}
if (!(await page.$('.summary'))) console.log((await page.locator('.bbpanel').innerText()).slice(0,300), JSON.stringify(await page.evaluate(() => window.__lab.S.baseball.cur)).slice(0,400));
ok(!!(await page.$('.summary')), 'game reached end screen after ' + guard + ' steps');
await shot(page, `bb-end-${lang}-${device}-${theme}`);
const st = await page.evaluate(() => window.__lab.S.baseball);
ok(st.games === 1, 'game counted: ' + JSON.stringify({ g: st.games, w: st.wins }));
await page.locator('.summary .btn.ghost').first().click(); await w(300);
ok(!!(await page.$('.bbmenu')), 'back to menu');
ok(errors.length === 0, 'console clean ' + errors.join(' / '));
await browser.close(); console.log(fails ? 'FAILED ' + fails : 'ALL OK'); process.exit(fails ? 1 : 0);
