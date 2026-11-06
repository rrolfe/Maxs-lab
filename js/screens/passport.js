// Passport: stamps from places, badges, explorers & heroes to meet, and a simple view of each subject level.
import { S, save, addPearls, losePearls, levelOf, TOPICS, rank, DAILY_PEARL_CAP } from '../core/store.js';
import { REWARD, payFor, penaltyFor } from '../core/economy.js';
import { h, shuffle, confetti, flyPoints, hashStr } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { BADGES, awardBadges } from '../core/badges.js';
import { TOPIC_META } from '../quiz/missions.js';

addStrings({
  en: {
    pListen: 'Read to me', pTitle: 'Passport', pTabStamps: 'Stamps', pTabBadges: 'Badges', pTabHeroes: 'Heroes', pTabLevels: 'My levels',
    pNoStamps: 'No stamps yet. Visit a place on the World Map and answer a question to collect your first one!', pGoMap: 'Open the World Map',
    pEarned: 'Earned', pLocked: 'Keep going to unlock this one.', pMeet: 'Meet', pMet: 'Met', pLevel: 'Level {n}', pFacts: 'Did you know?', pTry: 'Try this', pQuiz: 'Quick question',
    pHeroQuizBonus: 'Answer right to add this hero to your passport (+12 pearls).', pMetNow: 'Added to your passport!', pWrong: 'Not quite. Try another answer.',
    pRank: '{r}', pNextRank: '{n} pearls to {r}', pTopRank: 'You reached the top rank!', pLevelsNote: 'Levels grow as you answer. Harder questions appear when a subject feels easy.', pOf6: 'of 6',
    pHeroCount: '{n} of {m} heroes met',
  },
  es: {
    pListen: 'Léemelo', pTitle: 'Pasaporte', pTabStamps: 'Sellos', pTabBadges: 'Insignias', pTabHeroes: 'Héroes', pTabLevels: 'Mis niveles',
    pNoStamps: 'Todavía no hay sellos. ¡Visita un lugar en el Mapa del mundo y responde una pregunta para conseguir el primero!', pGoMap: 'Abrir el Mapa del mundo',
    pEarned: 'Ganada', pLocked: 'Sigue jugando para abrir esta.', pMeet: 'Conocer', pMet: 'Conocido', pLevel: 'Nivel {n}', pFacts: '¿Sabías que…?', pTry: 'Inténtalo', pQuiz: 'Pregunta rápida',
    pHeroQuizBonus: 'Responde bien para agregar a este héroe a tu pasaporte (+12 perlas).', pMetNow: '¡Agregado a tu pasaporte!', pWrong: 'Casi. Prueba otra respuesta.',
    pRank: '{r}', pNextRank: '{n} perlas para {r}', pTopRank: '¡Llegaste al rango más alto!', pLevelsNote: 'Los niveles suben a medida que respondes. Salen preguntas más difíciles cuando una materia te parece fácil.', pOf6: 'de 6',
    pHeroCount: '{n} de {m} héroes conocidos',
  },
});

const HUES = ['#FFD2BF', '#CFE8FF', '#E3DAFF', '#FFE6A8', '#BFE9E2', '#FFC9E3'];
const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => [...w][0]).join('').toUpperCase();

