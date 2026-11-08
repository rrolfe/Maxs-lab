// A one-time grown-up gift lands once, only on a save that already has progress, and leaves the daily taper alone.
import { open } from './lib.mjs';
const read = (page) => page.evaluate(() => { const S = window.__lab.S; return { b: S.pearls.balance, e: S.pearls.earned, g: Object.keys(S.gifts || {}).length, today: Object.values(S.days).reduce((a, d) => a + (d.pearls || 0), 0) }; });
let ok = true; const bad = (m) => { ok = false; console.log('FAIL ' + m); };

const a = await open({ lang: 'en', state: { schema: 2, pearls: { balance: 321, earned: 900, spent: 579 }, passport: { stamps: { paris: 1 }, people: {}, badges: {} } } });
const r1 = await read(a.page);
if (r1.b !== 821 || r1.e !== 1400 || r1.g !== 2 || r1.today !== 0) bad('first load ' + JSON.stringify(r1));
await a.page.reload(); await a.page.waitForSelector('.hud');
const r2 = await read(a.page);
if (r2.b !== 821 || r2.g !== 2) bad('second load gave it again ' + JSON.stringify(r2));
const hud = await a.page.textContent('.hud');
if (!/821/.test(hud)) bad('HUD does not show 821: ' + hud.replace(/\s+/g, ' ').slice(0, 120));
if (a.errors.length) bad(a.errors.join('/'));
await a.browser.close();

const b = await open({ lang: 'en' });          // brand-new device: nothing to add to
const r3 = await read(b.page);
if (r3.b !== 0 || r3.g !== 0) bad('fresh device got a gift ' + JSON.stringify(r3));
await b.browser.close();

console.log(ok ? 'PASS gifts: +200 and +300 once, silent, not on a fresh device' : 'FAILED');
process.exit(ok ? 0 : 1);
