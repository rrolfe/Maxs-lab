// Max's Ballpark: a real little baseball game. Pick your swing (bigger hit = harder question), answer, then tap to swing.
// Rules live in js/baseball/engine.js (pure, bot-tested). Games cost pearls (see js/core/economy.js).
import { S, save, spendPearls, TOPICS, levelOf } from '../core/store.js';
import { h, clamp, confetti, shuffle, pick, reduceMotion } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { go } from '../core/router.js';
import { sfx, speak, canSpeak, stopSpeaking } from '../core/audio.js';
import { COST } from '../core/economy.js';
import { loadBank, prepare, recordAnswer } from '../quiz/engine.js';
import { makeMath } from '../quiz/math.js';
import { awardBadges } from '../core/badges.js';
import { newGame, takePitch, swing, halfOver, oppHalf, endMyHalf, endOppHalf, timingOf, SWEET, CFG, HIT } from '../baseball/engine.js';

addStrings({
  en: {
    bbTitle: 'Max’s Ballpark', bbSub: 'Pick your swing, answer the question, then tap to swing!', bbPlay: 'Play ball!', bbInnings: 'Innings', bbInn3: '3 innings', bbInn6: '6 innings', bbCost: '{n} pearls',
    bbOpp: 'Pick your opponent', bbOppDinos: 'Dino Rexes', bbOppRockets: 'Space Rockets', bbOppPirates: 'Sea Pirates', bbLvEasy: 'Rookie', bbLvMed: 'Pro', bbLvHard: 'All-Star', bbYou: 'Sharks',
    bbNeed: 'You need {n} more pearls for this game.', bbEarn: 'Earn pearls', bbResume: 'Resume your game', bbResumeSub: 'Inning {i}: {a} to {b}', bbForfeit: 'Start over',
    bbStats: 'Your stats', bbGames: 'Games', bbWins: 'Wins', bbBest: 'Best score', bbHR: 'Home runs', bbAvg: 'Batting average', bbNoAvg: '—', bbQNote: 'Questions in the ballpark do not earn pearls. They power your swing!',
    bbHowTitle: 'How it works', bbHow1: 'Pick a swing. Bigger hits need harder questions.', bbHow2: 'Answer right to power up your swing.', bbHow3: 'Tap SWING! when the ball reaches the glowing ring.', bbHow4: 'Three outs and the other team bats. Score more runs to win!',
    bbInnLabel: 'Inning {n}', bbExtra: 'Extra inning!', bbTop: 'You bat', bbBottom: 'They bat', bbOuts: 'Outs', bbBalls: 'Balls', bbStrikes: 'Strikes', bbOutsFrac: '{n} out = {n}/3 of an inning',
    bbRunners: 'Runners on base', bbCount: 'Count {b}-{s}', bbBat: 'At bat', bbPick: 'Choose your swing', bbWait: 'Take a pitch', bbWaitSub: 'Let it go by and wait for another',
    bbSingle: 'Single', bbDouble: 'Double', bbTriple: 'Triple', bbHomer: 'Home run', bbSingleS: 'Safe and steady', bbDoubleS: 'Hit it in the gap', bbTripleS: 'Run all the way to third', bbHomerS: 'Over the fence!',
    bbRisk: 'Risk', bbBases: '{n} base', bbBases2: '{n} bases', bbHard: 'harder question',
    bbRead: 'Read it', bbQFor: 'Question for a {hit}', bbTry2: 'Not quite! Try once more. Your swing will be a little weaker.', bbReveal: 'The answer was “{a}”. {why}', bbPowered: 'Powered up! Now tap to swing.', bbPoweredWeak: 'Good! A bit weaker, but still a swing.',
    bbSwing: 'SWING!', bbTapHint: 'Tap SWING! when the ball is in the glowing ring.', bbPitching: 'Here comes the pitch…',
    bbMiss: 'Swing and a miss! Strike {s}.', bbStrike: 'Strike {s}!', bbBall: 'Ball {b}.', bbFoul: 'Foul ball!', bbFoulLate: 'Late swing: foul ball.', bbFoulEarly: 'Early swing: foul ball.', bbWalk: 'Ball four: a walk! Take your base.', bbWalkRun: 'Ball four, bases loaded: a run scores!', bbK: 'Strike three! You are out.',
    bbGround: 'Grounder: out at first.', bbFly: 'Fly ball: caught. Out!', bbSacFly: 'Sacrifice fly! The runner scores.',
    bbHit1: 'SINGLE!', bbHit2: 'DOUBLE!', bbHit3: 'TRIPLE!', bbHit4: 'HOME RUN!', bbRuns0: 'No runs yet.', bbRuns1: '1 run scores!', bbRunsN: '{n} runs score!',
    bbPerfect: 'Perfect timing!', bbGood: 'Good contact.', bbSwingWrong: 'You swung at a tricky pitch…',
    bbNext: 'Next batter', bbNextPitch: 'Next pitch', bbHalfDone: 'Three outs! You scored {n} this inning.', bbDefTitle: 'Defense! {team} is up to bat', bbDefSub: 'Make a great play to save a run. Answer right on the first try to stop a run.',
    bbDefGood: 'GREAT PLAY! You saved a run!', bbDefOk: '{team} scored {n}.', bbDefNone: '{team} did not score. Nice defense!', bbDefSaved: '{team} would have scored {n}, but your play saved {p}!', bbDefMissed: 'Not this time. {team} scored {n}.',
    bbScoreNow: 'It is {a} to {b}.', bbLead: 'You lead by {n}.', bbTrail: 'You trail by {n}.', bbTied: 'The game is tied!', bbNextInn: 'Next inning',
    bbEndWin: 'YOU WIN!', bbEndLoss: 'Good game! Almost…', bbEndTie: 'A tie! What a game.', bbFinal: 'Final: {a} to {b}', bbAgain: 'Play again', bbMore: 'Rematch costs {n} pearls', bbBack: 'Back to the ballpark', bbGameStats: 'Your game', bbAB: 'At bats', bbH: 'Hits', bbK2: 'Strikeouts', bbWalks: 'Walks', bbRBI: 'Runs driven in', bbBat2: 'Batting average: {n} hits in {m} at bats', bbPerf: 'Perfect swings',
    bbLose1: 'Every great player loses sometimes. Try a different swing or opponent!', bbWin1: 'Sharks win! Try a tougher team next.',
    bbScore: 'Score', bbTotal: 'R', bbLeave: 'Leave the game', bbLeaveAsk: 'Leave now? Your game is saved and you can resume it.',
    bbCaption: 'Ballpark', bbOnBase: '{n} on base', bbBasesEmpty: 'Bases empty', bbBasesLoaded: 'Bases loaded!',
  },
  es: {
    bbTitle: 'El estadio de Max', bbSub: '¡Elige tu bateo, responde la pregunta y toca para batear!', bbPlay: '¡A jugar!', bbInnings: 'Entradas', bbInn3: '3 entradas', bbInn6: '6 entradas', bbCost: '{n} perlas',
    bbOpp: 'Elige a tu rival', bbOppDinos: 'Dino Rexes', bbOppRockets: 'Cohetes Espaciales', bbOppPirates: 'Piratas del Mar', bbLvEasy: 'Novato', bbLvMed: 'Profesional', bbLvHard: 'Estrella', bbYou: 'Tiburones',
    bbNeed: 'Te faltan {n} perlas para este juego.', bbEarn: 'Ganar perlas', bbResume: 'Sigue tu juego', bbResumeSub: 'Entrada {i}: {a} a {b}', bbForfeit: 'Empezar de nuevo',
    bbStats: 'Tus estadísticas', bbGames: 'Juegos', bbWins: 'Victorias', bbBest: 'Mejor marcador', bbHR: 'Jonrones', bbAvg: 'Promedio de bateo', bbNoAvg: '—', bbQNote: 'Las preguntas del estadio no dan perlas. ¡Dan fuerza a tu bateo!',
    bbHowTitle: 'Cómo se juega', bbHow1: 'Elige un bateo. Los batazos más grandes piden preguntas más difíciles.', bbHow2: 'Responde bien para dar fuerza a tu bateo.', bbHow3: '¡Toca BATEAR! cuando la pelota llegue al anillo brillante.', bbHow4: 'Con tres outs batea el otro equipo. ¡Anota más carreras para ganar!',
    bbInnLabel: 'Entrada {n}', bbExtra: '¡Entrada extra!', bbTop: 'Bateas tú', bbBottom: 'Batea el rival', bbOuts: 'Outs', bbBalls: 'Bolas', bbStrikes: 'Strikes', bbOutsFrac: '{n} out = {n}/3 de una entrada',
    bbRunners: 'Corredores en base', bbCount: 'Cuenta {b}-{s}', bbBat: 'Al bate', bbPick: 'Elige tu bateo', bbWait: 'Esperar', bbWaitSub: 'Deja pasar la pelota y espera otra',
    bbSingle: 'Sencillo', bbDouble: 'Doble', bbTriple: 'Triple', bbHomer: 'Jonrón', bbSingleS: 'Seguro y firme', bbDoubleS: 'Entre los jardineros', bbTripleS: 'Corre hasta tercera', bbHomerS: '¡Fuera de la cerca!',
    bbRisk: 'Riesgo', bbBases: '{n} base', bbBases2: '{n} bases', bbHard: 'pregunta más difícil',
    bbRead: 'Leer', bbQFor: 'Pregunta para un {hit}', bbTry2: '¡Casi! Inténtalo una vez más. Tu bateo será un poco más débil.', bbReveal: 'La respuesta era “{a}”. {why}', bbPowered: '¡Con fuerza! Ahora toca para batear.', bbPoweredWeak: '¡Bien! Un poco más débil, pero es un bateo.',
    bbSwing: '¡BATEAR!', bbTapHint: 'Toca BATEAR cuando la pelota esté en el anillo brillante.', bbPitching: 'Ahí viene el lanzamiento…',
    bbMiss: '¡Se te pasó! Strike {s}.', bbStrike: '¡Strike {s}!', bbBall: 'Bola {b}.', bbFoul: '¡Foul!', bbFoulLate: 'Bateo tarde: foul.', bbFoulEarly: 'Bateo temprano: foul.', bbWalk: 'Bola cuatro: ¡base por bolas! Toma tu base.', bbWalkRun: 'Bola cuatro con bases llenas: ¡anota una carrera!', bbK: '¡Strike tres! Estás out.',
    bbGround: 'Rodado: out en primera.', bbFly: 'Elevado: atrapado. ¡Out!', bbSacFly: '¡Elevado de sacrificio! Anota el corredor.',
    bbHit1: '¡SENCILLO!', bbHit2: '¡DOBLE!', bbHit3: '¡TRIPLE!', bbHit4: '¡JONRÓN!', bbRuns0: 'Todavía sin carreras.', bbRuns1: '¡Anota 1 carrera!', bbRunsN: '¡Anotan {n} carreras!',
    bbPerfect: '¡Tiempo perfecto!', bbGood: 'Buen contacto.', bbSwingWrong: 'Bateaste a un lanzamiento difícil…',
    bbNext: 'Siguiente bateador', bbNextPitch: 'Siguiente lanzamiento', bbHalfDone: '¡Tres outs! Anotaste {n} en esta entrada.', bbDefTitle: '¡Defensa! Batea {team}', bbDefSub: 'Haz una gran jugada para salvar una carrera. Responde bien a la primera para detener una carrera.',
    bbDefGood: '¡GRAN JUGADA! ¡Salvaste una carrera!', bbDefOk: '{team} anotó {n}.', bbDefNone: '{team} no anotó. ¡Buena defensa!', bbDefSaved: '{team} habría anotado {n}, ¡pero tu jugada salvó {p}!', bbDefMissed: 'Esta vez no. {team} anotó {n}.',
    bbScoreNow: 'Va {a} a {b}.', bbLead: 'Ganas por {n}.', bbTrail: 'Pierdes por {n}.', bbTied: '¡El juego está empatado!', bbNextInn: 'Siguiente entrada',
    bbEndWin: '¡GANASTE!', bbEndLoss: '¡Buen juego! Casi…', bbEndTie: '¡Empate! Qué juegazo.', bbFinal: 'Final: {a} a {b}', bbAgain: 'Jugar otra vez', bbMore: 'La revancha cuesta {n} perlas', bbBack: 'Volver al estadio', bbGameStats: 'Tu juego', bbAB: 'Turnos al bate', bbH: 'Hits', bbK2: 'Ponches', bbWalks: 'Bases por bolas', bbRBI: 'Carreras impulsadas', bbBat2: 'Promedio de bateo: {n} hits en {m} turnos', bbPerf: 'Bateos perfectos',
    bbLose1: 'Todos los grandes jugadores pierden a veces. ¡Prueba otro bateo u otro rival!', bbWin1: '¡Ganan los Tiburones! Prueba un equipo más difícil.',
    bbScore: 'Marcador', bbTotal: 'C', bbLeave: 'Salir del juego', bbLeaveAsk: '¿Salir ahora? Tu juego queda guardado y puedes seguirlo.',
    bbCaption: 'Estadio', bbOnBase: '{n} en base', bbBasesEmpty: 'Bases vacías', bbBasesLoaded: '¡Bases llenas!',
  },
});

