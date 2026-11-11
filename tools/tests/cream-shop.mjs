// The big Ice Cream Parlor shop in the browser (Nov 11 2026): tabs, goal, secret flavors, today's special, places, toppings on the receipt, big crowds and old saves.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en', device = process.argv[3] || 'ipad-land';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
async function boot(up, extra = {}) {
  const { page, browser, errors } = await open({ lang, device });
  await page.evaluate(async ({ up, extra }) => {
    const st = await import('./js/core/store.js'); const S = st.S;
    S.pearls = { balance: 2000, earned: 2000, spent: 0 }; S.settings.dailyLimit = 0; S.settings.bedtime = ''; S.unlocked.icecream = true;
    S.stands.icecream = { bank: 200, days: 12, best: 20, total: 300, up, next: { weather: 'hot', event: null }, last: { price: 2, stock: 3, sold: 30, pricey: 1, soldout: 0, busy: 0, leftover: 2, profit: 25, weather: 'sunny' },
      price: 2, stock: 4, seasons: 8, season: { day: 2, profit: 80, cust: 50, startBank: 20, bestDay: 30 }, tickets: 0, bestSeason: 0, perks: {}, mstock: {}, level: 'normal', deal: false, ...extra };
    st.save();
  }, { up, extra });
  await page.evaluate(() => { location.hash = '#/stands'; }); await page.waitForTimeout(250);
  await page.evaluate(() => { location.hash = '#/stands/icecream'; }); await page.waitForSelector('.forecast', { timeout: 5000 });
  return { page, browser, errors };
}
const w = (page, ms) => page.waitForTimeout(ms);
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__lab.S.stands.icecream)));

