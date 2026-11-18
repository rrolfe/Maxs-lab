// Snack Shack: "Own a team" (Nov 18 2026): eight steps after the night-game stadium, a team name, a trophy case, a bigger crowd and team merch.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (p, ms) => p.waitForTimeout(ms);
async function boot(up, extra = {}) {
  const { page, browser, errors } = await open({ lang, device });
  await page.evaluate(async ({ up, extra }) => {
    const st = await import('./js/core/store.js'); const S = st.S;
    S.pearls = { balance: 2000, earned: 2000, spent: 0 }; S.settings.dailyLimit = 0; S.settings.bedtime = ''; S.unlocked.snack = true;
    S.stands.snack = { bank: 1e9, days: 40, best: 1e6, total: 1e8, up, next: { weather: 'sunny', event: null }, price: 2, stock: 4, seasons: 8, season: { day: 0, profit: 0, cust: 0, startBank: 20, bestDay: 0 }, tickets: 0, bestSeason: 0, perks: {}, mstock: {}, level: 'normal', deal: false, ...extra };
    st.save();
  }, { up, extra });
  await page.evaluate(() => { location.hash = '#/stands'; }); await w(page, 250);
  await page.evaluate(() => { location.hash = '#/stands/snack'; }); await page.waitForSelector('.forecast', { timeout: 6000 });
  return { page, browser, errors };
}
const base = { sign: 1, grill: 1, fryer: 1, cooler: 1, candy: 1, cones: 1, slush: 1, field2: 1, field3: 1, field4: 1, fields56: 1, fields78: 1, fields910: 1, fields1112: 1, merch: 1, merch2: 1, stadium: 1 };

