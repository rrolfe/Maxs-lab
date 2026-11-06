// Bots play whole baseball games to check the difficulty curve. "accuracy" = chance to answer the question for the called hit.
import { newGame, takePitch, swing, halfOver, oppHalf, endMyHalf, endOppHalf, runnersOn, CFG } from '../../js/baseball/engine.js';
const mk = (s) => { let a = s; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
// How good a typical 7-year-old is at the tap: chance of perfect/good by hit called, scaled by `tap` (1 = decent kid)
const tapOutcome = (want, tap, r) => { const pp = Math.max(0.05, (0.34 - 0.05 * (want - 1)) * tap), pg = 0.3 * tap, x = r(); return x < pp ? 'perfect' : x < pp + pg ? 'good' : x < pp + pg + 0.2 ? (r() < 0.5 ? 'early' : 'late') : 'miss'; };
// questions get harder as the called hit grows: accuracy falls a little per step (a kid at his level)
const answerFor = (acc, want, r) => { const a = Math.max(0.1, acc - 0.05 * (want - 1)); if (r() < a) return 'first'; return r() < 0.55 ? 'second' : 'wrong'; };
function play({ acc, tap = 1, innings = 3, opp = 'dinos', policy = 'smart', seed }) {
  const r = mk(seed), s = newGame({ innings, opp }); let guard = 0;
  while (!s.over && guard++ < 60) {
    let myRuns = 0, pitches = 0;
    while (!halfOver(s) && pitches++ < 80) {
      const on = runnersOn(s);
      let want = policy === 'cautious' ? 1 : policy === 'greedy' ? 4 : acc >= 0.85 ? (on >= 2 ? 3 : 2) : acc >= 0.65 ? 2 : 1;
      if (s.balls === 3 && policy === 'smart') { const t = takePitch(s, r); myRuns += t.runs; continue; }      // take ball 4 sometimes
      if (s.strikes === 2 && policy === 'smart') want = Math.min(want, 2);
      const ans = answerFor(acc, want, r), timing = ans === 'wrong' ? 'miss' : tapOutcome(want, tap, r);
      const o = swing(s, { want, answer: ans, timing }, r); myRuns += o.runs;
    }
    endMyHalf(s, myRuns);
    const defSaved = r() < Math.max(0.2, acc - 0.05);
    const o = oppHalf(s, defSaved, r); endOppHalf(s, o.runs);
  }
  return s;
}
const N = 3000; const rows = {};
for (const opp of ['dinos', 'rockets', 'pirates']) for (const innings of [3, 6]) for (const acc of [0.5, 0.7, 0.9]) {
  let w = 0, l = 0, t = 0, me = 0, op = 0;
  for (let i = 0; i < N; i++) { const s = play({ acc, innings, opp, seed: i * 31 + 7 }); me += s.score.me; op += s.score.opp; if (s.score.me > s.score.opp) w++; else if (s.score.me < s.score.opp) l++; else t++; }
  rows[`${opp} ${innings}inn acc${acc * 100}`] = { win: Math.round((w / N) * 100) + '%', loss: Math.round((l / N) * 100) + '%', tie: Math.round((t / N) * 100) + '%', myRuns: (me / N).toFixed(1), oppRuns: (op / N).toFixed(1) };
}
console.table(rows);
// strategy check: calling bigger hits should not be a dominant strategy for a 70% player
for (const policy of ['cautious', 'smart', 'greedy']) { let w = 0; for (let i = 0; i < N; i++) { const s = play({ acc: 0.7, policy, opp: 'rockets', seed: i * 13 + 5 }); if (s.score.me > s.score.opp) w++; } console.log('70% player, rockets, policy', policy, 'wins', Math.round((w / N) * 100) + '%'); }
