// Grown-up corner: progress, limits, map key, family notes, your own questions, backup. Everything stays on this device.
import { S, save, flush, minutesToday, TOPICS, levelOf, today, dateKey, exportData, importData, resetAll, listSnapshots, restoreSnapshot } from '../core/store.js';
import { h, toast, clamp } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { TOPIC_META } from '../quiz/missions.js';
import { speak, stopSpeaking, listVoices, pickVoice, voiceQuality, setVoice } from '../core/audio.js';

addStrings({
  en: {
    gTitle: 'Grown-up corner', gPrivacy: 'Everything here stays on this device. Nothing is sent anywhere.',
    gPin: 'Enter the grown-up passcode', gPinWrong: 'That passcode did not match.', gUnlock: 'Unlock', gEnter: 'Enter',
    gVoice: 'Reading voice', gVoiceNote: 'Pick the voice Max hears. The iPad can only use voices installed on it. For the most natural voice: Settings → Accessibility → Spoken Content → Voices, pick English (or Spanish), and download an Enhanced or Premium voice such as Ava or Samantha (Spanish: Paulina, or a Siri voice). Then come back here and choose it.', gVoiceNone: 'Best available (automatic)', gPreview: 'Hear it', gVoiceSample: 'Hi Max! Did you know a shark can lose thousands of teeth in its life, and they grow right back?', gVoiceCount: '{n} voices found on this device', gVoiceNoVoices: 'This device is not listing any voices yet. Try again in a moment.', gVoicePrem: 'Premium', gVoiceEnh: 'Enhanced', gVoiceSiri: 'Siri', gVoiceStd: 'Standard',
    gPinTip: '5-digit codes work great: pick any 4 to 6 digits you will remember. Max can’t see it, and you can change it any time.',
    gOverview: 'This week', gToday: 'Today', gMin: '{n} min', gAnswered: 'Questions answered', gAccuracy: 'Right answers', gSubjects: 'Subjects', gLevel: 'Level {n}', gNeeds: 'Most practice helps in: {s}', gNoData: 'No answers yet. Check back after a few missions!',
    gDifficulty: 'Question difficulty', gEasier: 'Easier', gJust: 'Just right', gHarder: 'Harder', gDiffNote: 'Shifts every subject by one level. The app also adjusts on its own to keep about 8 in 10 answers right.',
    gLimits: 'Time and comfort', gDaily: 'Daily play limit', gNone: 'No limit', gBed: 'Bedtime wind-down starts', gBig: 'Bigger text', gOn: 'On', gOff: 'Off',
    gMap: 'Map and places', gKey: 'Esri API key (optional)', gKeyNote: 'The map shows satellite pictures from free sources by default. For sharper pictures, make a free key at developers.arcgis.com, restrict it to this website’s address, switch off pay-as-you-go, then paste it here. Google Maps cannot be used on a children’s site under Google’s terms.',
    gHome: 'Home location (for “miles from home”)', gLat: 'Latitude', gLon: 'Longitude', gUseLoc: 'Use this device’s location', gClearLoc: 'Clear', gLocSaved: 'Saved on this device only.', gLocFail: 'Could not get the location. You can type it instead.',
    gFamily: 'Family notes', gFamNote: 'Add a short note to each family place. It shows on Max’s place card and is stored only on this device.', gImport: 'Load notes from a file', gNotesLoaded: 'Notes loaded.',
    gQs: 'Your own questions', gQsNote: 'These mix into Max’s missions now and then. Add one right answer and up to three wrong ones.', gQ: 'Question', gRight: 'Right answer', gW1: 'Wrong answer', gW2: 'Another wrong answer (optional)', gW3: 'One more (optional)', gWhy: 'Why it is right (optional)', gAdd: 'Add question', gDelete: 'Delete', gQNeed: 'Add a question, a right answer and one wrong answer.', gQAdded: 'Added!',
    gBackup: 'Backup and reset', gSnap: 'Automatic safety copies', gSnapNote: 'The lab keeps a copy of Max’s progress at his first visit each day and before any update that changes how progress is saved. If anything ever looks wrong after an update, restore a copy here. Copies stay on this iPad.', gSnapNone: 'No copies yet. The first one is made the next time the lab opens.', gSnapRestore: 'Restore', gSnapAsk: 'Restore this copy? Max’s current progress is saved as a copy first, so you can switch back.', gSnapDone: 'Copy restored.', gSnapLine: '{p} pearls earned · {s} stamps · {n} days played', gSnapDaily: 'Daily copy', gSnapUpdate: 'Before an update', gSnapBefore: 'Before a restore', gBackupNote: 'Save a copy so progress is safe if the browser is cleared or you switch iPads.', gExport: 'Save a backup file', gImportB: 'Restore from a backup file', gLast: 'Last backup: {d}', gNever: 'never', gImported: 'Backup restored.', gImportBad: 'That file did not work.', gMerge: 'Combine with current progress', gReplace: 'Replace current progress',
    gReset: 'Erase all progress', gResetAsk: 'This erases pearls, stamps, levels and settings on this device. Type ERASE to confirm.', gErased: 'Everything was erased.',
    gChoreCode: 'Chore code (grown-ups type this to approve chores)', gChoreSet: 'Save chore code', gChoreSaved: 'Chore code saved.', gSecurity: 'PIN and about', gSetPin: 'Set a passcode', gChangePin: 'Change passcode', gRemovePin: 'Remove passcode', gPinNew: 'New passcode (4 to 6 digits)', gPinSet: 'Passcode saved.', gPinRemoved: 'Passcode removed.', gPinNote: 'Optional. Without a PIN, pressing and holding the gear for 3 seconds is the only gate.',
    gCredits: 'Photo and map credits', gVersion: 'Max’s Lab · version 1.0',
  },
  es: {
    gTitle: 'Rincón de adultos', gPrivacy: 'Todo lo que ves aquí se queda en este dispositivo. No se envía a ningún lado.',
    gPin: 'Escribe el código de adulto', gPinWrong: 'Ese código no coincide.', gUnlock: 'Abrir', gEnter: 'Entrar',
    gVoice: 'Voz de lectura', gVoiceNote: 'Elige la voz que escucha Max. El iPad solo puede usar las voces instaladas en él. Para la voz más natural: Ajustes → Accesibilidad → Contenido leído → Voces, elige Español (o Inglés) y descarga una voz Mejorada o Premium, como Paulina o una voz de Siri (en inglés: Ava o Samantha). Luego vuelve aquí y elígela.', gVoiceNone: 'La mejor disponible (automática)', gPreview: 'Escúchala', gVoiceSample: '¡Hola Max! ¿Sabías que un tiburón puede perder miles de dientes en su vida y le vuelven a crecer?', gVoiceCount: '{n} voces encontradas en este dispositivo', gVoiceNoVoices: 'Este dispositivo todavía no muestra voces. Inténtalo de nuevo en un momento.', gVoicePrem: 'Premium', gVoiceEnh: 'Mejorada', gVoiceSiri: 'Siri', gVoiceStd: 'Estándar',
    gPinTip: 'Un código de 5 dígitos funciona muy bien: elige de 4 a 6 dígitos que recuerdes. Max no lo ve y puedes cambiarlo cuando quieras.',
    gOverview: 'Esta semana', gToday: 'Hoy', gMin: '{n} min', gAnswered: 'Preguntas respondidas', gAccuracy: 'Respuestas correctas', gSubjects: 'Materias', gLevel: 'Nivel {n}', gNeeds: 'Más práctica ayudaría en: {s}', gNoData: 'Todavía no hay respuestas. ¡Vuelve después de algunas misiones!',
    gDifficulty: 'Dificultad de las preguntas', gEasier: 'Más fácil', gJust: 'Justo', gHarder: 'Más difícil', gDiffNote: 'Cambia todas las materias un nivel. La app también se ajusta sola para que unas 8 de cada 10 respuestas sean correctas.',
    gLimits: 'Tiempo y comodidad', gDaily: 'Límite diario de juego', gNone: 'Sin límite', gBed: 'La calma de la hora de dormir empieza', gBig: 'Texto más grande', gOn: 'Sí', gOff: 'No',
    gMap: 'Mapa y lugares', gKey: 'Clave de API de Esri (opcional)', gKeyNote: 'El mapa muestra imágenes de satélite de fuentes gratuitas. Para imágenes más nítidas, crea una clave gratis en developers.arcgis.com, restríngela a la dirección de este sitio, desactiva el pago por uso y pégala aquí. Google Maps no se puede usar en un sitio para niños según sus términos.',
    gHome: 'Ubicación de casa (para “millas desde casa”)', gLat: 'Latitud', gLon: 'Longitud', gUseLoc: 'Usar la ubicación del dispositivo', gClearLoc: 'Borrar', gLocSaved: 'Guardada solo en este dispositivo.', gLocFail: 'No se pudo obtener la ubicación. Puedes escribirla.',
    gFamily: 'Notas de la familia', gFamNote: 'Agrega una nota corta a cada lugar de la familia. Se muestra en la tarjeta del lugar y solo se guarda en este dispositivo.', gImport: 'Cargar notas de un archivo', gNotesLoaded: 'Notas cargadas.',
    gQs: 'Tus propias preguntas', gQsNote: 'Se mezclan de vez en cuando en las misiones de Max. Agrega una respuesta correcta y hasta tres incorrectas.', gQ: 'Pregunta', gRight: 'Respuesta correcta', gW1: 'Respuesta incorrecta', gW2: 'Otra incorrecta (opcional)', gW3: 'Una más (opcional)', gWhy: 'Por qué es correcta (opcional)', gAdd: 'Agregar pregunta', gDelete: 'Borrar', gQNeed: 'Agrega una pregunta, una respuesta correcta y una incorrecta.', gQAdded: '¡Agregada!',
    gBackup: 'Copia de seguridad y borrado', gSnap: 'Copias de seguridad automáticas', gSnapNote: 'El laboratorio guarda una copia del progreso de Max en su primera visita de cada día y antes de cualquier actualización que cambie cómo se guarda el progreso. Si algo se ve mal después de una actualización, restaura una copia aquí. Las copias se quedan en este iPad.', gSnapNone: 'Todavía no hay copias. La primera se hace la próxima vez que se abra el laboratorio.', gSnapRestore: 'Restaurar', gSnapAsk: '¿Restaurar esta copia? Primero se guarda el progreso actual de Max como una copia, para que puedas volver.', gSnapDone: 'Copia restaurada.', gSnapLine: '{p} perlas ganadas · {s} sellos · {n} días jugados', gSnapDaily: 'Copia diaria', gSnapUpdate: 'Antes de una actualización', gSnapBefore: 'Antes de restaurar', gBackupNote: 'Guarda una copia para no perder el progreso si se borra el navegador o cambias de iPad.', gExport: 'Guardar archivo de respaldo', gImportB: 'Restaurar desde un archivo', gLast: 'Última copia: {d}', gNever: 'nunca', gImported: 'Copia restaurada.', gImportBad: 'Ese archivo no funcionó.', gMerge: 'Combinar con el progreso actual', gReplace: 'Reemplazar el progreso actual',
    gReset: 'Borrar todo el progreso', gResetAsk: 'Esto borra perlas, sellos, niveles y ajustes en este dispositivo. Escribe BORRAR para confirmar.', gErased: 'Se borró todo.',
    gChoreCode: 'Código de quehaceres (los adultos lo escriben para aprobar)', gChoreSet: 'Guardar código', gChoreSaved: 'Código guardado.', gSecurity: 'PIN e información', gSetPin: 'Crear un código', gChangePin: 'Cambiar código', gRemovePin: 'Quitar código', gPinNew: 'Nuevo código (4 a 6 dígitos)', gPinSet: 'Código guardado.', gPinRemoved: 'Código eliminado.', gPinNote: 'Opcional. Sin PIN, mantener presionado el engranaje 3 segundos es la única puerta.',
    gCredits: 'Créditos de fotos y mapas', gVersion: 'El Laboratorio de Max · versión 1.0',
  },
});

