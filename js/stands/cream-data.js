// The Ice Cream Parlor's big shop (Rob, Nov 11 2026): ~110 extras in nine paths, built from ideas by five "ice cream specialists"
// (operations, flavors, marketing, trucks and events, and a kids' game designer). Pure data: no DOM, no imports.
// Old ids (sign table freezer cone toppings helper truck party shop) keep their effects, so nobody's saved game changes.
// fx: traffic (+% customers), flat (+customers a day), ptol (+% price people accept), serve (+customers served a day), stock (+tubs), cost (x price of a tub),
//     hot (+% on sunny and hot days), rain (+% on cloudy and rainy days), order (size of party orders), branch ($ a day from other shops), adday, gamefreq, evgame.
// A card whose id is in ADDONS is a topping or treat people add to their order. `secret` cards show a riddle until what they need is owned.
// tier N shows from the season in TIER_SEASON (sims.js). Prices are tuned with tools/tests/cream-ladder.mjs.
const U = (id, path, tier, price, fx, more) => ({ id, path, tier, price, fx, ...more });
const A = (id, path, tier, price, more) => ({ id, path, tier, price, fx: {}, ...more });

export const CREAM_UPGRADES = [
  // ---------- 🍦 Cones & Flavors: the quality of the ice cream (people pay more) and the weather treats
  U('creamy', 'cones', 1, 35, { ptol: 0.08 }),
  U('cone', 'cones', 2, 85, { ptol: 0.2 }),                                   // legacy: waffle cone maker
  U('sundaebowl', 'cones', 2, 140, { ptol: 0.08 }),
  U('popsicle', 'cones', 2, 210, { hot: 0.2 }),
  U('sorbet', 'cones', 3, 1300, { hot: 0.25 }),
  U('season', 'cones', 3, 1700, { traffic: 0.12 }),
  U('froyo', 'cones', 3, 2000, { traffic: 0.2 }),
  U('twist', 'cones', 4, 6000, { traffic: 0.15 }, { req: ['creamy'] }),
  U('gelato', 'cones', 4, 8000, { ptol: 0.15 }, { req: ['creamy'] }),
  U('fountain', 'cones', 5, 23000, { traffic: 0.25 }, { req: ['sundaebowl'] }),
  U('celebchef', 'cones', 5, 39000, { ptol: 0.25 }, { req: ['gelato'] }),
  U('nitro', 'cones', 6, 60000, { traffic: 0.3 }, { req: ['twist'], milestone: true }),
  U('flavorlab', 'cones', 6, 100000, { ptol: 0.3 }, { req: ['season', 'gelato'], milestone: true }),
  U('chomp', 'cones', 4, 9000, { ptol: 0.1 }, { req: ['gummyshark', 'sundaebowl'], secret: true }),
  U('chipasaurus', 'cones', 4, 12000, { ptol: 0.15 }, { req: ['dinodirt', 'creamy'], secret: true }),
  U('galaxy', 'cones', 5, 32000, { traffic: 0.2 }, { req: ['spacebeads', 'twist'], secret: true }),
  U('homerunflavor', 'cones', 5, 26000, { ptol: 0.1, evgame: 1.3 }, { req: ['dugout', 'cone'], secret: true }),
  U('inventor', 'cones', 6, 160000, { ptol: 0.25, traffic: 0.2 }, { req: ['chomp', 'chipasaurus', 'galaxy', 'homerunflavor'], secret: true, milestone: true, fire: true }),

  // ---------- 🍫 Toppings & Treats: things people add to their scoop (each one is an add-on, see ADDONS)
  U('toppings', 'treats', 2, 100, { ptol: 0.15, traffic: 0.1 }),                // legacy: toppings bar
  A('sprinkles', 'treats', 1, 20),
  A('zigzag', 'treats', 1, 30),
  A('whipcherry', 'treats', 1, 55),
  A('dipcone', 'treats', 2, 110, { req: ['cone'] }),
  A('hotfudge', 'treats', 2, 150, { req: ['sundaebowl'] }),
  A('caramel', 'treats', 2, 180, { req: ['sundaebowl'] }),
  A('dinodirt', 'treats', 2, 130),
  A('gummyshark', 'treats', 2, 140),
  A('shake', 'treats', 3, 1000),
  A('berrysauce', 'treats', 3, 775, { req: ['sundaebowl'] }),
  A('skillet', 'treats', 3, 1700, { req: ['hotfudge'] }),
  A('banana', 'treats', 4, 6000, { req: ['sundaebowl', 'whipcherry', 'hotfudge'] }),
  A('sandwich', 'treats', 4, 4000, { req: ['dinodirt'] }),
  A('float', 'treats', 4, 5000, { req: ['shake'] }),
  A('mochi', 'treats', 4, 4500),
  A('icecake', 'treats', 5, 26000, { req: ['party'] }),
  A('spacebeads', 'treats', 5, 19500, { req: ['popsicle'] }),
  A('brownie', 'treats', 5, 32000, { req: ['hotfudge', 'skillet'] }),
  A('megasundae', 'treats', 6, 48000, { req: ['banana', 'float', 'sandwich'], milestone: true }),

  // ---------- ❄️ Freezers & Machines: store more, scoop faster, pay less for the cream
  U('freezer', 'gear', 1, 55, { stock: 2 }),                                    // legacy: big freezer
  U('cooler', 'gear', 1, 30, { stock: 4 }),
  U('springscoop', 'gear', 1, 35, { serve: 10 }),
  U('dryice', 'gear', 2, 140, { stock: 8 }, { req: ['cooler'] }),
  U('bulk', 'gear', 2, 100, { cost: 0.9 }),
  U('tablet', 'gear', 2, 210, { serve: 25 }),
  U('dipcab', 'gear', 3, 2800, { stock: 24, traffic: 0.1 }, { req: ['freezer'] }),
  U('soft', 'gear', 4, 12000, { serve: 120, cost: 0.9 }, { req: ['dipcab'] }),
  U('superchill', 'gear', 4, 10000, { hot: 0.2 }, { req: ['dipcab'] }),
  U('walkin', 'gear', 4, 15000, { stock: 120 }, { req: ['dipcab'] }),
  U('dairy', 'gear', 4, 15000, { cost: 0.85 }, { req: ['bulk'] }),
  U('blast', 'gear', 5, 52000, { stock: 400 }, { req: ['walkin'] }),
  U('churn', 'gear', 5, 78000, { cost: 0.75 }, { req: ['dairy'] }),

  // ---------- 🥄 Scoopers & Registers: serve a longer line
  U('helper', 'crew', 2, 140, { serve: 40 }),                                   // legacy: hire a helper
  U('uniforms', 'crew', 3, 1000, { ptol: 0.05, traffic: 0.05 }),
  U('reg2', 'crew', 3, 1700, { serve: 60 }, { req: ['helper'] }),
  U('squad', 'crew', 3, 2400, { serve: 80 }, { req: ['reg2'] }),
  U('kiosk', 'crew', 4, 9000, { serve: 150 }, { req: ['reg2'] }),
  U('lead', 'crew', 4, 12000, { serve: 250 }, { req: ['squad'] }),
  U('rollers', 'crew', 4, 14000, { serve: 150, traffic: 0.1 }, { req: ['squad'] }),
  U('drive', 'crew', 5, 32000, { serve: 250, traffic: 0.1 }, { req: ['shop'] }),
  U('team20', 'crew', 5, 65000, { serve: 1200 }, { req: ['lead'] }),
  U('manager', 'crew', 5, 195000, { serve: 3000, cost: 0.95 }, { req: ['team20'] }),
  U('robo', 'crew', 6, 360000, { serve: 10000 }, { req: ['manager'], milestone: true }),

  // ---------- 📣 Shout It Out: more people hear about the parlor
  U('chalk', 'promo', 1, 25, { flat: 5 }),
  U('spoons', 'promo', 1, 35, { traffic: 0.1 }),
  U('flyers', 'promo', 1, 50, { traffic: 0.08 }),
  U('punch', 'promo', 1, 70, { traffic: 0.12 }),
  U('jingle', 'promo', 2, 210, { traffic: 0.15 }),
  U('crayon', 'promo', 2, 280, { flat: 15 }),
  U('photowall', 'promo', 3, 2200, { traffic: 0.1 }),
  U('mascot', 'promo', 3, 4400, { traffic: 0.2 }, { req: ['photowall'] }),
  U('dugout', 'promo', 3, 3900, { traffic: 0.18, gamefreq: 0.1 }),
  U('coupon', 'promo', 3, 2800, { adday: 1 }),
  U('radio', 'promo', 4, 15000, { traffic: 0.3 }, { req: ['jingle'] }),
  U('sharkweek', 'promo', 4, 20000, { traffic: 0.25 }, { req: ['mascot'] }),
  U('billboard', 'promo', 5, 52000, { traffic: 0.4, flat: 150 }, { req: ['radio'] }),
  U('tv', 'promo', 5, 98000, { traffic: 0.6 }, { req: ['radio'] }),
  U('movie', 'promo', 6, 120000, { traffic: 0.8 }, { req: ['tv'] }),
  U('goldlogo', 'promo', 6, 200000, { ptol: 0.3 }, { req: ['tv'], milestone: true }),

  // ---------- 🚚 Trucks & Places: roll to the crowds, and pick a place to open every morning (see CREAM_SPOTS)
  U('tricycle', 'wheels', 1, 90, { flat: 12, stock: 2 }),
  U('bike', 'wheels', 2, 490, { flat: 35, stock: 4 }, { req: ['tricycle'] }),
  U('truck', 'wheels', 3, 725, { flat: 14, traffic: 0.2, stock: 6, serve: 40 }, { req: ['freezer'] }),    // legacy: ice cream truck
  U('retro', 'wheels', 4, 14000, { flat: 350, stock: 30 }, { req: ['truck'] }),
  U('dinodig', 'wheels', 4, 18000, { stock: 40 }, { req: ['truck', 'dinomuseum'] }),
  U('drones', 'wheels', 5, 58000, { flat: 1200 }, { req: ['retro'] }),
  U('rocket', 'wheels', 6, 200000, { flat: 6000 }, { req: ['drones', 'space'], milestone: true, fire: true }),
  U('splash', 'wheels', 2, 180, {}, { req: ['tricycle'] }),
  U('schoolgate', 'wheels', 2, 240, {}),
  U('beach', 'wheels', 3, 3300, {}, { req: ['bike'] }),
  U('dinomuseum', 'wheels', 3, 2800, {}, { req: ['bike'] }),
  U('aquarium', 'wheels', 4, 9000, {}, { req: ['truck'] }),
  U('ballgate', 'wheels', 4, 12000, {}, { req: ['truck'] }),
  U('fair', 'wheels', 5, 39000, {}, { req: ['truck2'] }),
  U('space', 'wheels', 6, 100000, {}, { req: ['fair'] }),

  // ---------- 🎉 Parties & Pals: party orders, keepsakes and friendly surprises
  U('party', 'pals', 3, 500, { order: 1 }, { req: ['cone'] }),                  // legacy: birthday-party catering
  U('classparty', 'pals', 3, 1700, { order: 2 }, { req: ['party'] }),
  U('wedding', 'pals', 4, 12000, { order: 3 }, { req: ['classparty', 'dipcab'] }),
  U('bash', 'pals', 5, 52000, { order: 4 }, { req: ['wedding'] }),
  U('stadiumdeal', 'pals', 6, 160000, { order: 5 }, { req: ['bash', 'ballgate'], milestone: true }),
  A('stickers', 'pals', 2, 210),
  A('dinoegg', 'pals', 3, 1700),
  A('plush', 'pals', 4, 15000, { req: ['mascot'] }),
  A('tee', 'pals', 4, 12000, { req: ['dugout'] }),
  U('rainybooth', 'pals', 3, 2000, { rain: 0.3 }),
  U('friends', 'pals', 5, 19500, { flat: 120 }, { req: ['stickers'] }),

  // ---------- 🌎 Brand & Branches: other trucks and shops pay you every day
  U('rocketcart', 'brand', 2, 850, { branch: 30 }, { req: ['tricycle'] }),
  U('truck2', 'brand', 3, 13000, { branch: 300 }, { req: ['truck'] }),
  U('sharktruck', 'brand', 4, 40000, { branch: 1000 }, { req: ['truck2'] }),
  U('parlor2', 'brand', 4, 60000, { branch: 1500 }, { req: ['shop'], milestone: true }),
  U('online', 'brand', 5, 78000, { branch: 3000 }, { req: ['plush'] }),
  U('grocery', 'brand', 5, 105000, { branch: 4000 }, { req: ['celebchef'] }),
  U('fleet5', 'brand', 5, 210000, { branch: 8000 }, { req: ['sharktruck'] }),
  U('chain10', 'brand', 6, 240000, { branch: 15000 }, { req: ['parlor2'], milestone: true }),
  U('franchise', 'brand', 6, 480000, { branch: 30000 }, { req: ['chain10', 'grocery'], milestone: true, fire: true }),
  U('fleet100', 'brand', 6, 950000, { branch: 60000 }, { req: ['fleet5', 'franchise'], milestone: true }),

  // ---------- 🏰 The Parlor: the look grows from a cart to a castle and a whole island (the dream: Sundae Island)
  U('sign', 'shop', 1, 25, { traffic: 0.15 }),                                  // legacy
  U('table', 'shop', 1, 40, { traffic: 0.2 }),                                  // legacy
  U('umbrella', 'shop', 1, 35, { hot: 0.1 }, { milestone: true }),
  U('bunting', 'shop', 2, 85, { traffic: 0.08 }),
  U('trailer', 'shop', 2, 280, { traffic: 0.2, flat: 8, stock: 4, serve: 30 }, { req: ['umbrella'], milestone: true }),
  U('shop', 'shop', 4, 2600, { traffic: 0.5, flat: 20, serve: 100, stock: 10, ptol: 0.1 }, { req: ['truck'], milestone: true }),   // legacy: ice cream shop (now the corner shop)
  U('booths', 'shop', 4, 5000, { rain: 0.25, flat: 10 }, { req: ['shop'] }),
  U('sweetparlor', 'shop', 5, 11500, { traffic: 0.4, serve: 150, ptol: 0.1 }, { req: ['booths'], milestone: true }),
  U('castle', 'shop', 5, 46000, { traffic: 0.5, flat: 100, stock: 60, ptol: 0.1 }, { req: ['sweetparlor'], milestone: true }),
  U('factory', 'shop', 6, 100000, { cost: 0.6, stock: 600, serve: 600 }, { req: ['castle', 'blast'], milestone: true, fire: true }),
  U('dock', 'shop', 4, 6000, { stock: 60, cost: 0.95 }, { req: ['shop'], dream: true }),
  U('conebeach', 'shop', 5, 13000, { traffic: 0.3, hot: 0.2 }, { req: ['dock'], dream: true }),
  U('volcano', 'shop', 5, 32000, { traffic: 0.3, hot: 0.3 }, { req: ['conebeach'], dream: true }),
  U('lagoon', 'shop', 5, 78000, { traffic: 0.4, flat: 150 }, { req: ['volcano'], dream: true }),
  U('dinopark', 'shop', 6, 120000, { traffic: 0.5, flat: 300 }, { req: ['lagoon'], dream: true }),
  U('scoopstadium', 'shop', 6, 280000, { traffic: 0.6, branch: 3000 }, { req: ['dinopark'], dream: true }),
  U('megamountain', 'shop', 6, 600000, { stock: 3000, cost: 0.7 }, { req: ['scoopstadium', 'factory'], dream: true }),
  U('rocketpad', 'shop', 6, 1200000, { traffic: 1, flat: 1000, branch: 5000 }, { req: ['megamountain'], dream: true, milestone: true, fire: true }),
];
for (const u of CREAM_UPGRADES) if (u.dream) u.milestone = true;

