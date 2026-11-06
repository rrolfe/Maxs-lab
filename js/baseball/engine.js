// Pure baseball rules for "Max's Ballpark" (no DOM, so bots can play thousands of games to tune the difficulty).
// Flow of one at-bat: pick a swing (single / double / triple / home run = harder question = bigger reward) or take a pitch,
// answer the question (answer quality decides how good the swing can be), then tap to swing at the right moment.
export const HIT = { 1: 'single', 2: 'double', 3: 'triple', 4: 'homer' };

// Tunables (kept in one place so the bots and the game agree)
export const CFG = {
  // timing windows in pitch-travel fractions (0..1): half-width of the "perfect" and "good" zones, by the hit you called
  perfect: { 1: 0.12, 2: 0.1, 3: 0.085, 4: 0.07 },
  goodMult: 1.9,
  // opponents: runs-per-inning distribution weights for 0,1,2,3,4 runs, pitch travel time (ms) and name
  opp: {
    dinos: { runs: [0.36, 0.28, 0.19, 0.10, 0.07], ms: 1500, emoji: '🦖' },
    rockets: { runs: [0.22, 0.26, 0.24, 0.15, 0.13], ms: 1250, emoji: '🚀' },
    pirates: { runs: [0.14, 0.22, 0.26, 0.2, 0.18], ms: 1050, emoji: '🏴‍☠️' },
  },
  caught: { perfect: 0.24, good: 0.52 },     // chance a ball in play is caught
  ballChance: 0.42,           // when Max takes a pitch
  defenseSavePenalty: 1,      // runs removed when the defensive question is right the first time
};

export function newGame({ innings = 3, opp = 'dinos' } = {}) {
  return {
    innings, opp, inn: 1, half: 'me', outs: 0, balls: 0, strikes: 0, bases: [false, false, false],
    score: { me: 0, opp: 0 }, line: { me: [], opp: [] }, over: false, extra: 0,
    stats: { ab: 0, h: 0, hr: 0, k: 0, bb: 0, rbi: 0, perfect: 0 }, log: [],
  };
}
const cnt = (b) => b.filter(Boolean).length;
export const runnersOn = (s) => cnt(s.bases);

/** Move runners for a hit (1-4). Returns runs scored; mutates bases. */
export function advance(s, hit) {
  const [a, b, c] = s.bases; let runs = 0;
  if (hit === 4) { runs = 1 + cnt(s.bases); s.bases = [false, false, false]; }
  else if (hit === 3) { runs = cnt(s.bases); s.bases = [false, false, true]; }
  else if (hit === 2) { runs = (b ? 1 : 0) + (c ? 1 : 0); s.bases = [false, true, !!a]; }
  else { runs = c ? 1 : 0; s.bases = [true, !!a, !!b]; }
  return runs;
}
function walk(s) {
  const [a, b, c] = s.bases; let runs = 0;
  if (a && b && c) runs = 1;
  s.bases = [true, a ? true : b, a && b ? true : c];
  if (a && b && !c) s.bases = [true, true, true];
  return runs;
}
function resetCount(s) { s.balls = 0; s.strikes = 0; }
function batterOut(s) { s.outs++; resetCount(s); }

/** Max lets a pitch go by. Returns {kind: 'ball'|'strike'|'walk'|'strikeout', runs}. */
export function takePitch(s, r = Math.random) {
  if (r() < CFG.ballChance) {
    s.balls++;
    if (s.balls >= 4) { const runs = walk(s); s.score.me += runs; s.stats.bb++; s.stats.rbi += runs; resetCount(s); return { kind: 'walk', runs }; }
    return { kind: 'ball', runs: 0 };
  }
  s.strikes++;
  if (s.strikes >= 3) { s.stats.ab++; s.stats.k++; batterOut(s); return { kind: 'strikeout', runs: 0 }; }
  return { kind: 'strike', runs: 0 };
}

/**
 * Max swings. want 1-4, answer 'first' | 'second' | 'wrong', timing 'perfect' | 'good' | 'early' | 'late' | 'miss'.
 * Returns {kind, hit?, runs}. kind: single/double/triple/homer, foul, strike, strikeout, out (groundout/flyout), sacfly.
 */
