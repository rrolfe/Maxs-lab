// Shared helpers for Word Search and Hangman.
import { S, today } from '../core/store.js';
import { fold, shuffle, rng, hashStr } from '../core/dom.js';
import { L } from '../core/i18n.js';

let packsCache = null;
export async function loadPacks() {
  if (!packsCache) packsCache = (await import('../../data/packs.js')).default.packs;
  return packsCache;
}
export const packName = (p) => L(p.name);
export const packWords = (p, lang = S.lang) => (p.words[lang] || p.words.en).map((w) => ({ ...w, key: fold(w.w), len: [...fold(w.w)].length }));

/** Prefer words Max has not solved yet (per language), then random. */
export function pickWords(words, n, { tiers = [1, 2, 3], r = Math.random, maxLen = 12, prefix = 'ws', useHistory = true } = {}) {
  const solved = S.words.solved;
  const pool = words.filter((w) => tiers.includes(w.tier) && w.len <= maxLen && w.len >= 3);
  const fresh = useHistory ? pool.filter((w) => !solved[`${prefix}:${S.lang}:${w.key}`]) : pool;
  const ordered = [...shuffle(fresh, r), ...shuffle(pool.filter((w) => !fresh.includes(w)), r)];
  return ordered.slice(0, n);
}
export function markSolved(prefix, key) { S.words.solved[`${prefix}:${S.lang}:${key}`] = 1; }

export const TIER_NAMES = { 1: { en: 'Easy', es: 'Fácil' }, 2: { en: 'Medium', es: 'Medio' }, 3: { en: 'Hard', es: 'Difícil' } };

/** Promote after 3 wins in a row at the chosen tier; never demote automatically. */
export function recordWin(kind, tier) {
  S.words.wins[kind] = (S.words.wins[kind] || 0) + 1;
  S.words.streak[kind] = (S.words.streak[kind] || 0) + 1;
  let promoted = false;
  if (S.words.streak[kind] >= 3 && tier >= (S.words.tier[kind] || 1) && tier < 3) { S.words.tier[kind] = tier + 1; S.words.streak[kind] = 0; promoted = true; }
  return promoted;
}
export function recordLoss(kind) { S.words.streak[kind] = 0; }

export const dailySeed = () => hashStr('daily' + today() + S.lang);
export { rng };
