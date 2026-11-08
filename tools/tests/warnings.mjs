// 10, 5 and 2 minute warnings: each shows once, must be acknowledged, and never repeats after a reload.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en';
const { page, browser, errors } = await open({ lang, state: { schema: 2, pearls: { balance: 50, earned: 50, spent: 0 } } });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const setSec = (sec) => page.evaluate(async (sec) => { const st = await import('./js/core/store.js'); st.S.settings.bedtime = ''; st.S.settings.dailyLimit = 30; st.day().sec = sec; window.__lab.checkLimits('/quiz'); }, sec);
const dlg = () => page.$('.overlay.warn .dialog');
const title = async () => (await page.textContent('.overlay.warn h2')).trim();

await setSec(30 * 60 - 700); await w(200);
ok(!(await dlg()), 'nothing at 11 minutes left');
await setSec(30 * 60 - 590); await w(200);
ok(!!(await dlg()) && /10/.test(await title()), '10-minute warning appears (' + (await title().catch(() => '')) + ')');
await shot(page, 'warn10-' + lang);
await setSec(30 * 60 - 580); await w(200);
ok((await page.$$('.overlay.warn')).length === 1, 'only one warning at a time, and no repeat while it is open');
await page.locator('.overlay.warn .btn').click(); await w(200);
ok(!(await dlg()), 'OK closes it');
await setSec(30 * 60 - 570); await w(200);
ok(!(await dlg()), '10-minute warning does not come back');
await setSec(30 * 60 - 290); await w(200);
ok(!!(await dlg()) && /5/.test(await title()), '5-minute warning appears');
await page.locator('.overlay.warn .btn').click(); await w(200);
await setSec(30 * 60 - 110); await w(200);
ok(!!(await dlg()) && /2/.test(await title()), '2-minute warning appears');
await shot(page, 'warn2-' + lang);
await page.locator('.overlay.warn .btn').click(); await w(200);
await page.evaluate(async () => { (await import('./js/core/store.js')).flush(); });
await page.reload(); await page.waitForSelector('.hud');
await setSec(30 * 60 - 100); await w(200);
ok(!(await dlg()), 'no repeat after a reload');
// arriving late: only the most urgent warning, once
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.warn = { day: '', key: '', done: [] }; });
await setSec(30 * 60 - 250); await w(200);
ok((await page.$$('.overlay.warn')).length === 1 && /5/.test(await title()), 'late arrival at 4 minutes shows just the 5-minute warning');
await page.locator('.overlay.warn .btn').click(); await w(200);
// time over -> sunset, not a warning
await setSec(30 * 60 + 5); await w(300);
ok(!!(await page.$('.overlay:not(.warn) .dialog')) && !(await dlg()), 'at zero the lab closes (sunset), no warning');
// extra time from a grown-up starts a fresh set of warnings
await page.evaluate(async () => { const st = await import('./js/core/store.js'); const d = new Date(); st.S.settings.extraMin = { day: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`, end: 45 }; st.S.settings.bedtime = ''; st.flush(); });
await page.reload(); await page.waitForSelector('.hud');
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.settings.bedtime = ''; st.day().sec = 45 * 60 - 595; window.__lab.checkLimits('/quiz'); });
await w(300);
ok(!!(await dlg()) && /10/.test(await title()), 'after 15 extra minutes the 10-minute warning comes again');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
