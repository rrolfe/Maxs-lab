// World Map: satellite map, family places highlighted, place sheets with facts and a mini quiz, and a "Find it!" game.
import { S, save, addPearls, losePearls, levelOf, day } from '../core/store.js';
import { REWARD, payFor, penaltyFor } from '../core/economy.js';
import { h, clamp, shuffle, pick, toast, confetti, flyPoints, flyLoss } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak } from '../core/audio.js';
import { awardBadges } from '../core/badges.js';
import { TileMap, distKm } from '../world/tilemap.js';

addStrings({
  en: {
    wReadIt: 'I read it! Quiz me', wReadFirst: 'Read the facts first…', wPeek: 'Peek at the facts (half points)', wClosedBook: 'The facts are tucked away. What do you remember?', wBackToFacts: 'Facts', wWrongCost: 'Not quite. A wrong pick costs a few pearls.', wRotate: 'New question each visit',
    wTitle: 'World Map', wAll: 'Everything', wFam: 'Family', wCities: 'Cities', wWild: 'Wild', wHist: 'History', wSci: 'Science',
    wMap: 'Map', wList: 'List', wFind: 'Find it!', wZoomIn: 'Zoom in', wZoomOut: 'Zoom out', wWhole: 'Whole world', wStamps: '{n} of {m} stamps',
    wSat: 'Satellite view', wSimple: 'Simple map (no internet pictures)', wLoadingSat: 'Loading satellite pictures…',
    wFacts: 'Did you know?', wThink: 'Think about it', wShowAns: 'Show an answer', wQuizMe: 'Quiz me', wQuizBonus: 'Win a passport stamp and 12 pearls!', wStamped: 'Stamped', wFamNote: 'Family note', wMiHome: '{n} miles from home',
    wCorrect: 'Yes!', wTry: 'Not quite. Try another one.', wStampGot: 'New passport stamp!', wPearlsGot: '+{n} pearls', wMore: 'One more question', wClosePlace: 'Close', wCredit: 'Photo: {c} ({l})', wZoomHere: 'Zoom in here', wListen: 'Read to me',
    fWhere: 'Where is {name}?', fTap: 'Tap the map where you think it is.', fRight: 'You found it! You were {d} miles away.', fClose: 'Close! You were {d} miles away. It is here.', fFar: 'Not this time. It was {d} miles from your tap. Now you know where it is!',
    fRound: 'Question {n} of 5', fNext: 'Next', fDone: 'Round complete: {n} of 5!', fAgain: 'Play again', fExit: 'Leave game', fBonus: 'Bonus pearls!',
    wPrefer: 'This map needs the internet to show satellite pictures.', wNoPlaces: 'No places match.', wOf: '{a} · {b}',
  },
  es: {
    wReadIt: '¡Ya lo leí! Pregúntame', wReadFirst: 'Primero lee los datos…', wPeek: 'Mirar los datos (la mitad de puntos)', wClosedBook: 'Los datos están guardados. ¿Qué recuerdas?', wBackToFacts: 'Datos', wWrongCost: 'Casi. Una respuesta equivocada cuesta unas perlas.', wRotate: 'Una pregunta nueva en cada visita',
    wTitle: 'Mapa del mundo', wAll: 'Todo', wFam: 'Familia', wCities: 'Ciudades', wWild: 'Naturaleza', wHist: 'Historia', wSci: 'Ciencia',
    wMap: 'Mapa', wList: 'Lista', wFind: '¡Encuéntralo!', wZoomIn: 'Acercar', wZoomOut: 'Alejar', wWhole: 'Todo el mundo', wStamps: '{n} de {m} sellos',
    wSat: 'Vista de satélite', wSimple: 'Mapa simple (sin imágenes de internet)', wLoadingSat: 'Cargando imágenes de satélite…',
    wFacts: '¿Sabías que…?', wThink: 'Piensa en esto', wShowAns: 'Mostrar una respuesta', wQuizMe: 'Ponme a prueba', wQuizBonus: '¡Gana un sello del pasaporte y 12 perlas!', wStamped: 'Sellado', wFamNote: 'Nota familiar', wMiHome: 'A {n} millas de casa',
    wCorrect: '¡Sí!', wTry: 'Casi. Prueba con otra.', wStampGot: '¡Nuevo sello en el pasaporte!', wPearlsGot: '+{n} perlas', wMore: 'Una pregunta más', wClosePlace: 'Cerrar', wCredit: 'Foto: {c} ({l})', wZoomHere: 'Acercar aquí', wListen: 'Léemelo',
    fWhere: '¿Dónde está {name}?', fTap: 'Toca el mapa donde crees que está.', fRight: '¡Lo encontraste! Estuviste a {d} millas.', fClose: '¡Cerca! Estuviste a {d} millas. Está aquí.', fFar: 'Esta vez no. Estaba a {d} millas de tu toque. ¡Ya sabes dónde está!',
    fRound: 'Pregunta {n} de 5', fNext: 'Siguiente', fDone: 'Ronda completa: ¡{n} de 5!', fAgain: 'Jugar otra vez', fExit: 'Salir del juego', fBonus: '¡Perlas extra!',
    wPrefer: 'Este mapa necesita internet para mostrar las imágenes de satélite.', wNoPlaces: 'No hay lugares.', wOf: '{a} · {b}',
  },
});

