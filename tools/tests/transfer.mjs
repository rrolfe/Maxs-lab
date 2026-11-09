// Grown-up corner: give pearls, and move progress between two separate copies (like Safari and the Home Screen icon) with a transfer code.
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const seed = { schema: 2, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 }, pearls: { balance: 123, earned: 900, spent: 777 }, unlocked: { lemonade: true }, passport: { stamps: { paris: 1, rome: 1 }, people: {}, badges: {} } };
const A = await open({ lang, state: seed });
const openCopySec = async (page) => { await page.evaluate(() => { location.hash = '#/grownup'; }); await page.waitForTimeout(700); await page.locator('details.gsec summary', { hasText: /This copy|Esta copia/ }).click(); await page.waitForTimeout(200); };
await openCopySec(A.page);
const bal = (page) => page.evaluate(async () => (await import('./js/core/store.js')).S.pearls.balance);
ok(/2026-11-\d\d/.test(await A.page.locator('details.gsec', { hasText: /This copy|Esta copia/ }).first().innerText()), 'the build number is shown');
await A.page.locator('details.gsec[open] button', { hasText: '+800' }).click(); await A.page.waitForTimeout(200);
ok((await bal(A.page)) === 923, 'give +800 adds exactly 800 (balance ' + await bal(A.page) + ')');
const day0 = await A.page.evaluate(async () => Object.values((await import('./js/core/store.js')).S.days).reduce((a, d) => a + (d.pearls || 0), 0));
ok(day0 === 0, 'given pearls do not use up the daily taper');
await A.page.locator('details.gsec[open] button', { hasText: /Copy this copy|Copiar el código/ }).click(); await A.page.waitForTimeout(500);
const code = await A.page.inputValue('details.gsec[open] textarea[readonly]');
ok(/^MLAB[01]:/.test(code) && code.length > 100, 'a transfer code is produced (' + code.slice(0, 8) + '…, ' + code.length + ' characters)');
// a brand-new, empty copy (like the Home Screen icon) takes the code
const B = await open({ lang });
ok((await bal(B.page)) === 0, 'the other copy starts with 0 pearls');
await openCopySec(B.page);
await B.page.locator('details.gsec[open] textarea:not([readonly])').fill(code);
const load = B.page.locator('details.gsec[open] button', { hasText: /Load it here|Cargarlo aquí/ });
await load.click(); await B.page.waitForTimeout(200);
ok((await bal(B.page)) === 0, 'one tap only asks "tap again"');
await B.page.locator('details.gsec[open] button', { hasText: /Tap again|Toca otra vez/ }).click(); await B.page.waitForTimeout(800);
const after = await B.page.evaluate(async () => { const S = (await import('./js/core/store.js')).S; return { b: S.pearls.balance, stamps: Object.keys(S.passport.stamps).length, unlocked: !!S.unlocked.lemonade }; });
ok(after.b === 923 && after.stamps === 2 && after.unlocked, 'the other copy now matches: ' + JSON.stringify(after));
await B.page.evaluate(() => window.__lab.flush()); await B.page.reload(); await B.page.waitForSelector('.hud');
ok((await bal(B.page)) === 923, 'and it is still there after a reload');
// a bad code changes nothing
await openCopySec(B.page);
await B.page.locator('details.gsec[open] textarea:not([readonly])').fill('hello');
await B.page.locator('details.gsec[open] button', { hasText: /Load it here|Cargarlo aquí/ }).click(); await B.page.waitForTimeout(200);
await B.page.locator('details.gsec[open] button', { hasText: /Tap again|Toca otra vez/ }).click().catch(() => {}); await B.page.waitForTimeout(500);
ok((await bal(B.page)) === 923, 'a bad code changes nothing');
ok(A.errors.length + B.errors.length === 0, 'console clean ' + [...A.errors, ...B.errors].join('/'));
await A.browser.close(); await B.browser.close();
console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
