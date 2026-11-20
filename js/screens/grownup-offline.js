// Grown-up corner section: "Ready for no internet". Shows whether the whole lab is saved on this device and lets a grown-up finish saving it.
import { h, toast } from '../core/dom.js';
import { t, addStrings } from '../core/i18n.js';
import { offlineStatus, saveAll, watchOffline, isStandalone } from '../core/offline.js';

addStrings({
  en: {
    ofTitle: 'Ready for no internet ✈️',
    ofLead: 'The lab can save itself on this device, so Max can keep playing on a plane or anywhere with no signal. Pearls, points and games all keep working and are saved on this device.',
    ofReady: '✓ Everything is saved. The lab will work with no internet.',
    ofSaving: 'Saving the lab… {a} of {b} files',
    ofNone: 'Not saved yet. Stay on wifi with this page open and tap the button.',
    ofSetup: 'Setting up… keep this page open on wifi for a minute. If this stays here, close the lab, open it again, and look back here.',
    ofUnsupported: 'This browser cannot save the lab for offline (a private tab or a very old browser can do that). Open the lab in regular Safari or from the Home Screen icon.',
    ofNowOnline: 'Right now: online', ofNowOffline: 'Right now: offline (this is a good test!)',
    ofBtn: 'Save everything now', ofBtnWait: 'Saving…', ofBtnNeedNet: 'Needs wifi to save',
    ofStepsH: 'Before you leave',
    ofS1: 'On home wifi, open the lab and keep this page open until it says “Everything is saved”.',
    ofS2: 'Best: add it to the Home Screen (Share → Add to Home Screen) and open it from that icon.',
    ofS3: 'Test it: turn on Airplane Mode, then open the lab. It should open and play like normal.',
    ofS4: 'Do not clear Safari’s website data and do not use Private Browsing, or the saved lab is erased.',
    ofStandalone: 'You are in the Home Screen icon. 👍',
    ofNotStandalone: 'You are in Safari. Adding the Home Screen icon makes the saved lab safer.',
    ofNeedsNetH: 'What needs internet',
    ofNeeds1: 'Read It Loud: the iPad cannot hear Max without internet. Use “A grown-up listens” instead.',
    ofNeeds2: 'The world map’s satellite pictures. The map still shows a simple offline map.',
    ofNeeds3: 'Everything else works: quizzes, games, stands, Home Jobs, Learning about Boise, pearls and points.',
    ofBack: 'When you are back online the lab quietly refreshes itself with any updates. Max’s progress is never touched.',
  },
  es: {
    ofTitle: 'Listo para sin internet ✈️',
    ofLead: 'El laboratorio se puede guardar en este aparato para que Max siga jugando en un avión o donde no haya señal. Las perlas, los puntos y los juegos siguen funcionando y se guardan en este aparato.',
    ofReady: '✓ Todo está guardado. El laboratorio funcionará sin internet.',
    ofSaving: 'Guardando el laboratorio… {a} de {b} archivos',
    ofNone: 'Todavía no está guardado. Quédate con wifi y esta página abierta, y toca el botón.',
    ofSetup: 'Preparando… deja esta página abierta con wifi por un minuto. Si sigue así, cierra el laboratorio, ábrelo otra vez y vuelve a mirar aquí.',
    ofUnsupported: 'Este navegador no puede guardar el laboratorio para usarlo sin internet (una pestaña privada o un navegador muy viejo). Abre el laboratorio en Safari normal o desde el icono de la pantalla de inicio.',
    ofNowOnline: 'Ahora mismo: con internet', ofNowOffline: 'Ahora mismo: sin internet (¡es una buena prueba!)',
    ofBtn: 'Guardar todo ahora', ofBtnWait: 'Guardando…', ofBtnNeedNet: 'Necesita wifi para guardar',
    ofStepsH: 'Antes de salir',
    ofS1: 'Con el wifi de casa, abre el laboratorio y deja esta página abierta hasta que diga “Todo está guardado”.',
    ofS2: 'Lo mejor: agrégalo a la pantalla de inicio (Compartir → Agregar a pantalla de inicio) y ábrelo desde ese icono.',
    ofS3: 'Pruébalo: activa el Modo avión y abre el laboratorio. Debe abrir y jugarse normal.',
    ofS4: 'No borres los datos de sitios web de Safari ni uses la Navegación privada, o se borra el laboratorio guardado.',
    ofStandalone: 'Estás en el icono de la pantalla de inicio. 👍',
    ofNotStandalone: 'Estás en Safari. Con el icono de la pantalla de inicio, lo guardado está más seguro.',
    ofNeedsNetH: 'Lo que necesita internet',
    ofNeeds1: 'Read It Loud (Léelo en voz alta): el iPad no puede escuchar a Max sin internet. Usa “Un adulto escucha”.',
    ofNeeds2: 'Las imágenes satelitales del mapa mundial. El mapa muestra un mapa sencillo sin internet.',
    ofNeeds3: 'Todo lo demás funciona: preguntas, juegos, puestos, Tareas de casa, Aprender sobre Boise, perlas y puntos.',
    ofBack: 'Cuando vuelvas a tener internet, el laboratorio se actualiza solo. El progreso de Max nunca se toca.',
  },
});

