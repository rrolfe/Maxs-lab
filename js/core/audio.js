// Sounds are synthesized with Web Audio (no files, no tracking). iOS needs a tap before audio can start.
// Speech uses whatever voices the device itself has installed (a web page cannot bring its own voice).
import { S, save } from './store.js';
import { addStrings, t } from './i18n.js';

let ctx = null;
function ensure() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
// Unlock on the first touch; the silent switch can still mute iPad audio.
['pointerdown', 'touchend', 'keydown'].forEach((e) => addEventListener(e, () => { ensure(); primeSpeech(); }, { passive: true }));

function tone(freq, start, dur, { type = 'sine', gain = 0.12, slide = 0 } = {}) {
  const c = ensure(); if (!c || !S.sound) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
  if (slide) o.frequency.linearRampToValueAtTime(freq + slide, c.currentTime + start + dur);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g).connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
}
const N = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, A4: 440, D5: 587.33, F5: 698.46, A5: 880, B5: 987.77, E6: 1318.5, G6: 1568 };

/** A game-show bell: a bright strike with a few inharmonic partials and a quick shimmer. */
function bell(freq, start, { gain = 0.11, dur = 0.55 } = {}) {
  const c = ensure(); if (!c || !S.sound) return;
  [[1, 1], [2.76, 0.45], [5.4, 0.2], [8.9, 0.08]].forEach(([m, a]) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq * m;
    const t0 = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain * a, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur / Math.sqrt(m));
    o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  });
}
/** A short arena-horn buzzer (about 0.6 s): two detuned buzzy tones through a low-pass. Not scary, not loud. */
function buzzer() {
  const c = ensure(); if (!c || !S.sound) return;
  const t0 = c.currentTime, dur = 0.6;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.03);
  g.gain.setValueAtTime(0.1, t0 + dur - 0.14); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  lp.connect(g).connect(c.destination);
  [[150, 'sawtooth'], [156, 'square'], [75, 'sawtooth']].forEach(([f, ty], i) => {
    const o = c.createOscillator(); o.type = ty; o.frequency.value = f;
    const og = c.createGain(); og.gain.value = i === 2 ? 0.5 : 1;
    o.connect(og).connect(lp); o.start(t0); o.stop(t0 + dur + 0.05);
  });
}

export const sfx = {
  tap: () => tone(N.A4, 0, 0.06, { gain: 0.05 }),
  correct: () => { bell(N.C6, 0); bell(N.E6, 0.16); bell(N.G6, 0.32, { dur: 0.8 }); },       // three bright dings, rising
  hardCorrect: () => { bell(N.C6, 0); bell(N.E6, 0.14); bell(N.G6, 0.28); bell(N.C6 * 2, 0.42, { dur: 0.9 }); },
  wrong: () => buzzer(),
  soft: () => tone(300, 0, 0.3, { type: 'triangle', gain: 0.07, slide: -40 }),   // a gentle low note for "not a word" taps
  pop: () => tone(740, 0, 0.09, { type: 'triangle', gain: 0.08, slide: 180 }),
  coin: () => { tone(N.G5, 0, 0.08, { type: 'square', gain: 0.04 }); tone(N.C6, 0.07, 0.2, { type: 'square', gain: 0.04 }); },
  found: () => { bell(N.E5 * 2, 0, { dur: 0.4 }); bell(N.G5 * 2, 0.1, { dur: 0.5 }); },
  levelUp: () => { [N.C5, N.E5, N.G5, N.C6].forEach((n, i) => tone(n, i * 0.13, 0.28)); },
  splash: () => { tone(220, 0, 0.35, { type: 'sine', gain: 0.07, slide: 200 }); tone(330, 0.05, 0.25, { type: 'sine', gain: 0.05, slide: 150 }); },
  whoosh: () => tone(200, 0, 0.18, { type: 'sine', gain: 0.05, slide: 500 }),
  /** Five or six bell dings climbing up the scale. */
  fanfare: () => { [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6].forEach((n, i) => bell(n, i * 0.17, { dur: 0.7 })); },
  crack: () => { tone(160, 0, 0.05, { type: 'square', gain: 0.1 }); tone(900, 0.01, 0.06, { type: 'triangle', gain: 0.08 }); },
  cheer: () => { [N.G5, N.C6, N.E6].forEach((n, i) => bell(n, i * 0.09, { dur: 0.5, gain: 0.08 })); tone(300, 0, 0.5, { type: 'sawtooth', gain: 0.02, slide: 200 }); },
};

