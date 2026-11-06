// English / Latin American Spanish. Each screen registers its own strings with addStrings().
import { S } from './store.js';

const dict = { en: {}, es: {} };
export function addStrings(pack) {
  for (const l of ['en', 'es']) Object.assign(dict[l], pack[l] || {});
}
/** t('key', {n: 3}) -> string; falls back to English, then the key. */
export function t(key, vars) {
  let s = dict[S.lang]?.[key] ?? dict.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll('{' + k + '}', v);
  return s;
}
/** Pick from a {en, es} object (data records). Falls back to English. */
export const L = (obj) => (obj == null ? '' : typeof obj === 'string' ? obj : obj[S.lang] ?? obj.en ?? '');
export const isEs = () => S.lang === 'es';

addStrings({
  en: {
    appName: 'Max’s Lab',
    tagline: 'Read · Solve · Discover',
    home: 'Home', back: 'Back', next: 'Next', done: 'Done', check: 'Check', hint: 'Hint', again: 'Play again',
    close: 'Close', cancel: 'Cancel', save: 'Save', yes: 'Yes', no: 'No', ok: 'OK', skip: 'Skip', show: 'Show me', play: 'Play',
    pearls: 'pearls', pearlsN: '{n} pearls', week: '{n} of 7 days this week',
    sound: 'Sound', soundOn: 'Sound on', soundOff: 'Sound off', readAloud: 'Read aloud', night: 'Night mode', day: 'Day mode',
    langName: 'English', langSwitch: 'Español',
    goodMorning: 'Good morning, Max!', goodAfternoon: 'Good afternoon, Max!', goodEvening: 'Good evening, Max!',
    tileWords: 'Word Search', tileWordsSub: 'Find the hidden words',
    tileHangman: 'Hangman', tileHangmanSub: 'Guess the secret word',
    tileQuiz: 'Quiz Missions', tileQuizSub: 'Earn pearls',
    tileStands: 'My Stands', tileStandsSub: 'Run a tiny business',
    tileWorld: 'World Map', tileWorldSub: 'Fly anywhere',
    tilePassport: 'Passport', tilePassportSub: 'Stamps and badges',
    continue: 'Pick up where you left off', startMission: 'Start mission',
    gear: 'Grown-up corner', gearHold: 'Press and hold for 3 seconds',
    loading: 'Loading…', storageWarn: 'This browser is not saving progress. Ask a grown-up to add this page to the Home Screen.',
    sunset: 'That’s plenty of lab time for today! Time to rest your eyes. Read a book, draw, or play outside.',
    sunsetKeep: 'A grown-up can keep going', eyeRest: 'Eye break! Look at something far away for 20 seconds.',
    nudge: 'You have played for {n} minutes. Great work!',
    chestFull: 'Pearl chest is full for today. Keep playing just for fun!',
    notFound: 'That page floated away.', creditsLink: 'Photo credits',
    plusN: '+{n} pearls', minusN: '−{n} pearls', announcerName: 'The Announcer', askGrownup: 'Ask a grown-up to enter the passcode',
  },
  es: {
    appName: 'El Laboratorio de Max',
    tagline: 'Lee · Resuelve · Descubre',
    home: 'Inicio', back: 'Atrás', next: 'Siguiente', done: 'Listo', check: 'Comprobar', hint: 'Pista', again: 'Jugar otra vez',
    close: 'Cerrar', cancel: 'Cancelar', save: 'Guardar', yes: 'Sí', no: 'No', ok: 'OK', skip: 'Saltar', show: 'Muéstrame', play: 'Jugar',
    pearls: 'perlas', pearlsN: '{n} perlas', week: '{n} de 7 días esta semana',
    sound: 'Sonido', soundOn: 'Sonido activado', soundOff: 'Sonido apagado', readAloud: 'Leer en voz alta', night: 'Modo noche', day: 'Modo día',
    langName: 'Español', langSwitch: 'English',
    goodMorning: '¡Buenos días, Max!', goodAfternoon: '¡Buenas tardes, Max!', goodEvening: '¡Buenas noches, Max!',
    tileWords: 'Sopa de letras', tileWordsSub: 'Encuentra las palabras',
    tileHangman: 'Ahorcado', tileHangmanSub: 'Adivina la palabra secreta',
    tileQuiz: 'Misiones de preguntas', tileQuizSub: 'Gana perlas',
    tileStands: 'Mis puestos', tileStandsSub: 'Dirige un negocio',
    tileWorld: 'Mapa del mundo', tileWorldSub: 'Vuela a cualquier lugar',
    tilePassport: 'Pasaporte', tilePassportSub: 'Sellos e insignias',
    continue: 'Sigue donde lo dejaste', startMission: 'Empezar misión',
    gear: 'Rincón de adultos', gearHold: 'Mantén presionado 3 segundos',
    loading: 'Cargando…', storageWarn: 'Este navegador no está guardando el progreso. Pide a un adulto que agregue esta página a la pantalla de inicio.',
    sunset: '¡Ya fue suficiente tiempo de laboratorio por hoy! Descansa los ojos. Lee un libro, dibuja o juega afuera.',
    sunsetKeep: 'Un adulto puede seguir', eyeRest: '¡Descanso para los ojos! Mira algo lejano durante 20 segundos.',
    nudge: 'Has jugado {n} minutos. ¡Buen trabajo!',
    chestFull: 'El cofre de perlas está lleno por hoy. ¡Sigue jugando por diversión!',
    notFound: 'Esa página se fue flotando.', creditsLink: 'Créditos de fotos',
    plusN: '+{n} perlas', minusN: '−{n} perlas', announcerName: 'El Locutor', askGrownup: 'Pide a un adulto que ingrese el código',
  },
});
