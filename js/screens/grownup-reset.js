// Grown-up corner: "Start a game over". Sends one game (a stand, the word games or baseball) back to the beginning so Max can play it again from scratch.
// Pearls, levels, stamps and every other game stay as they are. A safety copy is saved first, so a mistake can be undone under "Safety copies".
import { S, snapshotNow, resetGame, STAND_IDS } from '../core/store.js';
import { h, toast, money } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';

addStrings({
  en: {
    rsTitle: 'Start a game over', rsNote: 'Sends one game back to the very beginning so Max can play it again from scratch. His pearls, levels, stamps and the other games are not touched. A safety copy is saved first (see “Safety copies” below), so it can be undone.',
    rs_lemonade: 'Lemonade Stand', rs_icecream: 'Ice Cream Stand', rs_snack: 'Ballpark Snack Shack', rs_pizza: 'Pizza Shop', rs_words: 'Word Search and Hangman levels', rs_baseball: 'Max’s Ballpark stats',
    rsStand: 'Season {s} · {m} · {u} upgrades', rsNoStand: 'Not started yet', rsLocked: 'Locked', rsWords: '{n} puzzles solved', rsBall: '{g} games played', rsStart: 'Start over', rsAll: 'Start ALL games over',
    rsAsk: 'Start the {g} over?', rsKeep: 'Keep it unlocked (no pearls needed to play again)', rsGoes: 'Everything he built in it goes back to the beginning.', rsGoesAll: 'Every game goes back to the beginning. Pearls, levels and stamps stay.',
    rsType: 'Type {w} to confirm.', rsYes: 'Yes, start over', rsDone: 'Done. Max can start the {g} fresh.', rsDoneAll: 'Done. All the games are back at the beginning.', rsCancel: 'Cancel',
  },
  es: {
    rsTitle: 'Empezar un juego de nuevo', rsNote: 'Devuelve un juego al principio para que Max lo juegue otra vez desde cero. Sus perlas, niveles, sellos y los otros juegos no se tocan. Antes se guarda una copia de seguridad (mira “Copias de seguridad” abajo), así que se puede deshacer.',
    rs_lemonade: 'Puesto de limonada', rs_icecream: 'Puesto de helados', rs_snack: 'Puesto de botanas del estadio', rs_pizza: 'Pizzería', rs_words: 'Niveles de Sopa de letras y Ahorcado', rs_baseball: 'Estadísticas del Estadio de Max',
    rsStand: 'Temporada {s} · {m} · {u} mejoras', rsNoStand: 'Todavía no empezó', rsLocked: 'Bloqueado', rsWords: '{n} rompecabezas resueltos', rsBall: '{g} juegos jugados', rsStart: 'Empezar de nuevo', rsAll: 'Empezar TODOS los juegos de nuevo',
    rsAsk: '¿Empezar de nuevo: {g}?', rsKeep: 'Dejarlo desbloqueado (sin gastar perlas para jugar otra vez)', rsGoes: 'Todo lo que construyó vuelve al principio.', rsGoesAll: 'Todos los juegos vuelven al principio. Las perlas, niveles y sellos se quedan.',
    rsType: 'Escribe {w} para confirmar.', rsYes: 'Sí, empezar de nuevo', rsDone: 'Listo. Max puede empezar de nuevo: {g}.', rsDoneAll: 'Listo. Todos los juegos están de nuevo al principio.', rsCancel: 'Cancelar',
  },
});

const ICON = { lemonade: 'lemonade', icecream: 'icecream', snack: 'ballpark', pizza: 'pizza', words: 'wordsearch', baseball: 'ballpark' };
const GAMES = [...STAND_IDS, 'words', 'baseball'];
const icon = (id) => (icons[ICON[id]] || icons.pearl)(40);

function summary(id) {
  if (STAND_IDS.includes(id)) {
    if (!S.unlocked[id]) return t('rsLocked');
    const st = S.stands[id];
    if (!st || (!st.seasons && !st.days)) return t('rsNoStand');
    return t('rsStand', { s: st.seasons || 1, m: money(st.bank || 0), u: Object.keys(st.up || {}).length });
  }
  if (id === 'words') return t('rsWords', { n: Object.keys(S.words.solved || {}).length });
  return t('rsBall', { g: S.baseball?.games || 0 });
}
const word = () => (S.lang === 'es' ? 'REINICIAR' : 'RESTART');

function confirm(ids, rebuild) {
  const all = ids.length > 1, g = all ? '' : t('rs_' + ids[0]);
  const hasStand = ids.some((x) => STAND_IDS.includes(x));
  const keep = h('input', { type: 'checkbox', checked: true, id: 'rskeep' });
  const inp = all ? h('input', { class: 'textin', type: 'text', autocomplete: 'off', autocapitalize: 'characters', 'aria-label': t('rsType', { w: word() }) }) : null;
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dialog' },
    h('h2', {}, all ? t('rsAll') : t('rsAsk', { g })), h('p', {}, all ? t('rsGoesAll') : t('rsGoes')),
    hasStand ? h('label', { class: 'field', style: { display: 'flex', gap: '10px', alignItems: 'center' } }, keep, h('span', {}, t('rsKeep'))) : null,
    all ? h('p', { class: 'muted small' }, t('rsType', { w: word() })) : null, inp,
    h('div', { class: 'row' },
      h('button', { class: 'btn small danger', id: 'rsyes', onclick: async () => {
        if (all && inp.value.trim().toUpperCase() !== word()) return;
        try { await snapshotNow('before-restore'); } catch { /* the copy is a bonus; never block */ }
        for (const id of ids) resetGame(id, { keepUnlocked: keep.checked });
        ov.remove(); toast(all ? t('rsDoneAll') : t('rsDone', { g })); rebuild?.();
      } }, t('rsYes')),
      h('button', { class: 'btn ghost small', onclick: () => ov.remove() }, t('rsCancel')))));
  document.body.append(ov);
}

export function resetNodes() {
  const list = h('div', { class: 'qlist' });
  const draw = () => list.replaceChildren(...GAMES.map((id) => h('div', { class: 'qrow card flat', 'data-game': id },
    h('div', { style: { display: 'flex', gap: '12px', alignItems: 'center' } }, h('span', { html: icon(id) }), h('div', {}, h('strong', {}, t('rs_' + id)), h('small', {}, summary(id)))),
    h('button', { class: 'btn ghost small', onclick: () => confirm([id], draw) }, t('rsStart')))));
  draw();
  return [
    h('p', { class: 'muted small' }, t('rsNote')), list,
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small danger', id: 'rsall', onclick: () => confirm(GAMES, draw) }, t('rsAll'))),
  ];
}
