// Grown-up corner: "Start a game over" sends one game (or all) back to the beginning without touching pearls, and a safety copy is taken first.
import { open, shot } from './lib.mjs';
const lang = process.argv[2] || 'en';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const seed = {
  schema: 2, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 }, pearls: { balance: 777, earned: 4000, spent: 3223 },
  unlocked: { lemonade: true, snack: true, icecream: true, pizza: true },
  stands: { lemonade: { bank: 500, days: 20, seasons: 2, up: { sign: 1, table: 1 }, tickets: 0 }, snack: { bank: 99999, days: 40, seasons: 3, up: { field2: 1, field3: 1, merch: 1 }, tickets: 0, perks: { goldendog: 1 } }, icecream: { bank: 80, days: 5, seasons: 1, up: {}, tickets: 0 }, pizza: { bank: 9, days: 3, best: 1, level: 2, up: {} } },
  words: { solved: { 'ws:en:cat': 1, 'ws:en:dog': 1 }, served: {}, wins: { hm: 4, ws: 6 }, tier: { hm: 3, ws: 4 }, streak: { hm: 2, ws: 2 } },
  baseball: { games: 9, wins: 5, bestRuns: 7, hr: 3, hits: 20, k: 4, last: null },
  passport: { stamps: { paris: 1 }, people: {}, badges: {} },
};
const A = await open({ lang, state: seed });
const st = (fn) => A.page.evaluate(async (src) => { const S = (await import('./js/core/store.js')).S; return (new Function('S', 'return ' + src))(S); }, fn);
await A.page.evaluate(() => { location.hash = '#/grownup'; }); await A.page.waitForTimeout(800);
await A.page.locator('details.gsec summary', { hasText: /Start a game over|Empezar un juego de nuevo/ }).click(); await A.page.waitForTimeout(200);
const rows = await A.page.locator('details.gsec[open] [data-game]').count();
ok(rows === 6, 'six games are listed (' + rows + ')');
await shot(A.page, 'reset-list');

// one stand, keeping it unlocked
await A.page.locator('[data-game="lemonade"] button').click(); await A.page.waitForTimeout(200);
ok(await A.page.locator('.dialog #rskeep').isChecked(), 'keep-unlocked is ticked by default');
await shot(A.page, 'reset-confirm');
await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(800);
ok(await st("S.unlocked.lemonade") === true && await st("S.stands.lemonade.tickets") === 1 && await st("S.stands.lemonade.bank") === undefined, 'lemonade is back to the start but still unlocked, with its free season ticket');
ok(await st("S.stands.snack.bank") === 99999 && await st("S.pearls.balance") === 777, 'the other stands and the pearls are untouched');
const snaps = await A.page.evaluate(async () => (await (await import('./js/core/store.js')).listSnapshots()).length);
ok(snaps >= 1, 'a safety copy was saved first (' + snaps + ')');
// he can play it again from scratch
await A.page.evaluate(() => { location.hash = '#/stands/lemonade'; }); await A.page.waitForTimeout(900);
ok(await A.page.locator('.stand, .seasongate, .plan, #screen').first().isVisible() && (await A.page.locator('#screen').innerText()).length > 20, 'the stand opens again after the reset');
await A.page.evaluate(() => { location.hash = '#/grownup'; }); await A.page.waitForTimeout(800);
await A.page.locator('details.gsec summary', { hasText: /Start a game over|Empezar un juego de nuevo/ }).click();

// one stand, locking it again
await A.page.locator('[data-game="icecream"] button').click(); await A.page.waitForTimeout(150);
await A.page.locator('.dialog #rskeep').uncheck(); await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(600);
ok(await st("S.unlocked.icecream") === false && await st("S.stands.icecream") === undefined, 'with the box un-ticked the stand is locked again (needs pearls to reopen)');
// words and baseball
await A.page.locator('details.gsec[open] [data-game="words"] button').click(); await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(500);
ok(await st("S.words.tier.ws") === 1 && await st("Object.keys(S.words.solved).length") === 0 && await st("S.words.wins.hm") === 0, 'word games go back to level 1');
await A.page.locator('details.gsec[open] [data-game="baseball"] button').click(); await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(500);
ok(await st("S.baseball.games") === 0 && await st("S.baseball.hr") === 0, 'baseball stats are cleared');
ok(await st("Object.keys(S.passport.stamps).length") === 1 && await st("S.pearls.earned") === 4000, 'stamps and pearls are never touched');
// all games needs the typed word
await A.page.locator('#rsall').click(); await A.page.waitForTimeout(150);
await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(300);
ok(await st("S.stands.snack.bank") === 99999, 'ALL games does nothing until the word is typed');
await A.page.locator('.dialog input.textin').fill(lang === 'es' ? 'reiniciar' : 'restart'); await A.page.locator('#rsyes').click(); await A.page.waitForTimeout(700);
ok(await st("S.stands.snack.bank") === undefined && await st("S.stands.snack.tickets") === 1 && await st("S.stands.pizza.tickets") === 1 && await st("S.pearls.balance") === 777, 'ALL games reset; pearls still 777');
ok(A.errors.length === 0, 'console clean ' + A.errors.join('/'));
await A.browser.close();
console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