// ---------- speech: choosing the nicest voice the device has ----------
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch { voices = []; } }
try { loadVoices(); speechSynthesis.addEventListener?.('voiceschanged', loadVoices); } catch { /* unsupported */ }
[500, 1500, 3500].forEach((ms) => setTimeout(() => { if (!voices.length) loadVoices(); }, ms));   // some iPads fill the list late

const NOVELTY = /(bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|pipe organ|trinoids|whisper|zarvox|jester|organ|superstar|wobble|albert|junior|ralph|kathy|fred)/i;
const MALE = /(daniel|alex|aaron|arthur|gordon|rishi|thomas|tom\b|oliver|diego|jorge|juan|carlos|reed|rocko|eddy|grandpa|lee\b|david|mark\b|james|evan|nathan|bruce|ralph)/i;
const GOOD_FEMALE = { en: ['ava', 'samantha', 'allison', 'susan', 'zoe', 'nicky', 'karen', 'moira', 'tessa', 'serena', 'fiona', 'victoria'], es: ['paulina', 'monica', 'mónica', 'marisol', 'mariana', 'siri', 'luciana', 'angelica', 'angélica', 'francisca', 'esperanza', 'sabina', 'soledad'] };

const langOf = (v) => v.lang.replace('_', '-').toLowerCase();
const langMatches = (v, lang) => langOf(v).startsWith(lang);

function voiceScore(v, lang) {
  const n = v.name.toLowerCase();
  if (NOVELTY.test(n)) return -1000;
  let s = 0;
  if (/premium/.test(n)) s += 100;
  else if (/enhanced/.test(n)) s += 80;
  else if (/siri/.test(n)) s += 70;
  const idx = GOOD_FEMALE[lang].findIndex((g) => n.includes(g));
  if (idx >= 0) s += 60 - idx;
  if (MALE.test(n)) s -= 40;
  if (v.localService) s += 5;
  const l = langOf(v);
  if (lang === 'en' && l === 'en-us') s += 4; else if (lang === 'en' && /en-(gb|au|ie|za)/.test(l)) s += 1;
  if (lang === 'es' && /es-(mx|us|419)/.test(l)) s += 4;
  return s;
}
/** Voices for a language, best first (novelty voices removed). */
export function listVoices(lang = S.lang) {
  if (!voices.length) loadVoices();
  return voices.filter((v) => langMatches(v, lang) && voiceScore(v, lang) > -500).sort((a, b) => voiceScore(b, lang) - voiceScore(a, lang));
}
export function pickVoice(lang = S.lang) {
  const list = listVoices(lang), chosen = S.settings.voice?.[lang];
  return (chosen && list.find((v) => v.name === chosen)) || list[0] || null;
}
export function voiceQuality(v) {
  const n = (v?.name || '').toLowerCase();
  return /premium/.test(n) ? 'premium' : /enhanced/.test(n) ? 'enhanced' : /siri/.test(n) ? 'siri' : 'standard';
}
export function setVoice(lang, name) { S.settings.voice = { ...(S.settings.voice || {}), [lang]: name || '' }; save(); }

export function canSpeak(lang = S.lang) {
  if (!('speechSynthesis' in window)) return false;
  if (!voices.length) loadVoices();
  if (!voices.length) return true; // some iPads only list voices after the first speak; allow trying
  return voices.some((v) => langMatches(v, lang));
}

