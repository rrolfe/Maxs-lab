// The Ice Cream Parlor's big shop: its nine paths, emoji, look (cart to island), the dream (Sundae Island) and the words. The engine is lemon-shop.js (shared with the Lemonade Stand).
import { addStrings } from '../core/i18n.js';
import { CREAM_UPGRADES, CREAM_SPOTS } from './cream-data.js';

export const CREAM_PATHS = [
  { id: 'cones', emoji: '🍦' }, { id: 'treats', emoji: '🍫' }, { id: 'gear', emoji: '❄️' }, { id: 'crew', emoji: '🥄' }, { id: 'promo', emoji: '📣' },
  { id: 'wheels', emoji: '🚚' }, { id: 'pals', emoji: '🎉' }, { id: 'brand', emoji: '🌎' }, { id: 'shop', emoji: '🏰' },
];
const EMOJI = {
  creamy: '🐄', cone: '🧇', sundaebowl: '🥣', popsicle: '🍭', sorbet: '🍋', season: '📅', froyo: '🥛', twist: '🌀', gelato: '🍨', fountain: '⛲', celebchef: '👨‍🍳', nitro: '❄️', flavorlab: '🔬',
  chomp: '🦈', chipasaurus: '🌿', galaxy: '🌌', homerunflavor: '⚾', inventor: '🧪',
  toppings: '🍬', sprinkles: '🌈', zigzag: '🍫', whipcherry: '🍒', dipcone: '🍦', hotfudge: '🔥', caramel: '🍯', dinodirt: '🦖', gummyshark: '🐠', shake: '🥤', berrysauce: '🍓', skillet: '🍳', banana: '🍌', sandwich: '🍪', float: '🫧', mochi: '🍡', icecake: '🍰', spacebeads: '🪐', brownie: '🧁', megasundae: '🍧',
  freezer: '🥶', cooler: '🧊', springscoop: '🥄', dryice: '☁️', bulk: '📦', tablet: '📱', dipcab: '🪟', soft: '🍥', superchill: '⛄', walkin: '🚪', dairy: '🚜', blast: '🌨️', churn: '⚙️',
  helper: '🧒', uniforms: '🎽', reg2: '💰', squad: '🧑‍🍳', kiosk: '🖥️', lead: '⭐', rollers: '🛼', drive: '🚗', team20: '👥', manager: '👔', robo: '🤖',
  chalk: '📝', spoons: '😋', flyers: '📄', punch: '🎫', jingle: '🎵', crayon: '🖍️', photowall: '📸', mascot: '🕺', dugout: '🧢', coupon: '📰', radio: '📻', sharkweek: '🦈', billboard: '🛣️', tv: '📺', movie: '🎬', goldlogo: '🏆',
  tricycle: '🛺', bike: '🚴', truck: '🚚', retro: '🛻', dinodig: '🦕', drones: '🛸', rocket: '🛰️',
  party: '🎂', classparty: '🎒', wedding: '💍', bash: '🏢', stadiumdeal: '🎟️', stickers: '📒', dinoegg: '🥚', plush: '🧸', tee: '👕', rainybooth: '☔', friends: '🖼️',
  rocketcart: '🛒', truck2: '🚛', sharktruck: '🐋', parlor2: '🏪', online: '🛍️', grocery: '🥫', fleet5: '🚐', chain10: '🗺️', franchise: '🚩', fleet100: '🌎',
  sign: '🪧', table: '🪑', umbrella: '⛱️', bunting: '🎏', trailer: '🚃', shop: '🏠', booths: '🛋️', sweetparlor: '🎶', castle: '🏰', factory: '🏭',
  dock: '⛵', conebeach: '🏖️', volcano: '🌋', lagoon: '🌊', dinopark: '🦖', scoopstadium: '🏟️', megamountain: '🏔️', rocketpad: '🚀',
  ...Object.fromEntries(Object.entries(CREAM_SPOTS).map(([k, v]) => [k, v.emoji])),
};
/** The dream, piece by piece: Sundae Island lights up as he buys. */
export const CREAM_DREAM = CREAM_UPGRADES.filter((u) => u.dream).map((u) => u.id);
/** How the parlor looks: it grows from a tiny cart to a castle, a factory and a whole island. */
export const creamLook = (up = {}) => (up.rocketpad ? 'island' : up.factory ? 'factory' : up.castle ? 'castle' : up.sweetparlor ? 'parlor' : up.shop ? 'corner' : up.truck ? 'truck' : up.trailer ? 'trailer' : up.umbrella ? 'umbrella' : 'cart');
const GLYPH = { umbrella: '⛱️', trailer: '🚃', truck: '🚚', corner: '🏠', parlor: '🍨', castle: '🏰', factory: '🏭', island: '🏝️' };
export const CREAM_UI = { k: 'ic_', paths: CREAM_PATHS, emoji: EMOJI, dream: CREAM_DREAM, dreamEmoji: '🏝️', look: creamLook, glyph: GLYPH, home: '🍦', icon: 'icecream' };

