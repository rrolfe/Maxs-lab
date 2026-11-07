// Shared helpers for Word Search and Hangman.
import { S, today } from '../core/store.js';
import { fold, shuffle, rng, hashStr, h } from '../core/dom.js';
import { L, t, addStrings } from '../core/i18n.js';

let packsCache = null;
export async function loadPacks() {
  if (!packsCache) packsCache = (await import('../../data/packs.js')).default.packs;
  return packsCache;
}
export const packName = (p) => L(p.name);
export const packWords = (p, lang = S.lang) => (p.words[lang] || p.words.en).map((w) => ({ ...w, key: fold(w.w), len: [...fold(w.w)].length }));

/** Words Max has not met yet, in random order. With useHistory (the normal case) a word Max has already been shown or solved is NEVER
 *  offered again, so nothing repeats and nothing pays twice. When the pool is empty the caller shows the "all done" card. */
export function pickWords(words, n, { tiers = [1, 2, 3], r = Math.random, maxLen = 12, prefix = 'ws', useHistory = true } = {}) {
  const { solved, served } = S.words;
  const pool = words.filter((w) => tiers.includes(w.tier) && w.len <= maxLen && w.len >= 3);
  const used = (w) => solved[`${prefix}:${S.lang}:${w.key}`] || (served && served[`${prefix}:${S.lang}:${w.key}`]);
  const fresh = useHistory ? pool.filter((w) => !used(w)) : pool;
  return shuffle(fresh, r).slice(0, n);
}
export function markSolved(prefix, key) { S.words.solved[`${prefix}:${S.lang}:${key}`] = 1; }
export function markServed(prefix, key) { (S.words.served ||= {})[`${prefix}:${S.lang}:${key}`] = 1; }

addStrings({
  en: { allDoneTitle: 'GAME OVER… you won!', allDoneWords: 'You have met every word here at this level. Try another pack or level, or tell Dad you need MORE words to keep going!', allDoneGo: 'Pick something else' },
  es: { allDoneTitle: '¡FIN DEL JUEGO… ganaste!', allDoneWords: 'Ya conociste todas las palabras de aquí en este nivel. Prueba otro paquete u otro nivel, o dile a papá que necesitas MÁS palabras para seguir.', allDoneGo: 'Elegir otra cosa' },
});
/** The friendly "you finished everything" card. `msgKey` is an i18n key for the body; `href` where the button goes. */
export function allDoneCard(msgKey, href) {
  return h('div', { class: 'card alldone center', style: { maxWidth: '640px', margin: '24px auto', textAlign: 'center' } },
    h('div', { style: { fontSize: '64px' } }, '🏆'), h('h2', {}, t('allDoneTitle')), h('p', {}, t(msgKey)), h('a', { class: 'btn gold', href }, t('allDoneGo')));
}

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