/** Toppings, sauces, treats and keepsakes: p = share of buyers who add it on a normal day, v = what they pay, c = what it costs the parlor,
 *  kind: 'cold' loves hot days and slumps in the rain; 'warm' loves cool, rainy days. */
export const CREAM_ADDONS = {
  sprinkles: { p: 0.4, v: 0.35, c: 0.05 },
  zigzag: { p: 0.3, v: 0.45, c: 0.07 },
  whipcherry: { p: 0.35, v: 0.7, c: 0.12 },
  dipcone: { p: 0.28, v: 0.8, c: 0.15 },
  hotfudge: { p: 0.28, v: 0.8, c: 0.12, kind: 'warm' },
  caramel: { p: 0.25, v: 0.8, c: 0.12 },
  dinodirt: { p: 0.25, v: 0.55, c: 0.1 },
  gummyshark: { p: 0.25, v: 0.65, c: 0.14 },
  shake: { p: 0.12, v: 3, c: 0.9, kind: 'cold' },
  berrysauce: { p: 0.22, v: 0.55, c: 0.1 },
  skillet: { p: 0.1, v: 3.2, c: 0.9, kind: 'warm' },
  banana: { p: 0.1, v: 3.6, c: 1 },
  sandwich: { p: 0.12, v: 2.6, c: 0.7 },
  float: { p: 0.1, v: 2.6, c: 0.6, kind: 'cold' },
  mochi: { p: 0.1, v: 2.1, c: 0.55 },
  icecake: { p: 0.07, v: 5, c: 1.5 },
  spacebeads: { p: 0.12, v: 2.2, c: 0.6, kind: 'cold' },
  brownie: { p: 0.08, v: 4.2, c: 1.2, kind: 'warm' },
  megasundae: { p: 0.05, v: 12, c: 2.5 },
  stickers: { p: 0.2, v: 1, c: 0.3 },
  dinoegg: { p: 0.2, v: 1.2, c: 0.35 },
  plush: { p: 0.08, v: 8, c: 3 },
  tee: { p: 0.12, v: 5, c: 1.8 },
};