export function offlineNodes() {
  const line = h('p', { class: 'offline-line', role: 'status', 'aria-live': 'polite' });
  const bar = h('div', { class: 'offbar', 'aria-hidden': 'true' }, h('i'));
  const net = h('p', { class: 'muted small' });
  const btn = h('button', { class: 'btn small', type: 'button' });
  let last = { state: 'setup' }, busy = false;
  const draw = (s = last) => {
    last = s;
    const online = navigator.onLine !== false, done = s.state === 'ok' && s.done;
    line.className = 'offline-line' + (done ? ' good' : '');
    line.textContent = s.state === 'unsupported' ? t('ofUnsupported') : s.state === 'none' ? t('ofNone') : s.state === 'setup' ? t('ofSetup')
      : done ? t('ofReady') : (s.have > 0 ? t('ofSaving', { a: s.have, b: s.total }) : t('ofNone'));
    const pct = s.state === 'ok' && s.total ? Math.round((100 * s.have) / s.total) : 0;
    bar.firstChild.style.width = pct + '%'; bar.hidden = s.state === 'unsupported' || s.state === 'none';
    net.textContent = t(online ? 'ofNowOnline' : 'ofNowOffline');
    btn.hidden = done || s.state === 'unsupported';
    btn.disabled = busy || !online; btn.textContent = busy ? t('ofBtnWait') : online ? t('ofBtn') : t('ofBtnNeedNet');
  };
  btn.onclick = async () => { busy = true; draw(); const ok = await saveAll(); if (!ok) { busy = false; draw({ state: 'setup' }); toast(t('ofSetup')); } };
  const off = watchOffline((m) => { if (!line.isConnected) { off(); return; } if (m.done || m.have >= m.total) busy = false; draw({ state: 'ok', total: m.total, have: m.have, done: !!m.done }); });
  const refresh = () => { if (!line.isConnected) { window.removeEventListener('online', refresh); window.removeEventListener('offline', refresh); return; } offlineStatus().then((s) => { draw(s); if (s.state === 'ok' && !s.done && navigator.onLine !== false) { busy = true; draw(); saveAll(); } }); };
  window.addEventListener('online', refresh); window.addEventListener('offline', refresh);
  draw(); setTimeout(refresh, 0);
  return [
    h('p', {}, t('ofLead')), line, bar, net, h('div', { class: 'row' }, btn),
    h('h3', {}, t('ofStepsH')), h('ol', { class: 'offsteps' }, ['ofS1', 'ofS2', 'ofS3', 'ofS4'].map((k) => h('li', {}, t(k)))),
    h('p', { class: 'muted small' }, t(isStandalone() ? 'ofStandalone' : 'ofNotStandalone')),
    h('h3', {}, t('ofNeedsNetH')), h('ul', { class: 'offsteps' }, ['ofNeeds1', 'ofNeeds2', 'ofNeeds3'].map((k) => h('li', {}, t(k)))),
    h('p', { class: 'muted small' }, t('ofBack')),
  ];
}
