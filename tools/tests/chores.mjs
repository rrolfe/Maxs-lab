import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land', theme = process.argv[4] || 'day';
const { page, browser, errors } = await open({ lang, device, theme });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const bal = () => page.evaluate(() => window.__lab.S.pearls.balance);
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 0, earned: 0, spent: 0 }; st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.settings.pinHash = null; });
ok((await page.$$('.tile')).length === 8, 'home has 8 tiles');
await shot(page, `home8-${lang}-${device}-${theme}`);
await page.locator('.tile[data-k="chores"]').click(); await w(500);
const NJ = (await page.$$('.chcard')).length; ok(NJ === 33, '33 jobs (5 original + 28 new): ' + NJ);
const pts = await page.$$eval('.chpts', (e) => e.map((x) => x.textContent.replace(/\D/g, '')).join(','));
ok(pts.startsWith('3,5,10,5,5,'), 'original five keep their points, then the new ones (' + pts + ')');
await shot(page, `chores-list-${lang}-${device}-${theme}`);
await page.locator('.chcard').nth(2).click(); await w(300);
await shot(page, `chores-detail-${lang}-${device}-${theme}`);
const press = async (code) => { for (const d of code) await page.locator(`.pinpad .key[aria-label="${d}"]`).click(); await page.locator('.pinpad .key.go').click(); await w(500); };
await page.locator('.chdetail .btn.go').click(); await w(300);
await press('9999');
ok((await bal()) === 0, 'wrong code gives nothing');
ok(!!(await page.$('.pinpad')), 'pad stays open after a wrong code');
await press('1234');
ok((await bal()) === 10, 'code 1234 awards 10 (got ' + (await bal()) + ')');
await shot(page, `chores-yay-${lang}-${device}-${theme}`);
await page.locator('.summary .btn.gold').click(); await w(300);
ok((await page.locator('.chcard.done').count()) === 1, 'chore is marked done and locked for today');
// cheat check: pearls can't be gotten without the code, and the done chore cannot be re-opened
ok(await page.locator('.chcard.done').isDisabled(), 'done chore is disabled');
// taper bypass
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.day().pearls = 600; });
await page.locator('.chcard').nth(0).click(); await w(200); await page.locator('.chdetail .btn.go').click(); await w(300); await press('1234');
ok((await bal()) === 13, 'chores ignore the daily cap (balance ' + (await bal()) + ')');
await page.locator('.summary .btn.gold').click(); await w(200);
// editor
await page.locator('.btn.ghost.small', { hasText: /edit jobs|editar trabajos/i }).click(); await w(300); await press('1234');
await page.locator('.textin[maxlength="80"]').fill('Water the plants'); await page.locator('.btn.gold.small').click(); await w(200);
await page.locator('.btn', { hasText: /^(Done|Listo)$/ }).last().click(); await w(300);
ok((await page.$$('.chcard')).length === NJ + 1, 'custom job added');
// weekly limit: a job allowed 4 times a week is locked once four days this week have it done
await page.evaluate(async () => { const st = await import('./js/core/store.js'); const wk = st.weekView().map((d) => d.key); for (const k of wk.filter((x) => x !== st.today()).slice(0, 4)) (st.S.chores.done[k] ||= {}).brush = 1; for (const k of wk) if (k === st.today()) delete (st.S.chores.done[k] || {}).brush; });
await page.evaluate(async () => { location.hash = '#/home'; }); await w(300); await page.evaluate(async () => { location.hash = '#/chores'; }); await w(500);
const brushLocked = await page.evaluate(() => [...document.querySelectorAll('.chcard')].some((c) => /Brush Perla|Cepilla/.test(c.textContent) && c.disabled && /week|semana/.test(c.textContent)));
ok(brushLocked, 'a job at its weekly limit is locked and says done this week');
await page.locator('.chcard:not(.done)').nth(6).click(); await w(300);
ok((await page.$$('.chhow')).length === 1, 'new job shows its how-to line');
await shot(page, `chores-how-${lang}-${device}-${theme}`);
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
