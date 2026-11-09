// Windows and workers: more of them serve more fans, the shop offers them early, the plan screen says whether the line will be too long (Rob, Nov 9 2026).
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
const { page, browser, errors } = await open({ lang, device });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
const F = { field2: 1, field3: 1, field4: 1 };

const r = await page.evaluate(async (F) => {
  const m = await import('./js/stands/sims.js');
  const STAFF = ['window2', 'cook', 'cashier', 'window3', 'window4', 'crew', 'manager', 'window5'];
  const caps = [m.SNACK.serveCap(F)]; let up = { ...F };
  for (const id of STAFF) { up = { ...up, [id]: 1 }; caps.push(m.SNACK.serveCap(up)); }
  const vis1 = m.visibleUpgrades('snack', 1).map((u) => u.id).filter((i) => STAFF.includes(i));
  const vis2 = m.visibleUpgrades('snack', 2).map((u) => u.id).filter((i) => STAFF.includes(i));
  const req = STAFF.map((id) => [id, m.canBuy('snack', id, F)]);
  // a big hot game day: how many leave because of the line?
  const busy = (u) => { let k = 5; const rnd = () => { k = (k * 1664525 + 1013904223) >>> 0; return k / 4294967296; }; let b = 0, n = 0;
    for (let i = 0; i < 60; i++) { const ctx = { weather: 'hot', event: 'bigCrowd', up: u }; const ws = m.snackWeights(ctx), tot = ws.reduce((a, x) => a + x.k, 0), exp = m.SNACK.trafficOf(ctx); const stock = {}; for (const x of ws) stock[x.id] = Math.round(exp * 1.3 * x.k / tot);
      const res = m.SNACK.sim({ stock, level: 'normal' }, ctx, rnd); b += res.busy; n += res.n; } return b / n; };
  const full = Object.fromEntries([...Object.keys(F), ...STAFF, 'sign', 'grill', 'fryer'].map((k) => [k, 1]));
  return { caps, vis1, vis2, req, busyNone: busy({ ...F, sign: 1, grill: 1, fryer: 1 }), busyAll: busy(full) };
}, F);
console.log('  ', JSON.stringify(r));
ok(r.caps.every((c, i) => i === 0 || c > r.caps[i - 1]), 'every window and worker raises how many fans can be served: ' + r.caps.join(' < '));
ok(r.caps[8] >= r.caps[0] * 1.8, 'all of them together nearly double the capacity');
ok(['window2', 'cook', 'cashier', 'window3', 'window4', 'crew'].every((i) => r.vis1.includes(i)) && !r.vis1.includes('manager'), 'season 1 shop offers windows 2-4, a cook, cashiers and a crew: ' + r.vis1);
ok(r.vis2.includes('manager') && r.vis2.includes('window5'), 'season 2 adds the manager and a fifth window');
ok(r.busyNone > 0.05 && r.busyAll < 0.01, `a huge hot game day: ${(r.busyNone * 100).toFixed(0)}% leave with no staff, ${(r.busyAll * 100).toFixed(1)}% with all staff`);

// the screen
const seed = (up, bank = 5000) => page.evaluate(async ({ up, bank }) => { const st = await import('./js/core/store.js'); st.S.settings.dailyLimit = 0; st.S.settings.bedtime = ''; st.S.unlocked.snack = true; st.S.stands.snack = { tickets: 1, bank, up, season: { no: 1, day: 2 }, seasons: 1, perks: {}, next: { weather: 'hot', event: 'bigCrowd' }, last: { busy: 30, soldout: 0, pricey: 0, n: 200 } }; st.flush && st.flush(); }, { up, bank });
await seed({ ...F, sign: 1, grill: 1, fryer: 1, fields56: 1 }, 100000); await page.reload(); await w(600); await page.evaluate(() => { location.hash = '#/stands/snack'; }); await w(900);
const cap0 = await page.evaluate(() => ({ cls: document.querySelector('.caphint')?.className, txt: document.querySelector('.caphint')?.innerText, coach: document.querySelector('.coach, .tip')?.innerText || document.body.innerText.match(/line was too long[^.]*\./)?.[0] || '' }));
console.log('  ', JSON.stringify(cap0));
ok(/warn/.test(cap0.cls || ''), 'the forecast says the line may be too long when the windows are not enough');
ok(/Add a window|hire a worker|Agrega una ventanilla/i.test(cap0.coach + cap0.txt), 'the tip tells him where to fix it');
for (const id of ['window2', 'cook', 'cashier', 'window3', 'window4', 'crew']) { await page.locator(`button.upg[data-up="${id}"]`).click(); await w(250); }
const cap1 = await page.evaluate(() => ({ cls: document.querySelector('.caphint')?.className, n: window.__lab.S.stands.snack.up.crew }));
ok(cap1.n === 1 && /ok/.test(cap1.cls || ''), 'after buying windows and workers the hint turns green (' + cap1.cls + ')');
ok(errors.length === 0, 'console clean ' + errors.join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
