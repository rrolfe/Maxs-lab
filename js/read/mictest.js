// "Test my microphone": a small box that shows whether this phone, iPad or computer can hear and understand a short sentence.
// Used from the Read It Loud menu and from the Grown-up corner. Nothing is recorded; the browser turns speech into text and this box shows that text.
// The strings that Read It Loud shares (what to do on THIS device, microphone problems in plain words) are registered here so every screen can use them.
// {the} / {The} / {dev} / {br} / {rec} / {co} in a string are filled in by t() with this device's words (js/core/device.js).
import { h, toast } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { sfx, stopSpeaking } from '../core/audio.js';
import { deviceInfo } from '../core/device.js';
import { match } from './match.js';
import { createListener, listenSupport, listenProblem } from './listen.js';

addStrings({
  en: {
    rdMicOn: 'The microphone is ready.', rdGrownOn: 'A grown-up is the listener.',
    // why this device cannot listen, and what to do (one per case in listenWhy())
    rdWhyHome: '{The} cannot listen when Max’s Lab is opened from its Home Screen icon. Open the link in Safari instead.',
    rdWhyInapp: 'This page is open inside another app, and that cannot listen. Open the link in {rec} (look for “Open in browser” in the ••• or share menu).',
    rdWhyIos: '{Br} on {the} cannot listen. Open the link in Safari to use the microphone.',
    rdWhyFirefox: 'Firefox cannot listen. Open the link in {rec} to use the microphone.',
    rdWhyOld: 'This version of Safari is too old to listen. Updating {the} may fix it.',
    rdWhyNone: 'This browser cannot listen. Open the link in {rec} to use the microphone.',
    rdWhyGrown: 'Until then, a grown-up can listen.',
    rdCopyLink: 'Copy the link', rdLinkCopied: 'Link copied! Paste it into {rec}.', rdLinkFail: 'Could not copy. The link is: {u}',
    // what went wrong while listening
    rdErrDenied: '{The} would not let me listen. A grown-up can allow the microphone for this page (tap the lock icon next to the address). Until then, a grown-up can listen instead.',
    rdErrDeniedIos: '{The} would not let me listen. A grown-up can turn on Siri and Dictation in Settings and allow the microphone in Safari. Until then, a grown-up can listen instead.',
    rdErrIosOther: '{Br} on {the} cannot listen. Open the link in Safari to use the microphone. Until then, a grown-up can listen instead.',
    rdErrMic: 'I cannot find a microphone on {the}. A grown-up can listen instead.',
    rdErrNet: 'Listening needs the internet. Check the connection and try again.',
    rdErrNetDesk: 'Listening needs the internet. Check the connection and try again. Some privacy browsers block it: try {rec}.',
    rdErrLang: '{The} cannot listen in English. A grown-up can listen instead.',
    rdErrUnstable: 'The microphone keeps stopping. A grown-up can listen instead.',
    rdErrSilent: 'I did not hear anything. Is the sound on? Tap the microphone and try again.',
    rdWaitHint: 'Still waiting for the microphone. If a question popped up, tap Allow. Tap the microphone again to cancel.',
    // the test box
    rdMtTitle: 'Test my microphone', rdMtSay: 'Tap the microphone, then read this out loud:', rdMtHeard: '{The} heard', rdMtListen: 'Listening… tap when you are done.',
    rdMtGood: 'It works! {The} understood the sentence.', rdMtSome: '{The} heard some of it. Try again, a little slower and clearer.',
    rdMtNone: '{The} did not catch any words. Check that the sound is on and try again.', rdMtNew: 'Another sentence', rdMtClose: 'Close', rdMtTap: 'Tap to start',
    rdMtTip: '{Br} sends the sound to {co} to turn it into words. Nothing is recorded or kept in Max’s Lab.',
    rdMtDevice: 'Detected: {dev} · {br}', rdMtTech: 'Technical note: {c}',
    // grown-up help (a list for each kind of device)
    rdHelpTitle: 'If the microphone does not work',
    rdHelpIos: [
      'Open the link in Safari. The Home Screen icon, Chrome, Firefox and pages inside other apps cannot listen. (If you see “Open as Web App” when adding the page to the Home Screen, turn it off.)',
      'In Settings, make sure Siri is on and Dictation is on (Settings → General → Keyboard).',
      'In Safari, tap the aA button (or the page icon in the address bar) → Website Settings → Microphone → Allow.',
      'The iPhone or iPad needs the internet: Safari sends the sound to Apple to turn it into words.',
    ],
    rdHelpAndroid: [
      'Open the link in Chrome (or Samsung Internet). Firefox and pages inside other apps cannot listen.',
      'Tap the lock or settings icon next to the address → Permissions → Microphone → Allow.',
      'The Google app must be installed and up to date, and the phone needs the internet.',
    ],
    rdHelpDesk: [
      'Open the link in Chrome, Edge or Safari. Firefox cannot listen.',
      'Click the lock or settings icon next to the address and allow the Microphone.',
      'Check that the right microphone is chosen in the computer’s sound settings, and that the computer is online: the browser sends the sound to Apple, Google or Microsoft to turn it into words.',
    ],
  },
  es: {
    rdMicOn: 'El micrófono está listo.', rdGrownOn: 'Un adulto es quien escucha.',
    rdWhyHome: '{The} no puede escuchar cuando el Laboratorio de Max se abre desde su icono de la pantalla de inicio. Abre el enlace en Safari.',
    rdWhyInapp: 'Esta página está abierta dentro de otra app, y eso no puede escuchar. Abre el enlace en {rec} (busca “Abrir en el navegador” en el menú ••• o en compartir).',
    rdWhyIos: '{Br} en {the} no puede escuchar. Abre el enlace en Safari para usar el micrófono.',
    rdWhyFirefox: 'Firefox no puede escuchar. Abre el enlace en {rec} para usar el micrófono.',
    rdWhyOld: 'Esta versión de Safari es muy vieja para escuchar. Actualizar {the} puede arreglarlo.',
    rdWhyNone: 'Este navegador no puede escuchar. Abre el enlace en {rec} para usar el micrófono.',
    rdWhyGrown: 'Mientras tanto, puede escuchar un adulto.',
    rdCopyLink: 'Copiar el enlace', rdLinkCopied: '¡Enlace copiado! Pégalo en {rec}.', rdLinkFail: 'No se pudo copiar. El enlace es: {u}',
    rdErrDenied: '{The} no me dejó escuchar. Un adulto puede permitir el micrófono para esta página (toca el candado junto a la dirección). Mientras tanto, puede escuchar un adulto.',
    rdErrDeniedIos: '{The} no me dejó escuchar. Un adulto puede activar Siri y el Dictado en Ajustes y permitir el micrófono en Safari. Mientras tanto, puede escuchar un adulto.',
    rdErrIosOther: '{Br} en {the} no puede escuchar. Abre el enlace en Safari para usar el micrófono. Mientras tanto, puede escuchar un adulto.',
    rdErrMic: 'No encuentro un micrófono en {the}. Puede escuchar un adulto.',
    rdErrNet: 'Escuchar necesita internet. Revisa la conexión e inténtalo otra vez.',
    rdErrNetDesk: 'Escuchar necesita internet. Revisa la conexión e inténtalo otra vez. Algunos navegadores con mucha privacidad lo bloquean: prueba con {rec}.',
    rdErrLang: '{The} no puede escuchar en inglés. Puede escuchar un adulto.',
    rdErrUnstable: 'El micrófono se sigue deteniendo. Puede escuchar un adulto.',
    rdErrSilent: 'No escuché nada. ¿Está el sonido encendido? Toca el micrófono e inténtalo otra vez.',
    rdWaitHint: 'Todavía espero al micrófono. Si apareció una pregunta, toca Permitir. Toca el micrófono otra vez para cancelar.',
    rdMtTitle: 'Probar mi micrófono', rdMtSay: 'Toca el micrófono y lee esto en voz alta:', rdMtHeard: '{The} escuchó', rdMtListen: 'Escuchando… toca cuando termines.',
    rdMtGood: '¡Funciona! {The} entendió la oración.', rdMtSome: '{The} escuchó una parte. Inténtalo otra vez, un poco más despacio y más claro.',
    rdMtNone: '{The} no captó palabras. Revisa que el sonido esté encendido e inténtalo otra vez.', rdMtNew: 'Otra oración', rdMtClose: 'Cerrar', rdMtTap: 'Toca para empezar',
    rdMtTip: '{Br} envía el sonido a {co} para convertirlo en palabras. En el Laboratorio de Max no se graba ni se guarda nada.',
    rdMtDevice: 'Detectado: {dev} · {br}', rdMtTech: 'Nota técnica: {c}',
    rdHelpTitle: 'Si el micrófono no funciona',
    rdHelpIos: [
      'Abre el enlace en Safari. El icono de la pantalla de inicio, Chrome, Firefox y las páginas dentro de otras apps no pueden escuchar. (Si al agregar la página a la pantalla de inicio aparece “Abrir como app web”, desactívalo.)',
      'En Ajustes, comprueba que Siri esté activado y que el Dictado esté activado (Ajustes → General → Teclado).',
      'En Safari, toca el botón aA (o el icono de la página en la barra de direcciones) → Ajustes del sitio web → Micrófono → Permitir.',
      'El iPhone o iPad necesita internet: Safari envía el sonido a Apple para convertirlo en palabras.',
    ],
    rdHelpAndroid: [
      'Abre el enlace en Chrome (o Samsung Internet). Firefox y las páginas dentro de otras apps no pueden escuchar.',
      'Toca el candado o el icono de ajustes junto a la dirección → Permisos → Micrófono → Permitir.',
      'La app de Google debe estar instalada y actualizada, y el teléfono necesita internet.',
    ],
    rdHelpDesk: [
      'Abre el enlace en Chrome, Edge o Safari. Firefox no puede escuchar.',
      'Haz clic en el candado o el icono de ajustes junto a la dirección y permite el Micrófono.',
      'Comprueba que esté elegido el micrófono correcto en los ajustes de sonido de la computadora y que haya internet: el navegador envía el sonido a Apple, Google o Microsoft para convertirlo en palabras.',
    ],
  },
});