/** Say symbols and numbers the way a person would. */
export function cleanForSpeech(text, lang = S.lang) {
  let s = String(text);
  const es = lang === 'es';
  s = s.replace(/\$\s?(\d+)(?:\.(\d{2}))?/g, (m, d, c) => (c && c !== '00' ? `${d} ${es ? 'con' : 'and'} ${+c} ${es ? 'centavos' : 'cents'}` : `${d} ${es ? 'dólares' : 'dollars'}`));
  s = s.replace(/(\d+)\s?%/g, `$1 ${es ? 'por ciento' : 'percent'}`)
    .replace(/×/g, es ? ' por ' : ' times ').replace(/÷/g, es ? ' entre ' : ' divided by ').replace(/[−–]/g, es ? ' menos ' : ' minus ')
    .replace(/(\d)\s?\+\s?(\d)/g, `$1 ${es ? 'más' : 'plus'} $2`).replace(/=/g, es ? ' es igual a ' : ' equals ')
    .replace(/½/g, es ? ' un medio ' : ' one half ').replace(/¼/g, es ? ' un cuarto ' : ' one quarter ').replace(/¾/g, es ? ' tres cuartos ' : ' three quarters ')
    .replace(/(\d+)\/(\d+)/g, `$1 ${es ? 'sobre' : 'over'} $2`)
    .replace(/(\d),(\d{3})/g, '$1$2')
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ' ')
    .replace(/[_*#•▪►→←↑↓]/g, ' ').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();
  return s;
}
const sentences = (s) => (s.match(/[^.!?¡¿]+[.!?]*/g) || [s]).map((x) => x.trim()).filter((x) => x.length > 1);

let speakToken = 0;
let primed = false;
function primeSpeech() {
  if (primed || !('speechSynthesis' in window)) return; primed = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch { /* ignore */ }
}

/** Speak sentence by sentence with small pauses. Must be called from a tap on iOS. */
export function speak(text, lang = S.lang, { rate = 0.9, pitch = 1.05, voice = null, gap = 260, onend = null } = {}) {
  if (!('speechSynthesis' in window)) return false;
  try {
    speechSynthesis.cancel();
    const token = ++speakToken;
    const parts = sentences(cleanForSpeech(text, lang));
    const v = voice || pickVoice(lang);
    let i = 0;
    const next = () => {
      if (token !== speakToken) return;
      if (i >= parts.length) { onend?.(); return; }
      const u = new SpeechSynthesisUtterance(parts[i++]);
      u.lang = v?.lang || (lang === 'es' ? 'es-MX' : 'en-US');
      if (v) u.voice = v;
      u.rate = rate; u.pitch = pitch;
      u.onend = () => setTimeout(next, gap);
      u.onerror = () => setTimeout(next, gap);
      speechSynthesis.speak(u);
    };
    next();
    return true;
  } catch { return false; }
}
export const stopSpeaking = () => { speakToken++; try { speechSynthesis.cancel(); } catch { /* ignore */ } };

// ---------- the funny announcer ----------
addStrings({
  en: {
    annLines: [
      'Winner winner, chicken dinner! You’ve earned enough points for a chicken dinner! Wait, not a chicken dinner! I meant enough points to play a game! Or, you could keep accumulating more!',
      'Ladies and gentlemen, boys and girls, we have a champion! You’ve got enough pearls to play! Or save them and go for a bigger prize!',
      'Hold the phone! Stop the presses! Max has enough pearls for a game! Somebody get this kid a trophy! Well, a game. A game is better.',
      'Ding ding ding! The crowd goes wild! That’s enough pearls to play! Or keep collecting. The pearl bank is open all day!',
    ],
  },
  es: {
    annLines: [
      '¡Ganador ganador, cena de pollo! ¡Ya juntaste los puntos para una cena de pollo! ¡Espera, no, no es una cena de pollo! ¡Quise decir puntos suficientes para jugar un juego! ¡O puedes seguir juntando más!',
      '¡Damas y caballeros, niños y niñas, tenemos un campeón! ¡Ya tienes perlas para jugar! ¡O las guardas para un premio más grande!',
      '¡Alto ahí! ¡Paren las rotativas! ¡Max ya tiene perlas para un juego! ¡Que alguien le traiga un trofeo! Bueno, un juego. Un juego es mejor.',
      '¡Ding ding ding! ¡La multitud enloquece! ¡Ya hay perlas para jugar! O sigue juntando. ¡El banco de perlas abre todo el día!',
    ],
  },
});

function announcerVoice(lang) {
  if (!voices.length) loadVoices();
  const main = pickVoice(lang);
  const cands = voices.filter((v) => langMatches(v, lang) && !NOVELTY.test(v.name.toLowerCase()) && (!main || v.name !== main.name));
  return cands.find((v) => MALE.test(v.name.toLowerCase())) || cands[Math.floor(Math.random() * cands.length)] || main;
}
let annIdx = -1;
/** Five-six bells, then the announcer (spoken + captioned). Call right after a tap. Muted = no bells, no voice. */
export function announceMilestone(lang = S.lang) {
  const lines = t('annLines');
  annIdx = (annIdx + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length;
  if (S.lastAnn == null) annIdx = 0;                          // the very first time is always Rob's line
  S.lastAnn = annIdx;
  const line = lines[annIdx];
  sfx.fanfare();
  const caption = () => document.dispatchEvent(new CustomEvent('lab:announcer', { detail: { text: line } }));
  setTimeout(() => {
    caption();
    if (S.sound && 'speechSynthesis' in window) speak(line, lang, { rate: 1.18, pitch: 1.55, voice: announcerVoice(lang), gap: 120 });
  }, 1250);
}
