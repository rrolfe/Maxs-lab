// Max's Ballpark: an arcade baseball game of timing. The pitcher throws, Max taps SWING when the ball is in the glowing ring and lets pitches
// outside the dotted strike zone go by. No questions (Rob, Nov 10 2026). Games cost pearls (see js/core/economy.js); on defense he taps CATCH to save a run.
// Rules live in js/baseball/engine.js (pure, bot-tested); the picture and every animation live in js/baseball/field.js.
import { S, save, spendPearls } from '../core/store.js';
import { h, confetti } from '../core/dom.js';
import { icons } from '../core/icons.js';
import { t, addStrings } from '../core/i18n.js';
import { sfx, stopSpeaking } from '../core/audio.js';
import { COST } from '../core/economy.js';
import { awardBadges } from '../core/badges.js';
import { newGame, nextPitch, takePitch, swingAt, halfOver, oppHalf, endMyHalf, endOppHalf, timingOf, CFG } from '../baseball/engine.js';
import { makeField, CONTACT_MS } from '../baseball/field.js';

addStrings({
  en: {
    bbTitle: 'Max’s Ballpark', bbSub: 'Watch the pitch, then tap SWING when the ball is in the glowing ring!', bbPlay: 'Play ball!', bbInnings: 'Innings', bbInn3: '3 innings', bbInn6: '6 innings', bbCost: '{n} pearls',
    bbOpp: 'Pick your opponent', bbOppDinos: 'Dino Rexes', bbOppRockets: 'Space Rockets', bbOppPirates: 'Sea Pirates', bbLvEasy: 'Rookie', bbLvMed: 'Pro', bbLvHard: 'All-Star', bbYou: 'Sharks',
    bbNeed: 'You need {n} more pearls for this game.', bbEarn: 'Earn pearls', bbResume: 'Resume your game', bbResumeSub: 'Inning {i}: {a} to {b}', bbForfeit: 'Start over',
    bbStats: 'Your stats', bbGames: 'Games', bbWins: 'Wins', bbBest: 'Best score', bbHR: 'Home runs', bbAvg: 'Batting average', bbNoAvg: '—', bbQNote: 'You earn the pearls for a game in the quiz, the stands and the word games.',
    bbHowTitle: 'How it works', bbHow1: 'The pitcher winds up and throws.', bbHow2: 'Tap SWING! when the ball is inside the glowing ring. Perfect timing makes the biggest hits!', bbHow3: 'Pitches outside the dotted box are balls: let them go by.', bbHow4: 'Three outs and the other team bats. Tap CATCH! to make a great play. Score more runs to win!',
    bbInnLabel: 'Inning {n}', bbExtra: 'Extra inning!', bbTop: 'You bat', bbBottom: 'They bat', bbOuts: 'Outs', bbBalls: 'Balls', bbStrikes: 'Strikes', bbOutsFrac: '{n} out = {n}/3 of an inning',
    bbCount: 'Count {b}-{s}', bbBat: 'At bat', bbWait: 'Get ready…', bbSwing: 'SWING!', bbTapHint: 'Tap SWING! (or tap the picture) when the ball is in the glowing ring.', bbPitching: 'Here comes the pitch…',
    bbMiss: 'Swing and a miss! Strike {s}.', bbChase: 'That one was outside the box. Strike {s}.', bbCalled: 'Strike {s}! That one was in the box.', bbBall: 'Ball {b}. Good eye!', bbFoul: 'Foul ball!', bbFoulLate: 'Too late: foul ball.', bbFoulEarly: 'Too early: foul ball.', bbWalk: 'Ball four: a walk! Take your base.', bbWalkRun: 'Ball four, bases loaded: a run scores!', bbK: 'Strike three! You are out.', bbKLook: 'Strike three, looking! Swing at pitches in the box.',
    bbGround: 'Grounder: out at first.', bbFly: 'Fly ball: caught. Out!', bbSacFly: 'Sacrifice fly! The runner scores.',
    bbHit1: 'SINGLE!', bbHit2: 'DOUBLE!', bbHit3: 'TRIPLE!', bbHit4: 'HOME RUN!', bbRuns0: 'No runs yet.', bbRuns1: '1 run scores!', bbRunsN: '{n} runs score!', bbPerfect: 'Perfect timing!',
    bbNext: 'Next batter', bbNextPitch: 'Next pitch', bbHalfDone: 'Three outs! You scored {n} this inning.', bbDefTitle: 'Defense! {team} is up to bat', bbDefSub: 'A fly ball is coming! Tap CATCH! when the ring closes around the spot where it lands.', bbDefGo: 'Take the field', bbCatch: 'CATCH!', bbDefHint: 'Tap CATCH! when the ring turns green.',
    bbDefOk: '{team} scored {n}.', bbDefNone: '{team} did not score. Nice defense!', bbDefSaved: 'GREAT CATCH! {team} would have scored {n}, but you saved {p}!', bbDefMissed: 'It dropped in. {team} scored {n}.',
    bbScoreNow: 'It is {a} to {b}.', bbLead: 'You lead by {n}.', bbTrail: 'You trail by {n}.', bbTied: 'The game is tied!', bbNextInn: 'Next inning',
    bbEndWin: 'YOU WIN!', bbEndLoss: 'Good game! Almost…', bbEndTie: 'A tie! What a game.', bbFinal: 'Final: {a} to {b}', bbAgain: 'Play again', bbBack: 'Back to the ballpark', bbAB: 'At bats', bbH: 'Hits', bbK2: 'Strikeouts', bbWalks: 'Walks', bbRBI: 'Runs driven in', bbBat2: 'Batting average: {n} hits in {m} at bats', bbPerf: 'Perfect swings',
    bbLose1: 'Every great player loses sometimes. Wait for a pitch in the box and try again!', bbWin1: 'Sharks win! Try a tougher team next.',
    bbTotal: 'R', bbLeave: 'Leave the game', bbCaption: 'Ballpark', bbOnBase: '{n} on base', bbBasesEmpty: 'Bases empty', bbBasesLoaded: 'Bases loaded!',
  },
  es: {
    bbTitle: 'El estadio de Max', bbSub: '¡Mira el lanzamiento y toca BATEAR cuando la pelota esté en el anillo brillante!', bbPlay: '¡A jugar!', bbInnings: 'Entradas', bbInn3: '3 entradas', bbInn6: '6 entradas', bbCost: '{n} perlas',
    bbOpp: 'Elige a tu rival', bbOppDinos: 'Dino Rexes', bbOppRockets: 'Cohetes Espaciales', bbOppPirates: 'Piratas del Mar', bbLvEasy: 'Novato', bbLvMed: 'Profesional', bbLvHard: 'Estrella', bbYou: 'Tiburones',
    bbNeed: 'Te faltan {n} perlas para este juego.', bbEarn: 'Ganar perlas', bbResume: 'Sigue tu juego', bbResumeSub: 'Entrada {i}: {a} a {b}', bbForfeit: 'Empezar de nuevo',
    bbStats: 'Tus estadísticas', bbGames: 'Juegos', bbWins: 'Victorias', bbBest: 'Mejor marcador', bbHR: 'Jonrones', bbAvg: 'Promedio de bateo', bbNoAvg: '—', bbQNote: 'Las perlas para un juego se ganan en las preguntas, los puestos y los juegos de palabras.',
    bbHowTitle: 'Cómo se juega', bbHow1: 'El lanzador se prepara y lanza.', bbHow2: '¡Toca BATEAR! cuando la pelota esté dentro del anillo brillante. ¡El tiempo perfecto da los batazos más grandes!', bbHow3: 'Los lanzamientos fuera de la caja de puntos son bolas: déjalos pasar.', bbHow4: 'Con tres outs batea el otro equipo. ¡Toca ATRAPAR! para hacer una gran jugada. ¡Anota más carreras para ganar!',
    bbInnLabel: 'Entrada {n}', bbExtra: '¡Entrada extra!', bbTop: 'Bateas tú', bbBottom: 'Batea el rival', bbOuts: 'Outs', bbBalls: 'Bolas', bbStrikes: 'Strikes', bbOutsFrac: '{n} out = {n}/3 de una entrada',
    bbCount: 'Cuenta {b}-{s}', bbBat: 'Al bate', bbWait: 'Prepárate…', bbSwing: '¡BATEAR!', bbTapHint: 'Toca BATEAR (o toca la imagen) cuando la pelota esté en el anillo brillante.', bbPitching: 'Ahí viene el lanzamiento…',
    bbMiss: '¡Se te pasó! Strike {s}.', bbChase: 'Esa estaba fuera de la caja. Strike {s}.', bbCalled: '¡Strike {s}! Esa estaba dentro de la caja.', bbBall: 'Bola {b}. ¡Buen ojo!', bbFoul: '¡Foul!', bbFoulLate: 'Muy tarde: foul.', bbFoulEarly: 'Muy temprano: foul.', bbWalk: 'Bola cuatro: ¡base por bolas! Toma tu base.', bbWalkRun: 'Bola cuatro con bases llenas: ¡anota una carrera!', bbK: '¡Strike tres! Estás out.', bbKLook: '¡Strike tres sin batear! Batea los lanzamientos dentro de la caja.',
    bbGround: 'Rodado: out en primera.', bbFly: 'Elevado: atrapado. ¡Out!', bbSacFly: '¡Elevado de sacrificio! Anota el corredor.',
    bbHit1: '¡SENCILLO!', bbHit2: '¡DOBLE!', bbHit3: '¡TRIPLE!', bbHit4: '¡JONRÓN!', bbRuns0: 'Todavía sin carreras.', bbRuns1: '¡Anota 1 carrera!', bbRunsN: '¡Anotan {n} carreras!', bbPerfect: '¡Tiempo perfecto!',
    bbNext: 'Siguiente bateador', bbNextPitch: 'Siguiente lanzamiento', bbHalfDone: '¡Tres outs! Anotaste {n} en esta entrada.', bbDefTitle: '¡Defensa! Batea {team}', bbDefSub: '¡Viene un elevado! Toca ATRAPAR cuando el anillo se cierre donde va a caer.', bbDefGo: 'Salir al campo', bbCatch: '¡ATRAPAR!', bbDefHint: 'Toca ATRAPAR cuando el anillo se ponga verde.',
    bbDefOk: '{team} anotó {n}.', bbDefNone: '{team} no anotó. ¡Buena defensa!', bbDefSaved: '¡GRAN ATRAPADA! {team} habría anotado {n}, ¡pero salvaste {p}!', bbDefMissed: 'Cayó. {team} anotó {n}.',
    bbScoreNow: 'Va {a} a {b}.', bbLead: 'Ganas por {n}.', bbTrail: 'Pierdes por {n}.', bbTied: '¡El juego está empatado!', bbNextInn: 'Siguiente entrada',
    bbEndWin: '¡GANASTE!', bbEndLoss: '¡Buen juego! Casi…', bbEndTie: '¡Empate! Qué juegazo.', bbFinal: 'Final: {a} a {b}', bbAgain: 'Jugar otra vez', bbBack: 'Volver al estadio', bbAB: 'Turnos al bate', bbH: 'Hits', bbK2: 'Ponches', bbWalks: 'Bases por bolas', bbRBI: 'Carreras impulsadas', bbBat2: 'Promedio de bateo: {n} hits en {m} turnos', bbPerf: 'Bateos perfectos',
    bbLose1: 'Todos los grandes jugadores pierden a veces. ¡Espera un lanzamiento dentro de la caja e inténtalo otra vez!', bbWin1: '¡Ganan los Tiburones! Prueba un equipo más difícil.',
    bbTotal: 'C', bbLeave: 'Salir del juego', bbCaption: 'Estadio', bbOnBase: '{n} en base', bbBasesEmpty: 'Bases vacías', bbBasesLoaded: '¡Bases llenas!',
  },
});

