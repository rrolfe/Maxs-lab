// Surprises (Easter eggs) for the Ballpark Snack Shack: new things appear as the ballpark grows. Rob's idea, Nov 8 2026.
// Each perk is "found" once, remembered in the stand's save (st.perks), and celebrated with a banner. The golden hot dog is secret: tap the title.
import { fieldsOwned, stadiumLevel, SPORTS } from './sims.js';
import { addStrings } from '../core/i18n.js';

export const PERKS = [
  { id: 'chompy', emoji: '🦈', need: (st) => fieldsOwned(st.up) >= 3 },
  { id: 'fireworks', emoji: '🎆', need: (st) => fieldsOwned(st.up) >= 6 },
  { id: 'horn', emoji: '🎺', need: (st) => SPORTS.filter((s) => st.up[s]).length >= 2 },
  { id: 'stadium', emoji: '🏟️', need: (st) => stadiumLevel(st.up) >= 1 },
  { id: 'night', emoji: '🌙', need: (st) => stadiumLevel(st.up) >= 2 },
  { id: 'legend', emoji: '👑', need: (st) => stadiumLevel(st.up) >= 3 },
  { id: 'goldendog', emoji: '🌭', secret: true, need: () => false },
];
/** Perks he has just earned (not yet marked found). */
export const newPerks = (st) => PERKS.filter((p) => !p.secret && !(st.perks || {})[p.id] && p.need(st));
export const FACT_COUNT = 8;

addStrings({
  en: {
    stSurprises: 'Surprises', stSurprisesSub: 'The ballpark grows… and so do the surprises. Tap one you found!', stSurpriseNew: '🎁 New surprise: {n}!', stLockedP: 'Mystery surprise', stSecretP: 'A secret… something golden hides on this screen.',
    p_chompy: 'Chompy the Shark', pd_chompy: 'Your mascot! Tap him for a fun fact.', ph_chompy: 'Own 3 fields to find out!',
    p_fireworks: 'Fireworks', pd_fireworks: 'Fireworks after every record-breaking day.', ph_fireworks: 'Own 6 fields to find out!',
    p_horn: 'Stadium horn', pd_horn: 'Tap to blow the charge horn!', ph_horn: 'Own 2 other sports to find out!',
    p_stadium: 'Stadium look', pd_stadium: 'A real scoreboard and a pro look for the whole shack.', ph_stadium: 'Build the Stadium to find out!',
    p_night: 'Night games', pd_night: 'Floodlights! Night games bring huge crowds and hot cocoa.', ph_night: 'Build the Floodlights to find out!',
    p_legend: 'Legend crown', pd_legend: 'A golden shimmer. Only legends have this.', ph_legend: 'Build the Mega Stadium to find out!',
    p_goldendog: 'Golden hot dog', pd_goldendog: 'Your hot dog sparkles now. You found the secret!',
    stGoldenFound: '🌭✨ You found the Golden Hot Dog! Only true explorers find this.', stHornSay: 'CHARGE!',
    stScFields: 'FIELDS', stScFans: 'FANS TODAY', stScCash: 'CASH', stScDay: 'DAY', stScName: 'MAX’S STADIUM',
    stSnackStadium: 'Stadium Snack Shack', stSnackLights: 'Night Stadium Snack Shack', stSnackLegend: 'Mega Stadium Snack Shack',
    e_nightGame: 'Night game under the lights! Fans want something warm.',
    f_0: 'Great white sharks lose and regrow thousands of teeth in their life!', f_1: 'A baseball has 108 red stitches. Count them next time!', f_2: 'Some sharks glow in the dark deep in the ocean.',
    f_3: 'A fastball can zoom past home plate in less than half a second.', f_4: 'Sharks were around before the dinosaurs!', f_5: 'The first night baseball game was played in 1935.',
    f_6: 'Sharks do not have bones. Their skeleton is made of cartilage, like your ears!', f_7: 'A big stadium can sell more than 30,000 hot dogs in one day!',
  },
  es: {
    stSurprises: 'Sorpresas', stSurprisesSub: 'El estadio crece… y las sorpresas también. ¡Toca una que encontraste!', stSurpriseNew: '🎁 ¡Nueva sorpresa: {n}!', stLockedP: 'Sorpresa misteriosa', stSecretP: 'Un secreto… algo dorado se esconde en esta pantalla.',
    p_chompy: 'Chompy el Tiburón', pd_chompy: '¡Tu mascota! Tócalo para un dato curioso.', ph_chompy: '¡Ten 3 campos para descubrirlo!',
    p_fireworks: 'Fuegos artificiales', pd_fireworks: 'Fuegos artificiales después de cada día récord.', ph_fireworks: '¡Ten 6 campos para descubrirlo!',
    p_horn: 'Corneta del estadio', pd_horn: '¡Toca para tocar la corneta de carga!', ph_horn: '¡Ten 2 deportes más para descubrirlo!',
    p_stadium: 'Aspecto de estadio', pd_stadium: 'Un marcador de verdad y un look profesional para todo el puesto.', ph_stadium: '¡Construye el Estadio para descubrirlo!',
    p_night: 'Juegos nocturnos', pd_night: '¡Reflectores! Los juegos nocturnos traen multitudes enormes y chocolate caliente.', ph_night: '¡Construye los Reflectores para descubrirlo!',
    p_legend: 'Corona de leyenda', pd_legend: 'Un brillo dorado. Solo las leyendas lo tienen.', ph_legend: '¡Construye el Megaestadio para descubrirlo!',
    p_goldendog: 'Hot dog dorado', pd_goldendog: 'Tu hot dog ahora brilla. ¡Encontraste el secreto!',
    stGoldenFound: '🌭✨ ¡Encontraste el Hot Dog Dorado! Solo los verdaderos exploradores lo encuentran.', stHornSay: '¡CARGA!',
    stScFields: 'CAMPOS', stScFans: 'FANS HOY', stScCash: 'DINERO', stScDay: 'DÍA', stScName: 'ESTADIO DE MAX',
    stSnackStadium: 'Puesto del Estadio', stSnackLights: 'Puesto del Estadio Nocturno', stSnackLegend: 'Puesto del Megaestadio',
    e_nightGame: '¡Juego nocturno bajo los reflectores! Los fans quieren algo caliente.',
    f_0: '¡Los tiburones blancos pierden y vuelven a crecer miles de dientes durante su vida!', f_1: 'Una pelota de béisbol tiene 108 puntadas rojas. ¡Cuéntalas la próxima vez!', f_2: 'Algunos tiburones brillan en la oscuridad en lo profundo del océano.',
    f_3: 'Una bola rápida puede pasar por el plato en menos de medio segundo.', f_4: '¡Los tiburones existían antes que los dinosaurios!', f_5: 'El primer juego de béisbol nocturno fue en 1935.',
    f_6: 'Los tiburones no tienen huesos. Su esqueleto es de cartílago, ¡como tus orejas!', f_7: '¡Un estadio grande puede vender más de 30,000 hot dogs en un día!',
  },
});