addStrings({
  en: {
    ic_pth_cones: 'Cones & Flavors', ic_pth_treats: 'Toppings & Treats', ic_pth_gear: 'Freezers & Machines', ic_pth_crew: 'Scoopers & Registers', ic_pth_promo: 'Shout It Out', ic_pth_wheels: 'Trucks & Places', ic_pth_pals: 'Parties & Pals', ic_pth_brand: 'Brand & Branches', ic_pth_shop: 'The Parlor',
    ic_pthd_cones: 'Fancier flavors, so people pay more.', ic_pthd_treats: 'Sprinkle it, drizzle it, sell it!', ic_pthd_gear: 'Keep it frosty and make it cheaper.', ic_pthd_crew: 'Scoop faster and serve more happy kids.', ic_pthd_promo: 'Tell the whole town: ice cream!',
    ic_pthd_wheels: 'Roll to the crowds. Pick a place each morning: match it to the weather!', ic_pthd_pals: 'Party orders, keepsakes and friendly surprises.', ic_pthd_brand: 'Other trucks and shops pay you every day.', ic_pthd_shop: 'From a tiny cart to Sundae Island!',
    ic_stDreamT: 'Your dream: Sundae Island', ic_stAllBought: 'You bought everything! You rule Sundae Island!', ic_stHome: 'Home corner',
    ic_lk_cart: 'Tiny cart', ic_lk_umbrella: 'Striped umbrella cart', ic_lk_trailer: 'Little trailer', ic_lk_truck: 'Ice cream truck', ic_lk_corner: 'Corner shop', ic_lk_parlor: 'Sweet parlor', ic_lk_castle: 'Cone Castle', ic_lk_factory: 'Sprinkle Factory', ic_lk_island: 'Sundae Island',
    icSpecialT: 'Today’s special', icSpecialSub: 'Pick a treat to put on the chalkboard. More people order it! Cold treats win on hot days, warm treats win on cool, rainy days.', icLovesHot: 'loves hot days', icLovesCool: 'loves cool days', icAnyDay: 'every day', icGoodToday: 'great for today’s weather', icSlowToday: 'slow today',
    stAddons: 'Toppings & treats', stAddedBy: 'What people added', stSpecialSold: 'Today’s special',
    e_icday: 'It’s National Ice Cream Day! The whole town wants a scoop!', e_freecone: 'Free Cone Day! A thank-you party brings a giant line.', e_schoolOut: 'School’s out! Hundreds of kids run for the cart!', e_jingleDay: 'Jingle Parade Day! Every ice cream truck in town plays the song.', e_sharkScoop: 'Shark Week! Everyone wants shark-fin cones!', e_berryDay: 'A farmer gave you free strawberries! Tubs cost half today.',
  },
  es: {
    ic_pth_cones: 'Conos y sabores', ic_pth_treats: 'Toppings y antojos', ic_pth_gear: 'Congeladores y máquinas', ic_pth_crew: 'Heladeros y cajas', ic_pth_promo: 'Publicidad', ic_pth_wheels: 'Camiones y lugares', ic_pth_pals: 'Fiestas y amigos', ic_pth_brand: 'Marca y sucursales', ic_pth_shop: 'La heladería',
    ic_pthd_cones: 'Sabores más elegantes, para que la gente pague más.', ic_pthd_treats: '¡Espolvorea, baña y vende!', ic_pthd_gear: 'Mantén todo bien frío y más barato.', ic_pthd_crew: 'Sirve bolas más rápido y atiende a más niños felices.', ic_pthd_promo: 'Cuéntale a todo el pueblo: ¡helado!',
    ic_pthd_wheels: 'Ve adonde está la gente. Elige un lugar cada mañana: ¡combínalo con el clima!', ic_pthd_pals: 'Pedidos de fiestas, recuerdos y sorpresas amistosas.', ic_pthd_brand: 'Otros camiones y tiendas te pagan cada día.', ic_pthd_shop: '¡De un carrito pequeño a la Isla Sundae!',
    ic_stDreamT: 'Tu sueño: la Isla Sundae', ic_stAllBought: '¡Compraste todo! ¡Reinas en la Isla Sundae!', ic_stHome: 'Esquina de casa',
    ic_lk_cart: 'Carrito pequeño', ic_lk_umbrella: 'Carrito con sombrilla de rayas', ic_lk_trailer: 'Remolque pequeño', ic_lk_truck: 'Camión de helados', ic_lk_corner: 'Tienda de la esquina', ic_lk_parlor: 'Heladería dulce', ic_lk_castle: 'Castillo de Conos', ic_lk_factory: 'Fábrica de Chispas', ic_lk_island: 'Isla Sundae',
    icSpecialT: 'Especial de hoy', icSpecialSub: 'Elige un antojo para ponerlo en el pizarrón. ¡Más gente lo pide! Lo frío gana en días de calor; lo caliente, en días frescos y lluviosos.', icLovesHot: 'le encanta el calor', icLovesCool: 'le encantan los días frescos', icAnyDay: 'todos los días', icGoodToday: 'ideal para el clima de hoy', icSlowToday: 'flojo hoy',
    stAddons: 'Toppings y antojos', stAddedBy: 'Lo que agregó la gente', stSpecialSold: 'Especial de hoy',
    e_icday: '¡Es el Día Nacional del Helado! ¡Todo el pueblo quiere una bola!', e_freecone: '¡Día del Cono Gratis! Una fiesta de agradecimiento trae una fila gigante.', e_schoolOut: '¡Salieron de la escuela! ¡Cientos de niños corren al carrito!', e_jingleDay: '¡Desfile de melodías! Todos los camiones de helados del pueblo tocan la canción.', e_sharkScoop: '¡Semana del Tiburón! ¡Todos quieren conos con aleta de tiburón!', e_berryDay: '¡Un granjero te regaló fresas! Los botes cuestan la mitad hoy.',
  },
});
