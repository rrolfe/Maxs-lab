// Home Jobs: real chores that earn pearls. Max picks a job and sees the pearls; a grown-up checks it and types the chore code.
import { S, save, today, awardChore, weekView } from '../core/store.js';
import { h, confetti } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx } from '../core/audio.js';
import { askChoreCode } from './grownup.js';

addStrings({
  en: {
    chTitle: 'Home Jobs', chSub: 'Do a real job at home, show a grown-up, and earn real pearls!', chPts: '+{n}', chPearls: '{n} pearls',
    chDoneToday: 'Done today ✓', chDoneWeek: 'Done this week ✓', chLeft: '{n} left today', chPick: 'Tap a job to see what to do.',
    chGo: 'Go do it! When you are finished, come back and tap the button.', chDid: 'I did it! A grown-up will check',
    chCode: 'Grown-up check: enter the chore code', chBack: 'Back', chNope: 'Not yet. A grown-up needs to check the job first.',
    chYay: 'Great job, Max!', chYaySub: 'You earned {n} pearls for a real job.', chMore: 'More jobs', chHome: 'Home',
    chEdit: 'Grown-up: edit jobs', chEditTitle: 'Edit jobs', chAdd: 'Add a job', chName: 'Job name', chPtsLabel: 'Pearls', chPerDay: 'Times a day', chSave: 'Add', chRemove: 'Remove', chDone: 'Done',
    chNote: 'Pearls from jobs are not limited by the daily cap.', chTotal: 'Pearls from jobs so far: {n}',
    chores: {
      feed: 'Feed Perla', toys: 'Put 5 things back from the counters in your toy room or bedroom', poop: 'Pick up Perla’s poop',
      clothes: 'Pick up and put away any clothes or shoes in the living room', flowers: 'Pick some flowers and give them to Mom',
      water: 'Fresh water for Perla', brush: 'Brush Perla', walk: 'Walk Perla', settable: 'Set the table', cleartable: 'Clear the table', dishwasher: 'Unload the dishwasher',
      washfruit: 'Wash fruit and veggies', chef: 'Helper chef', wipe: 'Wipe the table', bed: 'Make your bed', rescue: '10-minute Room Rescue', backpack: 'Pack for tomorrow',
      baskets: 'Empty the wastebaskets', sortlaundry: 'Sort the laundry', socks: 'Sock match-up', towels: 'Fold the towels', clothesaway: 'Put clean clothes away',
      plants: 'Water the plants', sweep: 'Sweep the porch', garden: 'Garden helper', recycle: 'Recycling run', groceries: 'Put away groceries', teachback: 'Teach a grown-up',
      gamenight: 'Host family game night', journal: 'Journal or draw', thankyou: 'Thank-you note', neighbor: 'Help a neighbor', donate: 'Donate box',
    },
    chHow: {
      water: 'Fill Perla’s water bowl with fresh, cool water.', brush: 'Gently brush Perla, but only if she enjoys it. Stop if she walks away.',
      walk: 'A grown-up comes too and holds the leash near the street. Walk for 10 minutes or more.', settable: 'Plates, cups, napkins and spoons for everyone who is eating.',
      cleartable: 'Plates, cups and napkins go to the counter. No knives.', dishwasher: 'Put away the plastic, cups and spoons. A grown-up takes the glass and the knives.',
      washfruit: 'Wash the fruit and vegetables, or tear up the lettuce, for the meal.', chef: 'Measure, stir and crack the eggs with a grown-up. No stove and no knives.',
      wipe: 'Wipe the table and counters with a damp cloth. Water only, no sprays.', bed: 'Straighten the sheet, pull up the blanket and put the pillow on top.',
      rescue: 'Set a timer for 10 minutes: books on the shelf, toys in the bins, floor clear. Beat the clock!', backpack: 'Pack your backpack and lay out tomorrow’s outfit.',
      baskets: 'Carry the small wastebaskets to the big bin and empty them.', sortlaundry: 'Sort the dirty laundry into lights and darks.',
      socks: 'Find the matching pairs of clean socks and count how many pairs.', towels: 'Fold the towels and washcloths flat, then in thirds.',
      clothesaway: 'Put your clean clothes away in the drawers and the closet.', plants: 'Use the watering can, not the hose. Skip it on rainy days.',
      sweep: 'Sweep the porch or the patio into a pile and into the dustpan.', garden: 'Pull weeds and pick up sticks and leaves. Gloves on, and a grown-up is in the yard.',
      recycle: 'Sort the paper, plastic and cans into the bins. No glass.', groceries: 'Put away the groceries that are light and can’t break.',
      teachback: 'Teach a grown-up something you learned this week, then quiz them. Be a kind teacher!', gamenight: 'Set up a game, explain the rules and keep score.',
      journal: 'Write 3 sentences about your day, or draw a picture and label it.', thankyou: 'Write a thank-you note or card for someone. Don’t forget the comma after the greeting!',
      neighbor: 'With a grown-up: help a neighbor, or tidy a park with gloves and a grabber. No glass.', donate: 'Find toys and clothes you have outgrown and put them in the donate box.',
    },
  },
  es: {
    chTitle: 'Quehaceres', chSub: '¡Haz un trabajo de verdad en casa, muéstraselo a un adulto y gana perlas de verdad!', chPts: '+{n}', chPearls: '{n} perlas',
    chDoneToday: 'Hecho hoy ✓', chDoneWeek: 'Hecho esta semana ✓', chLeft: 'Quedan {n} hoy', chPick: 'Toca un trabajo para ver qué hacer.',
    chGo: '¡Ve a hacerlo! Cuando termines, regresa y toca el botón.', chDid: '¡Ya lo hice! Un adulto lo revisa',
    chCode: 'Revisión del adulto: escribe el código', chBack: 'Atrás', chNope: 'Todavía no. Un adulto tiene que revisar el trabajo primero.',
    chYay: '¡Buen trabajo, Max!', chYaySub: 'Ganaste {n} perlas por un trabajo de verdad.', chMore: 'Más trabajos', chHome: 'Inicio',
    chEdit: 'Adultos: editar trabajos', chEditTitle: 'Editar trabajos', chAdd: 'Agregar un trabajo', chName: 'Nombre del trabajo', chPtsLabel: 'Perlas', chPerDay: 'Veces al día', chSave: 'Agregar', chRemove: 'Quitar', chDone: 'Listo',
    chNote: 'Las perlas de los trabajos no tienen el límite diario.', chTotal: 'Perlas ganadas con trabajos: {n}',
    chores: {
      feed: 'Dale de comer a Perla', toys: 'Guarda 5 cosas de las superficies de tu cuarto de juguetes o recámara', poop: 'Recoge la caca de Perla',
      clothes: 'Recoge y guarda la ropa y los zapatos que haya en la sala', flowers: 'Corta unas flores y dáselas a mamá',
      water: 'Agua fresca para Perla', brush: 'Cepilla a Perla', walk: 'Pasea a Perla', settable: 'Pon la mesa', cleartable: 'Recoge la mesa', dishwasher: 'Vacía el lavaplatos',
      washfruit: 'Lava frutas y verduras', chef: 'Ayudante de cocina', wipe: 'Limpia la mesa', bed: 'Tiende tu cama', rescue: 'Rescate de cuarto en 10 minutos', backpack: 'Prepara lo de mañana',
      baskets: 'Vacía los botes de basura', sortlaundry: 'Separa la ropa', socks: 'Empareja calcetines', towels: 'Dobla las toallas', clothesaway: 'Guarda la ropa limpia',
      plants: 'Riega las plantas', sweep: 'Barre el porche', garden: 'Ayudante de jardín', recycle: 'Ronda de reciclaje', groceries: 'Guarda las compras', teachback: 'Enséñale a un adulto',
      gamenight: 'Organiza la noche de juegos', journal: 'Diario o dibujo', thankyou: 'Nota de agradecimiento', neighbor: 'Ayuda a un vecino', donate: 'Caja para donar',
    },
    chHow: {
      water: 'Llena el plato de Perla con agua fresca y fría.', brush: 'Cepilla a Perla con suavidad, pero solo si le gusta. Si se va, para.',
      walk: 'Un adulto va contigo y sostiene la correa cerca de la calle. Caminen 10 minutos o más.', settable: 'Platos, vasos, servilletas y cucharas para todos los que van a comer.',
      cleartable: 'Los platos, los vasos y las servilletas van al mostrador. Sin cuchillos.', dishwasher: 'Guarda los plásticos, los vasos y las cucharas. Un adulto saca el vidrio y los cuchillos.',
      washfruit: 'Lava las frutas y las verduras, o rompe la lechuga, para la comida.', chef: 'Mide, mezcla y rompe los huevos con un adulto. Sin estufa y sin cuchillos.',
      wipe: 'Limpia la mesa y los mostradores con un paño húmedo. Solo agua, sin aerosoles.', bed: 'Estira la sábana, sube la cobija y pon la almohada arriba.',
      rescue: 'Pon un temporizador de 10 minutos: libros en el estante, juguetes en los botes y el piso libre. ¡Gánale al reloj!', backpack: 'Prepara tu mochila y deja lista la ropa de mañana.',
      baskets: 'Lleva los botes de basura pequeños al grande y vacíalos.', sortlaundry: 'Separa la ropa sucia en clara y oscura.',
      socks: 'Busca los pares de calcetines limpios y cuenta cuántos pares hay.', towels: 'Dobla las toallas y los paños planos y luego en tres partes.',
      clothesaway: 'Guarda tu ropa limpia en los cajones y en el clóset.', plants: 'Usa la regadera, no la manguera. Si llovió, no hace falta.',
      sweep: 'Barre el porche o el patio hasta hacer un montoncito y échalo al recogedor.', garden: 'Arranca hierbas y recoge palitos y hojas. Con guantes y con un adulto en el jardín.',
      recycle: 'Separa el papel, el plástico y las latas en los botes. Sin vidrio.', groceries: 'Guarda las compras que sean ligeras y no se rompan.',
      teachback: 'Enséñale a un adulto algo que aprendiste esta semana y luego hazle preguntas. ¡Sé un maestro amable!', gamenight: 'Prepara un juego, explica las reglas y anota los puntos.',
      journal: 'Escribe 3 oraciones sobre tu día, o haz un dibujo y ponle nombres.', thankyou: 'Escribe una nota o tarjeta de agradecimiento para alguien. ¡No olvides la coma después del saludo!',
      neighbor: 'Con un adulto: ayuda a un vecino, o limpia un parque con guantes y pinza. Sin vidrio.', donate: 'Busca juguetes y ropa que ya no te queden y ponlos en la caja para donar.',
    },
  },
});