/** Pop-up places for the ice cream parlor: fx = extra customers (before the weather), wx = the place's weather: today's whole crowd is multiplied by it. Heat is everything for ice cream! */
export const CREAM_SPOTS = {
  splash: { emoji: '💦', fx: { flat: 15 }, wx: { sunny: 1.3, hot: 1.9, cloudy: 0.7, rainy: 0.2 } },
  schoolgate: { emoji: '🏫', fx: { flat: 25 }, wx: { sunny: 1.2, hot: 1.4, cloudy: 1.1, rainy: 0.5 } },
  beach: { emoji: '🏖️', fx: { flat: 90 }, wx: { sunny: 1.6, hot: 2.6, cloudy: 0.6, rainy: 0.1 } },
  dinomuseum: { emoji: '🦖', fx: { flat: 70 }, wx: { sunny: 0.9, hot: 0.9, cloudy: 1.2, rainy: 1.5 } },
  aquarium: { emoji: '🦈', fx: { flat: 200, ptol: 0.05 }, wx: { sunny: 1.2, hot: 1.3, cloudy: 1.2, rainy: 1.1 } },
  ballgate: { emoji: '⚾', fx: { flat: 400, evgame: 1.8 }, wx: { sunny: 1.4, hot: 2, cloudy: 1, rainy: 0.2 } },
  fair: { emoji: '🎡', fx: { flat: 900 }, wx: { sunny: 1.5, hot: 2.2, cloudy: 0.8, rainy: 0.3 } },
  space: { emoji: '🚀', fx: { flat: 2000, ptol: 0.1 }, wx: { sunny: 1.3, hot: 1.5, cloudy: 1.3, rainy: 1.2 } },
};

/** Party orders: [none, birthday, class party, wedding, big company event, stadium contract]: scoops wanted and the price paid for each scoop. */
export const CREAM_ORDER_LIST = [null, { need: 36, price: 3 }, { need: 100, price: 3.5 }, { need: 300, price: 5 }, { need: 1500, price: 4.5 }, { need: 6000, price: 4 }];
