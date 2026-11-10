// Milestone badges. awardBadges() is cheap; call it after anything that could earn one.
import { S, save, TOPICS, levelOf, daysPlayedThisWeek } from './store.js';
import { L } from './i18n.js';

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
  { id: 'ws10', icon: 'wordsearch', name: { en: 'Word Hunter', es: 'Cazapalabras' }, desc: { en: 'Solve 10 word searches.', es: 'Resuelve 10 sopas de letras.' }, test: () => S.words.wins.ws >= 10 },
  { id: 'hm10', icon: 'hangman', name: { en: 'Word Detective', es: 'Detective de palabras' }, desc: { en: 'Win 10 hangman games.', es: 'Gana 10 partidas de ahorcado.' }, test: () => S.words.wins.hm >= 10 },
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
