// All progress lives on the device: localStorage (primary) mirrored to IndexedDB (backup).
// Keys are prefixed because every page under rrolfe.github.io shares one origin.
const PFX = 'mll2:v1:';
const KEY = PFX + 'state';
export const SCHEMA = 2;
export const TOPICS = ['math', 'reading', 'words', 'science', 'world', 'logic'];
import { DAILY_SOFT, DAILY_HARD, DAILY_LOSS_CAP, crossed } from './economy.js';
export const DAILY_PEARL_CAP = DAILY_HARD;

const fresh = () => ({
  schema: SCHEMA,
  created: Date.now(),
  lang: 'en',
  theme: 'day',          // day | night
  sound: true,
  speak: false,          // read-aloud button visible by default only in Spanish
  bigText: false,
  pearls: { balance: 0, earned: 0, spent: 0 },
  skill: Object.fromEntries(TOPICS.map((t) => [t, 3.0])),
  tally: Object.fromEntries(TOPICS.map((t) => [t, 0])),   // answers counted per topic (controls learning rate)
  seen: {},              // question id -> {n, ok, last, due}
  log: [],               // [{t, topic, lvl, ok, id}] newest last (capped)
  recent: [],            // last question ids shown
  days: {},              // 'YYYY-MM-DD' -> {sec, q, ok, pearls, missions}
  unlocked: { lemonade: false, snack: false, icecream: false, pizza: false },
  stands: {},            // per-stand saves
  words: { solved: {}, served: {}, wins: { hm: 0, ws: 0 }, tier: { hm: 1, ws: 1 }, streak: { hm: 0, ws: 0 } },
  passport: { stamps: {}, people: {}, badges: {} },
  settings: { pinHash: null, pinSalt: null, voice: { en: '', es: '' }, extraMin: { day: '', min: 0 }, dailyLimit: 30, bedtime: '19:30', offset: 0, home: null, mapKey: '', familyNotes: {}, customQs: [], lastBackup: 0 },
  mission: { lastDay: '', done: 0 },
  baseball: { games: 0, wins: 0, bestRuns: 0, hr: 0, hits: 0, k: 0, last: null },
  checkins: { list: [], seen: [], school: [] },   // weekly check-in results; seen = question ids used; school = percentile scores a grown-up enters
  chores: { done: {}, pts: {}, hidden: {}, custom: [], total: 0 },   // done[day][id]=times; pts overrides; hidden = removed built-ins
  recentMath: [],       // texts of the last generated math questions, so the same sum never comes twice in a row
  mil: {},              // milestone id -> last day the announcer played
  gifts: {},            // one-time grown-up gifts already given on this device (id -> pearls)
});

// One-time gifts from a grown-up, delivered with an update. Each id is given once per device, to a save that already
// has progress (never to a brand-new one), straight into the balance: no pop-up, and the daily taper is not touched.
const GIFTS = [
  { id: '2026-11-07-rob-200', pearls: 200 },
];
function applyGifts() {
  for (const g of GIFTS) {
    if (S.gifts[g.id]) continue;
    S.gifts[g.id] = g.pearls;
    S.pearls.balance += g.pearls; S.pearls.earned += g.pearls; S.pearls.gift = (S.pearls.gift || 0) + g.pearls;
  }
}

export let S = fresh();
const subs = new Set();
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
const emit = () => subs.forEach((f) => { try { f(S); } catch (e) { console.error(e); } });

// ---------- persistence ----------
let saveTimer = 0, idb = null, storageOk = true;
function lsGet() { try { return localStorage.getItem(KEY); } catch { storageOk = false; return null; } }
function lsSet(v) { try { localStorage.setItem(KEY, v); } catch (e) { storageOk = false; } }

function openIDB() {
  return new Promise((res) => {
    try {
      const r = indexedDB.open('mll2', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => res(null);
    } catch { res(null); }
  });
}
function idbGet(k) { return new Promise((res) => { if (!idb) return res(null); try { const q = idb.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result ?? null); q.onerror = () => res(null); } catch { res(null); } }); }
function idbSet(k, v) { if (!idb) return; try { idb.transaction('kv', 'readwrite').objectStore('kv').put(v, k); } catch { /* best effort */ } }