const OPPS = ['dinos', 'rockets', 'pirates'];
function fill(node, ...kids) { node.replaceChildren(...kids.filter((k) => k != null && k !== false)); }
const OPP_LEVEL = { dinos: 'bbLvEasy', rockets: 'bbLvMed', pirates: 'bbLvHard' };
const OPP_NAME = { dinos: 'bbOppDinos', rockets: 'bbOppRockets', pirates: 'bbOppPirates' };
const HITKEYS = { 1: ['bbSingle', 'bbSingleS'], 2: ['bbDouble', 'bbDoubleS'], 3: ['bbTriple', 'bbTripleS'], 4: ['bbHomer', 'bbHomerS'] };
const DELTA = { 1: -1, 2: 0, 3: 1, 4: 2 };
const uiOpt = { innings: 3, opp: 'rockets' };
const bb = () => (S.baseball ||= { games: 0, wins: 0, bestRuns: 0, hr: 0, hits: 0, ab: 0, k: 0, last: null });

export async function mount(el) {
  let dead = false, raf = 0; const timers = [];
  const later = (fn, ms) => { const id = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(id); return id; };
  const root = h('div', { class: 'bb' }); el.append(root);
  const bank = await loadBank(S.lang);
  if (dead) return () => {};
  const used = new Set();
  let g = null;                       // the game state (engine)
  let phase = 'menu';

  // ---------- questions ----------
  function pickQuestion(delta) {
    const topics = shuffle(TOPICS.filter((x) => x !== 'world' || Math.random() < 0.3));
    const recent = new Set(S.recent.slice(-80));
    for (const tp of topics) {
      const lvl = clamp(levelOf(tp) + delta, 1, 6);
      if (tp === 'math' && Math.random() < 0.6) {
        const m = makeMath(lvl, Math.random, S.lang);
        return asChoice(m);
      }
      let pool = bank.filter((q) => q.topic === tp && q.level === lvl && q.type === 'choice' && !used.has(q.id));
      const unseen = pool.filter((q) => !S.seen[q.id]); if (unseen.length) pool = unseen;
      const fresh = pool.filter((q) => !recent.has(q.id)); if (fresh.length) pool = fresh;
      const base = pool.filter((q) => q.tags?.includes('baseball'));
      if (base.length && Math.random() < 0.4) pool = base;
      if (pool.length) { const q = pick(pool); used.add(q.id); return q; }
    }
    const any = bank.filter((q) => q.type === 'choice' && !used.has(q.id)); const q = pick(any.length ? any : bank.filter((x) => x.type === 'choice')); used.add(q.id); return q;
  }
  function asChoice(m) {
    if (m.type === 'choice') return m;
    const a = m.a, set = new Set([a]);
    for (const c of shuffle([a + 1, a - 1, a + 10, a - 10, a + 2, a - 2, Number(String(a).split('').reverse().join('')), a * 2])) { if (set.size >= 4) break; if (c > 0 && Number.isFinite(c) && !set.has(c)) set.add(c); }
    let k = 3; while (set.size < 4) set.add(a + k++);
    const opts = shuffle([...set]);
    return { ...m, type: 'choice', opts: opts.map(String), a: opts.indexOf(a) };
  }

  // ---------- menu ----------
  function menu() {
    phase = 'menu'; stopSpeaking();
    const st = bb(), cur = st.cur;
    const cost = COST.baseball[uiOpt.innings];
    const can = S.pearls.balance >= cost;
    const avg = st.ab ? (st.hits / st.ab).toFixed(3).replace(/^0/, '') : t('bbNoAvg');
    const oppCards = OPPS.map((o) => h('button', { class: 'oppcard' + (uiOpt.opp === o ? ' on' : ''), 'aria-pressed': String(uiOpt.opp === o), onclick: () => { uiOpt.opp = o; sfx.tap(); menu(); } },
      h('span', { class: 'oe' }, CFG.opp[o].emoji), h('strong', {}, t(OPP_NAME[o])), h('small', {}, t(OPP_LEVEL[o]))));
    fill(root, 
      h('div', { class: 'screen-head' }, h('h1', {}, t('bbTitle')), h('span', { class: 'chip' }, h('span', { html: icons.pearl(26) }), ' ' + S.pearls.balance)),
      h('p', { class: 'muted' }, t('bbSub')),
      cur && !cur.over ? h('div', { class: 'continue', style: { marginBottom: '18px' } }, h('div', { class: 'ci', html: icons.ballpark(56) }), h('div', { class: 'ct' }, h('strong', {}, t('bbResume')), h('small', {}, t('bbResumeSub', { i: cur.inn, a: cur.score.me, b: cur.score.opp }))),
        h('div', { class: 'row' }, h('button', { class: 'btn gold', onclick: () => { g = cur; used.clear(); resumeGame(); } }, t('play')), h('button', { class: 'btn ghost small', onclick: () => { st.cur = null; save(); menu(); } }, t('bbForfeit')))) : '',
      h('div', { class: 'bbmenu' },
        h('div', { class: 'card' }, h('h3', {}, t('bbInnings')), h('div', { class: 'row' }, [3, 6].map((n) => h('button', { class: 'chip big' + (uiOpt.innings === n ? ' on' : ''), 'aria-pressed': String(uiOpt.innings === n), onclick: () => { uiOpt.innings = n; sfx.tap(); menu(); } }, t(n === 3 ? 'bbInn3' : 'bbInn6') + ' · ' + t('bbCost', { n: COST.baseball[n] })))),
          h('h3', { style: { marginTop: '16px' } }, t('bbOpp')), h('div', { class: 'oppgrid' }, oppCards),
          can ? h('button', { class: 'btn gold go', onclick: () => { if (spendPearls(cost)) { sfx.levelUp(); startGame(); } } }, h('span', { html: icons.ballpark(40) }), t('bbPlay') + ' · ' + t('bbCost', { n: cost }))
            : h('div', {}, h('p', { class: 'notice' }, t('bbNeed', { n: cost - S.pearls.balance })), h('a', { class: 'btn gold', href: '#/quiz' }, t('bbEarn'))),
          h('p', { class: 'muted small' }, t('bbQNote'))),
        h('div', { class: 'card' }, h('h3', {}, t('bbHowTitle')), h('ol', { class: 'how' }, ['bbHow1', 'bbHow2', 'bbHow3', 'bbHow4'].map((k) => h('li', {}, t(k)))),
          h('h3', { style: { marginTop: '14px' } }, t('bbStats')),
          h('div', { class: 'gstats' }, [['bbGames', st.games], ['bbWins', st.wins], ['bbBest', st.bestRuns], ['bbHR', st.hr], ['bbAvg', avg]].map(([k, v]) => h('div', {}, h('small', {}, t(k)), h('b', {}, String(v))))))));
  }

  // ---------- game shell ----------
  let ui = {};
  function startGame() { g = newGame({ innings: uiOpt.innings, opp: uiOpt.opp }); bb().cur = g; used.clear(); save(); resumeGame(); }
  function resumeGame() {
    phase = 'game';
    const board = h('div', { class: 'scoreboard card', role: 'table' });
    const info = h('div', { class: 'bbinfo' });
    const field = fieldSvg();
    const panel = h('div', { class: 'bbpanel card' });
    const msg = h('div', { class: 'bbmsg', role: 'status', 'aria-live': 'polite' });
    fill(root, 
      h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('bbLeave'), onclick: () => { stopSpeaking(); sfx.tap(); save(); menu(); }, html: icons.back(34) }), h('h1', {}, t('bbTitle')), h('span', { class: 'chip' }, CFG.opp[g.opp].emoji + ' ' + t(OPP_NAME[g.opp]))),
      board, h('div', { class: 'bbgrid' }, h('div', { class: 'bbleft' }, field.wrap, info), h('div', { class: 'bbright' }, msg, panel)));
    ui = { board, info, field, panel, msg };
    drawBoard(); drawInfo(); drawBases();
    if (g.half === 'opp') defense(); else atBat();
  }
  const cleanupGame = () => { cancelAnimationFrame(raf); timers.splice(0).forEach(clearTimeout); };

  function drawBoard() {
    const n = Math.max(g.innings, g.inn), cells = Array.from({ length: n }, (_, i) => i);
    const row = (label, arr, tot) => h('tr', {}, h('th', {}, label), cells.map((i) => h('td', { class: i + 1 === g.inn ? 'cur' : '' }, arr[i] != null ? arr[i] : '·')), h('td', { class: 'tot' }, tot));
    fill(ui.board, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}), cells.map((i) => h('th', {}, i + 1)), h('th', { class: 'tot' }, t('bbTotal')))),
      h('tbody', {}, row(t('bbYou'), g.line.me, g.score.me), row(t(OPP_NAME[g.opp]), g.line.opp, g.score.opp))));
  }
  function drawInfo() {
    const outsDots = [0, 1, 2].map((i) => h('i', { class: 'dot out' + (i < g.outs ? ' on' : '') }));
    const balls = [0, 1, 2, 3].map((i) => h('i', { class: 'dot ball' + (i < g.balls ? ' on' : '') }));
    const strikes = [0, 1, 2].map((i) => h('i', { class: 'dot strike' + (i < g.strikes ? ' on' : '') }));
    const on = g.bases.filter(Boolean).length;
    fill(ui.info, 
      h('div', { class: 'ib' }, h('b', {}, (g.inn > g.innings ? t('bbExtra') + ' ' : '') + t('bbInnLabel', { n: g.inn })), h('small', {}, g.half === 'me' ? t('bbTop') : t('bbBottom'))),
      g.half === 'me' ? h('div', { class: 'counts' },
        h('div', {}, h('small', {}, t('bbBalls')), h('span', {}, balls)), h('div', {}, h('small', {}, t('bbStrikes')), h('span', {}, strikes)), h('div', {}, h('small', {}, t('bbOuts')), h('span', {}, outsDots))) : null,
      g.half === 'me' && g.outs > 0 ? h('small', { class: 'muted' }, t('bbOutsFrac', { n: g.outs })) : null,
      g.half === 'me' ? h('small', { class: 'muted' }, on === 0 ? t('bbBasesEmpty') : on === 3 ? t('bbBasesLoaded') : t('bbOnBase', { n: on })) : null);
  }
  function drawBases() { ui.field.setBases(g.bases); }
  function say(text, cls = '') { ui.msg.className = 'bbmsg ' + cls; ui.msg.textContent = text; }
  const persist = () => { bb().cur = g; save(); };

  // ---------- at-bat: choose ----------
  function atBat() {
    phase = 'choose'; drawInfo(); drawBases(); ui.field.reset(); persist();
    say(t('bbBat') + ' · ' + t('bbCount', { b: g.balls, s: g.strikes }));
    const btn = (hit) => {
      const [nk, sk] = HITKEYS[hit];
      return h('button', { class: 'swingbtn s' + hit, onclick: () => { sfx.pop(); ask(hit); } },
        h('span', { class: 'sb-t' }, h('strong', {}, t(nk)), h('small', {}, t(sk))),
        h('span', { class: 'sb-r' }, '★'.repeat(hit) + '☆'.repeat(4 - hit)), h('span', { class: 'sb-d' }, hit === 1 ? '' : t('bbHard')));
    };
    fill(ui.panel, h('h3', {}, t('bbPick')), h('div', { class: 'swings' }, [1, 2, 3, 4].map(btn)),
      h('button', { class: 'btn ghost waitbtn', onclick: () => { sfx.tap(); doTake(); } }, h('strong', {}, t('bbWait')), h('small', {}, t('bbWaitSub'))));
  }
  function doTake() {
    fill(ui.panel, );
    const o = takePitch(g, Math.random);
    ui.field.pitchOnly(CFG.opp[g.opp].ms * 0.7, () => {
      let m = '', good = false;
      if (o.kind === 'ball') { m = t('bbBall', { b: g.balls }); sfx.soft(); }
      else if (o.kind === 'strike') { m = t('bbStrike', { s: g.strikes }); sfx.crack(); }
      else if (o.kind === 'walk') { m = o.runs ? t('bbWalkRun') : t('bbWalk'); sfx.found(); good = true; }
      else { m = t('bbK'); sfx.soft(); }
      after(o, m, good);
    });
  }

  // ---------- the question ----------
  function ask(want) {
    phase = 'ask';
    const q = prepare(pickQuestion(DELTA[want]));
    let tries = 0, done = false; const dead2 = new Set();
    const hitName = t(HITKEYS[want][0]);
    const hintMsg = h('p', { class: 'qmsg', role: 'status' });
    const opts = h('div', { class: 'bbopts' + (q.shown.some((s) => String(s).length > 28) ? ' long' : '') }, q.shown.map((txt, k) => h('button', { class: 'ans', 'data-k': k, onclick: (e) => choose(k, e.currentTarget) }, h('span', { class: 'mark' }, String.fromCharCode(65 + k)), h('span', { class: 'lab' }, txt))));
    const readBtn = S.speak && canSpeak() ? h('button', { class: 'btn ghost icon', 'aria-label': t('bbRead'), onclick: () => speak(q.q + (S.lang === 'es' ? '. ' + q.shown.join('. ') : '')), html: icons.speaker(30) }) : null;
    say(t('bbQFor', { hit: hitName }));
    fill(ui.panel, h('div', { class: 'row', style: { justifyContent: 'space-between' } }, h('span', { class: 'chip on' }, '★'.repeat(want) + ' ' + hitName), readBtn), h('h2', { class: 'qtext' }, q.q), opts, hintMsg);
    function choose(k, b) {
      if (done || dead2.has(k)) return; sfx.tap();
      if (k === q.correctShown) {
        done = true; b.classList.add('right', 'pop'); opts.querySelectorAll('.ans').forEach((x) => { x.disabled = true; });
        sfx.correct(); recordAnswer({ ...q, slot: 'at' }, tries === 0 ? 1 : 0.6, { ms: 5000 });
        hintMsg.textContent = tries === 0 ? t('bbPowered') : t('bbPoweredWeak');
        later(() => swingPhase(want, tries === 0 ? 'first' : 'second'), 900);
        return;
      }
      sfx.wrong(); tries++; dead2.add(k); b.classList.add('try'); b.disabled = true;
      if (tries >= 2) {
        done = true; opts.querySelectorAll('.ans').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.correctShown) x.classList.add('right'); });
        recordAnswer({ ...q, slot: 'at' }, 0, { ms: 5000 });
        hintMsg.textContent = t('bbReveal', { a: q.shown[q.correctShown], why: q.why || '' });
        const go2 = h('button', { class: 'btn alt', onclick: () => swingPhase(want, 'wrong') }, t('next')); ui.panel.append(go2);
      } else hintMsg.textContent = t('bbTry2');
    }
  }

  // ---------- the swing: tap when the ball is in the ring ----------
  function swingPhase(want, answer) {
    if (answer === 'wrong') {
      const o = swing(g, { want, answer, timing: 'miss' }, Math.random);
      ui.field.pitchOnly(CFG.opp[g.opp].ms * 0.6, () => { after(o, outcomeText(o, 'miss', true), false); });
      fill(ui.panel, h('p', { class: 'center' }, t('bbPitching')));
      return;
    }
    phase = 'swing';
    const ms = CFG.opp[g.opp].ms;
    const swingBtn = h('button', { class: 'btn gold go swingnow', disabled: true, onclick: () => tap() }, t('bbSwing'));
    fill(ui.panel, h('p', { class: 'center' }, t('bbTapHint')), swingBtn);
    say(t('bbPitching'));
    let tapped = false;
    const p = CFG.perfect[want];
    ui.field.pitch({ ms, want, ring: p, onStart: () => { swingBtn.disabled = false; }, onEnd: (tt) => { if (!tapped) resolve(null); } });
    function tap() {
      if (tapped) return; tapped = true; swingBtn.disabled = true;
      const tt = ui.field.progress();
      resolve(tt);
    }
    ui.field.onTap = tap;
    function resolve(tt) {
      const timing = timingOf(tt, want);
      ui.field.swingAt(timing);
      sfx.crack();
      const o = swing(g, { want, answer, timing }, Math.random);
      ui.field.flight(o, () => { after(o, outcomeText(o, timing, false), ['single', 'double', 'triple', 'homer', 'sacfly'].includes(o.kind), timing); });
    }
  }
  function outcomeText(o, timing, wrongAns) {
    const k = o.kind; let m = '';
    if (k === 'single' || k === 'double' || k === 'triple' || k === 'homer') m = t('bbHit' + o.hit);
    else if (k === 'foul') m = timing === 'early' ? t('bbFoulEarly') : timing === 'late' ? t('bbFoulLate') : t('bbFoul');
    else if (k === 'strike') m = wrongAns ? t('bbSwingWrong') + ' ' + t('bbStrike', { s: g.strikes }) : t('bbMiss', { s: g.strikes });
    else if (k === 'strikeout') m = t('bbK');
    else if (k === 'groundout') m = t('bbGround'); else if (k === 'flyout') m = t('bbFly'); else if (k === 'sacfly') m = t('bbSacFly');
    return m;
  }

  // ---------- after every pitch ----------
  function after(o, text, good, timing) {
    drawInfo(); drawBases(); drawBoard(); persist();
    const k = o.kind;
    const big = k === 'homer';
    if (big) { sfx.fanfare(); sfx.cheer(); confetti(innerWidth / 2, innerHeight / 3); ui.field.banner(t('bbHit4'), 'hr'); }
    else if (k === 'triple' || k === 'double') { sfx.cheer(); ui.field.banner(t('bbHit' + o.hit), 'xb'); }
    else if (k === 'single') { sfx.found(); ui.field.banner(t('bbHit1'), 'b1'); }
    else if (k === 'sacfly') sfx.found();
    let more = text;
    if (o.runs != null && ['single', 'double', 'triple', 'homer', 'sacfly', 'walk'].includes(k)) more += ' ' + (o.runs === 0 ? t('bbRuns0') : o.runs === 1 ? t('bbRuns1') : t('bbRunsN', { n: o.runs }));
    if (timing === 'perfect' && o.hit) more += ' ' + t('bbPerfect');
    say(more, good ? 'good' : '');
    const over = halfOver(g);
    const btn = h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); if (over) halfEnd(); else atBat(); } }, over ? t('next') : (['ball', 'strike', 'foul'].includes(k) ? t('bbNextPitch') : t('bbNext')));
    fill(ui.panel, btn);
  }

  // ---------- half-inning ends: defense ----------
  let runsThisHalf = 0;
  function halfEnd() {
    // runs scored by Max this half = difference since the half began (tracked through the score)
    const prev = g.line.me.reduce((a, b) => a + (b || 0), 0);
    runsThisHalf = g.score.me - prev;
    endMyHalf(g, runsThisHalf);
    drawBoard(); persist();
    defense(true);
  }
  function defense(fresh) {
    phase = 'defense'; drawInfo(); drawBases(); ui.field.reset();
    const team = t(OPP_NAME[g.opp]);
    say(t('bbDefTitle', { team }));
    if (fresh && runsThisHalf != null) { /* summary of Max's half shown in the panel below */ }
    const q = prepare(pickQuestion(0));
    let tries = 0, done = false; const dead2 = new Set();
    const hintMsg = h('p', { class: 'qmsg', role: 'status' });
    const opts = h('div', { class: 'bbopts' + (q.shown.some((s) => String(s).length > 28) ? ' long' : '') }, q.shown.map((txt, k) => h('button', { class: 'ans', 'data-k': k, onclick: (e) => choose(k, e.currentTarget) }, h('span', { class: 'mark' }, String.fromCharCode(65 + k)), h('span', { class: 'lab' }, txt))));
    fill(ui.panel, h('p', { class: 'muted' }, (fresh ? t('bbHalfDone', { n: runsThisHalf }) + ' ' : '') + t('bbDefSub')), h('h2', { class: 'qtext' }, q.q), opts, hintMsg);
    function finish(saved) {
      done = true;
      const o = oppHalf(g, saved, Math.random);
      const r = endOppHalf(g, o.runs);
      drawBoard(); persist();
      let m = saved && o.prevented ? t('bbDefSaved', { team, n: o.runs + o.prevented, p: o.prevented }) : o.runs ? (saved ? t('bbDefOk', { team, n: o.runs }) : t('bbDefMissed', { team, n: o.runs })) : t('bbDefNone', { team });
      if (saved && o.prevented) { sfx.cheer(); }
      let diff = g.score.me - g.score.opp;
      m += ' ' + t('bbScoreNow', { a: g.score.me, b: g.score.opp }) + ' ' + (diff > 0 ? t('bbLead', { n: diff }) : diff < 0 ? t('bbTrail', { n: -diff }) : t('bbTied'));
      say(m, saved ? 'good' : '');
      const btn = h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); if (r.over) endGame(r.result); else { drawBoard(); atBat(); } } }, r.over ? t('next') : t('bbNextInn'));
      fill(ui.panel, btn);
    }
    function choose(k, b) {
      if (done || dead2.has(k)) return; sfx.tap();
      if (k === q.correctShown) { b.classList.add('right', 'pop'); opts.querySelectorAll('.ans').forEach((x) => { x.disabled = true; }); sfx.correct(); recordAnswer({ ...q, slot: 'at' }, tries === 0 ? 1 : 0.6, { ms: 5000 }); later(() => finish(tries === 0), 700); return; }
      sfx.wrong(); tries++; dead2.add(k); b.classList.add('try'); b.disabled = true;
      if (tries >= 2) { opts.querySelectorAll('.ans').forEach((x) => { x.disabled = true; if (+x.dataset.k === q.correctShown) x.classList.add('right'); }); recordAnswer({ ...q, slot: 'at' }, 0, { ms: 5000 }); hintMsg.textContent = t('bbReveal', { a: q.shown[q.correctShown], why: q.why || '' }); ui.panel.append(h('button', { class: 'btn alt', onclick: () => finish(false) }, t('next'))); }
      else hintMsg.textContent = t('bbTry2');
    }
  }

  // ---------- final ----------
  function endGame(result) {
    phase = 'end'; ui.field.reset();
    const st = bb(), s = g.stats;
    st.games++; if (result === 'win') st.wins++; st.bestRuns = Math.max(st.bestRuns, g.score.me); st.hr += s.hr; st.hits += s.h; st.ab += s.ab; st.k += s.k; st.last = { result, me: g.score.me, opp: g.score.opp, opp_id: g.opp, innings: g.innings };
    st.cur = null; save(); awardBadges();
    if (result === 'win') { sfx.fanfare(); sfx.cheer(); confetti(innerWidth / 2, innerHeight / 3); setTimeout(() => confetti(innerWidth / 3, innerHeight / 3), 400); } else sfx.found();
    const cost = COST.baseball[g.innings], can = S.pearls.balance >= cost;
    fill(root, h('div', { class: 'screen-head' }, h('h1', {}, t('bbTitle'))),
      h('div', { class: 'card center summary', style: { maxWidth: '720px', margin: '10px auto' } },
        h('div', { html: icons.trophy(84) }), h('h1', {}, result === 'win' ? t('bbEndWin') : result === 'loss' ? t('bbEndLoss') : t('bbEndTie')),
        h('p', { class: 'big' }, t('bbFinal', { a: g.score.me, b: g.score.opp })),
        h('div', { class: 'scoreboard' }, boardClone()),
        h('p', { class: 'muted' }, result === 'win' ? t('bbWin1') : t('bbLose1')),
        h('div', { class: 'gstats' }, [['bbAB', s.ab], ['bbH', s.h], ['bbHR', s.hr], ['bbK2', s.k], ['bbWalks', s.bb], ['bbRBI', s.rbi], ['bbPerf', s.perfect]].map(([k, v]) => h('div', {}, h('small', {}, t(k)), h('b', {}, String(v))))),
        s.ab ? h('p', { class: 'muted' }, t('bbBat2', { n: s.h, m: s.ab })) : null,
        h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '14px' } },
          can ? h('button', { class: 'btn gold', onclick: () => { if (spendPearls(cost)) { startGame(); } } }, t('bbAgain') + ' · ' + t('bbCost', { n: cost })) : h('a', { class: 'btn gold', href: '#/quiz' }, t('bbEarn')),
          h('button', { class: 'btn ghost', onclick: () => menu() }, t('bbBack')), h('a', { class: 'btn ghost', href: '#/home' }, t('home')))));
  }
  function boardClone() { const d = h('div', { class: 'scoreboard card' }); const keep = ui.board; ui.board = d; drawBoard(); ui.board = keep; return d.firstChild; }

  menu();
  return () => { dead = true; cleanupGame(); stopSpeaking(); };

  // ---------- the field (SVG) ----------
  function fieldSvg() {
    const ns = 'http://www.w3.org/2000/svg';
    const wrap = h('div', { class: 'bbfield', role: 'img', 'aria-label': t('bbCaption') });
    wrap.innerHTML = `<svg viewBox="0 0 400 330" xmlns="${ns}">
      <rect width="400" height="330" rx="14" fill="#7CC27A"/>
      <path d="M200 300 L40 140 A226 226 0 0 1 360 140 Z" fill="#C89A63" opacity=".0"/>
      <path d="M200 296 L24 120 Q200 -20 376 120 Z" fill="#8AD088" stroke="#10303B" stroke-width="3"/>
      <path d="M200 262 L110 172 L200 98 L290 172 Z" fill="#D9A56B" stroke="#10303B" stroke-width="3"/>
      <circle cx="200" cy="178" r="18" fill="#C98E52" stroke="#10303B" stroke-width="2.5"/>
      <rect x="192" y="174" width="16" height="6" rx="2" fill="#fff" stroke="#10303B" stroke-width="1.5"/>
      <g id="bb-bases" stroke="#10303B" stroke-width="3">
        <rect class="base b1" x="283" y="165" width="22" height="22" rx="3" transform="rotate(45 294 176)" fill="#fff"/>
        <rect class="base b2" x="189" y="88" width="22" height="22" rx="3" transform="rotate(45 200 99)" fill="#fff"/>
        <rect class="base b3" x="95" y="165" width="22" height="22" rx="3" transform="rotate(45 106 176)" fill="#fff"/>
      </g>
      <path d="M200 284 l12 -10 v-12 h-24 v12z" fill="#fff" stroke="#10303B" stroke-width="3"/>
      <g class="ring-g" opacity="0"><ellipse class="ring" cx="200" cy="248" rx="30" ry="11" fill="none" stroke="#FFD166" stroke-width="5"/><ellipse class="ring2" cx="200" cy="248" rx="30" ry="11" fill="#FFD166" opacity=".25"/></g>
      <g class="batter"><circle cx="232" cy="268" r="9" fill="#FFE2B8" stroke="#10303B" stroke-width="2.5"/><path d="M232 277 v22 M232 285 l-10 8 M232 285 l12 6 M232 299 l-8 14 M232 299 l8 14" stroke="#10303B" stroke-width="4" stroke-linecap="round" fill="none"/><path class="bat" d="M238 270 l26 -26" stroke="#8B5A2B" stroke-width="6" stroke-linecap="round"/></g>
      <g class="pitcher"><circle cx="200" cy="168" r="7" fill="#FFE2B8" stroke="#10303B" stroke-width="2"/><path d="M200 175 v14 M200 180 l-8 5 M200 180 l8 5 M200 189 l-6 10 M200 189 l6 10" stroke="#10303B" stroke-width="3.2" stroke-linecap="round" fill="none"/></g>
      <circle class="ball" cx="200" cy="176" r="6" fill="#fff" stroke="#C0392B" stroke-width="2" opacity="0"/>
      <g class="runners"></g>
    </svg><div class="bbbanner" hidden></div>`;
    const svg = wrap.firstElementChild;
    const q = (s) => svg.querySelector(s);
    const ball = q('.ball'), ringG = q('.ring-g'), ring = q('.ring'), ring2 = q('.ring2'), bat = q('.bat'), runners = q('.runners'), banner = wrap.querySelector('.bbbanner');
    const Y0 = 176, Y1 = 264;       // ball path y from the mound to the plate zone
    const yAt = (tt) => Y0 + (Y1 - Y0) * tt;
    const api = { wrap, onTap: null };
    let start = 0, ms = 1400, running = false, cb = null;
    const BASEXY = [[294, 176], [200, 99], [106, 176]];
    api.setBases = (bases) => {
      svg.querySelectorAll('.base').forEach((b, i) => { b.setAttribute('fill', bases[i] ? '#FFD166' : '#fff'); });
      fill(runners, );
      bases.forEach((on, i) => { if (!on) return; const c = document.createElementNS(ns, 'g'); c.innerHTML = `<circle cx="${BASEXY[i][0]}" cy="${BASEXY[i][1] - 18}" r="8" fill="#FFE2B8" stroke="#10303B" stroke-width="2.5"/><path d="M${BASEXY[i][0] - 7} ${BASEXY[i][1] - 24} q7 -9 14 0" fill="#3B82F6" stroke="#10303B" stroke-width="2"/>`; runners.append(c); });
    };
    api.reset = () => { cancelAnimationFrame(raf); running = false; ball.setAttribute('opacity', '0'); ringG.setAttribute('opacity', '0'); bat.setAttribute('transform', ''); banner.hidden = true; api.onTap = null; };
    const place = (tt) => { ball.setAttribute('cy', yAt(tt)); ball.setAttribute('cx', 200); ball.setAttribute('r', 5 + 3 * tt); ball.setAttribute('opacity', '1'); };
    api.progress = () => (running ? (performance.now() - start) / ms : null);
    function loop(onDone) {
      const step = () => {
        if (!running) return;
        const tt = (performance.now() - start) / ms;
        place(Math.min(tt, 1.15));
        if (tt >= 1.12) { running = false; onDone?.(null); return; }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    api.pitch = ({ ms: m, want, ring: p, onStart, onEnd }) => {
      api.reset(); ms = m;
      // the glowing ring is where a PERFECT swing happens: its height shows the size of the perfect window
      const cy = yAt(SWEET), halfH = Math.max(7, p * (Y1 - Y0) * 1.0);
      ring.setAttribute('cy', cy); ring2.setAttribute('cy', cy); ring.setAttribute('ry', halfH); ring2.setAttribute('ry', halfH); ringG.setAttribute('opacity', '1');
      place(0); const startAt = performance.now() + 700; later(() => { start = performance.now(); running = true; sfx.whoosh(); onStart?.(); loop(onEnd); }, 700); void startAt;
    };
    api.pitchOnly = (m, done) => { api.reset(); ms = m; place(0); later(() => { start = performance.now(); running = true; sfx.whoosh(); loop(() => { ball.setAttribute('opacity', '0'); done(); }); }, 450); };
    api.swingAt = (timing) => { running = false; cancelAnimationFrame(raf); bat.animate([{ transform: 'rotate(60deg)' }, { transform: 'rotate(-70deg)' }], { duration: 160, fill: 'forwards', easing: 'ease-out' }); bat.style.transformOrigin = '238px 270px'; };
    // where the ball goes after the swing
    api.flight = (o, done) => {
      const k = o.kind; let to, dur = 700, arc = 0;
      if (k === 'homer') { to = [200 + (Math.random() - 0.5) * 120, -30]; dur = 1100; arc = 0; }
      else if (k === 'triple') { to = [330, 80]; dur = 900; }
      else if (k === 'double') { to = [80, 70]; dur = 850; }
      else if (k === 'single') { to = [230, 130]; dur = 650; }
      else if (k === 'foul') { to = Math.random() < 0.5 ? [20, 230] : [380, 230]; dur = 600; }
      else if (k === 'groundout') { to = [120, 190]; dur = 600; }
      else if (k === 'flyout' || k === 'sacfly') { to = [250, 100]; dur = 800; arc = 40; }
      else { to = [200, 300]; dur = 350; }      // strike: into the catcher's glove
      const from = [200, Math.min(yAt(1), 262)], t0 = performance.now(); ball.setAttribute('opacity', '1');
      const fly = () => {
        const u = Math.min(1, (performance.now() - t0) / dur), e = 1 - (1 - u) * (1 - u);
        ball.setAttribute('cx', from[0] + (to[0] - from[0]) * e); ball.setAttribute('cy', from[1] + (to[1] - from[1]) * e - Math.sin(u * Math.PI) * arc);
        ball.setAttribute('r', (k === 'homer' ? 8 - 4 * u : 7 - 2 * u));
        if (u < 1) raf = requestAnimationFrame(fly); else { if (k !== 'homer') ball.setAttribute('opacity', '0.0'); later(done, 250); }
      };
      raf = requestAnimationFrame(fly);
    };
    api.banner = (txt, cls) => { banner.textContent = txt; banner.className = 'bbbanner ' + cls; banner.hidden = false; setTimeout(() => { banner.hidden = true; }, 1700); };
    wrap.addEventListener('pointerdown', () => { if (api.onTap && running) api.onTap(); });
    return api;
  }
}
