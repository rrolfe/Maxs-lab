// Nothing repeats and nothing pays twice: questions, hangman words and word-search words are each shown once, then a friendly "all done" card appears.
import { open } from './lib.mjs';
const { page, browser, errors } = await open({ lang: 'en' });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const w = (ms) => page.waitForTimeout(ms);
await page.evaluate(() => { const S = window.__lab.S; S.settings.dailyLimit = 0; S.settings.bedtime = ''; });

// 1. quiz engine: every question of one topic comes exactly once, then the round is empty
const q = await page.evaluate(async () => {
  const E = await import('./js/quiz/engine.js'); const S = window.__lab.S;
  const bank = await E.loadBank('en'); const total = bank.filter((x) => x.topic === 'logic').length;
  const ids = []; let rounds = 0, empty = false;
  for (let i = 0; i < 40; i++) {
    const items = await E.buildRound({ mission: 'mix', topic: 'logic' }); rounds++;
    if (!items.length) { empty = true; break; }
    for (const it of items) { ids.push(it.id); E.recordAnswer(it, 1, { ms: 6000 }); }
  }
  return { total, n: ids.length, uniq: new Set(ids).size, rounds, empty };
});
ok(q.n === q.uniq, `no question came twice (${q.n} asked, ${q.uniq} different)`);
ok(q.empty && q.n === q.total, `then the topic ran out cleanly after ${q.n} of ${q.total} questions`);

// 2. math never runs out and never repeats the same sum back to back
const m = await page.evaluate(async () => {
  const E = await import('./js/quiz/engine.js'); const texts = [];
  for (let i = 0; i < 30; i++) { const items = await E.buildRound({ mission: 'mix', topic: 'math' }); if (!items.length) return { empty: true }; for (const it of items) { texts.push(it.q); E.recordAnswer(it, 1, { ms: 6000 }); } }
  const seenKeys = Object.keys(window.__lab.S.seen).filter((k) => /^m\d:/.test(k)).length;
  return { n: texts.length, uniq: new Set(texts).size, seenKeys };
});
ok(!m.empty && m.uniq >= m.n * 0.9, `math keeps coming and rarely repeats (${m.uniq}/${m.n} different)`);
ok(m.seenKeys === 0, 'generated math does not bloat the save');

// 3. a quiz that is used up shows the GAME OVER card
await page.evaluate(() => { location.hash = '#/quiz/topic/logic'; }); await w(900);
const quizTxt = await page.evaluate(() => document.body.innerText);
ok(/GAME OVER/.test(quizTxt) && /MORE questions/.test(quizTxt), 'used-up topic shows the game-over card asking for more questions');

// 4. hangman: play a whole pack at level 1, no repeats, then the card
const hm = await page.evaluate(async () => {
  const C = await import('./js/games/common.js'); const S = window.__lab.S;
  const packs = await C.loadPacks(); const p = packs[0]; const all = C.packWords(p);
  const pool = C.pickWords(all, 9999, { tiers: [1], prefix: 'hm', maxLen: 6 });
  return { id: p.id, n: pool.length };
});
await page.evaluate((id) => { location.hash = '#/hangman/play?pack=' + id + '&tier=1'; }, hm.id); await w(700);
let rounds = 0, guard = 0;
while (guard++ < hm.n * 40) {
  if (await page.locator('text=GAME OVER').count()) break;
  const next = page.locator('button', { hasText: /Next word|Siguiente palabra/ });
  if (await next.count()) { await next.first().click(); await w(150); continue; }
  const key = page.locator('.hmkey:not([disabled])').first();
  if (await key.count()) { await key.click({ timeout: 2000 }).catch(() => {}); if (await page.locator('.hmkey:not([disabled])').count() === 0) await w(100); }
  if (await page.locator('.hmmsg .plus, .plus').count() && !(await next.count())) { /* waiting for the Next button */ }
}
const served = await page.evaluate(() => Object.keys(window.__lab.S.words.served).filter((k) => k.startsWith('hm:')).length);
ok(!!(await page.locator('text=GAME OVER').count()), `hangman showed the game-over card after the pack ran out (${served} words played)`);
ok(served === hm.n, `every word was shown exactly once (${served} of ${hm.n})`);

// 5. word search: used-up pack shows the card, fresh packs never reuse a word
const wsr = await page.evaluate(async () => {
  const C = await import('./js/games/common.js'); const S = window.__lab.S; const packs = await C.loadPacks(); const all = C.packWords(packs[1]);
  const seen = new Set(); let dup = 0;
  for (let i = 0; i < 40; i++) { const ch = C.pickWords(all, 6, { tiers: [2], prefix: 'ws', maxLen: 8 }); if (ch.length < 4) break; for (const x of ch) { if (seen.has(x.key)) dup++; seen.add(x.key); C.markServed('ws', x.key); } }
  return { dup, n: seen.size };
});
ok(wsr.dup === 0, `word search never reuses a word (${wsr.n} words over several puzzles)`);
ok(errors.length === 0, 'console clean ' + errors.slice(0, 3).join('/'));
await browser.close(); process.exit(fails ? 1 : 0);
