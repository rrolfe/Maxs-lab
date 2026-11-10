// Pure baseball rules for "Max's Ballpark" (no DOM, so bots can play thousands of games to tune the difficulty).
// An at-bat is an ARCADE game of timing, with no questions (Rob, Nov 10 2026): the pitcher throws, Max taps SWING when the ball is in the glowing ring,
// and holds off on pitches outside the strike zone. How well he times it decides the hit. Games cost pearls (see js/core/economy.js).
export const HIT = { 1: 'single', 2: 'double', 3: 'triple', 4: 'homer' };

// Tunables (kept in one place so the bots and the game agree)
export const CFG = {
  // timing windows in pitch-travel fractions (0..1): half-width of the "perfect" and "good" zones around SWEET
  perfect: 0.075,
  good: 0.17,
  // opponents: runs-per-inning weights for 0,1,2,3,4 runs; pitch travel time (ms) for a fastball; share of strikes; share of curveballs and changeups
  opp: {
    dinos: { runs: [0.36, 0.28, 0.19, 0.10, 0.07], ms: 1750, zone: 0.72, curve: 0.0, change: 0.12, emoji: '🦖' },
    rockets: { runs: [0.22, 0.26, 0.24, 0.15, 0.13], ms: 1500, zone: 0.62, curve: 0.18, change: 0.2, emoji: '🚀' },
    pirates: { runs: [0.14, 0.22, 0.26, 0.2, 0.18], ms: 1300, zone: 0.52, curve: 0.3, change: 0.2, emoji: '🏴‍☠️' },
  },
  // what a swing does, by how well it was timed: [homer, triple, double, single] weights, and the rest is a ball caught by a fielder
  table: { perfect: [0.10, 0.04, 0.16, 0.30], good: [0.01, 0.02, 0.07, 0.22] },
  defenseSavePenalty: 1,      // runs removed when Max makes the great play on defense
};
/** The strike zone is the box |x| <= ZONE and |y| <= ZONE (pitch locations run from -1 to 1). */
export const ZONE = 0.5;

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

/** The next pitch: where it crosses the plate (x, y in -1..1), whether that is a strike, and how it travels. */
export function nextPitch(opp, r = Math.random) {
  const o = CFG.opp[opp], inZone = r() < o.zone;
  let x, y;
  if (inZone) { x = (r() * 2 - 1) * ZONE * 0.95; y = (r() * 2 - 1) * ZONE * 0.95; }
  else { const a = r() * Math.PI * 2, m = 0.72 + r() * 0.26; x = Math.cos(a) * m * 1.1; y = Math.sin(a) * m; if (Math.max(Math.abs(x), Math.abs(y)) <= ZONE + 0.08) x = x < 0 ? -0.75 : 0.75; x = Math.max(-1, Math.min(1, x)); }
  const k = r(), kind = k < o.curve ? 'curve' : k < o.curve + o.change ? 'change' : 'fast';
  const ms = Math.round(o.ms * (kind === 'change' ? 1.3 : kind === 'curve' ? 1.1 : 1));
  return { x, y, inZone: Math.abs(x) <= ZONE && Math.abs(y) <= ZONE, kind, ms, bend: (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.4) };
}

/** Max lets a pitch go by. Returns {kind: 'ball'|'strike'|'walk'|'strikeout', runs}. */
export function takePitch(s, pitch) {
  if (!pitch.inZone) {
    s.balls++;
    if (s.balls >= 4) { const runs = walk(s); s.score.me += runs; s.stats.bb++; s.stats.rbi += runs; resetCount(s); return { kind: 'walk', runs }; }
    return { kind: 'ball', runs: 0 };
  }
  s.strikes++;
  if (s.strikes >= 3) { s.stats.ab++; s.stats.k++; batterOut(s); return { kind: 'strikeout', runs: 0, looking: true }; }
  return { kind: 'strike', runs: 0, looking: true };
}

function pickHit(timing, r) {
  const w = CFG.table[timing]; let x = r();
  for (let i = 0; i < 4; i++) { x -= w[i]; if (x <= 0) return 4 - i; }
  return 0;      // caught
}

/**
 * Max swings. timing 'perfect' | 'good' | 'early' | 'late' | 'miss'.
 * Returns {kind, hit?, runs}. kind: single/double/triple/homer, foul, strike, strikeout, groundout/flyout, sacfly.
 */
export function swingAt(s, pitch, timing, r = Math.random) {
  let outcome;
  if (!pitch.inZone) outcome = (timing === 'perfect' || timing === 'good') && r() < 0.5 ? 'foul' : 'strike';     // chasing a ball: a whiff or a weak foul
  else if (timing === 'miss') outcome = 'strike';
  else if (timing === 'early' || timing === 'late') outcome = r() < 0.75 ? 'foul' : 'out';
  else { const hit = pickHit(timing, r); outcome = hit || 'out'; }
  if (outcome === 'foul') { if (s.strikes < 2) s.strikes++; return { kind: 'foul', runs: 0, timing }; }
  if (outcome === 'strike') {
    s.strikes++;
    if (s.strikes >= 3) { s.stats.ab++; s.stats.k++; batterOut(s); return { kind: 'strikeout', runs: 0, timing }; }
    return { kind: 'strike', runs: 0, timing };
  }
  if (outcome === 'out') {
    s.stats.ab++;
    const fly = r() < 0.5;
    if (fly && s.bases[2] && s.outs < 2) { s.bases[2] = false; s.score.me += 1; s.stats.rbi += 1; batterOut(s); return { kind: 'sacfly', runs: 1, timing }; }
    batterOut(s); return { kind: fly ? 'flyout' : 'groundout', runs: 0, timing };
  }
  const runs = advance(s, outcome);
  s.score.me += runs; s.stats.ab++; s.stats.h++; s.stats.rbi += runs; if (outcome === 4) s.stats.hr++; if (timing === 'perfect') s.stats.perfect++;
  resetCount(s);
  return { kind: HIT[outcome], hit: outcome, runs, timing };
}
export const halfOver = (s) => s.outs >= 3;

/** The opponent's half-inning. saved = Max made the great play on defense. */
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

/** Timing: where the bat meets the pitch (0..1 along its flight) against the sweet spot where the ring glows. */
export const SWEET = 0.86;
export function timingOf(t) {
  if (t == null || t >= 1.02) return 'miss';
  const d = t - SWEET;
  if (Math.abs(d) <= CFG.perfect) return 'perfect';
  if (Math.abs(d) <= CFG.good) return 'good';
  if (d < -CFG.good && d > -0.34) return 'early';
  if (d > CFG.good && d < 0.2) return 'late';
  return 'miss';
}
