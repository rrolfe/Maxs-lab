// "Test my microphone": a small box that shows whether the iPad can hear and understand a short sentence.
// Used from the Read It Loud menu and from the Grown-up corner. Nothing is recorded; the iPad turns speech into text and this box shows that text.
// The strings that Read It Loud shares (microphone problems in plain words) are registered here so both screens can use them.
import { h } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { sfx, stopSpeaking } from '../core/audio.js';
import { match } from './match.js';
import { createListener, listenSupport } from './listen.js';

addStrings({
  en: {
    rdMicOn: 'The microphone is ready.', rdGrownOn: 'A grown-up is the listener.',
    rdMicHome: 'The iPad cannot listen when Max’s Lab is opened from the Home Screen icon. Open it in Safari to use the microphone, or let a grown-up listen.',
    rdMicNone: 'This browser cannot listen, so a grown-up listens instead.',
    rdErrDenied: 'The iPad would not let me listen. A grown-up can check that Siri and the microphone are turned on. Until then, a grown-up can listen instead.',
    rdErrMic: 'I cannot find a microphone. A grown-up can listen instead.',
    rdErrNet: 'The iPad needs the internet to listen. Try again when it is online.',
    rdErrLang: 'This iPad cannot listen in English. A grown-up can listen instead.',
    rdErrUnstable: 'The microphone keeps stopping. A grown-up can listen instead.',
    rdErrSilent: 'I did not hear anything. Is the sound on? Tap the microphone and try again.',
    rdMtTitle: 'Test my microphone', rdMtSay: 'Tap the microphone, then read this out loud:', rdMtHeard: 'The iPad heard', rdMtListen: 'Listening… tap when you are done.',
    rdMtGood: 'It works! The iPad understood the sentence.', rdMtSome: 'The iPad heard some of it. Try again, a little slower and clearer.',
    rdMtNone: 'The iPad did not catch any words. Check that the sound is on and try again.', rdMtNew: 'Another sentence', rdMtClose: 'Close', rdMtTap: 'Tap to start',
    rdMtTip: 'Safari sends the sound to Apple to turn it into words. Nothing is recorded or kept in Max’s Lab.',
  },
  es: {
    rdMicOn: 'El micrófono está listo.', rdGrownOn: 'Un adulto es quien escucha.',
    rdMicHome: 'El iPad no puede escuchar cuando el Laboratorio de Max se abre desde el icono de la pantalla de inicio. Ábrelo en Safari para usar el micrófono, o deja que un adulto escuche.',
    rdMicNone: 'Este navegador no puede escuchar, así que escucha un adulto.',
    rdErrDenied: 'El iPad no me dejó escuchar. Un adulto puede revisar que Siri y el micrófono estén activados. Mientras tanto, puede escuchar un adulto.',
    rdErrMic: 'No encuentro un micrófono. Puede escuchar un adulto.',
    rdErrNet: 'El iPad necesita internet para escuchar. Inténtalo cuando tenga conexión.',
    rdErrLang: 'Este iPad no puede escuchar en inglés. Puede escuchar un adulto.',
    rdErrUnstable: 'El micrófono se sigue deteniendo. Puede escuchar un adulto.',
    rdErrSilent: 'No escuché nada. ¿Está el sonido encendido? Toca el micrófono e inténtalo otra vez.',
    rdMtTitle: 'Probar mi micrófono', rdMtSay: 'Toca el micrófono y lee esto en voz alta:', rdMtHeard: 'El iPad escuchó', rdMtListen: 'Escuchando… toca cuando termines.',
    rdMtGood: '¡Funciona! El iPad entendió la oración.', rdMtSome: 'El iPad escuchó una parte. Inténtalo otra vez, un poco más despacio y más claro.',
    rdMtNone: 'El iPad no captó palabras. Revisa que el sonido esté encendido e inténtalo otra vez.', rdMtNew: 'Otra oración', rdMtClose: 'Cerrar', rdMtTap: 'Toca para empezar',
    rdMtTip: 'Safari envía el sonido a Apple para convertirlo en palabras. En el Laboratorio de Max no se graba ni se guarda nada.',
  },
});