export const BUILTIN = [
  { id: 'feed', pts: 3, ico: '🐶' },
  { id: 'toys', pts: 5, ico: '🧸' },
  { id: 'poop', pts: 10, ico: '🧤' },
  { id: 'clothes', pts: 5, ico: '👕' },
  { id: 'flowers', pts: 5, ico: '🌼' },
  // Added Nov 2026 from a teacher’s review. About 3 pearls a minute of effort. perWeek = most times in a Monday-to-Sunday week.
  { id: 'water', pts: 3, ico: '💧' },
  { id: 'brush', pts: 8, ico: '🪮', perWeek: 4 },
  { id: 'walk', pts: 25, ico: '🦮' },
  { id: 'settable', pts: 6, ico: '🍽️' },
  { id: 'cleartable', pts: 6, ico: '🧻' },
  { id: 'dishwasher', pts: 12, ico: '🥄' },
  { id: 'washfruit', pts: 8, ico: '🍓' },
  { id: 'chef', pts: 25, ico: '👨‍🍳', perWeek: 3 },
  { id: 'wipe', pts: 6, ico: '🧽' },
  { id: 'bed', pts: 5, ico: '🛏️' },
  { id: 'rescue', pts: 30, ico: '⏱️' },
  { id: 'backpack', pts: 8, ico: '🎒' },
  { id: 'baskets', pts: 8, ico: '🗑️', perWeek: 2 },
  { id: 'sortlaundry', pts: 10, ico: '🧺', perWeek: 2 },
  { id: 'socks', pts: 10, ico: '🧦', perWeek: 2 },
  { id: 'towels', pts: 15, ico: '🛁', perWeek: 2 },
  { id: 'clothesaway', pts: 10, ico: '👚', perWeek: 2 },
  { id: 'plants', pts: 8, ico: '🪴', perWeek: 3 },
  { id: 'sweep', pts: 12, ico: '🧹', perWeek: 2 },
  { id: 'garden', pts: 30, ico: '🌱', perWeek: 2 },
  { id: 'recycle', pts: 10, ico: '♻️', perWeek: 2 },
  { id: 'groceries', pts: 12, ico: '🛒', perWeek: 3 },
  { id: 'teachback', pts: 10, ico: '🎓', perWeek: 3 },
  { id: 'gamenight', pts: 40, ico: '🎲', perWeek: 1 },
  { id: 'journal', pts: 15, ico: '✏️', perWeek: 3 },
  { id: 'thankyou', pts: 20, ico: '💌', perWeek: 1 },
  { id: 'neighbor', pts: 30, ico: '🤝', perWeek: 1 },
  { id: 'donate', pts: 25, ico: '🎁', perWeek: 1 },
];
const perDayOf = (c) => c.perDay || 1;

