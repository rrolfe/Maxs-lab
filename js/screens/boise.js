// Learning about Boise: things to do, how Boise and Idaho began, and the animals and wild places around town.
// Each place has a picture, three facts, something to try with a grown-up and one quick question. The first right answer pays pearls (once per place).
import { S, save, addPearls, today } from '../core/store.js';
import { REWARD, payFor } from '../core/economy.js';
import { h, shuffle, confetti, flyPoints } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { awardBadges } from '../core/badges.js';
import { markPlayed } from '../progress/newgames.js';
import { scene, banner } from '../boise/scenes.js';

addStrings({
  en: {
    bzTitle: 'Learning about Boise', bzSub: 'Pick a place. Read three facts. Answer one question and win pearls!', bzAll: 'All places', bzOf: '{n} of {m} places explored', bzRankH: '{r}',
    bzRank0: 'Brand new in Boise', bzRank1: 'Boise Visitor', bzRank2: 'Boise Explorer', bzRank3: 'Boise Local Expert',
    bzTry: 'Try this with a grown-up', bzQuiz: 'Quick question', bzWin: 'Answer right to explore this place (+{n} pearls).', bzDone: 'You explored this place!', bzAgain: 'You already explored this place. Answer again for fun.',
    bzWrong: 'Not quite. Look at the facts above and try another answer.', bzRight: 'Yes!', bzExplored: 'Explored!', bzNext: 'Next place', bzBack: 'All places', bzClose: 'Close', bzHear: 'Read to me', bzNew: 'NEW',
    bzCatDone: 'You explored every place in {c}! +{n} pearls', bzPhotoCredit: 'Photo: {c} ({l})', bzPhotoAlt: 'A photo of {n}', bzPicNote: 'Picture drawn for Max’s Lab', bzAllDone: 'You explored every place in Boise! You are a Boise Local Expert!',
    bzFirstToday: 'First place today: +{n} pearls',
    bzCats: { do: 'Things to do', history: 'How Boise began', nature: 'Animals and wild places' },
  },
  es: {
    bzTitle: 'Aprendiendo sobre Boise', bzSub: '¡Elige un lugar. Lee tres datos. Responde una pregunta y gana perlas!', bzAll: 'Todos los lugares', bzOf: '{n} de {m} lugares explorados', bzRankH: '{r}',
    bzRank0: 'Recién llegado a Boise', bzRank1: 'Visitante de Boise', bzRank2: 'Explorador de Boise', bzRank3: 'Experto local de Boise',
    bzTry: 'Inténtalo con un adulto', bzQuiz: 'Pregunta rápida', bzWin: 'Responde bien para explorar este lugar (+{n} perlas).', bzDone: '¡Exploraste este lugar!', bzAgain: 'Ya exploraste este lugar. Responde otra vez por diversión.',
    bzWrong: 'Casi. Mira los datos de arriba y prueba otra respuesta.', bzRight: '¡Sí!', bzExplored: '¡Explorado!', bzNext: 'Siguiente lugar', bzBack: 'Todos los lugares', bzClose: 'Cerrar', bzHear: 'Léemelo', bzNew: 'NUEVO',
    bzCatDone: '¡Exploraste todos los lugares de {c}! +{n} perlas', bzPhotoCredit: 'Foto: {c} ({l})', bzPhotoAlt: 'Una foto de {n}', bzPicNote: 'Dibujo hecho para el Laboratorio de Max', bzAllDone: '¡Exploraste todos los lugares de Boise! ¡Eres un Experto local de Boise!',
    bzFirstToday: 'Primer lugar de hoy: +{n} perlas',
    bzCats: { do: 'Cosas por hacer', history: 'Cómo empezó Boise', nature: 'Animales y lugares salvajes' },
  },
});

const tx = (p) => p[S.lang] || p.en;
const isDone = (id) => !!S.boise.done[id];