const LINES = ['The cat sat on the red mat.', 'A baseball has red stitches.', 'The sun is a star.', 'Dogs love to run in the park.'];

export function openMicTest() {
  const sup = listenSupport();
  let l = null, idx = Math.floor(Math.random() * LINES.length), phase = 'ready', timer = 0;
  const line = h('p', { class: 'mtline' });
  const heard = h('p', { class: 'heardline', hidden: true });
  const result = h('div', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
  const label = h('div', { class: 'miclabel' });
  const mic = h('button', { class: 'micbtn', onclick: () => tap() }, h('span', { class: 'mi' }, h('span', { html: icons.mic(60) }), h('span', { class: 'sq' })));
  const more = h('button', { class: 'btn ghost small', onclick: () => { idx = (idx + 1) % LINES.length; reset(); } }, t('rdMtNew'));
  const close = () => { clearTimeout(timer); l?.destroy(); ov.remove(); };
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('rdMtTitle') },
    h('div', { class: 'dialog center mtbox' }, h('h2', {}, t('rdMtTitle')),
      sup === 'ready'
        ? [h('p', {}, t('rdMtSay')), h('div', { class: 'card mtcard' }, line), h('div', { class: 'micbox' }, mic, label), heard, result,
          h('div', { class: 'row', style: { justifyContent: 'center', gap: '12px' } }, more, h('button', { class: 'btn', onclick: close }, t('rdMtClose'))),
          h('p', { class: 'muted small', style: { margin: '14px 0 0' } }, t('rdMtTip'))]
        : [h('p', { class: 'rdstat warn' }, h('span', { html: icons.bulb(26) }), h('span', {}, sup === 'standalone' ? t('rdMicHome') : t('rdMicNone'))), h('button', { class: 'btn', onclick: close }, t('rdMtClose'))]));

  function paint() {
    mic.classList.toggle('on', phase === 'listening'); mic.classList.toggle('wait', phase === 'starting');
    label.textContent = phase === 'listening' ? t('rdMtListen') : phase === 'starting' ? '…' : t('rdMtTap');
  }
  function reset() { l?.abort(); phase = 'ready'; heard.hidden = true; result.replaceChildren(); result.className = 'feedback'; line.textContent = LINES[idx]; paint(); }
  function say(ok, key, ico) { result.replaceChildren(h('span', { html: ico }), h('span', {}, t(key))); result.className = 'feedback ' + (ok ? 'good' : 'try'); }
  function tap() {
    if (phase === 'listening') { sfx.tap(); l?.stop(); return; }
    if (phase === 'starting') return;
    sfx.tap(); stopSpeaking(); phase = 'starting'; heard.hidden = true; result.replaceChildren(); result.className = 'feedback'; paint();
    l = createListener({
      lang: 'en-US', maxMs: 14000, silentMs: 10000,
      onState: (s) => { if (s === 'listening' && phase === 'starting') { phase = 'listening'; paint(); } },
      onText: (txt) => { heard.hidden = !txt; heard.textContent = txt ? t('rdMtHeard') + ': “' + txt + '”' : ''; },
      onPause: (txt) => match(LINES[idx], txt, 1).pass,
      onDone: (txt) => {
        phase = 'ready'; paint();
        heard.hidden = !txt; heard.textContent = txt ? t('rdMtHeard') + ': “' + txt + '”' : '';
        const r = match(LINES[idx], txt, 1);
        if (r.pass) { sfx.correct(); say(true, 'rdMtGood', icons.check(34)); } else if (r.heard >= 2 && r.score >= 0.3) say(false, 'rdMtSome', icons.bulb(34)); else say(false, 'rdMtNone', icons.bulb(34));
      },
      onError: (code) => { phase = 'ready'; paint(); say(false, ({ denied: 'rdErrDenied', nomic: 'rdErrMic', network: 'rdErrNet', lang: 'rdErrLang', unstable: 'rdErrUnstable', silent: 'rdErrSilent' })[code] || 'rdErrDenied', icons.bulb(34)); },
    });
    if (!l.start()) say(false, 'rdErrDenied', icons.bulb(34));
  }
  if (sup === 'ready') reset();
  document.body.append(ov);
  return close;
}