// ---------- automatic safety copies ----------
// A copy of Max's save is kept in IndexedDB (its own, large quota) at the first visit each day and just before
// any update changes the save format, so a mistake in an update can always be undone from the Grown-up corner.
const SNAP_MAX = 8, SNAP_EVERY = 20 * 3600e3, SNAP_INDEX = 'snaps';
function idbDel(k) { if (!idb) return; try { idb.transaction('kv', 'readwrite').objectStore('kv').delete(k); } catch { /* best effort */ } }
const digest = (s) => ({ earned: s?.pearls?.earned || 0, balance: s?.pearls?.balance || 0, stamps: Object.keys(s?.passport?.stamps || {}).length, days: Object.keys(s?.days || {}).length });
const hasProgress = (s) => { const d = digest(s); return d.earned > 0 || d.days > 0 || d.stamps > 0; };
async function snapIndex() { const i = await idbGet(SNAP_INDEX); return Array.isArray(i) ? i : []; }
async function takeSnapshot(text, saved, why) {
  if (!idb || !hasProgress(saved)) return;
  const idx = await snapIndex();
  if (why !== 'update' && why !== 'before-restore' && idx.length && Date.now() - idx[0].t < SNAP_EVERY) return;
  const t = Date.now();
  idbSet('snap:' + t, text);
  idx.unshift({ t, why, d: digest(saved) });
  for (const old of idx.splice(SNAP_MAX)) idbDel('snap:' + old.t);
  idbSet(SNAP_INDEX, idx);
}
export const listSnapshots = snapIndex;
export async function restoreSnapshot(t) {
  const raw = await idbGet('snap:' + t); if (!raw) throw new Error('That copy is gone.');
  const saved = JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw));
  await takeSnapshot(JSON.stringify(S), S, 'before-restore');
  S = merge(fresh(), saved); migrate();
  document.documentElement.lang = S.lang; save(); flush();
}

function merge(base, saved) {
  // Keep new default keys when an older save is loaded.
  for (const k of Object.keys(saved)) {
    if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) merge(base[k], saved[k]);
    else base[k] = saved[k];
  }
  return base;
}

/** Older saves keep working: new keys come from fresh(); stand saves get season tickets. */
function migrate() {
  if ((S.schema || 1) < 2) {
    for (const id of ['lemonade', 'icecream']) if (S.unlocked[id] && S.stands[id] && S.stands[id].tickets == null) S.stands[id].tickets = 1;
  }
  // generated math questions can never come back, so their records are only clutter (they would grow the save forever)
  const gen = Object.keys(S.seen || {}).filter((k) => /^m\d:/.test(k));
  if (gen.length > 300) for (const k of gen) delete S.seen[k];
  S.schema = SCHEMA;
}

export async function initStore() {
  idb = await openIDB();
  let raw = lsGet();
  let from = 'ls';
  if (!raw) { raw = await idbGet(KEY); from = 'idb'; }
  if (raw) {
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
    let saved = null;
    try { saved = JSON.parse(text); } catch (e) {
      console.warn('Save unreadable, trying the backup copy', e);
      idbSet('unreadable:' + Date.now(), text);          // never throw an unreadable save away
      const alt = await idbGet(KEY);
      try { saved = JSON.parse(typeof alt === 'string' ? alt : JSON.stringify(alt)); from = 'idb'; } catch { saved = null; }
    }
    if (saved) {
      try { await takeSnapshot(text, saved, (saved.schema || 1) < SCHEMA ? 'update' : 'daily'); } catch { /* optional */ }
      S = merge(fresh(), saved);
      migrate();
      if (hasProgress(saved)) applyGifts();
      lsSet(JSON.stringify(S)); idbSet(KEY, JSON.stringify(S));
    }
  }
  try { if (navigator.storage?.persist) navigator.storage.persist(); } catch { /* optional */ }
  document.documentElement.lang = S.lang;
  return S;
}

export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 400);
  emit();
}
export function flush() {
  const s = JSON.stringify(S);
  lsSet(s);
  idbSet(KEY, s);
}
addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
export const storageHealthy = () => storageOk;

// ---------- dates ----------
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => dateKey();
export function day(k = today()) { return (S.days[k] ||= { sec: 0, q: 0, ok: 0, pearls: 0, missions: 0, topics: {}, prog: {} }); }
/** Monday-start week, newest data only: returns [{key, played, isToday}] */
export function weekView() {
  const now = new Date(); const dow = (now.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - dow + i);
    const k = dateKey(d); const v = S.days[k];
    return { key: k, played: !!(v && (v.q > 0 || v.sec > 120)), isToday: k === today(), future: i > dow };
  });
}
export const daysPlayedThisWeek = () => weekView().filter((d) => d.played).length;

