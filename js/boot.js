import { initStore, S, subscribe, save, setLang, weekView, S as _S, storageHealthy, minutesToday, day, flush, onMilestone } from './core/store.js';
import { h, $, toast } from './core/dom.js';
import { icons, logo } from './core/icons.js';
import { t } from './core/i18n.js';
import { sfx, stopSpeaking, announceMilestone } from './core/audio.js';
import { route, startRouter, go, currentPath, setBeforeEach } from './core/router.js';

function applyTheme() {
  const r = document.documentElement;
  r.dataset.theme = S.theme === 'night' ? 'night' : 'day';
  r.dataset.big = S.bigText ? '1' : '0';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', S.theme === 'night' ? '#0F0A20' : '#10303B');
}

route('/home', () => import('./screens/home.js'));
route('/quiz', () => import('./screens/quiz.js'));
route('/words', () => import('./screens/wordsearch.js'));
route('/hangman', () => import('./screens/hangman.js'));
route('/stands', () => import('./screens/stands.js'));
route('/world', () => import('./screens/world.js'));
route('/passport', () => import('./screens/passport.js'));
route('/grownup', () => import('./screens/grownup.js'));
route('/credits', () => import('./screens/credits.js'));

let hudEls = {};
function buildHud() {
  const hud = h('header', { class: 'hud', role: 'banner' });
  const homeBtn = h('button', { class: 'btn-home', 'aria-label': t('home'), onclick: () => { stopSpeaking(); sfx.tap(); go('/home'); }, html: icons.home(44) });
  const brand = h('div', { class: 'brand' }, h('span', { html: logo(48) }), h('b', {}, t('appName')));
  const week = h('div', { class: 'week', role: 'img' });
  const pearl = h('a', { class: 'pill', href: '#/stands', id: 'pearl-pill' }, h('span', { html: icons.pearl(30) }), h('span', { id: 'pearl-count' }, '0'));
  const speak = h('button', { class: 'hud-btn', 'aria-pressed': 'false', onclick: () => { S.speak = !S.speak; save(); refreshHud(); } });
  const snd = h('button', { class: 'hud-btn', onclick: () => { S.sound = !S.sound; save(); if (S.sound) sfx.pop(); refreshHud(); } });
  const theme = h('button', { class: 'hud-btn', onclick: () => { S.theme = S.theme === 'night' ? 'day' : 'night'; save(); applyTheme(); refreshHud(); } });
  const lang = h('div', { class: 'seg', role: 'group', 'aria-label': 'Language' },
    h('button', { 'data-l': 'en', onclick: () => switchLang('en') }, 'EN'),
    h('button', { 'data-l': 'es', onclick: () => switchLang('es') }, 'ES'));
  hud.append(homeBtn, brand, h('div', { class: 'spacer' }), week, pearl, speak, snd, theme, lang);
  hudEls = { homeBtn, brand, week, pearl, speak, snd, theme, lang };
  return hud;
}
function switchLang(l) {
  if (S.lang === l) return;
  setLang(l);
  if (l === 'es' && !S.speak) S.speak = true;   // read-aloud is prominent in Spanish mode
  save(); refreshHud();
  import('./core/router.js').then((m) => m.render());
}
export function refreshHud() {
  const e = hudEls; if (!e.week) return;
  e.homeBtn.setAttribute('aria-label', t('home'));
  e.brand.querySelector('b').textContent = t('appName');
  const wv = weekView();
  e.week.replaceChildren(...wv.map((d) => h('i', { class: (d.played ? 'on ' : '') + (d.isToday ? 'today' : '') })));
  e.week.setAttribute('aria-label', t('week', { n: wv.filter((d) => d.played).length }));
  document.getElementById('pearl-count').textContent = S.pearls.balance.toLocaleString();
  e.pearl.setAttribute('aria-label', t('pearlsN', { n: S.pearls.balance }));
  e.speak.innerHTML = icons.talk(34); e.speak.setAttribute('aria-pressed', String(!!S.speak)); e.speak.setAttribute('aria-label', t('readAloud'));
  e.speak.style.opacity = S.speak ? '1' : '.55';
  e.snd.innerHTML = S.sound ? icons.speaker(34) : icons.speakerOff(34); e.snd.setAttribute('aria-label', S.sound ? t('soundOn') : t('soundOff'));
  e.theme.innerHTML = S.theme === 'night' ? icons.sun(34) : icons.moon(34); e.theme.setAttribute('aria-label', S.theme === 'night' ? t('day') : t('night'));
  e.lang.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.l === S.lang)));
  document.title = t('appName');
}

// ---------- gentle limits: nudge at 20 min, sunset at the limit, bedtime wind-down ----------
let sunsetShown = false, nudged = false, lastRest = 0;
function checkLimits() {
  const m = minutesToday();
  const lim = S.settings.dailyLimit || 0;
  if (m >= 20 && !nudged && (!lim || m < lim)) { nudged = true; toast(t('nudge', { n: m })); }
  if (m - lastRest >= 20 && m > 0) { lastRest = m; toast(t('eyeRest'), 5000); }
  const [bh, bm] = (S.settings.bedtime || '19:30').split(':').map(Number);
  const now = new Date(); const past = now.getHours() * 60 + now.getMinutes() >= bh * 60 + bm && now.getHours() < 22 + 8;
  const allow = ['/home', '/grownup', '/passport', '/credits'];
  if (((lim && m >= lim) || (S.settings.bedtime && past && m > 0)) && !sunsetShown && !allow.includes(currentPath())) showSunset();
}
function showSunset() {
  sunsetShown = true;
  const ov = h('div', { class: 'overlay', role: 'dialog', 'aria-modal': 'true' },
    h('div', { class: 'dialog center' }, h('div', { html: logo(96) }), h('h2', {}, t('appName')), h('p', {}, t('sunset')),
      h('div', { class: 'row', style: { justifyContent: 'center' } },
        h('button', { class: 'btn', onclick: () => { ov.remove(); go('/home'); } }, t('done')),
        h('button', { class: 'btn ghost small', onclick: async () => { const { askGate } = await import('./screens/grownup.js'); if (await askGate()) { S.settings.dailyLimit += 15; save(); ov.remove(); sunsetShown = false; } } }, t('sunsetKeep')))));
  document.body.append(ov);
}

async function main() {
  const app = document.getElementById('app');
  app.append(h('p', { class: 'center muted', style: { padding: '40vh 0' } }, 'Loading…'));
  await initStore();
  applyTheme();
  app.replaceChildren(buildHud(), h('main', { id: 'screen', tabindex: '-1' }));
  subscribe(() => refreshHud());
  refreshHud();
  if (!storageHealthy()) toast(t('storageWarn'), 7000);
  setBeforeEach(() => { stopSpeaking(); });
  // "You can afford a game!" - bell fanfare + announcer, at most once per milestone per day, only right after a tap
  onMilestone(() => announceMilestone());
  document.addEventListener('lab:announcer', (e) => {
    document.querySelector('.announcer')?.remove();
    const el = h('div', { class: 'announcer', role: 'status' }, h('small', {}, t('announcerName')), e.detail.text);
    document.body.append(el); setTimeout(() => el.remove(), 9000);
    el.addEventListener('click', () => el.remove());
  });
  startRouter($('#screen'));
  setInterval(checkLimits, 30000);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.__lab = { S, go, flush };   // handy for testing and the grown-up export
}
main();