const LINES = ['The cat sat on the red mat.', 'A baseball has red stitches.', 'The sun is a star.', 'Dogs love to run in the park.'];
export const WAIT_MS = 7000;                         // how long "getting ready" may last before the screen says what to tap

const WHY_KEYS = { homescreen: 'rdWhyHome', inapp: 'rdWhyInapp', iosbrowser: 'rdWhyIos', firefox: 'rdWhyFirefox', oldsafari: 'rdWhyOld', nobrowser: 'rdWhyNone' };

/** One sentence for the Read menu and the Grown-up corner: the microphone is ready, or why not and what to do on this device. */
export function listenNote() {
  const why = listenProblem();
  return why ? t(WHY_KEYS[why]) + ' ' + t('rdWhyGrown') : t('rdMicOn');
}

/** Plain words for an error code, with the right steps for this device (the screen shows them; a grown-up acts on them). */
export function errText(code) {
  const d = deviceInfo();
  if (code === 'denied') return t(d.ios ? (d.browser === 'safari' ? 'rdErrDeniedIos' : 'rdErrIosOther') : 'rdErrDenied');
  if (code === 'network') return t(d.computer ? 'rdErrNetDesk' : 'rdErrNet');
  return t({ nomic: 'rdErrMic', lang: 'rdErrLang', unstable: 'rdErrUnstable', silent: 'rdErrSilent' }[code] || 'rdErrDenied');
}