// ---------- pearls ----------
// Earned-today (day().pearls) drives a gentle ceiling: full rate to DAILY_SOFT, half rate to DAILY_HARD.
// Spending never changes it. (Old bug: a flat 300/day cap on EARNED pearls blocked earning after a stand purchase.)
let milestoneHook = null;
export const onMilestone = (fn) => { milestoneHook = fn; };
export function addPearls(n) {
  n = Math.max(0, Math.round(n));
  const d = day();
  const before = S.pearls.balance;
  const fullRoom = Math.max(0, DAILY_SOFT - d.pearls);
  const full = Math.min(n, fullRoom);
  const rest = n - full;
  const halfRoom = Math.max(0, DAILY_HARD - Math.max(d.pearls, DAILY_SOFT));
  const half = Math.min(Math.floor(rest / 2), halfRoom);
  const got = full + half;
  S.pearls.balance += got; S.pearls.earned += got; d.pearls += got;
  save();
  const m = got ? crossed(S, before, S.pearls.balance) : null;
  if (m && milestoneHook && S.mil[m.id] !== today()) { S.mil[m.id] = today(); try { milestoneHook(m); } catch (e) { console.error(e); } }
  return { got, capped: got < n, full: d.pearls >= DAILY_HARD };
}
/** Pearls for a real-life chore a grown-up has approved. Not subject to the daily taper (it is not screen time). */
export function awardChore(n) {
  n = Math.max(0, Math.round(n));
  const before = S.pearls.balance, d = day();
  S.pearls.balance += n; S.pearls.earned += n; d.chore = (d.chore || 0) + n; S.chores.total = (S.chores.total || 0) + n;
  save();
  const m = n ? crossed(S, before, S.pearls.balance) : null;
  if (m && milestoneHook && S.mil[m.id] !== today()) { S.mil[m.id] = today(); try { milestoneHook(m); } catch (e) { console.error(e); } }
  return n;
}
/** A wrong answer. Pearls never go below zero and the day's earned total never goes below zero. */
export function losePearls(n) {
  n = Math.max(0, Math.round(n));
  const d = day();
  // gentle: never more than a quarter of what he holds in one miss (at least 1), and a small daily ceiling on losses
  const room = Math.max(0, DAILY_LOSS_CAP - (d.lost || 0));
  const lost = Math.min(n, room, S.pearls.balance, Math.max(1, Math.floor(S.pearls.balance / 4)));
  S.pearls.balance -= lost; d.pearls = Math.max(0, d.pearls - lost); d.lost = (d.lost || 0) + lost;
  save();
  return lost;
}
export function spendPearls(n) {
  if (S.pearls.balance < n) return false;
  S.pearls.balance -= n; S.pearls.spent += n; save(); return true;
}
export const RANKS = [
  { id: 'rookie', min: 0, en: 'Rookie', es: 'Novato' },
  { id: 'allstar', min: 1000, en: 'All-Star', es: 'Estrella' },
  { id: 'hof', min: 4000, en: 'Hall of Fame', es: 'Salón de la Fama' },
];
export function rank() {
  let r = RANKS[0], next = null;
  for (let i = 0; i < RANKS.length; i++) if (S.pearls.earned >= RANKS[i].min) { r = RANKS[i]; next = RANKS[i + 1] || null; }
  return { rank: r, next, into: S.pearls.earned - r.min, span: next ? next.min - r.min : 1 };
}

// ---------- time on site ----------
let lastInput = Date.now();
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
setInterval(() => {
  if (document.visibilityState !== 'visible' || Date.now() - lastInput > 45000) return;
  const d = day(); d.sec += 5;
  const pk = (location.hash.split('?')[0].split('/')[1] || 'home'); if (pk !== 'grownup') { d.prog ||= {}; d.prog[pk] = (d.prog[pk] || 0) + 5; }   // seconds per program
  emit();
  if ((d.sec % 30) < 5) save();
}, 5000);
export const minutesToday = () => Math.floor(day().sec / 60);

// ---------- skill (adaptive level) ----------
export const levelOf = (topic) => Math.max(1, Math.min(6, Math.round(S.skill[topic] + (S.settings.offset || 0))));

// ---------- backup ----------
export function exportData() {
  return JSON.stringify({ app: 'maxs-lab', schema: SCHEMA, exported: new Date().toISOString(), state: S }, null, 1);
}
export function importData(text, mode = 'replace') {
  const obj = JSON.parse(text);
  if (obj?.app !== 'maxs-lab' || !obj.state) throw new Error('This is not a Max’s Lab backup file.');
  if (mode === 'replace') S = merge(fresh(), obj.state);
  else {
    const o = obj.state;
    S.pearls.balance = Math.max(S.pearls.balance, o.pearls?.balance || 0);
    S.pearls.earned = Math.max(S.pearls.earned, o.pearls?.earned || 0);
    for (const t of TOPICS) if ((o.tally?.[t] || 0) > (S.tally[t] || 0)) { S.skill[t] = o.skill[t]; S.tally[t] = o.tally[t]; }
    Object.assign(S.passport.stamps, o.passport?.stamps || {});
    Object.assign(S.passport.people, o.passport?.people || {});
    Object.assign(S.passport.badges, o.passport?.badges || {});
    for (const k of Object.keys(o.unlocked || {})) S.unlocked[k] = S.unlocked[k] || o.unlocked[k];
    for (const [k, v] of Object.entries(o.days || {})) if (!S.days[k]) S.days[k] = v;
    for (const [k, v] of Object.entries(o.seen || {})) if (!S.seen[k]) S.seen[k] = v;
  }
  document.documentElement.lang = S.lang;
  save(); flush();
}
export function resetAll() { S = fresh(); document.documentElement.lang = S.lang; save(); flush(); }
export function setLang(l) { S.lang = l === 'es' ? 'es' : 'en'; document.documentElement.lang = S.lang; save(); }