export async function mount(el, { parts }) {
  const data = await import('../../data/boise.js');
  const PLACES = data.default, CATS = data.CATS;
  const byId = new Map(PLACES.map((p) => [p.id, p]));
  let filter = 'all';
  const root = h('div', { class: 'boise' }); el.append(root);
  const head = h('div'), tabs = h('div', { class: 'tabs', role: 'tablist' }), grid = h('div', { class: 'bz-grid' });
  root.append(head, tabs, grid);

  const doneCount = () => PLACES.filter((p) => isDone(p.id)).length;
  const rankKey = () => { const n = doneCount(); return n >= PLACES.length ? 'bzRank3' : n >= 10 ? 'bzRank2' : n >= 1 ? 'bzRank1' : 'bzRank0'; };

  function drawHead() {
    const n = doneCount(), m = PLACES.length;
    head.replaceChildren(
      h('div', { class: 'screen-head' }, h('h1', {}, t('bzTitle')), h('span', { class: 'chip' }, h('span', { html: icons.pearl(26) }), ' ' + S.pearls.balance)),
      h('div', { class: 'bz-hero' }, h('div', { class: 'bzban', html: banner() }),
        h('div', { class: 'bz-herotxt' }, h('p', { class: 'bz-sub' }, t('bzSub')),
          h('div', { class: 'bz-prog' }, h('span', { class: 'chip' }, h('span', { html: icons.boise(26) }), t(rankKey())), h('b', {}, t('bzOf', { n, m }))),
          h('div', { class: 'bz-bar', role: 'img', 'aria-label': t('bzOf', { n, m }) }, h('i', { style: { width: Math.round((100 * n) / m) + '%' } })))));
  }
  function drawTabs() {
    const all = [['all', t('bzAll')], ...CATS.map((c) => [c.id, c.e + ' ' + t('bzCats')[c.id]])];
    tabs.replaceChildren(...all.map(([k, label]) => h('button', { role: 'tab', class: 'tab', 'aria-selected': String(filter === k), onclick: () => { filter = k; sfx.tap(); drawTabs(); drawGrid(); } }, label)));
  }
  function drawGrid() {
    const list = PLACES.filter((p) => filter === 'all' || p.cat === filter);
    const firstOpen = PLACES.find((p) => !isDone(p.id));
    grid.replaceChildren(...list.map((p) => {
      const d = tx(p), done = isDone(p.id);
      return h('button', { class: 'bz-card' + (done ? ' done' : ''), 'data-id': p.id, 'aria-label': d.name + (done ? ' ✓' : ''), onclick: () => open(p) },
        h('div', { class: 'bz-pic' }, pic(p)),
        done ? h('span', { class: 'bz-done', 'aria-hidden': 'true' }, '✓') : (firstOpen && firstOpen.id === p.id && doneCount() === 0 ? h('span', { class: 'bz-new' }, t('bzNew')) : null),
        h('span', { class: 'bz-t' }, d.name), h('span', { class: 'bz-h' }, d.hook));
    }));
  }
  /** the picture inside a card: the photo when this place has one that loads, otherwise the drawing */
  function pic(p) {
    const art = h('div', { html: scene(p.scene || p.id, p.cat), style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } });
    if (!p.photo) return art;
    const img = h('img', { src: p.photo.src, alt: '', loading: 'lazy', onerror: () => img.remove() });
    return h('div', { style: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' } }, art, img);
  }

  function open(p) {
    sfx.pop(); stopSpeaking(true);
    const d = tx(p), q = d.quiz, was = isDone(p.id);
    const msg = h('p', { class: 'qmsg', role: 'status' });
    const opts = h('div', { class: 'opts' });
    const after = h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '8px', gap: '12px' } });
    let wrongN = 0, solved = false;
    const close = () => { stopSpeaking(true); ov.remove(); drawHead(); drawGrid(); };
    const nextBtn = () => {
      const left = PLACES.filter((x) => !isDone(x.id) && x.id !== p.id && (filter === 'all' || x.cat === filter));
      const pickNext = left[0] || PLACES.find((x) => !isDone(x.id) && x.id !== p.id);
      after.replaceChildren(...[pickNext ? h('button', { class: 'btn gold', onclick: () => { ov.remove(); open(pickNext); } }, t('bzNext')) : null, h('button', { class: 'btn ghost', onclick: close }, t('bzBack'))].filter(Boolean));
    };
    after.append(h('button', { class: 'btn ghost', onclick: close }, t('bzClose')));
    const draw = () => {
      opts.replaceChildren(...shuffle(q.opts.map((o, i) => ({ o, i }))).map(({ o, i }) => h('button', { class: 'ans', onclick: (e) => {
        if (solved) return;
        const b = e.currentTarget;
        if (i !== q.a) { sfx.wrong(); b.classList.add('try'); b.disabled = true; wrongN++; msg.textContent = t('bzWrong'); return; }
        solved = true; sfx.hardCorrect(); b.classList.add('right'); opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
        let text = t('bzRight') + ' ' + q.why;
        if (!S.boise.done[p.id]) {
          S.boise.done[p.id] = { t: Date.now(), w: wrongN };
          let pay = REWARD.boise.place + payFor(q.opts.length, REWARD.boise.quiz, wrongN);
          if (S.boise.lastDay !== today()) { S.boise.lastDay = today(); pay += REWARD.boise.firstToday; }
          const cat = CATS.find((c) => c.id === p.cat);
          let catBonus = 0;
          if (!S.boise.cats[p.cat] && PLACES.filter((x) => x.cat === p.cat).every((x) => isDone(x.id))) { S.boise.cats[p.cat] = true; catBonus = REWARD.boise.catDone; pay += catBonus; }
          const got = addPearls(pay).got; save(); markPlayed('boise');
          text += ' ' + t('bzDone') + (got ? ' +' + got : '');
          if (catBonus && cat) text += ' ' + t('bzCatDone', { c: t('bzCats')[cat.id], n: catBonus });
          confetti(); if (got) flyPoints(b, got); awardBadges();
          if (PLACES.every((x) => isDone(x.id))) text += ' ' + t('bzAllDone');
        }
        msg.textContent = text; nextBtn();
      } }, o)));
    };
    draw();
    const ph = p.photo;
    const fig = h('figure', { class: 'bz-fig' }, h('div', { class: 'bz-pic' }, pic(p)),
      h('figcaption', {}, ph ? t('bzPhotoCredit', { c: ph.credit, l: ph.license }) : t('bzPicNote')));
    const cat = CATS.find((c) => c.id === p.cat);
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': d.name }, h('div', { class: 'dialog bzD' },
      h('button', { class: 'btn ghost icon pclose', 'aria-label': t('bzClose'), onclick: close, html: icons.close(30) }),
      cat ? h('span', { class: 'chip bz-cat' }, cat.e + ' ' + t('bzCats')[cat.id]) : null,
      h('h2', {}, d.name), h('p', { class: 'hook' }, d.hook), fig,
      h('ol', { class: 'bz-facts' }, d.facts.map((f) => h('li', {}, f))),
      canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak([d.name, d.hook, ...d.facts].join('. ')) }, h('span', { html: icons.speaker(30) }), t('bzHear')) : null,
      d.ask ? h('div', { class: 'bz-try' }, h('h3', {}, t('bzTry')), h('p', {}, d.ask)) : null,
      h('h3', {}, t('bzQuiz')), h('p', { class: 'muted bz-reward' }, was ? t('bzAgain') : t('bzWin', { n: REWARD.boise.place + REWARD.boise.quiz })),
      h('p', { class: 'qq' }, q.q), opts, msg, after));
    document.body.append(ov);
    const first = ov.querySelector('.ans'); if (first) first.focus({ preventScroll: true });
  }

  drawHead(); drawTabs(); drawGrid();
  if (parts && parts[0] && byId.has(parts[0])) open(byId.get(parts[0]));
  return () => { stopSpeaking(true); document.querySelectorAll('.overlay .bzD').forEach((x) => x.closest('.overlay')?.remove()); };
}
