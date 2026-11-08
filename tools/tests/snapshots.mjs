// Updates must never cost Max his progress: a daily/update safety copy is made, an unreadable save falls back to the mirror, and a copy can be restored.
import { open } from './lib.mjs';
const seed = { schema: 1, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 }, pearls: { balance: 321, earned: 900, spent: 400 }, unlocked: { lemonade: true }, stands: { lemonade: { bank: 777, up: { sign: 1, table: 1 } } }, passport: { stamps: { paris: { t: 1 } }, people: {}, badges: {} }, days: { '2026-11-05': { sec: 600, q: 20, ok: 15, pearls: 120, missions: 2, topics: {}, prog: {} } } };
const { page, browser, errors } = await open({ lang: 'en', state: seed });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await w(600);
const idx = await page.evaluate(async () => (await import('./js/core/store.js')).listSnapshots());
ok(idx.length === 1 && idx[0].why === 'update' && idx[0].d.earned === 900, 'first load after an update keeps a safety copy: ' + JSON.stringify(idx[0]));

// 1. a broken main save falls back to the mirror
await page.evaluate(() => window.__lab.flush());
await page.evaluate(() => localStorage.setItem('mll2:v1:state', '{{ not json'));
await page.reload(); await page.waitForSelector('.hud'); await w(500);
const after = await page.evaluate(() => ({ b: window.__lab.S.pearls.balance, e: window.__lab.S.pearls.earned, bank: window.__lab.S.stands.lemonade.bank }));
ok(after.b === 321 && after.e === 900 && after.bank === 777, 'unreadable main save: progress comes back from the mirror ' + JSON.stringify(after));

// 2. restore
await page.evaluate(() => { window.__lab.S.pearls.balance = 5; window.__lab.S.pearls.earned = 6; window.__lab.flush(); });
const restored = await page.evaluate(async () => { const st = await import('./js/core/store.js'); const [first] = await st.listSnapshots(); await st.restoreSnapshot(first.t); const again = await st.listSnapshots(); return { b: st.S.pearls.balance, e: st.S.pearls.earned, n: again.length, why: again[0].why }; });
ok(restored.b === 321 && restored.e === 900, 'restoring a copy brings the progress back ' + JSON.stringify(restored));
ok(restored.n >= 2 && restored.why === 'before-restore', 'the state before a restore is itself kept as a copy');

// 3. grown-up corner lists the copies
await page.evaluate(() => { location.hash = '#/grownup'; }); await w(800);
const body = await page.evaluate(() => document.body.innerText);
ok(/Automatic safety copies/.test(body), 'Grown-up corner shows the safety copies section');
await page.locator('summary', { hasText: 'Automatic safety copies' }).click().catch(() => {}); await w(300);
ok((await page.locator('.qrow button', { hasText: 'Restore' }).count()) >= 1, 'each copy has a Restore button');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