let unlocked = false;
async function sha(text) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join(''); }
  catch { let x = 2166136261; for (const c of text) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return 'f' + (x >>> 0).toString(16); }
}
async function pinOk(pin) { return (await sha((S.settings.pinSalt || '') + pin)) === S.settings.pinHash; }

/** Resolves true when the grown-up passes the PIN check (or when no PIN is set). */
export function askGate(title) {
  if (!S.settings.pinHash) return Promise.resolve(false);   // no passcode yet: nobody can skip the limit
  return new Promise((resolve) => {
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', style: { zIndex: 120 } });
    ov.append(pad(title || t('gPin'), (ok) => { ov.remove(); resolve(ok); }, () => { ov.remove(); resolve(false); }));
    document.body.append(ov);
  });
}
export const CHORE_CODE_DEFAULT = '1234';   // Rob asked for an easy chore code; changeable in the Grown-up corner
const choreOk = async (v) => v === (S.settings.choreCode || CHORE_CODE_DEFAULT) || (!!S.settings.pinHash && (await pinOk(v)));
/** The chore check: a grown-up types the chore code (or their passcode). Resolves true / false. */
export function askChoreCode(title) {
  return new Promise((resolve) => {
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', style: { zIndex: 120 } });
    ov.append(pad(title, (ok) => { ov.remove(); resolve(ok); }, () => { ov.remove(); resolve(false); }, choreOk));
    document.body.append(ov);
  });
}
/** PIN pad: 4 to 6 digits, press the check key to enter. */
function pad(title, done, cancel, check = pinOk) {
  let val = ''; const dots = h('div', { class: 'pdots', 'aria-hidden': 'true' }), msg = h('p', { class: 'qmsg', role: 'status' });
  const draw = () => dots.replaceChildren(...Array.from({ length: Math.max(4, val.length) }, (_, i) => h('i', { class: i < val.length ? 'on' : '' })));
  const submit = async () => {
    if (val.length < 4) return;
    if (await check(val)) done(true); else { msg.textContent = t('gPinWrong'); val = ''; draw(); }
  };
  const press = (d) => { if (val.length >= 6) return; val += d; draw(); msg.textContent = ''; };
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'].map((k) => h('button', { class: 'key' + (k === '✓' ? ' go' : ''), 'aria-label': k === '✓' ? t('gEnter') : k === '⌫' ? 'Delete' : k, onclick: () => { if (k === '⌫') { val = val.slice(0, -1); draw(); } else if (k === '✓') submit(); else press(k); } }, k));
  draw();
  return h('div', { class: 'dialog center pinpad' }, h('h2', {}, title), dots, msg, h('div', { class: 'keys' }, keys), cancel ? h('button', { class: 'btn ghost small', onclick: cancel }, t('cancel')) : null);
}