let lastError = '';                                  // the browser's own word for the last microphone problem (memory only, never saved)
export const noteError = (raw) => { lastError = String(raw || '').slice(0, 40); };
export const lastMicError = () => lastError;

const pageLink = () => location.href.split('#')[0];
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch { /* old browser or not allowed: try the old way */ }
  try {
    const ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-999px;top:0;opacity:0';
    document.body.append(ta); ta.select(); ta.setSelectionRange(0, txt.length);
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  } catch { return false; }
}
/** "Copy the link": paste it into Safari / Chrome, the browsers that can listen. */
export function copyLinkButton(cls = 'btn ghost small') {
  return h('button', { class: cls, onclick: async () => { const ok = await copyText(pageLink()); toast(ok ? t('rdLinkCopied') : t('rdLinkFail', { u: pageLink() }), ok ? 3200 : 9000); } }, t('rdCopyLink'));
}

/** A folded "If the microphone does not work" list with the steps for this kind of device (for the Grown-up corner). */
export function helpBlock() {
  const d = deviceInfo(), steps = t(d.ios ? 'rdHelpIos' : d.android ? 'rdHelpAndroid' : 'rdHelpDesk');
  return h('details', { class: 'mthelp' }, h('summary', {}, t('rdHelpTitle')), h('ol', {}, (Array.isArray(steps) ? steps : [steps]).map((s) => h('li', {}, s))));
}

