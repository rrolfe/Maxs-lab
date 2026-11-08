// The Snack Shack opens at 300 pearls; below that the card says how many more are needed; the gift covers it.
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const gifts = { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 };
const card = (page) => page.locator('.stcard', { hasText: /Snack Shack|Puesto de Meriendas|Merienda/i }).first();
{
  const { page, browser } = await open({ lang, state: { schema: 2, gifts, pearls: { balance: 200, earned: 900, spent: 700 }, unlocked: { lemonade: true } } });
  await page.evaluate(() => { location.hash = '#/stands'; }); await page.waitForTimeout(600);
  const txt = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ');
  ok(/100 more pearls|Faltan 100/.test(txt), 'with 200 pearls the card says 100 more are needed');
  await browser.close();
}
{
  const { page, browser, errors } = await open({ lang, state: { schema: 2, pearls: { balance: 321, earned: 900, spent: 579 }, unlocked: { lemonade: true } } });  // gifts not yet given: +200 +300
  const bal = await page.evaluate(() => window.__lab.S.pearls.balance);
  ok(bal === 821, 'both gifts arrive on the next load (balance ' + bal + ')');
  await page.evaluate(() => { location.hash = '#/stands'; }); await page.waitForTimeout(600);
  await page.locator('.stcard:not(.open) .btn.gold').first().click(); await page.waitForTimeout(400);
  await page.locator('.overlay .btn.gold').first().click(); await page.waitForTimeout(900);
  const st = await page.evaluate(() => ({ u: window.__lab.S.unlocked.snack, b: window.__lab.S.pearls.balance, h: location.hash }));
  ok(st.u === true && st.b === 521 && /stands\/snack/.test(st.h), 'tapping open spends 300 and opens the Snack Shack ' + JSON.stringify(st));
  ok(errors.length === 0, 'console clean ' + errors.join('/'));
  await browser.close();
}
console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
