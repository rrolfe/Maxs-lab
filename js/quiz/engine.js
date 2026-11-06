// Adaptive quiz engine: ~80% target success, per-topic level 1-6, 8-question rounds
// (5 at level, 2 a level easier for confidence, 1 "boss" a level up that never costs anything).
import { S, TOPICS, levelOf, today, day, save, dateKey } from '../core/store.js';
import { shuffle, rng, hashStr, clamp } from '../core/dom.js';
import { makeMath } from './math.js';
import { MISSIONS } from './missions.js';
import { REWARD, payFor, penaltyFor } from '../core/economy.js';

const INTEREST = new Set(['sharks', 'dinosaurs', 'space', 'ocean', 'baseball']);
let bankCache = {};

export async function loadBank(lang) {
  if (bankCache[lang]) return bankCache[lang];
  const mod = await import(`../../data/questions.${lang}.js`);
  bankCache[lang] = mod.default;
  return bankCache[lang];
}
export const bankStats = async (lang) => {
  const b = await loadBank(lang); const out = {};
  for (const q of b) { const k = q.topic + ':' + q.level; out[k] = (out[k] || 0) + 1; }
  return out;
};

function customItems(lang) {
  return (S.settings.customQs || []).filter((c) => c.q && c.right && c.w1).map((c, i) => {
    const opts = shuffle([c.right, c.w1, c.w2, c.w3].filter(Boolean));
    return { id: 'dad:' + i + ':' + c.q.slice(0, 12), topic: 'dad', level: 3, type: 'choice', q: c.q, opts, a: opts.indexOf(c.right), why: c.why || '', hint: c.hint || '', tags: [], dad: true };
  });
}

function matches(item, filter) {
  if (!filter || (!filter.topics && !filter.tags)) return true;
  if (filter.topics?.includes(item.topic)) return true;
  if (filter.tags && item.tags?.some((t) => filter.tags.includes(t))) return true;
  return false;
}

/** Build one round of up to 8 questions. */
export async function buildRound({ mission = 'mix', topic = null, lang = S.lang, size = 8 }) {
  const bank = await loadBank(lang);
  const filter = topic ? { topics: [topic] } : MISSIONS[mission]?.filter || {};
  const r = Math.random;
  const pool = bank.filter((q) => matches(q, filter));
  const wantsMath = !topic ? (!filter.topics && !filter.tags) || filter.topics?.includes('math') : topic === 'math';
  const recent = new Set(S.recent.slice(-60));
  const todayK = today();

  // Generated math: ~14 fresh candidates across the levels near Max's math level.
  const lm = levelOf('math');
  const mathPool = [];
  if (wantsMath) for (let l = Math.max(1, lm - 1); l <= Math.min(6, lm + 1); l++) for (let k = 0; k < 8; k++) mathPool.push(makeMath(l, r, lang));
  const all = [...pool, ...mathPool];
  const lvlOf = (q) => levelOf(q.topic);
  const rel = (q) => q.level - lvlOf(q);

  const score = (q) => {
    let s = r();
    if (recent.has(q.id)) s -= 2;
    const seen = S.seen[q.id];
    if (seen?.due && seen.due <= todayK) s += 1.5;            // missed yesterday: bring it back
    if (INTEREST.has(q.tags?.[0]) || q.tags?.some((t) => INTEREST.has(t))) s += (mission === 'mix' || topic) ? 0.35 : 0.1;
    if (q.fun) s += 0.15;
    if (seen && seen.ok >= 2) s -= 0.6;                         // mastered items rest
    return s;
  };

  const slots = ['easy', 'at', 'at', 'at', 'boss', 'at', 'at', 'easy'].slice(0, size);
  const picked = [];
  const used = new Set();
  const lastTopic = () => picked[picked.length - 1]?.topic;
  const lastTypes = () => picked.slice(-2).map((p) => p.type);

  for (const slot of slots) {
    const want = (q) => (slot === 'at' ? rel(q) === 0 : slot === 'easy' ? rel(q) <= -1 && rel(q) >= -2 : rel(q) === 1);
    let cands = all.filter((q) => !used.has(q.id) && want(q));
    if (!cands.length) cands = all.filter((q) => !used.has(q.id) && Math.abs(rel(q)) <= 1);
    if (!cands.length) cands = all.filter((q) => !used.has(q.id));
    if (!cands.length) break;
    cands.sort((a, b) => score(b) - score(a));
    // variety: avoid 3 in a row of the same type, and the same topic back-to-back when possible
    let choice = cands.find((q) => q.topic !== lastTopic() && !(lastTypes().length === 2 && lastTypes().every((t) => t === q.type))) || cands[0];
    choice = { ...choice, slot, rel: rel(choice) };
    picked.push(choice); used.add(choice.id);
  }
  // A parent's custom question sneaks into slot 3 when there is one.
  const dad = customItems(lang);
  if (dad.length && picked.length > 4) { const d = dad[Math.floor(r() * dad.length)]; picked[2] = { ...d, slot: 'at', rel: 0 }; }
  return picked;
}