export function swing(s, { want, answer, timing }, r = Math.random) {
  let outcome;
  if (answer === 'wrong') { const x = r(); outcome = x < 0.6 ? 'strike' : x < 0.85 ? 'foul' : 'out'; }
  else if (timing === 'miss') outcome = 'strike';
  else if (timing === 'early' || timing === 'late') outcome = 'foul';
  else {
    let hit = want;
    if (answer === 'second') hit = Math.max(1, want - 1);        // a second try still helps, just not as much
    if (timing === 'good') hit = Math.max(1, hit - 1);
    // fielders catch some balls: solid-but-not-perfect contact and second-try swings are caught more often
    const caught = (timing === 'perfect' ? CFG.caught.perfect : CFG.caught.good) + 0.04 * (hit - 1);
    outcome = r() < caught ? 'out' : hit;
  }
  if (outcome === 'foul') { if (s.strikes < 2) s.strikes++; return { kind: 'foul', runs: 0 }; }
  if (outcome === 'strike') {
    s.strikes++;
    if (s.strikes >= 3) { s.stats.ab++; s.stats.k++; batterOut(s); return { kind: 'strikeout', runs: 0 }; }
    return { kind: 'strike', runs: 0 };
  }
  if (outcome === 'out') {
    s.stats.ab++;
    const fly = r() < 0.5;
    if (fly && s.bases[2] && s.outs < 2) { s.bases[2] = false; s.score.me += 1; s.stats.rbi += 1; batterOut(s); return { kind: 'sacfly', runs: 1 }; }
    batterOut(s); return { kind: fly ? 'flyout' : 'groundout', runs: 0 };
  }
  const runs = advance(s, outcome);
  s.score.me += runs; s.stats.ab++; s.stats.h++; s.stats.rbi += runs; if (outcome === 4) s.stats.hr++; if (timing === 'perfect') s.stats.perfect++;
  resetCount(s);
  return { kind: HIT[outcome], hit: outcome, runs };
}
export const halfOver = (s) => s.outs >= 3;

/** The opponent's half-inning. saved = Max answered the defensive question right the first time. */
export function oppHalf(s, saved = false, r = Math.random) {
  const w = CFG.opp[s.opp].runs; let x = r() * w.reduce((a, b) => a + b, 0), runs = 0;
  for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0) { runs = i; break; } }
  const prevented = saved && runs > 0 ? Math.min(runs, CFG.defenseSavePenalty) : 0;
  runs -= prevented;
  s.score.opp += runs;
  return { runs, prevented, hits: Math.min(runs + Math.floor(r() * 3), 5) };
}

/** Close out the half-inning bookkeeping for Max's turn. */
export function endMyHalf(s, runsThisHalf) { s.line.me[s.inn - 1] = runsThisHalf; s.half = 'opp'; s.outs = 0; resetCount(s); s.bases = [false, false, false]; }
/** After the opponent's turn: move on, or finish (extra innings if tied after the last inning, up to 2 extras). */
export function endOppHalf(s, runs) {
  s.line.opp[s.inn - 1] = runs;
  const last = s.inn >= s.innings + s.extra;
  if (last) {
    if (s.score.me !== s.score.opp || s.extra >= 2) { s.over = true; return { over: true, result: s.score.me > s.score.opp ? 'win' : s.score.me < s.score.opp ? 'loss' : 'tie' }; }
    s.extra++;
  }
  s.inn++; s.half = 'me'; s.outs = 0; resetCount(s); s.bases = [false, false, false];
  return { over: false };
}

/** Timing: tap position t (0..1 along the pitch) against the centre 0.82 of the sweet spot. */
export const SWEET = 0.82;
export function timingOf(t, want) {
  if (t == null) return 'miss';
  const d = t - SWEET, p = CFG.perfect[want], g = p * CFG.goodMult;
  if (Math.abs(d) <= p) return 'perfect';
  if (Math.abs(d) <= g) return 'good';
  if (d < -g && d > -0.35) return 'early';
  if (d > g && d < 0.25) return 'late';
  return 'miss';
}
