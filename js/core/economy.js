// One place for every pearl number in the lab. Target pace: about 12 pearls per minute of play in ANY game.
//   quiz mission ......... ~13/min     word search ........ ~14/min     hangman ......... ~12/min
//   world map places ..... ~12/min     Find it! ........... ~14/min
// Costs below are chosen from that pace (see README "Pearls and pace").
export const PACE = 12; // pearls per minute, the design target

export const REWARD = {
  quiz: { easy: 3, at: 5, boss: 10, missionDone: 5, missionPerfect: 5, firstMissionToday: 15 },
  map: { right: 6, second: 3, stamp: 6, findRight: 3, findBonus: 5 },
  hero: { stamp: 6 },
  ws: { word: { 1: 3, 2: 4, 3: 5 }, finish: { 1: 10, 2: 15, 3: 20 } },
  hm: { win: { 1: 10, 2: 15, 3: 20 }, flawless: 5, loss: 3 },
};

// What things cost. unlock = one-time; season = a new season after the first (the unlock includes season 1).
export const COST = {
  stands: {
    lemonade: { unlock: 100, season: 75 },
    snack: { unlock: 300, season: 110 },       // Rob: the snack shack is the SECOND stand, exactly 300
    icecream: { unlock: 500, season: 130 },
    pizza: { unlock: 700, season: 0 },         // pizza is a fractions practice shop with no seasons
  },
  baseball: { 3: 150, 6: 270 },                // innings -> pearls (3 innings ~12 min of play)
};

// Daily ceiling: full rate up to SOFT, then half rate up to HARD. The cap counts pearls EARNED today and never
// shrinks when Max spends, but at 30 minutes/day nobody gets near it (30 min x 13 = ~390).
export const DAILY_SOFT = 400;
export const DAILY_HARD = 600;

/** Guessing must lose: wrong picks cost pearls; second tries pay half. (EV of blind guessing is negative for 2, 3 and 4 options.) */
export function penaltyFor(nOptions, base) {
  const n = nOptions || 4;
  return n <= 2 ? Math.ceil(base * 1.2) : Math.ceil(base * 0.6);
}
/** Pearls for a correct answer after `wrong` misses. A 2-option question pays nothing on a second try (it is a sure thing). */
export function payFor(nOptions, base, wrong) {
  if (wrong === 0) return base;
  if (wrong === 1 && nOptions > 2) return Math.floor(base / 2);
  return 0;
}
/** Expected value (pearls) of blindly guessing, with the quiz rule "two tries then the answer is shown". */
export function guessEV(nOptions, base) {
  const P = penaltyFor(nOptions, base), n = nOptions;
  const pFirst = 1 / n;
  // after the first miss (-P): a second try pays half if right, or costs another P if wrong; 2-option questions end at once
  const afterMiss = n > 2 ? -P + (1 / (n - 1)) * payFor(n, base, 1) + ((n - 2) / (n - 1)) * -P : -P;
  return pFirst * base + (1 - pFirst) * afterMiss;
}

// Milestones: moments when Max can newly afford something. The announcer plays at most once per milestone per day.
export function milestoneCosts(S) {
  const out = [];
  for (const [id, c] of Object.entries(COST.stands)) { if (!S.unlocked[id] && c.unlock) out.push({ id: 'unlock:' + id, cost: c.unlock }); }
  out.push({ id: 'baseball:3', cost: COST.baseball[3] });
  for (const id of ['lemonade', 'snack', 'icecream']) if (S.unlocked[id] && S.stands[id]?.tickets === 0) out.push({ id: 'season:' + id, cost: COST.stands[id].season });
  return out;
}
export function crossed(S, before, after) {
  return milestoneCosts(S).find((m) => before < m.cost && after >= m.cost) || null;
}
