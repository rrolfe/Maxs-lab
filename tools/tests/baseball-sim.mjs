// Bots play whole arcade baseball games to check the difficulty curve.
// A bot's timing error is bell-shaped with spread `sd` (in pitch-travel units; a decent 7-year-old is about 0.09, a sharp one 0.06); `chase` = chance to swing at a pitch outside the zone.
import { newGame, nextPitch, takePitch, swingAt, timingOf, SWEET, halfOver, oppHalf, endMyHalf, endOppHalf } from '../../js/baseball/engine.js';
const mk = (s) => { let a = s; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
function play({ sd, chase, save, innings = 3, opp = 'dinos', seed }) {
  const r = mk(seed), s = newGame({ innings, opp }); let guard = 0;
  while (!s.over && guard++ < 60) {
    let myRuns = 0, pitches = 0;
    while (!halfOver(s) && pitches++ < 120) {
      const p = nextPitch(opp, r);
      const swings = p.inZone ? r() < 0.92 : r() < chase;
      const o = swings ? swingAt(s, p, timingOf(SWEET + gauss(r) * sd), r) : takePitch(s, p);
      myRuns += o.runs;
    }
    endMyHalf(s, myRuns);
    const o = oppHalf(s, r() < save, r); endOppHalf(s, o.runs);
  }
  return s;
}
const N = 3000; const rows = {};
for (const opp of ['dinos', 'rockets', 'pirates']) for (const innings of [3, 6]) for (const [name, sd, chase] of [['rookie', 0.13, 0.5], ['kid', 0.09, 0.3], ['sharp', 0.06, 0.12]]) {
  let w = 0, l = 0, t = 0, me = 0, op = 0;
  for (let i = 0; i < N; i++) { const s = play({ sd, chase, save: 0.45, innings, opp, seed: i * 31 + 7 }); me += s.score.me; op += s.score.opp; if (s.score.me > s.score.opp) w++; else if (s.score.me < s.score.opp) l++; else t++; }
  rows[`${opp} ${innings}inn ${name}`] = { win: Math.round((w / N) * 100) + '%', loss: Math.round((l / N) * 100) + '%', tie: Math.round((t / N) * 100) + '%', myRuns: (me / N).toFixed(1), oppRuns: (op / N).toFixed(1) };
}
console.table(rows);
