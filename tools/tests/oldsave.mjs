// An older save (before seasons, chores, check-ins, baseball) must load with pearls, money and upgrades intact.
import { open } from './lib.mjs';
const { page, browser, errors } = await open({ lang: 'en', state: { schema: 1, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 }, pearls: { balance: 321, earned: 900, spent: 400 }, unlocked: { lemonade: true }, stands: { lemonade: { bank: 777, up: { sign: 1, table: 1 } } }, passport: { stamps: { paris: 1 }, people: {}, badges: {} } } });
const s = await page.evaluate(() => { const S = window.__lab.S; return { b: S.pearls.balance, e: S.pearls.earned, bank: S.stands.lemonade.bank, up: Object.keys(S.stands.lemonade.up).join(','), tickets: S.stands.lemonade.tickets, stamps: Object.keys(S.passport.stamps).join(','), chores: !!S.chores, checkins: !!S.checkins, schema: S.schema }; });
console.log(JSON.stringify(s));
const ok = s.b === 321 && s.e === 900 && s.bank === 777 && s.up === 'sign,table' && s.stamps === 'paris' && s.chores && s.checkins && s.tickets === 1;
console.log(ok && errors.length === 0 ? 'PASS old save keeps pearls, money, upgrades, stamps' : 'FAIL ' + errors.join('/'));
await browser.close(); process.exit(ok ? 0 : 1);
