import { S, rank, daysPlayedThisWeek, day, DAILY_PEARL_CAP } from '../core/store.js';
import { h } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { dailyMissions, MISSIONS } from '../quiz/missions.js';
import { stampCount } from './passport-lite.js';

addStrings({
  en: { todaysMission: 'Today’s mission', rankLine: '{r} · {n} pearls earned', stampsBadge: '{n} stamps', unlockSoon: 'Unlocks with pearls', standsBadge: '{n} open' },
  es: { todaysMission: 'Misión de hoy', rankLine: '{r} · {n} perlas ganadas', stampsBadge: '{n} sellos', unlockSoon: 'Se abre con perlas', standsBadge: '{n} abiertos' },
});

export function mount(el) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? t('goodMorning') : hr < 18 ? t('goodAfternoon') : t('goodEvening');
  const rk = rank();
  const [first] = dailyMissions();
  const mi = MISSIONS[first];

  const cont = h('a', { class: 'continue', href: '#/quiz/mission/' + first, onclick: () => sfx.pop() },
    h('div', { class: 'ci', html: icons[mi.icon](56) }),
    h('div', { class: 'ct' }, h('small', {}, t('todaysMission')), h('strong', {}, t('m_' + first)), h('small', {}, t('m_' + first + '_s'))),
    h('span', { class: 'btn gold' }, t('startMission')));

  const open = Object.values(S.unlocked).filter(Boolean).length;
  const tiles = [
    ['words', 'wordsearch', t('tileWords'), t('tileWordsSub'), '/words'],
    ['hangman', 'hangman', t('tileHangman'), t('tileHangmanSub'), '/hangman'],
    ['quiz', 'quiz', t('tileQuiz'), t('tileQuizSub'), '/quiz'],
    ['stands', 'stands', t('tileStands'), t('tileStandsSub'), '/stands', open ? t('standsBadge', { n: open }) : ''],
    ['world', 'world', t('tileWorld'), t('tileWorldSub'), '/world'],
    ['passport', 'passport', t('tilePassport'), t('tilePassportSub'), '/passport', stampCount() ? t('stampsBadge', { n: stampCount() }) : ''],
  ].map(([k, ic, title, sub, to, badge]) =>
    h('button', { class: 'tile', 'data-k': k, onclick: () => { sfx.pop(); go(to); } },
      h('span', { html: icons[ic](68) }), badge ? h('span', { class: 'badge' }, badge) : null,
      h('strong', {}, title), h('span', { class: 'sub' }, sub)));

  // Gear: press and hold 3 seconds to reach the grown-up corner.
  let timer = 0;
  const gear = h('button', { class: 'gear', 'aria-label': t('gear') + '. ' + t('gearHold'), title: t('gearHold') }, h('span', { class: 'ring' }), h('span', { html: icons.gear(40) }));
  const start = (e) => { e.preventDefault(); gear.classList.add('holding'); clearTimeout(timer); timer = setTimeout(() => { gear.classList.remove('holding'); go('/grownup'); }, 3000); };
  const stop = () => { clearTimeout(timer); gear.classList.remove('holding'); };
  gear.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, stop));
  gear.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/grownup'); } });
  gear.addEventListener('contextmenu', (e) => e.preventDefault());

  el.append(
    h('div', { class: 'greet' }, h('h1', {}, greet), h('span', { class: 'chip' }, t('rankLine', { r: rk.rank[S.lang], n: S.pearls.earned.toLocaleString() }))),
    cont, h('div', { class: 'hub' }, tiles), gear);
  if (day().pearls >= DAILY_PEARL_CAP) el.append(h('p', { class: 'center muted' }, t('chestFull')));
  return () => { clearTimeout(timer); };
}