// ---- 1. before the night-game stadium: no team card, and the steps are locked
{
  const { page, browser, errors } = await boot({ ...base });
  ok((await page.locator('.teamcard').count()) === 0, 'before the night-game stadium there is no team card');
  const b = page.locator('[data-up="teamstart"]'); ok((await b.count()) === 1 && await b.isDisabled(), 'the first team step is in the shop but locked');
  ok(/Floodlights|Reflectores/i.test(await b.innerText()), 'it says what it needs (the floodlights)');
  if (errors.length) { console.log(errors); fails++; } await browser.close();
}
// ---- 2. with the floodlights: the card, the first step, the crowd, the menu and the name
{
  const { page, browser, errors } = await boot({ ...base, stadium2: 1 });
  ok((await page.locator('.teamcard').count()) === 1, 'with night games the team card shows up');
  ok((await page.locator('.tstep').count()) === 8 && (await page.locator('.tstep.lit').count()) === 0, 'eight dark pieces in the trophy case');
  const crowd0 = await page.evaluate(async () => { const s = await import('./js/stands/sims.js'); const up = window.__lab.S.stands.snack.up; return s.SNACK.trafficOf({ weather: 'sunny', event: null, up }); });
  const need = await page.locator('[data-up="teamstart"]').isDisabled(); ok(!need, 'the first step can be bought with the cash');
  await page.locator('[data-up="teamstart"]').click(); await w(page, 400);
  const s1 = await page.evaluate(async () => { const s = await import('./js/stands/sims.js'); const S = window.__lab.S.stands.snack; return { up: S.up.teamstart, bank: S.bank, crowd: s.SNACK.trafficOf({ weather: 'sunny', event: null, up: S.up }), menu: s.menuAvail(S.up).map((m) => m.id) }; });
  ok(s1.up === 1 && Math.round(s1.bank) === 1e9 - 20000000, 'buying it costs $20,000,000 (' + s1.bank + ')');
  ok(Math.abs(s1.crowd / crowd0 - 1.5) < 0.001, 'the crowd grows by half (' + (s1.crowd / crowd0).toFixed(3) + 'x)');
  ok(s1.menu.includes('jersey'), 'team jerseys join the menu');
  ok((await page.locator('.tstep.lit').count()) === 1, 'one piece of the trophy case is lit');
  const inp = page.locator('.teamname'); ok((await inp.count()) === 1 && !(await inp.isDisabled()), 'now he can name the team');
  await inp.fill('Max’s Rockets'); await w(page, 200);
  ok(await page.evaluate(() => window.__lab.S.stands.snack.teamName) === 'Max’s Rockets', 'the name is saved');
  ok(/MAX’S ROCKETS/.test(await page.locator('.scoreboard .sbname').innerText()), 'the scoreboard shows the team name');
  await shot(page, `snack-team-1-${device}-${lang}`);
  if (errors.length) { console.log(errors); fails++; } await browser.close();
}
// ---- 3. the whole ladder, one step at a time: each needs the one before, the crowd multiplies to about 14x, and the end is a champion
{
  const { page, browser, errors } = await boot({ ...base, stadium2: 1, stadium3: 1 }, { bank: 3e10 });
  const ids = ['teamstart', 'coach', 'stars', 'practice', 'bus', 'fanclub', 'hof', 'champs'];
  const crowd0 = await page.evaluate(async () => { const s = await import('./js/stands/sims.js'); return s.SNACK.trafficOf({ weather: 'sunny', event: null, up: window.__lab.S.stands.snack.up }); });
  let order = true;
  for (let i = 0; i < ids.length; i++) {
    const loc = page.locator(`[data-up="${ids[i]}"]`);
    if (i + 1 < ids.length && !(await page.locator(`[data-up="${ids[i + 1]}"]`).isDisabled())) order = false;   // the next one must still be locked
    if (await loc.count() !== 1 || await loc.isDisabled()) { ok(false, `step ${ids[i]} can be bought in order`); break; }
    await loc.click(); await w(page, 250);
  }
  ok(order, 'every step stays locked until the one before it is bought');
  const f = await page.evaluate(async () => { const s = await import('./js/stands/sims.js'); const S = window.__lab.S.stands.snack; const e = s.effects('snack', S.up); return { lv: s.teamLevel(S.up), crowd: s.SNACK.trafficOf({ weather: 'sunny', event: null, up: S.up }), menu: s.menuAvail(S.up).map((m) => m.id), bank: S.bank, serve: s.SNACK.serveCap(S.up) }; });
  ok(f.lv === 8, 'all eight steps owned');
  ok(f.crowd / crowd0 > 13 && f.crowd / crowd0 < 13.3, 'the crowd is about 13x bigger (' + (f.crowd / crowd0).toFixed(2) + 'x)');
  ok(['jersey', 'autoball', 'trophy'].every((x) => f.menu.includes(x)), 'jersey, signed baseball and gold trophy are all on the menu');
  ok((await page.locator('.teamcard.champ').count()) === 1 && (await page.locator('.tstep.lit').count()) === 8, 'the trophy case is full and the card shines');
  ok(f.bank > 0, 'the bank is still positive (' + f.bank + ')');
  await shot(page, `snack-team-8-${device}-${lang}`);
  // a whole day plays with the huge crowd
  await page.locator('.openbtn, [data-act="open"], .btn.gold.big').first().click({ timeout: 3000 }).catch(() => {}); await w(page, 1800);
  if (device === 'phone') { const sw = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); ok(sw[1] <= 392, 'phone: no sideways scroll (' + sw + ')'); }
  if (errors.length) { console.log(errors); fails++; } await browser.close();
}
// ---- 4. an old save with everything bought but no team: nothing is lost, the new steps simply appear
{
  const old = { ...base, stadium2: 1, stadium3: 1, basketball: 1, soccer: 1, football: 1, tennis: 1, window2: 1, cook: 1, cashier: 1, window3: 1, window4: 1, crew: 1, manager: 1, window5: 1, mascot: 1, suites: 1, jerseys: 1 };
  const { page, browser, errors } = await boot(old, { bank: 123456789 });
  const s = await page.evaluate(() => { const S = window.__lab.S.stands.snack; return { n: Object.keys(S.up).length, bank: S.bank, tl: Object.keys(S.up).filter((k) => ['teamstart', 'coach', 'stars', 'practice', 'bus', 'fanclub', 'hof', 'champs'].includes(k)).length }; });
  ok(s.n === Object.keys(old).length && Math.round(s.bank) === 123456789 && s.tl === 0, 'the old save keeps everything and its cash');
  ok((await page.locator('.teamcard').count()) === 1 && !(await page.locator('[data-up="teamstart"]').isDisabled()), 'the new challenge is waiting for him');
  if (errors.length) { console.log(errors); fails++; } await browser.close();
}
console.log(fails ? '\nFAILED' : '\nALL OK'); process.exit(fails ? 1 : 0);
