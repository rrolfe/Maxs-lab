// Max's progress must survive the Nov 17 update. An OLD save (no Number Patterns / Read It Loud keys at all) has to load untouched,
// keep every old value while both new games are opened and played, still be there after a reload, and the new progress has to be kept too.
import { open, BASE } from './lib.mjs';
const FAKE = () => {
  class FakeSR { constructor() { this.ended = false; window.__sr = this; } start() { setTimeout(() => this.onstart && this.onstart(), 30); } stop() { setTimeout(() => this.endNow(), 20); } abort() { this.endNow(); } endNow() { if (!this.ended) { this.ended = true; this.onend && this.onend(); } }
    say(text, final) { const r = Object.assign([{ transcript: text }], { isFinal: !!final }); this.onresult && this.onresult({ results: [r] }); } }
  window.webkitSpeechRecognition = FakeSR; window.SpeechRecognition = FakeSR;
};
const OLD = {
  schema: 1, gifts: { '2026-11-07-rob-200': 200, '2026-11-07-rob-snack-300': 300 }, pearls: { balance: 321, earned: 900, spent: 400 }, unlocked: { lemonade: true, snack: true },
  stands: { lemonade: { bank: 777, up: { sign: 1, table: 1 }, days: 4, best: 6, total: 20 } }, passport: { stamps: { paris: 1 }, badges: { first: 1700000000000 }, people: {} },
};
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
const { browser, page, errors } = await open({ device: 'ipad-land', lang: 'en', state: OLD, init: FAKE });
const snap = () => page.evaluate(() => { const S = window.__lab.S; return { pearls: S.pearls, unlocked: S.unlocked, stands: S.stands, stamps: S.passport.stamps, oldBadge: S.passport.badges.first, gifts: S.gifts, skill: S.skill, tally: S.tally, settings: S.settings, lang: S.lang,
  patterns: S.patterns, read: { done: Object.keys(S.read.done).length, cfg: S.read.cfg }, newSeen: S.newSeen }; });
await page.waitForSelector('.hub');
const before = await snap();
ok(before.pearls.balance === 321 && before.pearls.earned === 900 && before.stands.lemonade.bank === 777 && before.stamps.paris === 1, 'old values are there after loading');
ok(await page.locator('.newshelf .newcard').count() === 3, 'the NEW shelf shows for an old save');
ok(before.read.done === 0 && before.patterns.runs === 0 && before.read.cfg.strict === 1 && before.read.cfg.listen === 'auto', 'new games start with clean defaults');

ok(await page.evaluate(() => { const b = window.__lab.S.boise; return !!b && Object.keys(b.done).length === 0 && Object.keys(b.cats).length === 0; }), 'Learning about Boise starts empty for an old save');

// read three facts with the (pretend) microphone, then leave in the middle of a sitting
await page.goto(BASE + '#/read/play/sp'); await page.waitForSelector('.facttext');
for (let k = 0; k < 3; k++) {
  const text = await page.textContent('.facttext');
  await page.click('.micbtn'); await page.waitForSelector('.micbtn.on'); await page.evaluate((t) => window.__sr.say(t, true), text);
  await page.waitForSelector('.feedback.good'); await page.click('.btn.alt:has-text("Next fact")'); await page.waitForSelector('.facttext');
}
// open Number Patterns, start a game, leave without answering
await page.goto(BASE + '#/patterns'); await page.waitForSelector('.pathero'); await page.click('.pathero .btn'); await page.waitForSelector('.qlayout.pat');
await page.goto(BASE + '#/home'); await page.waitForSelector('.hub');
await page.evaluate(() => window.__lab.flush());
await page.reload(); await page.waitForSelector('.hub'); await page.waitForTimeout(300);
const after = await snap();
for (const k of ['unlocked', 'stands', 'stamps', 'gifts', 'skill', 'tally', 'settings', 'lang']) ok(JSON.stringify(before[k]) === JSON.stringify(after[k]), `${k} unchanged by the new games and the reload`);
ok(after.oldBadge === 1700000000000, 'the old badge is still there');
ok(after.pearls.earned === 900 + 24 && after.pearls.balance === 321 + 24, `three facts paid 4 + 5 + 5 + 10 first-of-day = 24 on top of the old balance (balance ${after.pearls.balance}, earned ${after.pearls.earned})`);
ok(after.read.done === 3, 'three facts are remembered after the reload');
ok(after.newSeen.read === undefined || after.newSeen.read === 0, 'an unfinished sitting does not count toward hiding the NEW card');
ok(await page.locator('.newshelf .newcard').count() === 3, 'the NEW shelf is still there');
ok(errors.length === 0, 'no page errors: ' + errors.join(' | '));
console.log(fails ? `${fails} problem(s)` : 'PASS an old save keeps everything, and the new games add to it');
await browser.close(); process.exit(fails ? 1 : 0);
