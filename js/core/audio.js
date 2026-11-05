// Sounds are synthesized with Web Audio (no files, no tracking). iOS needs a tap before audio can start.
import { S } from './store.js';

let ctx = null;
function ensure() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}
// Unlock on the first touch; the silent switch can still mute iPad audio.
['pointerdown', 'touchend', 'keydown'].forEach((e) => addEventListener(e, () => ensure(), { once: false, passive: true }));

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
const N = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, A4: 440, D5: 587.33, F5: 698.46 };

export const sfx = {
  tap: () => tone(N.A4, 0, 0.06, { gain: 0.05 }),
  correct: () => { tone(N.C5, 0, 0.16); tone(N.E5, 0.11, 0.26); },                 // rising major third
  hardCorrect: () => { tone(N.C5, 0, 0.14); tone(N.E5, 0.1, 0.14); tone(N.G5, 0.2, 0.3); },
  wrong: () => tone(300, 0, 0.3, { type: 'triangle', gain: 0.08, slide: -40 }),     // one low soft note, never a buzzer
  pop: () => tone(740, 0, 0.09, { type: 'triangle', gain: 0.08, slide: 180 }),
  coin: () => { tone(N.G5, 0, 0.08, { type: 'square', gain: 0.04 }); tone(N.C6, 0.07, 0.2, { type: 'square', gain: 0.04 }); },
  found: () => { tone(N.E5, 0, 0.12); tone(N.G5, 0.1, 0.12); tone(N.C6, 0.2, 0.25); },
  levelUp: () => { [N.C5, N.E5, N.G5, N.C6].forEach((n, i) => tone(n, i * 0.13, 0.28)); },
  splash: () => { tone(220, 0, 0.35, { type: 'sine', gain: 0.07, slide: 200 }); tone(330, 0.05, 0.25, { type: 'sine', gain: 0.05, slide: 150 }); },
  whoosh: () => tone(200, 0, 0.18, { type: 'sine', gain: 0.05, slide: 500 }),
};

// ---------- read aloud ----------
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch { voices = []; } }
try { loadVoices(); speechSynthesis.addEventListener?.('voiceschanged', loadVoices); } catch { /* unsupported */ }

export function canSpeak(lang = S.lang) {
  if (!('speechSynthesis' in window)) return false;
  if (!voices.length) loadVoices();
  if (!voices.length) return true; // some iPads only list voices after the first speak; allow trying
  return voices.some((v) => v.lang.toLowerCase().startsWith(lang));
}
/** Must be called synchronously from a tap on iOS. */
export function speak(text, lang = S.lang) {
  if (!('speechSynthesis' in window)) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\s+/g, ' '));
    u.lang = lang === 'es' ? 'es-MX' : 'en-US';
    const v = voices.find((x) => x.lang.replace('_', '-').toLowerCase().startsWith(lang) && x.localService) || voices.find((x) => x.lang.toLowerCase().startsWith(lang));
    if (v) u.voice = v;
    u.rate = 0.95;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}
export const stopSpeaking = () => { try { speechSynthesis.cancel(); } catch { /* ignore */ } };
