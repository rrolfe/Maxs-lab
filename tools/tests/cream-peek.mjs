// The "sneak peek" in the Ice Cream Parlor and Lemonade shops (Nov 18 2026):
// every path has something to look at in the current season, next season's things are shown (but cannot be bought early), and secrets stay secret.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
async function boot(stand, seasons, extra = {}) {
  const { page, browser, errors } = await open({ lang, device });
  await page.evaluate(async ({ stand, seasons, extra }) => {
    const st = await import('./js/core/store.js'); const S = st.S;
    S.pearls = { balance: 2000, earned: 2000, spent: 0 }; S.settings.dailyLimit = 0; S.settings.bedtime = ''; S.unlocked[stand] = true;
    S.stands[stand] = { bank: 40, days: 5, best: 20, total: 100, up: { sign: 1, table: 1 }, next: { weather: 'sunny', event: null }, price: 2, stock: 4, seasons, season: { day: 2, profit: 80, cust: 50, startBank: 20, bestDay: 30 }, tickets: 0, bestSeason: 0, perks: {}, mstock: {}, level: 'normal', deal: false, ...extra };
    st.save();
  }, { stand, seasons, extra });
  await page.evaluate(() => { location.hash = '#/stands'; }); await page.waitForTimeout(250);
  await page.evaluate((s) => { location.hash = '#/stands/' + s; }, stand); await page.waitForSelector('.forecast', { timeout: 5000 });
  return { page, browser, errors };
}
const w = (page, ms) => page.waitForTimeout(ms);

for (const stand of ['icecream', 'lemonade']) {
  // ---- early seasons: nothing is empty, the peek shows what is coming
  for (const seasons of [1, 2, 3]) {
    const { page, browser, errors } = await boot(stand, seasons);
    const tabs = await page.$$eval('.ptab', (b) => b.map((x) => x.dataset.path));
    const emptyTabs = [];
    for (const p of tabs) {
      await page.locator(`.ptab[data-path="${p}"]`).click(); await w(page, 120);
      // the Ice Cream Parlor must always have something to buy or look at; the older Lemonade stand only needs a "more coming" card on a path that opens later
      const n = await page.locator(stand === 'icecream' ? '.ppanel .upg:not(.mystery)' : '.ppanel .upg').count();
      const book = await page.locator('.ppanel .sticker').count();
      if (n + book === 0) emptyTabs.push(p);
    }
    ok(emptyTabs.length === 0, `${stand} season ${seasons}: no path is empty (${emptyTabs.join(',') || 'all have something'})`);
    const strip = await page.locator('.peekstrip').count();
    ok(strip === 1, `${stand} season ${seasons}: the sneak peek strip is there`);
    if (strip) {
      const txt = await page.locator('.peekstrip').innerText();
      ok(/\b\d+\b/.test(txt) && /🔭/.test(txt) , `${stand} season ${seasons}: the strip names the season and how many new things ("${txt.split('\n')[0]}")`);
      const pv = await page.locator('.peekstrip .pstep.pv').count(), all = await page.locator('.peekstrip .pstep').count();
      ok(stand === 'icecream' ? (pv > all / 2 && pv < all) : (pv >= 1 && pv <= all), `${stand} season ${seasons}: most are shown, some may stay a surprise (${pv} of ${all})`);
    }
    // peeks cannot be bought: they are not buttons, and clicking one changes nothing
    let peeked = 0, saw = false;
    for (const p of tabs) {
      await page.locator(`.ptab[data-path="${p}"]`).click(); await w(page, 100);
      const c = await page.locator('.upg.peek').count(); peeked += c;
      if (c) { saw = true; const before = await page.evaluate((s) => JSON.stringify(window.__lab.S.stands[s]), stand); await page.locator('.upg.peek').first().click({ force: true }); await w(page, 100); const after = await page.evaluate((s) => JSON.stringify(window.__lab.S.stands[s]), stand); ok(before === after, `${stand} season ${seasons}: tapping a peek card does not buy it`); break; }
    }
    ok(saw, `${stand} season ${seasons}: at least one path shows a locked next-season card`);
    ok(!(await page.locator('button.upg.peek').count()), `${stand} season ${seasons}: peek cards are not buttons`);
    // every peek card says which season it opens and has a price
    const bad = await page.$$eval('.upg.peek', (n) => n.filter((x) => !/\d/.test(x.querySelector('.lock')?.textContent || '') || !/\d/.test(x.querySelector('.tag')?.textContent || '')).length);
    ok(bad === 0, `${stand} season ${seasons}: peek cards show season and price`);
    if (errors.length) { console.log(errors); fails++; }
    if (seasons === 1) await shot(page, `peek-${stand}-${device}-${lang}`);
    if (device === 'phone') { const sw = await page.evaluate(() => [innerWidth, document.documentElement.scrollWidth]); ok(sw[1] <= sw[0] + 1, `${stand} phone: no sideways scroll (${sw})`); }
    await browser.close();
  }
  // ---- secrets never appear in the peek
  {
    const { page, browser } = await boot(stand, 1);
    const mod = await page.evaluate(async (s) => {
      const d = await import(s === 'icecream' ? './js/stands/cream-data.js' : './js/stands/lemon-data.js').catch(() => null);
      return d ? Object.keys(d) : [];
    }, stand);
    const peekIds = []; for (const p of await page.$$eval('.ptab', (b) => b.map((x) => x.dataset.path))) { await page.locator(`.ptab[data-path="${p}"]`).click(); await w(page, 80); peekIds.push(...await page.$$eval('.upg.peek', (n) => n.map((x) => x.dataset.peek))); }
    if (stand === 'icecream') {
      const secrets = await page.evaluate(async () => (await import('./js/stands/cream-data.js')).CREAM_UPGRADES.filter((u) => u.secret).map((u) => u.id));
      ok(!peekIds.some((id) => secrets.includes(id)), `icecream: secret flavors never show in the peek (${secrets.length} secrets, ${peekIds.length} peeks)`);
    } else ok(true, `lemonade: peeks listed (${peekIds.length})`);
    await browser.close();
  }
  // ---- the very end: nothing more is coming, so there is no strip
  {
    const { page, browser } = await boot(stand, 60, { bank: 100 });
    ok((await page.locator('.peekstrip').count()) === 0, `${stand} season 60: no peek strip when nothing more is coming`);
    await browser.close();
  }
}
console.log(fails ? `\n${fails} FAILED` : '\nall peek checks passed'); process.exit(fails ? 1 : 0);
