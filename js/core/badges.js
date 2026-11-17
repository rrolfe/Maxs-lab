// Milestone badges. awardBadges() is cheap; call it after anything that could earn one.
import { S, save, TOPICS, levelOf, daysPlayedThisWeek } from './store.js';
import { L } from './i18n.js';
import { CREAM_UPGRADES } from '../stands/cream-data.js';
const DREAM_IDS = CREAM_UPGRADES.filter((u) => u.dream).map((u) => u.id);

export const BADGES = [
  { id: 'first', icon: 'quiz', name: { en: 'First Mission', es: 'Primera misión' }, desc: { en: 'Finish a quiz mission.', es: 'Termina una misión de preguntas.' }, test: () => S.mission.done >= 1 },
  { id: 'ten', icon: 'quiz', name: { en: 'Ten Missions', es: 'Diez misiones' }, desc: { en: 'Finish 10 missions.', es: 'Termina 10 misiones.' }, test: () => S.mission.done >= 10 },
  { id: 'lvl4', icon: 'star', name: { en: 'Level 4', es: 'Nivel 4' }, desc: { en: 'Reach level 4 in any subject.', es: 'Llega al nivel 4 en una materia.' }, test: () => TOPICS.some((t) => levelOf(t) >= 4) },
  { id: 'lvl5', icon: 'star', name: { en: 'Level 5', es: 'Nivel 5' }, desc: { en: 'Reach level 5 in any subject.', es: 'Llega al nivel 5 en una materia.' }, test: () => TOPICS.some((t) => levelOf(t) >= 5) },
  { id: 'lvl6', icon: 'trophy', name: { en: 'Level 6', es: 'Nivel 6' }, desc: { en: 'Reach level 6 in any subject.', es: 'Llega al nivel 6 en una materia.' }, test: () => TOPICS.some((t) => levelOf(t) >= 6) },
  { id: 'allround', icon: 'trophy', name: { en: 'All-Rounder', es: 'Todoterreno' }, desc: { en: 'Level 4 in every subject.', es: 'Nivel 4 en todas las materias.' }, test: () => TOPICS.every((t) => levelOf(t) >= 4) },
  { id: 'week4', icon: 'sun', name: { en: 'Four-Day Week', es: 'Semana de cuatro días' }, desc: { en: 'Play 4 days in one week.', es: 'Juega 4 días en una semana.' }, test: () => daysPlayedThisWeek() >= 4 },
  { id: 'allstar', icon: 'star', name: { en: 'All-Star', es: 'Estrella' }, desc: { en: 'Earn 1,000 pearls.', es: 'Gana 1,000 perlas.' }, test: () => S.pearls.earned >= 1000 },
  { id: 'stamps5', icon: 'stamp', name: { en: 'Explorer', es: 'Explorador' }, desc: { en: 'Collect 5 passport stamps.', es: 'Reúne 5 sellos del pasaporte.' }, test: () => Object.keys(S.passport.stamps).length >= 5 },
  { id: 'stamps25', icon: 'world', name: { en: 'World Traveler', es: 'Viajero del mundo' }, desc: { en: 'Collect 25 passport stamps.', es: 'Reúne 25 sellos del pasaporte.' }, test: () => Object.keys(S.passport.stamps).length >= 25 },
  { id: 'stand1', icon: 'lemonade', name: { en: 'Open for Business', es: 'Abierto al público' }, desc: { en: 'Run your first stand day.', es: 'Atiende tu primer día en un puesto.' }, test: () => Object.values(S.stands).some((s) => s && s.days > 0) },
  { id: 'profit', icon: 'trophy', name: { en: 'Big Profit', es: 'Gran ganancia' }, desc: { en: 'Make $10 profit in one day.', es: 'Gana $10 en un solo día.' }, test: () => Object.values(S.stands).some((s) => s && s.best >= 10) },
  { id: 'lemon20', icon: 'lemonade', name: { en: 'Lemon Collector', es: 'Coleccionista de limones' }, desc: { en: 'Buy 20 extras for your lemonade stand.', es: 'Compra 20 extras para tu puesto de limonada.' }, test: () => Object.keys(S.stands.lemonade?.up || {}).length >= 20 },
  { id: 'lemonshop', icon: 'lemonade', name: { en: 'Grand Opening', es: 'Gran inauguración' }, desc: { en: 'Open your own lemonade shop.', es: 'Abre tu propia tienda de limonada.' }, test: () => !!S.stands.lemonade?.up?.store },
  { id: 'lemontown', icon: 'trophy', name: { en: 'Lemon Town Legend', es: 'Leyenda de Ciudad Limón' }, desc: { en: 'Build Lemon Town.', es: 'Construye Ciudad Limón.' }, test: () => !!S.stands.lemonade?.up?.lemontown },
  { id: 'cream20', icon: 'icecream', name: { en: 'Sprinkle Collector', es: 'Coleccionista de chispas' }, desc: { en: 'Buy 20 extras for your ice cream parlor.', es: 'Compra 20 extras para tu heladería.' }, test: () => Object.keys(S.stands.icecream?.up || {}).length >= 20 },
  { id: 'creamshop', icon: 'icecream', name: { en: 'Corner Parlor', es: 'Heladería de la esquina' }, desc: { en: 'Open your own ice cream shop.', es: 'Abre tu propia heladería.' }, test: () => !!S.stands.icecream?.up?.shop },
  { id: 'cream60', icon: 'icecream', name: { en: 'Scoop Superstar', es: 'Superestrella de bolas' }, desc: { en: 'Buy 60 extras for your ice cream parlor.', es: 'Compra 60 extras para tu heladería.' }, test: () => Object.keys(S.stands.icecream?.up || {}).length >= 60 },
  { id: 'sundaeisland', icon: 'trophy', name: { en: 'Sundae Island Legend', es: 'Leyenda de la Isla Sundae' }, desc: { en: 'Build every piece of Sundae Island.', es: 'Construye todas las piezas de la Isla Sundae.' }, test: () => DREAM_IDS.every((k) => !!S.stands.icecream?.up?.[k]) },
  { id: 'ws10', icon: 'wordsearch', name: { en: 'Word Hunter', es: 'Cazapalabras' }, desc: { en: 'Solve 10 word searches.', es: 'Resuelve 10 sopas de letras.' }, test: () => S.words.wins.ws >= 10 },
  { id: 'hm10', icon: 'hangman', name: { en: 'Word Detective', es: 'Detective de palabras' }, desc: { en: 'Win 10 hangman games.', es: 'Gana 10 partidas de ahorcado.' }, test: () => S.words.wins.hm >= 10 },
  // added Nov 17 2026 with Number Patterns and Read It Loud
  { id: 'pat1', icon: 'patterns', name: { en: 'Pattern Spotter', es: 'Cazapatrones' }, desc: { en: 'Finish a Number Patterns game.', es: 'Termina un juego de Patrones de números.' }, test: () => (S.patterns?.runs || 0) >= 1 },
  { id: 'pat10', icon: 'patterns', name: { en: 'Pattern Pro', es: 'Profesional de patrones' }, desc: { en: 'Finish 10 Number Patterns games.', es: 'Termina 10 juegos de Patrones de números.' }, test: () => (S.patterns?.runs || 0) >= 10 },
  { id: 'patcards', icon: 'trophy', name: { en: 'Critter Collector', es: 'Coleccionista de criaturas' }, desc: { en: 'Collect 12 critter cards.', es: 'Reúne 12 cartas de criaturas.' }, test: () => Object.keys(S.patterns?.cards || {}).length >= 12 },
  { id: 'rd1', icon: 'mic', name: { en: 'Loud Reader', es: 'Lector en voz alta' }, desc: { en: 'Read your first fact out loud.', es: 'Lee tu primer dato en voz alta.' }, test: () => (S.read?.passes || 0) >= 1 },
  { id: 'rd25', icon: 'mic', name: { en: 'Fact Reader', es: 'Lector de datos' }, desc: { en: 'Read 25 different facts out loud.', es: 'Lee 25 datos distintos en voz alta.' }, test: () => Object.keys(S.read?.done || {}).length >= 25 },
  { id: 'rd100', icon: 'trophy', name: { en: 'Reading Star', es: 'Estrella de la lectura' }, desc: { en: 'Read 100 different facts out loud.', es: 'Lee 100 datos distintos en voz alta.' }, test: () => Object.keys(S.read?.done || {}).length >= 100 },
  { id: 'rdcat', icon: 'star', name: { en: 'Topic Master', es: 'Maestro de un tema' }, desc: { en: 'Read all 20 facts in one topic.', es: 'Lee los 20 datos de un tema.' }, test: () => { const n = {}; for (const k of Object.keys(S.read?.done || {})) n[k.slice(0, 2)] = (n[k.slice(0, 2)] || 0) + 1; return Object.values(n).some((v) => v >= 20); } },
];

/** Returns the localized names of badges earned just now. */
export function awardBadges() {
  const fresh = [];
  for (const b of BADGES) {
    if (!S.passport.badges[b.id] && b.test()) { S.passport.badges[b.id] = Date.now(); fresh.push(L(b.name)); }
  }
  if (fresh.length) save();
  return fresh;
}
