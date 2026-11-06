// Home Jobs: real chores that earn pearls. Max picks a job and sees the pearls; a grown-up checks it and types the chore code.
import { S, save, today, awardChore } from '../core/store.js';
import { h, confetti } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { askChoreCode } from './grownup.js';

addStrings({
  en: {
    chTitle: 'Home Jobs', chSub: 'Do a real job at home, show a grown-up, and earn real pearls!', chPts: '+{n}', chPearls: '{n} pearls',
    chDoneToday: 'Done today ✓', chLeft: '{n} left today', chPick: 'Tap a job to see what to do.',
    chGo: 'Go do it! When you are finished, come back and tap the button.', chDid: 'I did it! A grown-up will check',
    chCode: 'Grown-up check: enter the chore code', chBack: 'Back', chNope: 'Not yet. A grown-up needs to check the job first.',
    chYay: 'Great job, Max!', chYaySub: 'You earned {n} pearls for a real job.', chMore: 'More jobs', chHome: 'Home',
    chEdit: 'Grown-up: edit jobs', chEditTitle: 'Edit jobs', chAdd: 'Add a job', chName: 'Job name', chPtsLabel: 'Pearls', chPerDay: 'Times a day', chSave: 'Add', chRemove: 'Remove', chDone: 'Done',
    chNote: 'Pearls from jobs are not limited by the daily cap.', chTotal: 'Pearls from jobs so far: {n}',
    chores: {
      feed: 'Feed Perla', toys: 'Put 5 things back from the counters in your toy room or bedroom', poop: 'Pick up Perla’s poop',
      clothes: 'Pick up and put away any clothes or shoes in the living room', flowers: 'Pick some flowers and give them to Mom',
    },
  },
  es: {
    chTitle: 'Quehaceres', chSub: '¡Haz un trabajo de verdad en casa, muéstraselo a un adulto y gana perlas de verdad!', chPts: '+{n}', chPearls: '{n} perlas',
    chDoneToday: 'Hecho hoy ✓', chLeft: 'Quedan {n} hoy', chPick: 'Toca un trabajo para ver qué hacer.',
    chGo: '¡Ve a hacerlo! Cuando termines, regresa y toca el botón.', chDid: '¡Ya lo hice! Un adulto lo revisa',
    chCode: 'Revisión del adulto: escribe el código', chBack: 'Atrás', chNope: 'Todavía no. Un adulto tiene que revisar el trabajo primero.',
    chYay: '¡Buen trabajo, Max!', chYaySub: 'Ganaste {n} perlas por un trabajo de verdad.', chMore: 'Más trabajos', chHome: 'Inicio',
    chEdit: 'Adultos: editar trabajos', chEditTitle: 'Editar trabajos', chAdd: 'Agregar un trabajo', chName: 'Nombre del trabajo', chPtsLabel: 'Perlas', chPerDay: 'Veces al día', chSave: 'Agregar', chRemove: 'Quitar', chDone: 'Listo',
    chNote: 'Las perlas de los trabajos no tienen el límite diario.', chTotal: 'Perlas ganadas con trabajos: {n}',
    chores: {
      feed: 'Dale de comer a Perla', toys: 'Guarda 5 cosas de las superficies de tu cuarto de juguetes o recámara', poop: 'Recoge la caca de Perla',
      clothes: 'Recoge y guarda la ropa y los zapatos que haya en la sala', flowers: 'Corta unas flores y dáselas a mamá',
    },
  },
});

export const BUILTIN = [
  { id: 'feed', pts: 3, ico: '🐶' },
  { id: 'toys', pts: 5, ico: '🧸' },
  { id: 'poop', pts: 10, ico: '🧤' },
  { id: 'clothes', pts: 5, ico: '👕' },
  { id: 'flowers', pts: 5, ico: '🌼' },
];
const perDayOf = (c) => c.perDay || 1;

export function allChores() {
  const C = S.chores;
  const built = BUILTIN.filter((c) => !C.hidden[c.id]).map((c) => ({ ...c, pts: C.pts[c.id] ?? c.pts, name: () => t('chores')[c.id] }));
  const mine = (C.custom || []).map((c) => ({ id: c.id, pts: c.pts, perDay: c.perDay, ico: '⭐', name: () => c.name }));
  return [...built, ...mine];
}
export const doneToday = (id) => (S.chores.done[today()] || {})[id] || 0;

