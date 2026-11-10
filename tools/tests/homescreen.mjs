// Home Screen icon: progress rides along in a cookie, a new empty icon picks it up, and the paste-a-code card covers the rest.
import { open } from './lib.mjs';
const lang = process.argv[2] || 'en';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const stamps = Object.fromEntries(Array.from({ length: 40 }, (_, i) => ['place' + i, { t: 1762000000000 + i, n: 1 }]));
const seed = {
  schema: 2, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 },
  pearls: { balance: 1234, earned: 5000, spent: 3766 }, unlocked: { lemonade: true, snack: true },
  passport: { stamps, people: {}, badges: { first: 1 } }, skill: { math: 5.2, reading: 4.1, words: 3, science: 3, world: 3, logic: 3 },
  settings: { pinHash: 'abc123hash', pinSalt: 'salty', dailyLimit: 45, bedtime: '19:30', voice: { en: '', es: '' } },
  stands: { snack: { bank: 99999, days: 40, up: { field2: 1, field3: 1, field4: 1, fields56: 1, window2: 1, merch: 1 }, seasons: 3, last: { big: 'x'.repeat(4000) }, lastItems: { a: 1 }, season: { day: 3, profit: 10, cust: 5, startBank: 1, bestDay: 3 } } },
  seen: Object.fromEntries(Array.from({ length: 600 }, (_, i) => ['q' + i, { n: 2, ok: 1, last: i, due: i }])),
};
const A = await open({ lang, state: seed });                                   // "Safari": has Max's progress
await A.page.waitForTimeout(2200);
const cookies = (await A.ctx.cookies()).filter((c) => c.name === 'mll_carry');
ok(cookies.length === 1, 'one carry cookie is written while Max plays');
ok(cookies[0] && cookies[0].value.length <= 3400 && cookies[0].value.length > 200, 'and it is small enough for a cookie (' + (cookies[0]?.value.length) + ' bytes)');
ok(cookies[0] && !cookies[0].httpOnly && cookies[0].sameSite === 'Lax', 'cookie is first-party, SameSite=Lax');

// a brand-new Home Screen icon: empty storage, but iOS copied the cookies
const B = await open({ lang, cookies, standalone: true });
await B.page.waitForTimeout(900);
const got = await B.page.evaluate(async () => { const S = (await import('./js/core/store.js')).S; return { b: S.pearls.balance, e: S.pearls.earned, un: S.unlocked, stamps: Object.keys(S.passport.stamps).length, pin: S.settings.pinHash, lim: S.settings.dailyLimit, up: Object.keys(S.stands.snack?.up || {}).length, bank: S.stands.snack?.bank, last: S.stands.snack?.last, math: S.skill.math, carried: !!S.carried, gifts: Object.keys(S.gifts).length }; });
ok(got.b === 1234 && got.e === 5000, 'the new icon starts with Max’s pearls (' + got.b + ')');
ok(got.un.lemonade && got.un.snack && got.stamps === 40 && got.up === 6 && got.bank === 99999, 'stands, unlocks and stamps came along ' + JSON.stringify({ stamps: got.stamps, up: got.up, bank: got.bank }));
ok(got.pin === 'abc123hash' && got.lim === 45 && got.math === 5.2, 'PIN, limits and levels came along');
ok(got.carried && got.gifts === 2, 'gifts are not given twice (balance stays ' + got.b + ')');
ok(got.last == null, 'yesterday’s long receipt is not carried (cookie stays small)');
ok(await B.page.locator('#recover').count() === 0, 'no "bring progress" card when the carry worked');
ok(/Welcome back|Bienvenido de nuevo/.test(await B.page.locator('body').innerText()), 'Max gets a friendly welcome');
await B.page.evaluate(() => window.__lab.flush()); await B.page.reload(); await B.page.waitForSelector('.hud');
ok(await B.page.evaluate(async () => (await import('./js/core/store.js')).S.pearls.balance) === 1234, 'still there after a reload');

// an icon where the cookie did NOT come along: the card asks for the transfer code
const code = await A.page.evaluate(async () => (await import('./js/core/store.js')).makeTransferCode());
const C = await open({ lang, standalone: true });
await C.page.waitForSelector('#recover', { timeout: 4000 });
ok(true, 'an empty icon with no cookie shows the "bring progress here" card');
await C.page.locator('#recover textarea').fill('nonsense');
await C.page.locator('#recover button.gold').click(); await C.page.waitForTimeout(400);
ok(await C.page.locator('#recover').count() === 1 && await C.page.evaluate(async () => (await import('./js/core/store.js')).S.pearls.balance) === 0, 'a bad code changes nothing');
await C.page.locator('#recover textarea').fill(code);
await C.page.locator('#recover button.gold').click(); await C.page.waitForTimeout(900);
ok(await C.page.locator('#recover').count() === 0 && await C.page.evaluate(async () => (await import('./js/core/store.js')).S.pearls.balance) === 1234, 'pasting the code brings everything over');
// "Not now" just closes it
const D = await open({ lang, standalone: true });
await D.page.waitForSelector('#recover'); await D.page.locator('#recover button.ghost').click();
ok(await D.page.locator('#recover').count() === 0, '"Not now" closes the card');
// Safari with no progress never shows it
const E = await open({ lang }); await E.page.waitForTimeout(1200);
ok(await E.page.locator('#recover').count() === 0, 'the card is only for the Home Screen icon');
// an icon that already has progress never shows it, and is never overwritten by the cookie
const F = await open({ lang, cookies, standalone: true, state: { gifts: seed.gifts, pearls: { balance: 5, earned: 50, spent: 45 } } });
await F.page.waitForTimeout(900);
ok(await F.page.locator('#recover').count() === 0 && await F.page.evaluate(async () => (await import('./js/core/store.js')).S.pearls.balance) === 5, 'a copy that already has progress is never overwritten by the cookie');

// erasing everything also erases the carried copy, so it cannot come back
await A.page.evaluate(async () => (await import('./js/core/store.js')).resetAll());
await A.page.waitForTimeout(300);
ok((await A.ctx.cookies()).filter((c) => c.name === 'mll_carry').length === 0, 'erase-all also removes the carried copy');

// a very big save still fits (least important parts are dropped first)
const big = { ...seed, stands: { snack: { ...seed.stands.snack, up: Object.fromEntries(Array.from({ length: 80 }, (_, i) => ['upgrade' + i, 1])) }, lemonade: { bank: 5, up: Object.fromEntries(Array.from({ length: 80 }, (_, i) => ['u' + i, 1])) } }, passport: { stamps: Object.fromEntries(Array.from({ length: 400 }, (_, i) => ['place-number-' + i, { t: 1762000000000 + i * 7919, n: i }])), people: Object.fromEntries(Array.from({ length: 80 }, (_, i) => ['person' + i, { t: i * 31, n: 1 }])), badges: {} } };
const G = await open({ lang, state: big }); await G.page.waitForTimeout(2200);
const gc = (await G.ctx.cookies()).filter((c) => c.name === 'mll_carry');
ok(gc.length === 1 && gc[0].value.length <= 3400, 'a huge save still makes a cookie under the limit (' + (gc[0]?.value.length ?? 'none') + ')');
ok(A.errors.length + B.errors.length + C.errors.length + D.errors.length + E.errors.length + F.errors.length + G.errors.length === 0, 'console clean ' + [...A.errors, ...B.errors, ...C.errors, ...G.errors].join('/'));
for (const x of [A, B, C, D, E, F, G]) await x.browser.close();
console.log(fails ? 'FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
