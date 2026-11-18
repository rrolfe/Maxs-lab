import { checkinDoneThisWeek } from '../progress/stats.js';
import { S, rank, daysPlayedThisWeek, day, DAILY_PEARL_CAP } from '../core/store.js';
import { h } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { dailyMissions, MISSIONS } from '../quiz/missions.js';
import { stampCount } from './passport-lite.js';
import { REWARD } from '../core/economy.js';
import { NEW_GAMES, stillNew } from '../progress/newgames.js';
import { banner } from '../boise/scenes.js';

addStrings({
  en: { todaysMission: 'Today’s mission', rankLine: '{r} · {n} pearls earned', stampsBadge: '{n} stamps', unlockSoon: 'Unlocks with pearls', standsBadge: '{n} open', ciBanner: 'This week’s check-in', ciBannerSub: 'A quick 24-question look at how you are growing. Earn {n} pearls!' },
  es: { todaysMission: 'Misión de hoy', rankLine: '{r} · {n} perlas ganadas', stampsBadge: '{n} sellos', unlockSoon: 'Se abre con perlas', standsBadge: '{n} abiertos', ciBanner: 'El chequeo de esta semana', ciBannerSub: 'Un vistazo rápido de 24 preguntas a cómo creces. ¡Gana {n} perlas!' },
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
  const choreBadge = 0;
  const newTag = (k) => (stillNew(k) ? t('newTag') : '');
  const boiseTile = h('button', { class: 'tile wide', 'data-k': 'boise', onclick: () => { sfx.pop(); go('/boise'); } },
    h('span', { class: 'bzban', html: banner() }), stillNew('boise') ? h('span', { class: 'badge' }, t('newTag')) : null,
    h('span', { class: 'bztext' }, h('strong', {}, t('tileBoise')), h('span', { class: 'sub' }, t('tileBoiseSub'))));
  const tiles = [
    ['patterns', 'patterns', t('tilePatterns'), t('tilePatternsSub'), '/patterns', newTag('patterns')],
    ['read', 'mic', t('tileRead'), t('tileReadSub'), '/read', newTag('read')],
    ['words', 'wordsearch', t('tileWords'), t('tileWordsSub'), '/words'],
    ['hangman', 'hangman', t('tileHangman'), t('tileHangmanSub'), '/hangman'],
    ['quiz', 'quiz', t('tileQuiz'), t('tileQuizSub'), '/quiz'],
    ['stands', 'stands', t('tileStands'), t('tileStandsSub'), '/stands', open ? t('standsBadge', { n: open }) : ''],
    ['ball', 'ballpark', t('tileBall'), t('tileBallSub'), '/baseball'],
    ['chores', 'chores', t('tileChores'), t('tileChoresSub'), '/chores', choreBadge ? t('choreBadge', { n: choreBadge }) : ''],
    ['world', 'world', t('tileWorld'), t('tileWorldSub'), '/world'],
    ['passport', 'passport', t('tilePassport'), t('tilePassportSub'), '/passport', stampCount() ? t('stampsBadge', { n: stampCount() }) : ''],
  ].map(([k, ic, title, sub, to, badge]) =>
    h('button', { class: 'tile', 'data-k': k, onclick: () => { sfx.pop(); go(to); } },
      h('span', { html: icons[ic](68) }), badge ? h('span', { class: 'badge' }, badge) : null,
      h('strong', {}, title), h('span', { class: 'sub' }, sub)));

  // The NEW shelf: the two newest games, right under the greeting, until each has been finished a few times (then only the hub tiles remain).
  const NEWCARD = { boise: ['boise', 'tileBoise', 'newBoiseDesc', '/boise'], patterns: ['patterns', 'tilePatterns', 'newPatDesc', '/patterns'], read: ['mic', 'tileRead', 'newReadDesc', '/read'] };
  const fresh = NEW_GAMES.filter(stillNew);
  const shelf = fresh.length ? h('section', { class: 'newshelf', 'aria-label': t('newShelf') },
    h('div', { class: 'nshead' }, h('span', { 'aria-hidden': 'true', style: { fontSize: '34px', lineHeight: 1 } }, '✨'), h('h2', {}, t('newShelf')), h('span', { class: 'nsnote' }, t('newShelfNote'))),
    h('div', { class: 'nscards' + (fresh.length === 1 ? ' one' : '') }, fresh.map((k) => {
      const [ic, title, desc, to] = NEWCARD[k];
      return h('button', { class: 'newcard', 'data-k': k, onclick: () => { sfx.pop(); go(to); } },
        h('span', { class: 'nstag' }, t('newTag')), k === 'read' ? h('span', { class: 'nstag beta' }, t('betaTag')) : null,
        h('span', { class: 'nsico', html: k === 'boise' ? banner() : icons[ic](72) }), h('strong', {}, t(title)), h('span', { class: 'nsdesc' }, t(desc)), h('span', { class: 'btn gold' }, t('newPlay')));
    }))) : null;

  // Gear: press and hold 3 seconds to reach the grown-up corner.
  let timer = 0;
  const gear = h('button', { class: 'gear', 'aria-label': t('gear') + '. ' + t('gearHold'), title: t('gearHold') }, h('span', { class: 'ring' }), h('span', { html: icons.gear(40) }));
  const start = (e) => { e.preventDefault(); gear.classList.add('holding'); clearTimeout(timer); timer = setTimeout(() => { gear.classList.remove('holding'); go('/grownup'); }, 3000); };
  const stop = () => { clearTimeout(timer); gear.classList.remove('holding'); };
  gear.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, stop));
  gear.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('/grownup'); } });
  gear.addEventListener('contextmenu', (e) => e.preventDefault());

  el.append(...[
    h('div', { class: 'greet' }, h('h1', {}, greet), h('span', { class: 'chip' }, t('rankLine', { r: rk.rank[S.lang], n: S.pearls.earned.toLocaleString() }))),
    shelf, cont, checkinDoneThisWeek() ? null : h('a', { class: 'continue ciBanner', href: '#/checkin', onclick: () => sfx.pop() }, h('div', { class: 'ci', html: icons.trophy(48) }), h('div', { class: 'ct' }, h('strong', {}, t('ciBanner')), h('small', {}, t('ciBannerSub', { n: REWARD.checkin }))), h('span', { class: 'btn' }, t('play'))), h('div', { class: 'hub' }, [boiseTile, ...tiles]), gear].filter(Boolean));   // (el.append(null) would print the word "null")
  if (day().pearls >= DAILY_PEARL_CAP) el.append(h('p', { class: 'center muted' }, t('chestFull')));
  return () => { clearTimeout(timer); };
}
