// The big Lemonade shop in the browser (Nov 10 2026): tabs, goal, stand looks, places to open, other shops' income, big crowds, and old saves.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const OLD = 'sign table cooler squeezer nugget umbrella cups flyers speaker helper flake spinner table2 wagon catering store'.split(' ');
const setup = (up, extra = {}) => ({ lang, state: undefined, up, extra });
async function boot(up, extra = {}) {
  const { page, browser, errors } = await open({ lang, device });
  await page.evaluate(async ({ up, extra }) => {
    const st = await import('./js/core/store.js'); const S = st.S;
    S.pearls = { balance: 2000, earned: 2000, spent: 0 }; S.settings.dailyLimit = 0; S.settings.bedtime = ''; S.unlocked.lemonade = true;
    S.stands.lemonade = { bank: 500, days: 12, best: 20, total: 300, up, next: { weather: 'hot', event: null }, last: { price: 1, stock: 40, sold: 30, pricey: 1, soldout: 0, busy: 0, leftover: 2, profit: 25, weather: 'sunny' },
      price: 1, stock: 40, seasons: 8, season: { day: 2, profit: 80, cust: 50, startBank: 20, bestDay: 30 }, tickets: 0, bestSeason: 0, perks: {}, mstock: {}, level: 'normal', deal: false, ...extra };
    st.save();
  }, { up, extra });
  await page.evaluate(() => { location.hash = '#/stands'; }); await page.waitForTimeout(250);
  await page.evaluate(() => { location.hash = '#/stands/lemonade'; }); await page.waitForSelector('.forecast', { timeout: 5000 });
  return { page, browser, errors };
}
const w = (page, ms) => page.waitForTimeout(ms);
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__lab.S.stands.lemonade)));

// ---- 1. an old save keeps everything, and the old store owner already has the steps before it
{
  const up = Object.fromEntries(OLD.map((k) => [k, 1]));
  const { page, browser, errors } = await boot(up, { bank: 2000 });
  const s = await st(page);
  ok(OLD.every((k) => s.up[k]), 'every old extra is still owned');
  ok(s.up.shoprent && s.up.counter, 'the old store owner already has the shop steps before it');
  ok(!!(await page.$('.scene.look-shop')), 'the stand looks like a shop');
  ok((await page.$$('.dstep.lit')).length === 3, 'the dream strip shows the first three steps lit');
  ok((await page.$$('.ptab')).length === 8, 'eight paths');
  ok(Math.round(s.bank) === 2000, 'the bank is untouched by opening the screen');
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 2. tabs, saving goal, buying
{
  const { page, browser, errors } = await boot({ sign: 1, table: 1, cooler: 1 }, { bank: 100, seasons: 8 });
  ok(!!(await page.$('.scene.look-cart')), 'a new stand is a cart');
  await page.locator('.ptab[data-path="gear"]').click(); await w(page, 200);
  ok((await page.locator('.ppanel .upg[data-up]').count()) >= 2, 'the Gear tab shows a few things to buy');
  ok((await page.locator('.ppanel .upg.mystery').count()) === 1, 'and a mystery card');
  const shown = await page.$$eval('.ppanel .upg[data-up]', (b) => b.length); ok(shown <= 3, `at most three cards at a time (${shown})`);
  // save for something pricey
  await page.locator('.ptab[data-path="look"]').click(); await w(page, 150);
  const goalBtn = page.locator('.goalbtn').first();
  if (await goalBtn.count()) {
    const id = await goalBtn.getAttribute('data-goal'); await goalBtn.click(); await w(page, 150);
    ok((await st(page)).goal === id, `tapping "save for this" sets the goal (${id})`);
    ok(/Saving for|Ahorrando/.test(await page.locator('.saving').innerText()), 'the banner says what he is saving for');
  } else ok(true, 'nothing to save for yet (everything affordable)');
  // buy an affordable thing
  await page.locator('.ptab[data-path="gear"]').click(); await w(page, 150);
  const first = page.locator('.ppanel .upg:not([disabled]):not(.mystery)').first();
  const upId = await first.getAttribute('data-up'), bankBefore = (await st(page)).bank;
  await first.click(); await w(page, 300);
  const s = await st(page);
  ok(!!s.up[upId] && s.bank < bankBefore, `buying works (${upId}: ${bankBefore} -> ${s.bank})`);
  await shot(page, `lemon-shop-${lang}-${device}`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 3. places to open: the numbers change, the day runs, and the receipt shows
{
  const { page, browser, errors } = await boot({ sign: 1, table: 1, park: 1, beach: 1, dinomuseum: 1 }, { bank: 300, seasons: 8 });
  ok((await page.$$('.spotchip')).length === 4, 'home plus three places to open');
  const num = async () => parseInt((await page.locator('.crowdhint').innerText()).replace(/[^0-9]/g, ''), 10);
  const home = await num();
  await page.locator('.spotchip[data-spot="beach"]').click(); await w(page, 300);
  const beach = await num();
  ok(beach > home, `the beach is better on a hot day (${home} -> ${beach})`);
  ok((await st(page)).spot === 'beach', 'the place is remembered');
  await page.locator('.openrow .btn.go').click(); await w(page, 300);
  await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(page, 400);
  ok(!!(await page.$('.receipt')), 'the day ran at the beach and the receipt shows');
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 4. another shop pays every day, a big crowd runs smoothly, and the cup stepper takes big steps
{
  const big = 'sign table cooler squeezer nugget umbrella cups flyers speaker helper flake spinner table2 wagon awning wooden lights shoprent counter store bakery shop2 radio billboard fridge walkin juicer cashier cousins lead crew5 aprons bike scooter catering partypacks'.split(' ');
  const { page, browser, errors } = await boot(Object.fromEntries(big.map((k) => [k, 1])), { bank: 5000, seasons: 12, stock: 200, price: 2.5 });
  const t0 = Date.now();
  const crowd = parseInt((await page.locator('.crowdhint').innerText()).replace(/[^0-9]/g, ''), 10);
  ok(crowd > 400, `a big stand expects a big crowd (${crowd})`);
  await page.locator('.stepper').nth(1).locator('button').nth(1).click(); await w(page, 150);
  const stock = parseInt(await page.locator('.stepper').nth(1).locator('output').innerText(), 10);
  ok(stock === 300, `the cup stepper adds 100 at a time (200 -> ${stock})`);
  await page.locator('.openrow .btn.go').click(); await w(page, 300);
  await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(page, 500);
  ok(!!(await page.$('.receipt')), `a day with ${crowd} customers finishes (${Date.now() - t0} ms)`);
  const rec = await page.locator('.receipt').innerText();
  ok(/Your other shops paid you|Tus otras tiendas te pagaron/.test(rec), 'the other shop shows on the receipt');
  const after = await st(page); ok(after.bank > 5000 - 100, `bank after the day is sensible (${Math.round(after.bank)})`);
  await shot(page, `lemon-receipt-big-${lang}-${device}`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 5. a catering day shows the right number of cups
{
  const { page, browser, errors } = await boot({ sign: 1, wagon: 1, catering: 1, partypacks: 1, fridge: 1, walkin: 1 }, { bank: 800, seasons: 8, next: { weather: 'sunny', event: 'catering' } });
  const ev = await page.locator('.forecast .ev').innerText();
  ok(/100/.test(ev), `party packs make the catering order 100 cups ("${ev.trim()}")`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}
process.exit(fails ? 1 : 0);