const GROUPS = [['all', 'wAll', '🌍'], ['family', 'wFam', '⭐'], ['cities', 'wCities', '🏙️'], ['wild', 'wWild', '🦁'], ['history', 'wHist', '🏛️'], ['science', 'wSci', '🔬']];
const km2mi = (km) => Math.round(km * 0.621371);

export async function mount(el, { parts }) {
  const data = (await import('../../data/places.js')).default;
  const PQ = (await import('../../data/placeqs.js')).default;
  const byId = new Map(data.map((p) => [p.id, p]));
  const bankFor = (p) => [...L(p.quiz), ...((PQ[p.id] || {})[S.lang] || [])];
  const st = { group: S.settings.lastWorldGroup || 'all', view: 'map', sel: null, find: null };
  const root = h('div', { class: 'world' }); el.append(root);
  root.style.setProperty('--hudh', (document.querySelector('.hud')?.getBoundingClientRect().height || 98) + 'px');
  const stamped = () => Object.keys(S.passport.stamps).filter((id) => byId.has(id)).length;
  const matches = (p) => st.group === 'all' || p.g === st.group;
  const noteOf = (id) => { const n = S.settings.familyNotes && S.settings.familyNotes[id]; return typeof n === 'object' && n ? n[S.lang] || n.en || '' : n || ''; };

  // ----- header
  const chips = h('div', { class: 'chips', role: 'group', 'aria-label': t('wTitle') });
  const viewBtn = h('div', { class: 'seg2', role: 'group' });
  const countEl = h('span', { class: 'chip' });
  const head = h('div', { class: 'screen-head wh' }, h('h1', {}, t('wTitle')), countEl, viewBtn, h('button', { class: 'btn gold small', onclick: () => startFind() }, h('span', { html: icons.world(34) }), t('wFind')));
  const mapbox = h('div', { class: 'mapbox' }), listbox = h('div', { class: 'placelist', hidden: true });
  const sheetHost = h('div', { class: 'sheethost' });
  root.append(head, chips, mapbox, listbox, sheetHost);

  const hudH = () => (document.querySelector('.hud')?.getBoundingClientRect().height || 98);
  function sizeMap() { const top = mapbox.getBoundingClientRect().top; mapbox.style.height = Math.max(420, innerHeight - top - 14) + 'px'; }

  // ----- map
  const home = S.settings.home;
  const mk = (p) => ({ id: p.id, lat: p.lat, lon: p.lon, label: L(p.name), fam: p.fam, done: !!S.passport.stamps[p.id], kind: p.k });
  let finding = false;
  const sheetTimers = [];
  const note = h('div', { class: 'tm-note tm-ui' });
  const map = new TileMap(mapbox, {
    getKey: () => S.settings.mapKey || '',
    filter: (m) => !finding && (st.group === 'all' || byId.get(m.id).g === st.group || m.id === st.sel),
    onProvider: (p) => setNote(p),
    onTap: (e) => { if (finding) return findTap(e); if (e.hit) openPlace(e.hit.id); else closePlace(); },
  });
  map.root.setAttribute('aria-label', t('wTitle'));
  function setNote(p) { note.textContent = p ? t('wSat') + ' · ' + p.name : t('wSimple'); note.classList.toggle('off', !p); }
  setNote(map.provider);
  const ctl = h('div', { class: 'tm-ctl tm-ui' },
    h('button', { class: 'btn ghost icon', 'aria-label': t('wZoomIn'), onclick: () => { sfx.tap(); map.zoomBy(1); }, html: icons.plus(34) }),
    h('button', { class: 'btn ghost icon', 'aria-label': t('wZoomOut'), onclick: () => { sfx.tap(); map.zoomBy(-1); }, html: icons.minus(34) }),
    h('button', { class: 'btn ghost small', onclick: () => { sfx.tap(); wholeWorld(); } }, t('wWhole')));
  map.root.append(ctl, note);
  function wholeWorld() { map.flyTo(18, 8, map.minZ() + 0.15, 700); }
  map.setMarkers(data.map(mk));
  if (home && typeof home.lat === 'number') { /* home pin is drawn through the pin layer only inside the sheet distance text */ }
  requestAnimationFrame(() => { sizeMap(); map.resize(); wholeWorld(); });
  const onResize = () => { sizeMap(); };
  addEventListener('resize', onResize);

  // ----- chips / view toggle
  function drawChips() {
    chips.replaceChildren(...GROUPS.map(([k, key, em]) => h('button', { class: 'chip big', 'aria-pressed': String(st.group === k), onclick: () => { st.group = k; S.settings.lastWorldGroup = k; save(); sfx.tap(); drawChips(); map.draw(); drawList(); } }, em + ' ' + t(key))));
    countEl.textContent = t('wStamps', { n: stamped(), m: data.length });
    viewBtn.replaceChildren(...[['map', 'wMap'], ['list', 'wList']].map(([k, key]) => h('button', { 'aria-pressed': String(st.view === k), onclick: () => { st.view = k; mapbox.hidden = k !== 'map'; listbox.hidden = k !== 'list'; if (k === 'map') { sizeMap(); map.resize(); } drawChips(); drawList(); } }, t(key))));
  }
  function drawList() {
    if (st.view !== 'list') return;
    const items = data.filter(matches).sort((a, b) => b.fam - a.fam || L(a.name).localeCompare(L(b.name)));
    listbox.replaceChildren(...(items.length ? items.map((p) => h('button', { class: 'pcard' + (S.passport.stamps[p.id] ? ' done' : ''), onclick: () => openPlace(p.id) },
      h('img', { src: 'img/places/' + p.id + '.jpg', alt: '', loading: 'lazy' }), h('strong', {}, (p.fam ? '⭐ ' : '') + L(p.name)), h('small', {}, L(p.country)), S.passport.stamps[p.id] ? h('span', { class: 'tag' }, '✓') : null)) : [h('p', { class: 'muted' }, t('wNoPlaces'))]));
  }

  // ----- place sheet
  function closePlace() { sheetTimers.splice(0).forEach(clearTimeout); st.sel = null; map.pad = { l: 0, r: 0, t: 0, b: 0 }; map.setSelected(null); sheetHost.replaceChildren(); }
  function openPlace(id) {
    const p = byId.get(id); if (!p) return;
    sheetTimers.splice(0).forEach(clearTimeout);
    sfx.pop(); st.sel = id; map.setSelected(id);
    const done = !!S.passport.stamps[id], note = noteOf(id);
    const listen = canSpeak() ? h('button', { class: 'btn ghost small', onclick: () => speak([L(p.name), L(p.hook), ...L(p.facts)].join('. ')) }, h('span', { html: icons.speaker(30) }), t('wListen')) : null;
    const quizArea = h('div', { class: 'pquiz' });
    const factsBox = h('div', { class: 'factsbox' },
      h('p', { class: 'hook' }, L(p.hook)),
      note ? h('p', { class: 'famnote' }, h('b', {}, t('wFamNote') + ': '), note) : null,
      h('h3', {}, t('wFacts')), h('ul', { class: 'facts2' }, L(p.facts).map((f) => h('li', {}, f))));
    let peeked = false;
    const dist = home && typeof home.lat === 'number' ? t('wMiHome', { n: km2mi(distKm(home, p)).toLocaleString() }) : '';
    const ph = p.photo;
    const readBtn = h('button', { class: 'btn gold', disabled: true, onclick: () => startQuiz() }, h('span', { html: icons.quiz(34) }), t('wReadFirst'));
    const readTimer = setTimeout(() => { readBtn.disabled = false; readBtn.lastChild.textContent = t('wReadIt'); }, 5500);
    sheetTimers.push(readTimer);
    const sheet = h('aside', { class: 'psheet card', role: 'dialog', 'aria-label': L(p.name) },
      h('button', { class: 'btn ghost icon pclose', 'aria-label': t('wClosePlace'), onclick: closePlace, html: icons.close(30) }),
      h('figure', {}, h('img', { src: 'img/places/' + p.id + '.jpg', alt: L(ph.alt), width: ph.w, height: ph.h }), h('figcaption', {}, t('wCredit', { c: ph.credit, l: ph.license }))),
      h('h2', {}, (p.fam ? '⭐ ' : '') + L(p.name)), h('p', { class: 'muted pc' }, L(p.country) + (dist ? ' · ' + dist : '')),
      factsBox,
      listen,
      h('details', { class: 'think' }, h('summary', {}, t('wThink') + ': ' + L(p.stretch).question), h('p', {}, L(p.stretch).answer)),
      done ? h('p', { class: 'tag good' }, '✓ ' + t('wStamped')) : h('p', { class: 'muted' }, t('wQuizBonus')),
      h('div', { class: 'row' }, readBtn, h('button', { class: 'btn ghost small', onclick: () => map.flyTo(p.lat, p.lon, Math.min(map.maxZ(), 8), 800) }, t('wZoomHere'))),
      quizArea);
    sheetHost.replaceChildren(sheet); sheet.scrollTop = 0;
    if (st.view === 'map') {
      const sr = sheet.getBoundingClientRect(), mr = mapbox.getBoundingClientRect();
      map.pad = sr.left > mr.left + 120 ? { l: 0, r: Math.max(0, mr.right - sr.left), t: 0, b: 0 } : { l: 0, r: 0, t: 0, b: Math.max(0, mr.bottom - sr.top) };
      map.flyTo(p.lat, p.lon, Math.max(map.z, p.k === 'city' ? 5.2 : 4.6), 700);
    }
    function startQuiz() {
      const qs = bankFor(p); if (!qs.length) return;
      const pq = ((S.settings.placeQ ||= {})[id] ||= { ok: [], last: -1 });
      let cand = qs.map((_, i) => i).filter((i) => !pq.ok.includes(i) && i !== pq.last);
      if (!cand.length) { pq.ok = []; cand = qs.map((_, i) => i).filter((i) => i !== pq.last); }   // all learned: cycle again
      const qi = cand[0]; pq.last = qi; save();
      const q = qs[qi];
      const order = shuffle(q.opts.map((o, i) => ({ o, i })));
      const base = REWARD.map.right, n = q.opts.length;
      let wrong = 0, lostSum = 0; peeked = false;
      factsBox.hidden = true;                                   // closed book: he has to remember what he read
      readBtn.hidden = true;
      const peekBtn = h('button', { class: 'btn ghost small', onclick: () => { peeked = true; factsBox.hidden = !factsBox.hidden; peekBtn.textContent = factsBox.hidden ? t('wPeek') : t('wBackToFacts') + ' ✓'; } }, t('wPeek'));
      quizArea.replaceChildren(h('p', { class: 'muted small' }, t('wClosedBook')), h('h3', {}, q.q),
        h('div', { class: 'opts' }, order.map(({ o, i }) => h('button', { class: 'ans', onclick: (e) => answer(e.currentTarget, i === q.a, q) }, o))), h('p', { class: 'qmsg', role: 'status' }), peekBtn);
      quizArea.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      function answer(btn, ok, q) {
        const msg = quizArea.querySelector('.qmsg');
        if (!ok) {
          sfx.wrong(); btn.classList.add('try'); btn.disabled = true; wrong++;
          const lost = losePearls(penaltyFor(n, base)); lostSum += lost; if (lost) flyLoss(btn, lost);
          msg.textContent = t('wWrongCost') + (lost ? ' −' + lost : ''); return;
        }
        sfx.hardCorrect(); quizArea.querySelectorAll('.ans').forEach((b) => { b.disabled = true; }); btn.classList.add('right');
        factsBox.hidden = false; readBtn.hidden = false; readBtn.disabled = false; readBtn.lastChild.textContent = t('wMore'); peekBtn.hidden = true;
        let pay = payFor(n, base, wrong); if (peeked) pay = Math.floor(pay / 2);
        if (!pq.ok.includes(qi) && wrong === 0) pq.ok.push(qi);
        let m = t('wCorrect') + ' ' + q.why;
        const g = addPearls(pay); let got = g.got;
        if (!S.passport.stamps[id]) {
          S.passport.stamps[id] = { t: Date.now() }; const gs = addPearls(REWARD.map.stamp); got += gs.got; save();
          m += ' ' + t('wStampGot'); confetti(); awardBadges(); map.marks.get(id).el.classList.add('done'); drawChips();
        }
        if (got) { m += ' ' + t('wPearlsGot', { n: got }); flyPoints(btn, got); }
        msg.textContent = m; save();
      }
    }
  }

  // ----- Find it! game
  function startFind() {
    sfx.pop(); closePlace(); finding = true; map.root.classList.add('find'); map.setMarkers(data.map(mk)); wholeWorld();
    const pool = (levelOf('world') >= 4 ? data : data.filter((p) => p.fam || p.k === 'city')).filter(matches);
    const set = shuffle(pool.length >= 5 ? pool : data).slice(0, 5);
    let n = 0, right = 0, awaiting = true, target = null;
    const bar = h('div', { class: 'findbar tm-ui', role: 'status' });
    map.root.append(bar);
    const ask = () => {
      target = set[n]; awaiting = true; map.setPin(null); wholeWorld();
      bar.replaceChildren(h('small', {}, t('fRound', { n: n + 1 })), h('strong', {}, t('fWhere', { name: L(target.name) })), h('span', {}, t('fTap')), h('button', { class: 'btn ghost small', onclick: leave }, t('fExit')));
    };
    function leave() { finding = false; map.root.classList.remove('find'); bar.remove(); map.setPin(null); map.setMarkers(data.map(mk)); findTap = () => {}; }
    findTap = (e) => {
      if (!awaiting) return; awaiting = false;
      const km = distKm(e, target), mi = km2mi(km), lvl = levelOf('world'), lim = lvl >= 4 ? 700 : 1500, near = lim * 2.2;
      const good = km <= lim;
      map.setPin({ lat: target.lat, lon: target.lon, cls: good ? 'good' : 'near', text: L(target.name) });
      if (good) { right++; sfx.hardCorrect(); confetti(e.x, e.y); } else sfx.soft();
      map.flyTo((e.lat + target.lat) / 2, (e.lon + target.lon) / 2, clamp(map.z, map.minZ() + 0.2, 4), 700);
      const msg = good ? t('fRight', { d: mi.toLocaleString() }) : km <= near ? t('fClose', { d: mi.toLocaleString() }) : t('fFar', { d: mi.toLocaleString() });
      const last = n === 4;
      bar.replaceChildren(h('small', {}, t('fRound', { n: n + 1 })), h('strong', {}, msg), h('button', { class: 'btn gold small', onclick: () => { sfx.pop(); if (last) done(); else { n++; ask(); } } }, last ? t('done') : t('fNext')));
    };
    function done() {
      let extra = 0; const pearls = right * REWARD.map.findRight + (right >= 4 ? REWARD.map.findBonus : 0); const g = addPearls(pearls); extra = g.got; save(); awardBadges();
      bar.replaceChildren(h('small', {}, t('fDone', { n: right })), h('strong', {}, extra ? t('wPearlsGot', { n: extra }) + (right >= 4 ? ' · ' + t('fBonus') : '') : ''),
        h('div', { class: 'row' }, h('button', { class: 'btn gold small', onclick: () => { leave(); startFind(); } }, t('fAgain')), h('button', { class: 'btn ghost small', onclick: leave }, t('fExit'))));
      if (right >= 3) confetti();
    }
    ask();
  }
  let findTap = () => {};

  drawChips(); drawList();
  if (parts[0] === 'place' && parts[1] && byId.has(parts[1])) setTimeout(() => openPlace(parts[1]), 300);
  return () => { removeEventListener('resize', onResize); map.destroy(); };
}
