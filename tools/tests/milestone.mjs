import { open } from './lib.mjs';
const { page, browser, errors } = await open({ lang: process.argv[2] || 'en' });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls = { balance: 90, earned: 90, spent: 0 }; st.S.mil = {}; });
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.addPearls(15); });   // crosses 100 (lemonade)
await page.waitForSelector('.announcer', { timeout: 4000 }).then(() => ok(true, 'announcer caption appears after crossing the cost'), () => ok(false, 'announcer caption appears'));
const txt = await page.textContent('.announcer').catch(() => '');
console.log('  caption:', txt.slice(0, 120));
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.pearls.balance = 90; st.addPearls(15); });
await page.waitForTimeout(1500);
ok(await page.$$eval('.announcer', (e) => e.length) === 1, 'announcer only once per milestone per day');
// muted: no speech
await page.evaluate(async () => { const st = await import('./js/core/store.js'); st.S.sound = false; st.S.mil = {}; st.S.pearls.balance = 140; window.__spoke = 0; const o = speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak = (u) => { window.__spoke++; o(u); }; st.addPearls(15); });
await page.waitForTimeout(1800);
ok((await page.evaluate(() => window.__spoke)) === 0, 'muted: announcer does not speak');
console.log('errors', errors); await browser.close(); process.exit(fails ? 1 : 0);