export async function mount(el) {
  const root = h('div', { class: 'grownup' }); el.append(root);
  if (S.settings.pinHash && !unlocked) {
    root.append(h('div', { class: 'screen-head' }, h('h1', {}, t('gTitle'))), pad(t('gPin'), () => { unlocked = true; root.replaceChildren(); build(root); }, () => go('/home')));
    return () => {};
  }
  build(root);
  return () => {};
}

const fmt = (n) => Number(n || 0).toLocaleString();
function section(title, ...kids) { return h('details', { class: 'gsec card' }, h('summary', {}, title), h('div', { class: 'gbody' }, kids)); }
const field = (label, input) => h('label', { class: 'field' }, h('span', {}, label), input);
const textin = (attrs) => h('input', { class: 'textin', ...attrs });

async function build(root) {
  const places = (await import('../../data/places.js')).default;
  const wk = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = dateKey(d); const v = S.days[k] || { sec: 0, q: 0, ok: 0, pearls: 0 }; return { k, d, ...v }; });
  const totalQ = wk.reduce((a, d) => a + (d.q || 0), 0), totalOk = wk.reduce((a, d) => a + (d.ok || 0), 0);
  const maxQ = Math.max(1, ...wk.map((d) => d.q || 0));
  const todayD = S.days[today()] || { sec: 0 };
  const byTopic = {}; for (const e of S.log.slice(-300)) { const b = (byTopic[e.topic] ||= { n: 0, ok: 0 }); b.n++; if (e.ok) b.ok++; }
  const weak = Object.entries(byTopic).filter(([, v]) => v.n >= 8).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 2).map(([k]) => t(TOPIC_META[k]?.key || k));

  // ----- overview
  const overview = section(t('gOverview'),
    h('div', { class: 'gstats' },
      h('div', {}, h('small', {}, t('gToday')), h('b', {}, t('gMin', { n: Math.floor((todayD.sec || 0) / 60) }))),
      h('div', {}, h('small', {}, t('gAnswered')), h('b', {}, fmt(totalQ))),
      h('div', {}, h('small', {}, t('gAccuracy')), h('b', {}, totalQ ? Math.round((100 * totalOk) / totalQ) + '%' : '–'))),
    h('div', { class: 'wkbars', role: 'img', 'aria-label': t('gOverview') }, wk.map((d) => h('div', { class: 'wb' }, h('i', { style: { height: Math.max(4, Math.round(((d.q || 0) / maxQ) * 80)) + 'px' } }), h('small', {}, d.d.toLocaleDateString(S.lang === 'es' ? 'es-US' : 'en-US', { weekday: 'narrow' }))))),
    totalQ ? null : h('p', { class: 'muted' }, t('gNoData')),
    h('h3', {}, t('gSubjects')), h('div', { class: 'gsub' }, TOPICS.map((tp) => { const lv = levelOf(tp), b = byTopic[tp]; return h('div', { class: 'card flat' }, h('strong', {}, t(TOPIC_META[tp].key)), h('div', { class: 'lvbar' }, [1, 2, 3, 4, 5, 6].map((i) => h('i', { class: i <= lv ? 'on' : '' }))), h('small', {}, t('gLevel', { n: lv }) + (b ? ' · ' + Math.round((100 * b.ok) / b.n) + '%' : ''))); })),
    weak.length ? h('p', {}, t('gNeeds', { s: weak.join(', ') })) : null,
    h('h3', {}, t('gDifficulty')), h('div', { class: 'seg2' }, [[-1, 'gEasier'], [0, 'gJust'], [1, 'gHarder']].map(([v, k]) => h('button', { 'aria-pressed': String((S.settings.offset || 0) === v), onclick: (e) => { S.settings.offset = v; save(); e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }, t(k)))),
    h('p', { class: 'muted small' }, t('gDiffNote')));
  overview.open = true;

  // ----- limits
  const limSel = h('select', { class: 'textin', onchange: (e) => { S.settings.dailyLimit = +e.target.value; save(); } }, [[0, t('gNone')], [15, '15 min'], [20, '20 min'], [30, '30 min'], [45, '45 min'], [60, '60 min']].map(([v, l]) => h('option', { value: v, selected: (S.settings.dailyLimit || 0) === v }, l)));
  const bed = textin({ type: 'time', value: S.settings.bedtime || '19:30', onchange: (e) => { S.settings.bedtime = e.target.value; save(); } });
  const big = h('div', { class: 'seg2' }, [[false, 'gOff'], [true, 'gOn']].map(([v, k]) => h('button', { 'aria-pressed': String(!!S.bigText === v), onclick: (e) => { S.bigText = v; save(); document.documentElement.dataset.big = v ? '1' : '0'; e.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }, t(k))));
  const limits = section(t('gLimits'), field(t('gDaily'), limSel), field(t('gBed'), bed), field(t('gBig'), big));

  // ----- voice
  const voiceSel = h('select', { class: 'textin', 'aria-label': t('gVoice'), onchange: (e) => { setVoice(S.lang, e.target.value); } });
  const voiceInfo = h('small', { class: 'muted' });
  const fillVoices = () => {
    const list = listVoices(S.lang), cur = S.settings.voice?.[S.lang] || '', best = pickVoice(S.lang);
    const q = { premium: t('gVoicePrem'), enhanced: t('gVoiceEnh'), siri: t('gVoiceSiri'), standard: t('gVoiceStd') };
    voiceSel.replaceChildren(h('option', { value: '', selected: !cur }, t('gVoiceNone') + (best && !cur ? ' → ' + best.name : '')),
      ...list.map((v) => h('option', { value: v.name, selected: v.name === cur }, `${v.name} · ${q[voiceQuality(v)]}`)));
    voiceInfo.textContent = list.length ? t('gVoiceCount', { n: list.length }) : t('gVoiceNoVoices');
  };
  fillVoices(); [600, 1800, 4000].forEach((ms) => setTimeout(fillVoices, ms));
  try { speechSynthesis.addEventListener('voiceschanged', fillVoices); } catch { /* unsupported */ }
  const voiceSec = section(t('gVoice'), h('p', { class: 'muted small' }, t('gVoiceNote')), field(t('gVoice'), voiceSel), voiceInfo,
    h('div', { class: 'row' }, h('button', { class: 'btn gold small', onclick: () => speak(t('gVoiceSample')) }, h('span', { html: icons.speaker(28) }), t('gPreview')), h('button', { class: 'btn ghost small', onclick: () => stopSpeaking() }, t('close'))));

  // ----- map
  const key = textin({ type: 'text', value: S.settings.mapKey || '', placeholder: 'AAPK…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', onchange: (e) => { S.settings.mapKey = e.target.value.trim(); save(); toast(t('gLocSaved')); } });
  const home = S.settings.home || {};
  const lat = textin({ type: 'text', inputmode: 'decimal', value: home.lat ?? '' }), lon = textin({ type: 'text', inputmode: 'decimal', value: home.lon ?? '' });
  const saveHome = () => { const a = parseFloat(lat.value), b = parseFloat(lon.value); S.settings.home = Number.isFinite(a) && Number.isFinite(b) ? { lat: clamp(a, -90, 90), lon: clamp(b, -180, 180) } : null; save(); toast(t('gLocSaved')); };
  lat.onchange = saveHome; lon.onchange = saveHome;
  const useLoc = h('button', { class: 'btn ghost small', onclick: () => navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => { lat.value = p.coords.latitude.toFixed(2); lon.value = p.coords.longitude.toFixed(2); saveHome(); }, () => toast(t('gLocFail')), { timeout: 8000 }) : toast(t('gLocFail')) }, t('gUseLoc'));
  const clearLoc = h('button', { class: 'btn ghost small', onclick: () => { lat.value = ''; lon.value = ''; saveHome(); } }, t('gClearLoc'));
  const mapSec = section(t('gMap'), field(t('gKey'), key), h('p', { class: 'muted small' }, t('gKeyNote')), h('h3', {}, t('gHome')), h('div', { class: 'row' }, field(t('gLat'), lat), field(t('gLon'), lon)), h('div', { class: 'row' }, useLoc, clearLoc));

  // ----- family notes
  const fam = places.filter((p) => p.fam);
  const noteGet = (id) => { const n = S.settings.familyNotes[id]; return typeof n === 'object' && n ? n[S.lang] || n.en || '' : n || ''; };
  const noteSet = (id, v) => { const n = S.settings.familyNotes[id]; const o = typeof n === 'object' && n ? n : n ? { en: n, es: n } : {}; o[S.lang] = v; S.settings.familyNotes[id] = o; save(); };
  const file = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => {
    try {
      const obj = JSON.parse(await e.target.files[0].text());
      for (const [id, v] of Object.entries(obj)) { const o = typeof v === 'string' ? { en: v, es: v } : v.hook ? { en: v.hook.en, es: v.hook.es } : v; S.settings.familyNotes[id] = o; }
      save(); toast(t('gNotesLoaded')); root.replaceChildren(); build(root);
    } catch { toast(t('gImportBad')); }
  } });
  const famSec = section(t('gFamily'), h('p', { class: 'muted small' }, t('gFamNote')),
    fam.map((p) => field(L(p.name), textin({ type: 'text', value: noteGet(p.id), maxlength: 140, oninput: (e) => noteSet(p.id, e.target.value) }))),
    h('button', { class: 'btn ghost small', onclick: () => file.click() }, t('gImport')), file);

  // ----- own questions
  const qlist = h('div', { class: 'qlist' });
  const drawQs = () => qlist.replaceChildren(...(S.settings.customQs || []).map((c, i) => h('div', { class: 'card flat qrow' }, h('div', {}, h('strong', {}, c.q), h('small', { class: 'muted' }, '✓ ' + c.right)), h('button', { class: 'btn ghost small', onclick: () => { S.settings.customQs.splice(i, 1); save(); drawQs(); } }, t('gDelete')))));
  const f = { q: textin({ type: 'text', maxlength: 160 }), right: textin({ type: 'text', maxlength: 60 }), w1: textin({ type: 'text', maxlength: 60 }), w2: textin({ type: 'text', maxlength: 60 }), w3: textin({ type: 'text', maxlength: 60 }), why: textin({ type: 'text', maxlength: 140 }) };
  const addQ = () => {
    if (!f.q.value.trim() || !f.right.value.trim() || !f.w1.value.trim()) { toast(t('gQNeed')); return; }
    if ((S.settings.customQs || []).length >= 60) return;
    (S.settings.customQs ||= []).push(Object.fromEntries(Object.entries(f).map(([k, el]) => [k, el.value.trim()])));
    Object.values(f).forEach((el) => { el.value = ''; }); save(); drawQs(); toast(t('gQAdded'));
  };
  drawQs();
  const qSec = section(t('gQs'), h('p', { class: 'muted small' }, t('gQsNote')), qlist, field(t('gQ'), f.q), field(t('gRight'), f.right), field(t('gW1'), f.w1), field(t('gW2'), f.w2), field(t('gW3'), f.w3), field(t('gWhy'), f.why), h('button', { class: 'btn gold small', onclick: addQ }, t('gAdd')));

  // ----- backup
  const last = S.settings.lastBackup ? new Date(S.settings.lastBackup).toLocaleDateString() : t('gNever');
  const lastEl = h('p', { class: 'muted small' }, t('gLast', { d: last }));
  let mode = 'merge';
  const bfile = h('input', { type: 'file', accept: 'application/json,.json', hidden: true, onchange: async (e) => { try { importData(await e.target.files[0].text(), mode); toast(t('gImported')); root.replaceChildren(); build(root); } catch (err) { toast(t('gImportBad')); } } });
  const exp = () => {
    const blob = new Blob([exportData()], { type: 'application/json' }), a = h('a', { href: URL.createObjectURL(blob), download: 'maxs-lab-backup-' + today() + '.json' });
    document.body.append(a); a.click(); a.remove(); S.settings.lastBackup = Date.now(); save(); lastEl.textContent = t('gLast', { d: new Date().toLocaleDateString() });
  };
  const reset = () => {
    const inp = textin({ type: 'text', autocomplete: 'off', autocapitalize: 'characters' });
    const word = S.lang === 'es' ? 'BORRAR' : 'ERASE';
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dialog' }, h('h2', {}, t('gReset')), h('p', {}, t('gResetAsk')), inp,
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => { if (inp.value.trim().toUpperCase() !== word) return; resetAll(); ov.remove(); toast(t('gErased')); unlocked = false; go('/home'); } }, t('gReset')), h('button', { class: 'btn ghost small', onclick: () => ov.remove() }, t('cancel')))));
    document.body.append(ov); inp.focus();
  };
  const bSec = section(t('gBackup'), h('p', { class: 'muted small' }, t('gBackupNote')), h('div', { class: 'row' }, h('button', { class: 'btn gold small', onclick: exp }, t('gExport')),
    h('button', { class: 'btn ghost small', onclick: () => { mode = 'merge'; bfile.click(); } }, t('gImportB') + ' · ' + t('gMerge')), h('button', { class: 'btn ghost small', onclick: () => { mode = 'replace'; bfile.click(); } }, t('gReplace'))), bfile, lastEl,
    h('div', { class: 'row' }, h('button', { class: 'btn ghost small danger', onclick: reset }, t('gReset'))));


  // ----- automatic safety copies
  const snapList = h('div', { class: 'qlist' });
  const whyKey = { daily: 'gSnapDaily', update: 'gSnapUpdate', 'before-restore': 'gSnapBefore' };
  const askRestore = (e) => {
    const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' }, h('div', { class: 'dialog' }, h('h2', {}, t('gSnapRestore')), h('p', {}, t('gSnapAsk')),
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: async () => { try { await restoreSnapshot(e.t); ov.remove(); toast(t('gSnapDone')); root.replaceChildren(); build(root); } catch (err) { ov.remove(); toast(t('gImportBad')); } } }, t('gSnapRestore')), h('button', { class: 'btn ghost small', onclick: () => ov.remove() }, t('cancel')))));
    document.body.append(ov);
  };
  const drawSnaps = async () => {
    const idx = await listSnapshots().catch(() => []);
    snapList.replaceChildren(...(idx.length ? idx.map((e) => h('div', { class: 'qrow card flat' },
      h('div', {}, h('strong', {}, new Date(e.t).toLocaleString(S.lang === 'es' ? 'es-US' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + ' · ' + t(whyKey[e.why] || 'gSnapDaily')),
        h('small', {}, t('gSnapLine', { p: e.d.earned.toLocaleString(), s: e.d.stamps, n: e.d.days }))),
      h('button', { class: 'btn ghost small', onclick: () => askRestore(e) }, t('gSnapRestore')))) : [h('p', { class: 'muted small' }, t('gSnapNone'))]));
  };
  drawSnaps();
  const snapSec = section(t('gSnap'), h('p', { class: 'muted small' }, t('gSnapNote')), snapList);

  // ----- pin + about
  const pinIn = textin({ type: 'password', inputmode: 'numeric', maxlength: 6, pattern: '[0-9]*', placeholder: '•••••', autocomplete: 'off' });
  const setPin = async () => {
    if (!/^\d{4,6}$/.test(pinIn.value)) { toast(t('gPinNew')); return; }
    const salt = Math.random().toString(36).slice(2); S.settings.pinSalt = salt; S.settings.pinHash = await sha(salt + pinIn.value); save(); pinIn.value = ''; toast(t('gPinSet')); unlocked = true;
  };
  const choreIn = textin({ type: 'text', inputmode: 'numeric', maxlength: 6, pattern: '[0-9]*', placeholder: S.settings.choreCode || CHORE_CODE_DEFAULT, autocomplete: 'off' });
  const setChore = () => { if (!/^\d{4,6}$/.test(choreIn.value)) { toast(t('gPinNew')); return; } S.settings.choreCode = choreIn.value; save(); choreIn.value = ''; toast(t('gChoreSaved')); };
  const sec = section(t('gSecurity'), field(t('gChoreCode'), choreIn), h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: setChore }, t('gChoreSet'))), h('p', { class: 'muted small' }, t('gPinNote')), h('p', { class: 'chip on' }, t('gPinTip')), field(t('gPinNew'), pinIn), h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: setPin }, S.settings.pinHash ? t('gChangePin') : t('gSetPin')),
    S.settings.pinHash ? h('button', { class: 'btn ghost small', onclick: () => { S.settings.pinHash = null; S.settings.pinSalt = null; save(); toast(t('gPinRemoved')); } }, t('gRemovePin')) : null),
    h('p', {}, h('a', { href: '#/credits' }, t('gCredits'))), h('small', { class: 'muted' }, t('gVersion')));

  root.replaceChildren(h('div', { class: 'screen-head' }, h('h1', {}, t('gTitle')), h('button', { class: 'btn ghost small', onclick: () => { unlocked = false; go('/home'); } }, t('done'))), h('p', { class: 'muted' }, t('gPrivacy')), overview, limits, voiceSec, mapSec, famSec, qSec, bSec, snapSec, sec);
}