// ---- 1. an old save keeps everything, and the old shop owner already has the steps before it
{
  const up = { sign: 1, table: 1, freezer: 1, cone: 1, toppings: 1, helper: 1, truck: 1, party: 1, shop: 1 };
  const { page, browser, errors } = await boot(up, { bank: 5000 });
  const s = await st(page);
  ok(Object.keys(up).every((k) => s.up[k]), 'every old extra is still owned');
  ok(s.up.umbrella && s.up.trailer, 'the old shop owner already has the look steps before it');
  ok(!!(await page.$('.scene.look-corner')), 'the parlor looks like a corner shop');
  ok((await page.$$('.ptab')).length === 9, 'nine paths');
  ok((await page.$$('.dstep')).length === 8 && (await page.$$('.dstep.lit')).length === 0, 'the Sundae Island strip shows eight dark pieces');
  ok(Math.round(s.bank) === 5000, 'the bank is untouched by opening the screen');
  ok(!(await page.locator('.forecast .ev').count()) || /party|fiesta|scoops|bolas|school|escuela|Ice Cream|Helado|Shark|Tiburón|Jingle|melod|strawberr|fresas|Free Cone|Cono|game|juego|road|obras|dino|cohete|rocket|arco|rainbow|mystery|misterioso|newspaper|periódico/i.test(await page.locator('.forecast .ev').innerText()), 'the day story reads as words');
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 2. tabs, saving goal, secrets, buying
{
  const { page, browser, errors } = await boot({ sign: 1, table: 1, sundaebowl: 1 }, { bank: 100, seasons: 8 });
  ok(!!(await page.$('.scene.look-cart')), 'a new stand is a cart');
  await page.locator('.ptab[data-path="treats"]').click(); await w(page, 200);
  const shown = await page.$$eval('.ppanel .upg[data-up]', (b) => b.length); ok(shown >= 2 && shown <= 3, `the Toppings tab shows a few cards (${shown})`);
  ok((await page.locator('.ppanel .upg.mystery').count()) === 1, 'and a mystery card');
  // secret flavors show a riddle, never the name
  await page.locator('.ptab[data-path="cones"]').click(); await w(page, 200);
  const nSecret = await page.locator('.ppanel .upg.secret').count();
  if (nSecret) { const txt = await page.locator('.ppanel .upg.secret').first().innerText(); ok(/Secret flavor|Sabor secreto/.test(txt) && !/Chomp|Chip-asaurus|Galaxy|Home Run|Invent/.test(txt), 'a secret flavor shows a riddle instead of its name'); }
  else ok(true, 'no secret flavor in the first three cards (fine)');
  // save for something pricey
  let goalBtn = page.locator('.goalbtn').first();
  for (const tab of ['cones', 'gear', 'crew', 'promo', 'wheels', 'pals', 'brand', 'shop', 'treats']) {
    if (await goalBtn.count()) break;
    await page.locator(`.ptab[data-path="${tab}"]`).click(); await w(page, 120); goalBtn = page.locator('.goalbtn').first();
  }
  ok(await goalBtn.count() > 0, 'some card says "save for this" when he cannot afford it yet');
  if (await goalBtn.count()) {
    const id = await goalBtn.getAttribute('data-goal'); await goalBtn.click(); await w(page, 150);
    ok((await st(page)).goal === id, `tapping "save for this" sets the goal (${id})`);
    ok(/Saving for|Ahorrando/.test(await page.locator('.saving').innerText()), 'the banner says what he is saving for');
  } else ok(true, 'nothing to save for yet (everything affordable)');
  // buy an affordable sprinkle
  await page.locator('.ptab[data-path="treats"]').click(); await w(page, 150);
  const first = page.locator('.ppanel .upg:not([disabled]):not(.mystery)').first();
  const upId = await first.getAttribute('data-up'), bankBefore = (await st(page)).bank;
  await first.click(); await w(page, 300);
  const s = await st(page);
  ok(!!s.up[upId] && s.bank < bankBefore, `buying works (${upId}: ${bankBefore} -> ${s.bank})`);
  await shot(page, `cream-shop-${lang}-${device}`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 3. today's special, toppings on the receipt
{
  const { page, browser, errors } = await boot({ sign: 1, table: 1, sundaebowl: 1, sprinkles: 1, zigzag: 1, whipcherry: 1, hotfudge: 1 }, { bank: 300, seasons: 8 });
  ok((await page.locator('.specialsel .spotchip').count()) === 4, 'four treats to choose a special from');
  await page.locator('.specialsel .spotchip[data-special="hotfudge"]').click(); await w(page, 250);
  ok((await st(page)).special === 'hotfudge', 'the chosen special is remembered');
  ok((await page.locator('.specialsel .spotchip[data-special="hotfudge"].on').count()) === 1, 'and it lights up');
  await page.locator('.openrow .btn.go').click(); await w(page, 300);
  await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(page, 400);
  ok(!!(await page.$('.receipt')), 'the day ran and the receipt shows');
  const rec = await page.locator('.receipt').first().innerText();
  ok(/Toppings & treats|Toppings y antojos/.test(rec), 'the receipt shows the money from toppings and treats');
  ok((await page.locator('.addchips .chip').count()) >= 2, 'and what people added');
  await shot(page, `cream-receipt-${lang}-${device}`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 4. places to open: the numbers change, the day runs
{
  const { page, browser, errors } = await boot({ sign: 1, table: 1, splash: 1, beach: 1, dinomuseum: 1 }, { bank: 300, seasons: 8 });
  ok((await page.$$('.spotchip:not(.special)')).length === 4, 'home plus three places to open');
  const num = async () => parseInt((await page.locator('.crowdhint').innerText()).replace(/[^0-9]/g, ''), 10);
  const home = await num();
  await page.locator('.spotchip[data-spot="beach"]').click(); await w(page, 300);
  const beach = await num();
  ok(beach > home * 2, `the beach is far better on a hot day (${home} -> ${beach})`);
  ok((await st(page)).spot === 'beach', 'the place is remembered');
  await page.locator('.openrow .btn.go').click(); await w(page, 300);
  await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(page, 400);
  ok(!!(await page.$('.receipt')), 'the day ran at the beach and the receipt shows');
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 5. a huge parlor: a big crowd runs smoothly, the tub stepper takes big steps, the island scene shows
{
  const big = 'sign table freezer cone toppings helper truck party shop umbrella trailer booths sweetparlor castle factory blast walkin dipcab dairy churn soft kiosk lead team20 manager drive reg2 squad radio billboard tv mascot photowall dock conebeach volcano rocketcart truck2 parlor2 retro drones'.split(' ');
  const { page, browser, errors } = await boot(Object.fromEntries(big.map((k) => [k, 1])), { bank: 90000, seasons: 12, stock: 100, price: 4 });
  const t0 = Date.now();
  const crowd = parseInt((await page.locator('.crowdhint').innerText()).replace(/[^0-9]/g, ''), 10);
  ok(crowd > 800, `a big parlor expects a big crowd (${crowd})`);
  ok(!!(await page.$('.scene.look-factory')), 'the parlor looks like a factory');
  await page.locator('.stepper').nth(1).locator('button').nth(1).click(); await w(page, 150);
  const stock = parseInt(await page.locator('.stepper').nth(1).locator('output').innerText(), 10);
  ok(stock >= 110, `the tub stepper takes big steps (100 -> ${stock})`);
  await page.locator('.openrow .btn.go').click(); await w(page, 300);
  await page.locator('button', { hasText: /Skip to the end|Saltar al final/ }).click(); await w(page, 600);
  ok(!!(await page.$('.receipt')), `a day with ${crowd} customers finishes (${Date.now() - t0} ms)`);
  const rec = await page.locator('.receipt').first().innerText();
  ok(/Your other shops paid you|Tus otras tiendas te pagaron/.test(rec), 'the other shops show on the receipt');
  await shot(page, `cream-receipt-big-${lang}-${device}`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}

// ---- 6. a party day shows the right number of scoops and tubs
{
  const { page, browser, errors } = await boot({ sign: 1, cone: 1, party: 1, classparty: 1, freezer: 1, cooler: 1 }, { bank: 800, seasons: 8, next: { weather: 'sunny', event: 'party' } });
  const ev = await page.locator('.forecast .ev').innerText();
  ok(/100/.test(ev) && /9/.test(ev), `the class party wants 100 scoops, 9 tubs ("${ev.trim()}")`);
  await browser.close(); if (errors.length) { console.log(errors); fails++; }
}
process.exit(fails ? 1 : 0);
