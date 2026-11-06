// Pure-ish helpers for the Grown-up corner: time per program, "what to work on" suggestions, weekly check-in history.
import { S, TOPICS, dateKey, levelOf } from '../core/store.js';

export const PROGRAMS = ['quiz', 'words', 'hangman', 'stands', 'baseball', 'world', 'passport', 'chores', 'checkin', 'home'];
const TILE = { quiz: 'tileQuiz', words: 'tileWords', hangman: 'tileHangman', stands: 'tileStands', baseball: 'tileBall', world: 'tileWorld', passport: 'tilePassport', chores: 'tileChores', checkin: 'ciTitle', home: 'prHome' };
export const programKey = (p) => TILE[p] || p;

/** Monday-based week key like 2026-W45 (ISO week). */
export function weekKey(d = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1));
  return `${x.getUTCFullYear()}-W${String(Math.ceil(((x - y0) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}
export const checkinDoneThisWeek = () => (S.checkins?.list || []).some((c) => c.wk === weekKey());

/** Seconds per program and in total for the last `n` days (today included). */
export function timeStats(n = 7) {
  const prog = {}; let total = 0;
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dateKey(d), v = S.days[k];
    days.push({ k, d, sec: v?.sec || 0 });
    if (!v) continue;
    total += v.sec || 0;
    for (const [p, s] of Object.entries(v.prog || {})) prog[p] = (prog[p] || 0) + s;
  }
  const tracked = Object.values(prog).reduce((a, b) => a + b, 0);
  return { prog, total, tracked, days };
}
export const mins = (sec) => Math.round(sec / 60);

/** Recent accuracy per topic from the answer log (last `days` days). First-try right counts as right. */
export function topicAccuracy(days = 14) {
  const since = Date.now() - days * 86400000, out = {};
  for (const e of S.log) { if (e.t < since || !TOPICS.includes(e.topic)) continue; const b = (out[e.topic] ||= { n: 0, ok: 0 }); b.n++; if (e.ok >= 0.99) b.ok++; }
  return out;
}

/** Returns suggestion descriptors [{k, ...params}] - the screen turns them into words. Highest value first, at most 4. */
export function suggestions() {
  const acc14 = topicAccuracy(14), acc7 = topicAccuracy(7);
  const list = [];
  const ranked = Object.entries(acc14).filter(([, v]) => v.n >= 8).map(([tp, v]) => ({ tp, pct: Math.round((100 * v.ok) / v.n), n: v.n })).sort((a, b) => a.pct - b.pct);
  const last = (S.checkins?.list || []).slice(-1)[0];
  if (ranked[0] && ranked[0].pct < 80) list.push({ k: 'focus', tp: ranked[0].tp, pct: ranked[0].pct });
  if (last) {
    const lt = Object.entries(last.byTopic || {}).filter(([, v]) => v.n >= 3).map(([tp, v]) => ({ tp, pct: Math.round((100 * v.ok) / v.n) })).sort((a, b) => a.pct - b.pct)[0];
    if (lt && lt.pct <= 50 && !list.some((s) => s.tp === lt.tp)) list.push({ k: 'checkinLow', tp: lt.tp, pct: lt.pct });
  }
  const strong = ranked.filter((r) => r.pct >= 92 && r.n >= 12 && levelOf(r.tp) <= 5).slice(-1)[0];
  if (strong) list.push({ k: 'stretch', tp: strong.tp, pct: strong.pct });
  const idle = TOPICS.filter((tp) => (acc7[tp]?.n || 0) < 4);
  if (idle.length && Object.keys(acc14).length) list.push({ k: 'idle', tps: idle.slice(0, 3) });
  const ts = timeStats(7);
  if (ts.tracked >= 30 * 60) {
    const top = Object.entries(ts.prog).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] / ts.tracked > 0.6 && ['stands', 'baseball', 'hangman', 'words'].includes(top[0])) list.push({ k: 'balance', p: top[0], pct: Math.round((100 * top[1]) / ts.tracked) });
  }
  if (!checkinDoneThisWeek()) list.push({ k: 'checkin' });
  return list.slice(0, 4);
}