const OPPS = ['dinos', 'rockets', 'pirates'];
function fill(node, ...kids) { node.replaceChildren(...kids.filter((k) => k != null && k !== false)); }
const OPP_LEVEL = { dinos: 'bbLvEasy', rockets: 'bbLvMed', pirates: 'bbLvHard' };
const OPP_NAME = { dinos: 'bbOppDinos', rockets: 'bbOppRockets', pirates: 'bbOppPirates' };
const uiOpt = { innings: 3, opp: 'rockets' };
const bb = () => (S.baseball ||= { games: 0, wins: 0, bestRuns: 0, hr: 0, hits: 0, ab: 0, k: 0, last: null });

export async function mount(el) {
  let dead = false, curTap = null;
  const timers = [];
  const later = (fn, ms) => { const id = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(id); return id; };
  const root = h('div', { class: 'bb' }); el.append(root);
  let g = null;                       // the game state (engine)
  let field = null;
  let ui = {};
  const onKey = (e) => { if ((e.code === 'Space' || e.key === 'Enter') && curTap && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) { e.preventDefault(); curTap(); } };
  addEventListener('keydown', onKey);

  // ---------- menu ----------
  function menu() {
    stopSpeaking(); field?.stop(); curTap = null;
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
        h('div', { class: 'row' }, h('button', { class: 'btn gold', onclick: () => { g = cur; resumeGame(); } }, t('play')), h('button', { class: 'btn ghost small', onclick: () => { st.cur = null; save(); menu(); } }, t('bbForfeit')))) : '',
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
  function startGame() { g = newGame({ innings: uiOpt.innings, opp: uiOpt.opp }); bb().cur = g; save(); resumeGame(); }
  function resumeGame() {
    field?.stop();
    field = makeField(g.opp);
    field.wrap.addEventListener('pointerdown', () => { if (curTap) curTap(); });
    const board = h('div', { class: 'scoreboard card', role: 'table' });
    const info = h('div', { class: 'bbinfo' });
    const panel = h('div', { class: 'bbpanel card' });
    const msg = h('div', { class: 'bbmsg', role: 'status', 'aria-live': 'polite' });
    fill(root,
      h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('bbLeave'), onclick: () => { stopSpeaking(); sfx.tap(); field.stop(); curTap = null; save(); menu(); }, html: icons.back(34) }), h('h1', {}, t('bbTitle')), h('span', { class: 'chip' }, CFG.opp[g.opp].emoji + ' ' + t(OPP_NAME[g.opp]))),
      h('div', { class: 'bbgrid' }, h('div', { class: 'bbleft' }, field.wrap, info), h('div', { class: 'bbright' }, board, msg, panel)));
    ui = { board, info, panel, msg };
    drawBoard(); drawInfo(); drawBases();
    if (g.half === 'opp') defense(); else atBat();
  }

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
  function drawBases() { field.setBases(g.bases); }
  function say(text, cls = '') { ui.msg.className = 'bbmsg ' + cls; ui.msg.textContent = text; }
  const persist = () => { bb().cur = g; save(); };

  // ---------- at bat: the pitch, the swing ----------
  function atBat() {
    drawInfo(); drawBases(); field.reset(); persist();
    say(t('bbBat') + ' · ' + t('bbCount', { b: g.balls, s: g.strikes }));
    const btn = h('button', { class: 'btn gold go swingnow', disabled: true }, t('bbWait'));
    fill(ui.panel, btn, h('p', { class: 'center muted' }, t('bbTapHint')));
    later(() => throwPitch(btn), 700);
  }
  function throwPitch(btn) {
    const p = nextPitch(g.opp);
    let state = 'wind', swung = false, result = null;
    field.pitch(p, {
      onRelease: () => { state = 'fly'; btn.disabled = false; btn.textContent = t('bbSwing'); curTap = tap; btn.onclick = tap; say(t('bbPitching')); },
      onPlate: () => {        // the ball reached the catcher's mitt
        curTap = null; state = 'done';
        if (swung) { sfx.crack(); field.pop(); finish(result); }
        else { const o = takePitch(g, p); o.timing = null; sfx[o.kind === 'strike' || o.kind === 'strikeout' ? 'crack' : 'soft'](); field.pop(o.kind !== 'ball'); finish(o); }
      },
    });
    function tap() {
      if (swung || state !== 'fly') return;
      const tau = field.tau(); if (tau == null) return;
      swung = true; curTap = null; btn.disabled = true;
      const timing = tau >= 1 ? 'miss' : timingOf(tau + CONTACT_MS / p.ms);
      field.swing(); sfx.whoosh();
      result = swingAt(g, p, timing);
      if (!['strike', 'strikeout'].includes(result.kind)) {
        state = 'hit';
        later(() => { sfx.crack(); field.hit(result, () => finish(result)); }, CONTACT_MS);
      }
    }
    function finish(o) {
      drawInfo(); drawBases(); drawBoard(); persist();
      const k = o.kind, hit = ['single', 'double', 'triple', 'homer'].includes(k);
      if (k === 'homer') { sfx.fanfare(); sfx.cheer(); confetti(innerWidth / 2, innerHeight / 3); field.banner(t('bbHit4'), 'hr', 1800); }
      else if (k === 'triple' || k === 'double') { sfx.cheer(); field.banner(t('bbHit' + o.hit), 'xb', 1500); }
      else if (k === 'single') { sfx.found(); field.banner(t('bbHit1'), 'b1', 1300); }
      else if (k === 'sacfly' || k === 'walk') sfx.found();
      let more = outcomeText(o, p);
      if (o.runs != null && ['single', 'double', 'triple', 'homer', 'sacfly', 'walk'].includes(k)) more += ' ' + (o.runs === 0 ? t('bbRuns0') : o.runs === 1 ? t('bbRuns1') : t('bbRunsN', { n: o.runs }));
      if (o.timing === 'perfect' && hit) more += ' ' + t('bbPerfect');
      say(more, hit || k === 'walk' || k === 'sacfly' || k === 'ball' ? 'good' : '');
      const over = halfOver(g);
      fill(ui.panel, h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); if (over) halfEnd(); else atBat(); } }, over ? t('next') : (['ball', 'strike', 'foul'].includes(k) ? t('bbNextPitch') : t('bbNext'))));
    }
  }
  function outcomeText(o, p) {
    const k = o.kind;
    if (['single', 'double', 'triple', 'homer'].includes(k)) return t('bbHit' + o.hit);
    if (k === 'foul') return o.timing === 'early' ? t('bbFoulEarly') : o.timing === 'late' ? t('bbFoulLate') : t('bbFoul');
    if (k === 'ball') return t('bbBall', { b: g.balls });
    if (k === 'walk') return o.runs ? t('bbWalkRun') : t('bbWalk');
    if (k === 'strike') return o.looking ? t('bbCalled', { s: g.strikes }) : !p.inZone ? t('bbChase', { s: g.strikes }) : t('bbMiss', { s: g.strikes });
    if (k === 'strikeout') return o.looking ? t('bbKLook') : t('bbK');
    if (k === 'groundout') return t('bbGround');
    if (k === 'flyout') return t('bbFly');
    if (k === 'sacfly') return t('bbSacFly');
    return '';
  }

  // ---------- half-inning ends: defense ----------
  let runsThisHalf = 0;
  function halfEnd() {
    const prev = g.line.me.reduce((a, b) => a + (b || 0), 0);
    runsThisHalf = g.score.me - prev;
    endMyHalf(g, runsThisHalf);
    drawBoard(); persist();
    defense(true);
  }
  function defense(fresh) {
    drawInfo(); drawBases(); field.reset(); field.setBases([false, false, false]);
    const team = t(OPP_NAME[g.opp]);
    say(t('bbDefTitle', { team }));
    const start = h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); play(); } }, t('bbDefGo'));
    fill(ui.panel, h('p', { class: 'muted' }, (fresh ? t('bbHalfDone', { n: runsThisHalf }) + ' ' : '') + t('bbDefSub')), start);
    function play() {
      const cbtn = h('button', { class: 'btn gold go swingnow' }, t('bbCatch'));
      fill(ui.panel, cbtn, h('p', { class: 'center muted' }, t('bbDefHint')));
      let ctl = null;
      const doCatch = () => { if (!ctl) return; const u = ctl.tau(); curTap = null; cbtn.disabled = true; ctl.finish(u >= 0.78 && u <= 1.1); };
      cbtn.onclick = doCatch; curTap = doCatch;
      sfx.whoosh();
      ctl = field.fly(1900, (saved) => { curTap = null; finish(saved); });
    }
    function finish(saved) {
      const o = oppHalf(g, saved, Math.random);
      const r = endOppHalf(g, o.runs);
      drawBoard(); persist();
      let m = saved && o.prevented ? t('bbDefSaved', { team, n: o.runs + o.prevented, p: o.prevented }) : o.runs ? (saved ? t('bbDefOk', { team, n: o.runs }) : t('bbDefMissed', { team, n: o.runs })) : t('bbDefNone', { team });
      if (saved && o.prevented) sfx.cheer();
      const diff = g.score.me - g.score.opp;
      m += ' ' + t('bbScoreNow', { a: g.score.me, b: g.score.opp }) + ' ' + (diff > 0 ? t('bbLead', { n: diff }) : diff < 0 ? t('bbTrail', { n: -diff }) : t('bbTied'));
      say(m, saved ? 'good' : '');
      fill(ui.panel, h('button', { class: 'btn gold go', onclick: () => { sfx.pop(); if (r.over) endGame(r.result); else { drawBoard(); atBat(); } } }, r.over ? t('next') : t('bbNextInn')));
    }
  }

  // ---------- final ----------
  function endGame(result) {
    field.stop(); curTap = null;
    const st = bb(), s = g.stats;
    st.games++; if (result === 'win') st.wins++; st.bestRuns = Math.max(st.bestRuns, g.score.me); st.hr += s.hr; st.hits += s.h; st.ab += s.ab; st.k += s.k; st.last = { result, me: g.score.me, opp: g.score.opp, opp_id: g.opp, innings: g.innings };
    st.cur = null; save(); awardBadges();
    if (result === 'win') { sfx.fanfare(); sfx.cheer(); confetti(innerWidth / 2, innerHeight / 3); later(() => confetti(innerWidth / 3, innerHeight / 3), 400); } else sfx.found();
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
  return () => { dead = true; timers.forEach(clearTimeout); field?.stop(); removeEventListener('keydown', onKey); stopSpeaking(); };
}