export function openMicTest() {
  const sup = listenSupport();
  let l = null, idx = Math.floor(Math.random() * LINES.length), phase = 'ready', timer = 0, waitTimer = 0;
  const line = h('p', { class: 'mtline' });
  const heard = h('p', { class: 'heardline', hidden: true });
  const result = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const label = h('div', { class: 'miclabel' });
  const tech = h('p', { class: 'muted small', hidden: true, style: { margin: '8px 0 0' } });
  const mic = h('button', { class: 'micbtn', onclick: () => tap() }, h('span', { class: 'mi' }, h('span', { html: icons.mic(60) }), h('span', { class: 'sq' })));
  const more = h('button', { class: 'btn ghost small', onclick: () => { idx = (idx + 1) % LINES.length; reset(); } }, t('rdMtNew'));
  const close = () => { clearTimeout(timer); clearTimeout(waitTimer); l?.destroy(); ov.remove(); };
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('rdMtTitle') },
    h('div', { class: 'dialog center mtbox' }, h('h2', {}, t('rdMtTitle')),
      sup === 'ready'
        ? [h('p', {}, t('rdMtSay')), h('div', { class: 'card mtcard' }, line), h('div', { class: 'micbox' }, mic, label), heard, result, tech,
          h('div', { class: 'row', style: { justifyContent: 'center', gap: '12px' } }, more, h('button', { class: 'btn', onclick: close }, t('rdMtClose'))),
          h('p', { class: 'muted small', style: { margin: '14px 0 0' } }, t('rdMtTip')),
          h('p', { class: 'muted small', style: { margin: '4px 0 0' } }, t('rdMtDevice'))]
        : [h('p', { class: 'rdstat warn' }, h('span', { html: icons.bulb(26) }), h('span', {}, listenNote())),
          h('div', { class: 'row', style: { justifyContent: 'center', gap: '12px' } }, copyLinkButton('btn gold'), h('button', { class: 'btn', onclick: close }, t('rdMtClose'))),
          h('p', { class: 'muted small', style: { margin: '14px 0 0' } }, t('rdMtDevice'))]));

  function paint() {
    mic.classList.toggle('on', phase === 'listening'); mic.classList.toggle('wait', phase === 'starting');
    label.textContent = phase === 'listening' ? t('rdMtListen') : phase === 'starting' ? '…' : t('rdMtTap');
  }
  function clearResult() { result.replaceChildren(); result.className = 'feedback'; tech.hidden = true; }
  function reset() { clearTimeout(waitTimer); l?.abort(); phase = 'ready'; heard.hidden = true; clearResult(); line.textContent = LINES[idx]; paint(); }
  function say(ok, key, ico, text) { result.replaceChildren(h('span', { html: ico }), h('span', {}, text || t(key))); result.className = 'feedback ' + (ok ? 'good' : 'try'); }
  function tap() {
    if (phase === 'listening') { sfx.tap(); l?.stop(); return; }
    if (phase === 'starting') { sfx.tap(); reset(); return; }                // still waiting for the microphone: a second tap cancels, so he is never stuck
    sfx.tap(); stopSpeaking(); phase = 'starting'; heard.hidden = true; clearResult(); paint();
    waitTimer = setTimeout(() => { if (phase === 'starting') say(false, 'rdWaitHint', icons.bulb(34)); }, WAIT_MS);
    l = createListener({
      lang: 'en-US', maxMs: 14000, silentMs: 10000,
      onState: (s) => { if (s === 'listening' && phase === 'starting') { clearTimeout(waitTimer); phase = 'listening'; clearResult(); paint(); } },
      onText: (txt) => { heard.hidden = !txt; heard.textContent = txt ? t('rdMtHeard') + ': “' + txt + '”' : ''; },
      onPause: (txt) => match(LINES[idx], txt, 1).pass,
      onDone: (txt) => {
        clearTimeout(waitTimer); phase = 'ready'; paint();
        heard.hidden = !txt; heard.textContent = txt ? t('rdMtHeard') + ': “' + txt + '”' : '';
        const r = match(LINES[idx], txt, 1);
        if (r.pass) { sfx.correct(); say(true, 'rdMtGood', icons.check(34)); } else if (r.heard >= 2 && r.score >= 0.3) say(false, 'rdMtSome', icons.bulb(34)); else say(false, 'rdMtNone', icons.bulb(34));
      },
      onError: (code, raw) => {
        clearTimeout(waitTimer); phase = 'ready'; paint(); say(false, '', icons.bulb(34), errText(code));
        noteError(raw || code); tech.textContent = t('rdMtTech', { c: raw || code }); tech.hidden = false;   // the browser's own word for it, for a grown-up to read out
      },
    });
    if (!l.start()) { phase = 'ready'; paint(); say(false, '', icons.bulb(34), errText('denied')); }
  }
  if (sup === 'ready') reset();
  document.body.append(ov);
  return close;
}