export function allChores() {
  const C = S.chores;
  const built = BUILTIN.filter((c) => !C.hidden[c.id]).map((c) => ({ ...c, pts: C.pts[c.id] ?? c.pts, name: () => t('chores')[c.id] }));
  const mine = (C.custom || []).map((c) => ({ id: c.id, pts: c.pts, perDay: c.perDay, ico: '⭐', name: () => c.name }));
  return [...built, ...mine];
}
export const doneToday = (id) => (S.chores.done[today()] || {})[id] || 0;
export const doneThisWeek = (id) => weekView().reduce((n, d) => n + ((S.chores.done[d.key] || {})[id] || 0), 0);
/** 'today' or 'week' when the job is used up for now, else '' */
export const lockedBy = (c) => (doneToday(c.id) >= perDayOf(c) ? 'today' : (c.perWeek && doneThisWeek(c.id) >= c.perWeek ? 'week' : ''));

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
        const lock = lockedBy(c), done = !!lock;
        return h('button', { class: 'chcard' + (done ? ' done' : ''), disabled: done, onclick: () => { sfx.pop(); detail(c); } },
          h('span', { class: 'che' }, c.ico),
          h('span', { class: 'chname' }, c.name()),
          h('span', { class: 'chpts' }, lock === 'week' ? t('chDoneWeek') : lock ? t('chDoneToday') : t('chPts', { n: c.pts })));
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
        t('chHow')[c.id] ? h('p', { class: 'chhow' }, t('chHow')[c.id]) : null,
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
