// All progress lives on the device: localStorage (primary) mirrored to IndexedDB (backup).
// Keys are prefixed because every page under rrolfe.github.io shares one origin.
const PFX = 'mll2:v1:';
const KEY = PFX + 'state';
export const SCHEMA = 2;
export const TOPICS = ['math', 'reading', 'words', 'science', 'world', 'logic'];
import { DAILY_SOFT, DAILY_HARD, crossed } from './economy.js';
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
  words: { solved: {}, wins: { hm: 0, ws: 0 }, tier: { hm: 1, ws: 1 }, streak: { hm: 0, ws: 0 } },
  passport: { stamps: {}, people: {}, badges: {} },
  settings: { pinHash: null, pinSalt: null, voice: { en: '', es: '' }, extraMin: { day: '', min: 0 }, dailyLimit: 30, bedtime: '19:30', offset: 0, home: null, mapKey: '', familyNotes: {}, customQs: [], lastBackup: 0 },
  mission: { lastDay: '', done: 0 },
  baseball: { games: 0, wins: 0, bestRuns: 0, hr: 0, hits: 0, k: 0, last: null },
  mil: {},              // milestone id -> last day the announcer played
});

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
  S.schema = SCHEMA;
}

export async function initStore() {
  idb = await openIDB();
  let raw = lsGet();
  let from = 'ls';
  if (!raw) { raw = await idbGet(KEY); from = 'idb'; }
  if (raw) {
    try { S = merge(fresh(), typeof raw === 'string' ? JSON.parse(raw) : raw); } catch (e) { console.warn('Bad save, starting fresh', e); S = fresh(); }
    migrate();
    if (from === 'idb') lsSet(JSON.stringify(S));
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
export function day(k = today()) { return (S.days[k] ||= { sec: 0, q: 0, ok: 0, pearls: 0, missions: 0, topics: {} }); }
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
/** A wrong answer. Pearls never go below zero and the day's earned total never goes below zero. */
export function losePearls(n) {
  n = Math.max(0, Math.round(n));
  const lost = Math.min(n, S.pearls.balance);
  const d = day();
  S.pearls.balance -= lost; d.pearls = Math.max(0, d.pearls - lost);
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
  day().sec += 5; emit();
  if ((day().sec % 30) < 5) save();
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