/** Present the options in a fixed shuffled order for this showing. */
export function prepare(q) {
  if (q.type === 'choice') {
    const tf = q.opts.length === 2;                               // keep True/False order stable
    const order = tf ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
    return { ...q, order, shown: order.map((i) => q.opts[i]), correctShown: order.indexOf(q.a) };
  }
  if (q.type === 'order') {
    let order = shuffle(q.opts.map((_, i) => i));
    if (order.every((v, i) => v === i)) order = order.reverse();
    return { ...q, order, shown: order.map((i) => q.opts[i]) };
  }
  return { ...q };
}

const BASE_POINTS = REWARD.quiz;
export const basePoints = (q) => BASE_POINTS[q.slot] ?? BASE_POINTS.at;
export const optionCount = (q) => (q.type === 'choice' ? q.opts.length : 4);
/** Pearls for a right answer: full on the first try, half on a second try (never on a 2-option question), half again with a hint. */
export function pointsFor(q, { wrong = 0, hinted = false }) {
  const pay = payFor(optionCount(q), basePoints(q), wrong);
  return hinted ? Math.floor(pay / 2) : pay;
}
/** Pearls lost for one wrong pick: small enough to forgive a slip, big enough that guessing loses on average. */
export const penaltyOf = (q) => penaltyFor(optionCount(q), basePoints(q));

/** Update the topic skill (logistic expectation, shrinking learning rate). success: 1 | 0.6 | 0 */
export function recordAnswer(q, success, { ms = 5000 } = {}) {
  const topic = TOPICS.includes(q.topic) ? q.topic : null;
  const d = day();
  d.q++; if (success >= 0.99) d.ok++;
  if (topic) { const dt = (d.topics[topic] ||= { q: 0, ok: 0 }); dt.q++; if (success >= 0.99) dt.ok++; }
  S.log.push({ t: Date.now(), topic: q.topic, lvl: q.level, ok: success, id: q.id });
  if (S.log.length > 400) S.log.splice(0, S.log.length - 400);
  S.recent.push(q.id); if (S.recent.length > 80) S.recent.splice(0, S.recent.length - 80);
  const sn = (S.seen[q.id] ||= { n: 0, ok: 0, last: 0 });
  sn.n++; sn.last = Date.now(); if (success >= 0.99) sn.ok++;
  if (success === 0) { const t = new Date(); t.setDate(t.getDate() + 1); sn.due = dateKey(t); } else if (success >= 0.99) delete sn.due;
  if (!topic) { save(); return null; }

  const R = S.skill[topic], D = q.level;
  const P = 1 / (1 + Math.exp(-2.8 * (R - D)));
  const K = S.tally[topic] < 15 ? 0.34 : 0.14;
  let s = success;
  if (q.slot === 'boss' && success === 0) s = P;                // a missed boss question never costs anything
  if (ms < 1200 && success >= 0.99 && D >= 3) s = P;            // answered too fast: probably a guess
  const before = levelOf(topic);
  S.skill[topic] = clamp(R + K * (s - P), 1, 6.99);
  S.tally[topic]++;
  save();
  return { before, after: levelOf(topic), topic };
}

export function topicSummary() {
  return TOPICS.map((t) => {
    const recent = S.log.filter((x) => x.topic === t).slice(-20);
    const acc = recent.length ? recent.reduce((a, b) => a + (b.ok >= 0.99 ? 1 : 0), 0) / recent.length : null;
    return { topic: t, level: levelOf(t), skill: S.skill[t], n: S.tally[t], acc };
  });
}
export function mostMissed(limit = 5) {
  return Object.entries(S.seen).filter(([, v]) => v.n - v.ok >= 1).sort((a, b) => (b[1].n - b[1].ok) - (a[1].n - a[1].ok)).slice(0, limit).map(([id, v]) => ({ id, miss: v.n - v.ok, n: v.n }));
}
