// Shared bits for the two games added Nov 17 2026: Number Patterns and Read It Loud (beta).
// Level, run records, the critter-card collection, and the Home "NEW" shelf counters. Everything lives in S.patterns / S.read / S.newSeen.
import { S, save, day, today } from '../core/store.js';
import { clamp } from '../core/dom.js';
import { addStrings } from '../core/i18n.js';
import { MAX_LEVEL } from '../quiz/patterns.js';

// Names and words for the Home screen (the NEW shelf and the two permanent tiles) and for the Grown-up corner's time list.
addStrings({
  en: {
    tilePatterns: 'Number Patterns', tilePatternsSub: 'Spot it. Solve it. Win cards!', tileRead: 'Read It Loud', tileReadSub: 'Read a fact. Win pearls!',
    newShelf: 'New in Max’s Lab!', newShelfNote: 'Try them. They are brand new!', newTag: 'NEW', betaTag: 'BETA', newPlay: 'Play!',
    newPatDesc: 'Number puzzles with surprise twists. Win critter cards!', newReadDesc: 'Pick a topic and read a cool fact out loud. {The} listens!',
  },
  es: {
    tilePatterns: 'Patrones de números', tilePatternsSub: '¡Descúbrelo, resuélvelo y gana cartas!', tileRead: 'Lee en voz alta', tileReadSub: '¡Lee un dato y gana perlas!',
    newShelf: '¡Nuevo en el Laboratorio de Max!', newShelfNote: '¡Pruébalos! ¡Son nuevecitos!', newTag: 'NUEVO', betaTag: 'BETA', newPlay: '¡Jugar!',
    newPatDesc: 'Rompecabezas de números con giros sorpresa. ¡Gana cartas de criaturas!', newReadDesc: 'Elige un tema y lee en voz alta un dato genial. ¡{The} escucha!',
  },
});

/** Pattern level 1-8 (the Grown-up "Easier / Harder" setting shifts it by one, like every subject). */
export const patLevel = () => clamp(Math.round(S.patterns.skill + (S.settings.offset || 0)), 1, MAX_LEVEL);

/** Move the hidden skill number after one puzzle. success: 1 (first try, no hint) | 0.6 (second try or a hint) | 0 */
export function adaptPat(q, success, ms = 5000) {
  const P = S.patterns, R = P.skill, D = q.level;
  const exp = 1 / (1 + Math.exp(-2.4 * (R - D)));
  const K = P.n < 15 ? 0.4 : 0.16;
  let s = success;
  if (q.twist && success === 0) s = exp;                     // a miss on a silly twist never counts against him
  if (ms < 1100 && success >= 0.99 && D >= 3) s = exp;       // answered too fast: probably a guess
  const before = patLevel();
  P.skill = clamp(R + K * (s - exp), 1, MAX_LEVEL + 0.99);
  P.n++;
  return { before, after: patLevel() };
}

/** Count the puzzle in the Grown-up corner's totals. Logged as topic "patterns" so it never disturbs the six school subjects. */
export function recordPat(q, success) {
  const d = day();
  d.q++; if (success >= 0.99) d.ok++;
  S.log.push({ t: Date.now(), topic: 'patterns', lvl: q.level, ok: success, id: q.id });
  if (S.log.length > 400) S.log.splice(0, S.log.length - 400);
  const P = S.patterns; P.q++; if (success >= 0.99) P.ok++;
  (P.recent ||= []).push(q.key); if (P.recent.length > 60) P.recent.splice(0, P.recent.length - 60);
}