export async function mount(el, { parts }) {
  const places = (await import('../../data/places.js')).default;
  const people = (await import('../../data/people.js')).default;
  const placeById = new Map(places.map((p) => [p.id, p]));
  let tab = parts[0] || 'stamps';
  const root = h('div'); el.append(root);
  const body = h('div', { class: 'pbody' }), tabs = h('div', { class: 'tabs', role: 'tablist' });
  const rk = rank();
  const summary = h('div', { class: 'psum' },
    h('span', { class: 'chip' }, h('span', { html: icons.star(26) }), rk.rank[S.lang]),
    h('span', { class: 'chip' }, S.pearls.earned.toLocaleString() + ' ' + t('pearls')),
    rk.next ? h('small', { class: 'muted' }, t('pNextRank', { n: (rk.next.min - S.pearls.earned).toLocaleString(), r: rk.next[S.lang] })) : h('small', { class: 'muted' }, t('pTopRank')));
  root.append(h('div', { class: 'screen-head' }, h('h1', {}, t('pTitle'))), summary, tabs, body);

  function drawTabs() {
    tabs.replaceChildren(...[['stamps', 'pTabStamps'], ['badges', 'pTabBadges'], ['heroes', 'pTabHeroes'], ['levels', 'pTabLevels']].map(([k, key]) =>
      h('button', { role: 'tab', 'aria-selected': String(tab === k), class: 'tab', onclick: () => { tab = k; sfx.tap(); draw(); } }, t(key))));
  }
  function draw() {
    drawTabs(); body.replaceChildren();
    if (tab === 'stamps') stamps(); else if (tab === 'badges') badges(); else if (tab === 'heroes') heroes(); else levels();
  }

  function stamps() {
    const ids = Object.keys(S.passport.stamps).filter((id) => placeById.has(id)).sort((a, b) => S.passport.stamps[b].t - S.passport.stamps[a].t);
    if (!ids.length) { body.append(h('p', {}, t('pNoStamps')), h('a', { class: 'btn gold', href: '#/world' }, t('pGoMap'))); return; }
    body.append(h('div', { class: 'stampgrid' }, ids.map((id) => {
      const p = placeById.get(id), tilt = (hashStr(id) % 9) - 4;
      return h('a', { class: 'stampcard', href: '#/world/place/' + id, style: { '--tilt': tilt + 'deg' } },
        h('img', { src: 'img/places/' + id + '.jpg', alt: '', loading: 'lazy' }),
        h('span', { class: 'stampmark', html: icons.stamp(54) }), h('strong', {}, L(p.name)), h('small', {}, L(p.country)));
    })));
  }
  function badges() {
    body.append(h('div', { class: 'badgegrid' }, BADGES.map((b) => {
      const got = S.passport.badges[b.id];
      return h('div', { class: 'badge2' + (got ? ' got' : '') }, h('span', { class: 'bi', html: icons[b.icon](56) }), h('strong', {}, L(b.name)), h('small', {}, got ? t('pEarned') + ' · ' + new Date(got).toLocaleDateString(S.lang === 'es' ? 'es-US' : 'en-US', { month: 'short', day: 'numeric' }) : L(b.desc)));
    })));
  }
  function heroes() {
    const met = Object.keys(S.passport.people).length;
    body.append(h('p', { class: 'muted' }, t('pHeroCount', { n: met, m: people.length })),
      h('div', { class: 'herogrid' }, people.map((p, i) => {
        const done = !!S.passport.people[p.id];
        return h('button', { class: 'hero' + (done ? ' met' : ''), onclick: () => openHero(p) },
          h('span', { class: 'mono', style: { background: HUES[i % HUES.length] } }, initials(L(p.name))),
          h('strong', {}, L(p.name)), h('small', {}, L(p.role)), done ? h('span', { class: 'tag good' }, '✓ ' + t('pMet')) : null);
      })));
  }
  function openHero(p) {
    sfx.pop();
    const q = L(p.quiz)[0]; const done = !!S.passport.people[p.id];
    const msg = h('p', { class: 'qmsg', role: 'status' });
    const opts = h('div', { class: 'opts' });
    let wrongN = 0;
    const draw2 = () => {
      opts.replaceChildren(...shuffle(q.opts.map((o, i) => ({ o, i }))).map(({ o, i }) => h('button', { class: 'ans', onclick: (e) => {
        const b = e.currentTarget;
        if (i !== q.a) { sfx.wrong(); b.classList.add('try'); b.disabled = true; wrongN++; const lost = losePearls(penaltyFor(q.opts.length, REWARD.hero.stamp)); msg.textContent = t('pWrong') + (lost ? ' −' + lost : ''); return; }
        sfx.hardCorrect(); b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
        let m = q.why;
        if (!S.passport.people[p.id]) { S.passport.people[p.id] = { t: Date.now() }; const g = addPearls(REWARD.hero.stamp + payFor(q.opts.length, REWARD.hero.stamp, wrongN)); save(); m += ' ' + t('pMetNow') + (g.got ? ' +' + g.got : ''); confetti(); if (g.got) flyPoints(b, g.got); awardBadges(); }
        msg.textContent = m;
      } }, o)));
    };
    draw2();
    const act = p.activity ? L(p.activity) : null;
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dialog heroD' },
      h('button', { class: 'btn ghost icon pclose', 'aria-label': t('close'), onclick: () => { ov.remove(); draw(); }, html: icons.close(30) }),
      h('h2', {}, L(p.name)), h('p', { class: 'muted' }, L(p.role) + (p.years ? ' · ' + p.years : '') + ' · ' + L(p.country)), h('p', { class: 'hook' }, L(p.hook)),
      h('h3', {}, t('pFacts')), h('ul', { class: 'facts2' }, L(p.facts).map((f) => h('li', {}, f))),
      canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak([L(p.name), L(p.hook), ...L(p.facts)].join('. ')) }, h('span', { html: icons.speaker(30) }), t('pListen')) : null,
      act ? h('div', { class: 'card flat' }, h('h3', {}, t('pTry') + ': ' + act.title), h('p', {}, act.prompt)) : null,
      h('h3', {}, t('pQuiz')), done ? null : h('p', { class: 'muted' }, t('pHeroQuizBonus')), h('p', { class: 'qq' }, q.q), opts, msg));
    document.body.append(ov);
  }
  function levels() {
    body.append(h('p', { class: 'muted' }, t('pLevelsNote')), h('div', { class: 'lvgrid' }, TOPICS.map((tp) => {
      const lv = levelOf(tp), meta = TOPIC_META[tp];
      return h('div', { class: 'lv card', style: { '--tc': 'var(--c-' + tp + ')' } }, h('span', { html: icons[meta.icon](48) }), h('div', {}, h('strong', {}, t(meta.key)), h('div', { class: 'lvbar', role: 'img', 'aria-label': t('pLevel', { n: lv }) + ' ' + t('pOf6') }, [1, 2, 3, 4, 5, 6].map((i) => h('i', { class: i <= lv ? 'on' : '' }))), h('small', {}, t('pLevel', { n: lv }))));
    })));
  }
  draw();
  return () => {};
}