export function mount(el) {
  const root = h('div', { class: 'chores' }); el.append(root);
  let selected = null;

  function list() {
    selected = null;
    const jobs = allChores();
    root.replaceChildren(
      h('div', { class: 'screen-head' }, h('h1', {}, t('chTitle')), h('span', { class: 'chip' }, h('span', { html: icons.pearl(26) }), ' ' + S.pearls.balance)),
      h('p', { class: 'muted' }, t('chSub')),
      h('div', { class: 'chgrid' }, jobs.map((c) => {
        const left = perDayOf(c) - doneToday(c.id), done = left <= 0;
        return h('button', { class: 'chcard' + (done ? ' done' : ''), disabled: done, onclick: () => { sfx.pop(); detail(c); } },
          h('span', { class: 'che' }, c.ico),
          h('span', { class: 'chname' }, c.name()),
          h('span', { class: 'chpts' }, done ? t('chDoneToday') : t('chPts', { n: c.pts })));
      })),
      h('p', { class: 'muted small' }, t('chNote') + ' ' + t('chTotal', { n: S.chores.total || 0 })),
      h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: editor }, t('chEdit'))));
  }

  function detail(c) {
    selected = c;
    const msg = h('p', { class: 'qmsg', role: 'status' });
    root.replaceChildren(
      h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('chBack'), onclick: list, html: icons.back(34) }), h('h1', {}, t('chTitle'))),
      h('div', { class: 'card chdetail' },
        h('div', { class: 'che big' }, c.ico),
        h('h2', {}, c.name()),
        h('p', { class: 'chbig' }, h('span', { html: icons.pearl(40) }), ' ', t('chPearls', { n: c.pts })),
        h('p', {}, t('chGo')),
        h('button', { class: 'btn gold go', onclick: async () => {
          const ok = await askChoreCode(t('chCode'));
          if (!ok) { msg.textContent = t('chNope'); return; }
          const d = (S.chores.done[today()] ||= {}); d[c.id] = (d[c.id] || 0) + 1;
          awardChore(c.pts); sfx.fanfare(); sfx.cheer(); confetti(innerWidth / 2, innerHeight / 3); celebrate(c);
        } }, t('chDid')),
        msg,
        h('button', { class: 'btn ghost', onclick: list }, t('chBack'))));
  }

  function celebrate(c) {
    root.replaceChildren(h('div', { class: 'card center summary', style: { maxWidth: '640px', margin: '20px auto' } },
      h('div', { html: icons.trophy(84) }), h('h1', {}, t('chYay')),
      h('p', { class: 'big' }, h('span', { html: icons.pearl(36) }), ' ', t('plusN', { n: c.pts })), h('p', { class: 'muted' }, t('chYaySub', { n: c.pts })),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn gold', onclick: list }, t('chMore')), h('a', { class: 'btn ghost', href: '#/home' }, t('chHome')))));
  }

  async function editor() {
    if (!(await askChoreCode(t('chEdit')))) return;
    const draw = () => {
      const C = S.chores;
      const name = h('input', { class: 'textin', placeholder: t('chName'), maxlength: 80 });
      const pts = h('input', { class: 'textin', type: 'number', min: 1, max: 50, value: 5, style: { width: '100px' } });
      const per = h('input', { class: 'textin', type: 'number', min: 1, max: 5, value: 1, style: { width: '100px' } });
      root.replaceChildren(
        h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('chDone'), onclick: list, html: icons.back(34) }), h('h1', {}, t('chEditTitle'))),
        h('div', { class: 'card' }, allChores().map((c) => h('div', { class: 'edrow' },
          h('span', { class: 'chname' }, c.ico + ' ' + c.name()),
          h('button', { class: 'btn ghost small', 'aria-label': '−', onclick: () => { setPts(c, Math.max(1, c.pts - 1)); draw(); } }, '−'),
          h('b', {}, String(c.pts)),
          h('button', { class: 'btn ghost small', 'aria-label': '+', onclick: () => { setPts(c, Math.min(50, c.pts + 1)); draw(); } }, '+'),
          h('button', { class: 'btn ghost small', onclick: () => { if (BUILTIN.some((b) => b.id === c.id)) C.hidden[c.id] = true; else C.custom = C.custom.filter((x) => x.id !== c.id); save(); draw(); } }, t('chRemove'))))),
        h('div', { class: 'card', style: { marginTop: '14px' } }, h('h3', {}, t('chAdd')),
          h('div', { class: 'row' }, name, h('label', {}, t('chPtsLabel') + ' ', pts), h('label', {}, t('chPerDay') + ' ', per),
            h('button', { class: 'btn gold small', onclick: () => {
              const n = name.value.trim(); if (!n) return;
              C.custom.push({ id: 'c' + Date.now().toString(36), name: n, pts: Math.max(1, Math.min(50, +pts.value || 5)), perDay: Math.max(1, Math.min(5, +per.value || 1)) }); save(); draw();
            } }, t('chSave')))),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: list }, t('chDone'))));
    };
    const setPts = (c, v) => { if (BUILTIN.some((b) => b.id === c.id)) S.chores.pts[c.id] = v; else { const m = S.chores.custom.find((x) => x.id === c.id); if (m) m.pts = v; } save(); };
    draw();
  }

  list();
  return () => {};
}