// ---------------------------------------------------------------- critter cards (all invented here; emoji picture + a silly name)
// Only emoji from Unicode 11 or older, so they draw on an old iPad too.
export const CRITTERS = [
  { id: 'fox', e: '🦊', n: { en: 'Zip the Fox', es: 'Zip el Zorro' } },
  { id: 'octo', e: '🐙', n: { en: 'Inky Octo', es: 'Inky Pulpo' } },
  { id: 'owl', e: '🦉', n: { en: 'Professor Hoot', es: 'Profesor Uhu' } },
  { id: 'turtle', e: '🐢', n: { en: 'Turbo Turtle', es: 'Tortuga Turbo' } },
  { id: 'hedge', e: '🦔', n: { en: 'Prickles', es: 'Pinchitos' } },
  { id: 'penguin', e: '🐧', n: { en: 'Waddle', es: 'Pingüi' } },
  { id: 'bee', e: '🐝', n: { en: 'Buzz Bee', es: 'Zumbi la Abeja' } },
  { id: 'gecko', e: '🦎', n: { en: 'Gecko Joe', es: 'Gecko Joe' } },
  { id: 'frog', e: '🐸', n: { en: 'Sir Ribbit', es: 'Sir Croac' } },
  { id: 'whale', e: '🐳', n: { en: 'Bubbles the Whale', es: 'Burbujas la Ballena' } },
  { id: 'crab', e: '🦀', n: { en: 'Pinch the Crab', es: 'Pinza el Cangrejo' } },
  { id: 'ladybug', e: '🐞', n: { en: 'Dot the Ladybug', es: 'Lunita la Mariquita' } },
  { id: 'panda', e: '🐼', n: { en: 'Panda Pat', es: 'Pandi Pat' } },
  { id: 'koala', e: '🐨', n: { en: 'Koko Koala', es: 'Koko Koala' } },
  { id: 'parrot', e: '🦜', n: { en: 'Polly Parrot', es: 'Lora Lorita' } },
  { id: 'roo', e: '🦘', n: { en: 'Hop-Hop Roo', es: 'Salti Canguro' } },
  { id: 'rex', e: '🦖', n: { en: 'Little Rex', es: 'Rexito' }, rare: true },
  { id: 'shark', e: '🦈', n: { en: 'Finn the Shark', es: 'Finn el Tiburón' }, rare: true },
  { id: 'unicorn', e: '🦄', n: { en: 'Sparkle', es: 'Destello' }, rare: true },
  { id: 'lion', e: '🦁', n: { en: 'Leo the Lion', es: 'Leo el León' }, rare: true },
  { id: 'giraffe', e: '🦒', n: { en: 'Stretch', es: 'Estirón' }, rare: true },
  { id: 'croc', e: '🐊', n: { en: 'Chomp Croc', es: 'Croc Chomp' }, rare: true },
  { id: 'butterfly', e: '🦋', n: { en: 'Flutter', es: 'Aleteo' }, rare: true },
  { id: 'dragon', e: '🐲', n: { en: 'Ember the Dragon', es: 'Brasa el Dragón' }, rare: true },
];
export const CARD_TOTAL = CRITTERS.length;
export const cardsOwned = () => CRITTERS.filter((c) => S.patterns.cards[c.id]).length;

/** One card for finishing a run. A strong run (8+ first tries) has an even chance at a rare one. Returns { card, isNew }. */
export function rollCard(firstTry, total, r = Math.random) {
  const strong = firstTry >= Math.ceil(total * 0.8);
  const rareWanted = strong && r() < 0.5;
  const pool = CRITTERS.filter((c) => !!c.rare === rareWanted);
  // lean toward cards he does not have yet
  const missing = pool.filter((c) => !S.patterns.cards[c.id]);
  const from = missing.length && r() < 0.85 ? missing : pool;
  const card = from[Math.floor(r() * from.length)];
  const isNew = !S.patterns.cards[card.id];
  S.patterns.cards[card.id] = (S.patterns.cards[card.id] || 0) + 1;
  return { card, isNew };
}

// ---------------------------------------------------------------- the Home "NEW" shelf
export const NEW_GAMES = ['patterns', 'read'];
export const NEW_TRIES = 3;                       // a NEW card goes away after he has finished the game this many times
export const newCount = (k) => (S.newSeen && S.newSeen[k]) || 0;
export function markPlayed(k) { (S.newSeen ||= {})[k] = newCount(k) + 1; save(); }
export const stillNew = (k) => newCount(k) < NEW_TRIES;

/** First finished run / fact of the day gets the "try it today" bonus. Returns true when this is the first one today. */
export function firstToday(key) {
  const P = S[key]; if (!P) return false;
  if (P.lastDay === today()) return false;
  P.lastDay = today(); return true;
}
