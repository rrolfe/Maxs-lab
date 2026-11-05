// Missions are themed 8-question rounds. The questions are picked by quiz/engine.js.
import { addStrings } from '../core/i18n.js';
import { rng, hashStr } from '../core/dom.js';
import { today } from '../core/store.js';

export const MISSIONS = {
  sharks:   { icon: 'shark',     color: '#0B6B78', filter: { tags: ['sharks', 'ocean'] } },
  dinos:    { icon: 'dino',      color: '#0E8A6E', filter: { tags: ['dinosaurs'] } },
  space:    { icon: 'planet',    color: '#6D4AC9', filter: { tags: ['space'] } },
  ocean:    { icon: 'sanctuary', color: '#2F6FDB', filter: { tags: ['ocean', 'animals'] } },
  baseball: { icon: 'ballpark',  color: '#B8620A', filter: { tags: ['baseball', 'machines'] } },
  numbers:  { icon: 'stands',    color: '#2F6FDB', filter: { topics: ['math'] } },
  words:    { icon: 'wordsearch', color: '#6D4AC9', filter: { topics: ['reading', 'words'] } },
  logic:    { icon: 'bulb',      color: '#0B6B78', filter: { topics: ['logic'] } },
  wild:     { icon: 'world',     color: '#A8326E', filter: { topics: ['world', 'science'] } },
  mix:      { icon: 'quiz',      color: '#FF8A5B', filter: {} },
};
export const TOPIC_META = {
  math:    { icon: 'stands',     key: 'topicMath' },
  reading: { icon: 'passport',   key: 'topicReading' },
  words:   { icon: 'wordsearch', key: 'topicWords' },
  science: { icon: 'planet',     key: 'topicScience' },
  world:   { icon: 'world',      key: 'topicWorld' },
  logic:   { icon: 'bulb',       key: 'topicLogic' },
};

/** Three missions per day (same on every device): one themed, one subject, one mixed. */
export function dailyMissions(date = today()) {
  const r = rng(hashStr('missions' + date));
  const themed = ['sharks', 'dinos', 'space', 'ocean', 'baseball'];
  const subject = ['numbers', 'words', 'logic', 'wild'];
  const a = themed[Math.floor(r() * themed.length)];
  const b = subject[Math.floor(r() * subject.length)];
  return [a, b, 'mix'];
}

addStrings({
  en: {
    m_sharks: 'Shark Patrol', m_dinos: 'Dino Dig', m_space: 'Space Station', m_ocean: 'Deep Dive', m_baseball: 'Ballpark Brainstorm',
    m_numbers: 'Number Lab', m_words: 'Word Wizard', m_logic: 'Brain Bender', m_wild: 'Wild World', m_mix: 'Mixed Mission',
    m_sharks_s: 'Sharks and sea mysteries', m_dinos_s: 'Fossils, plates and giants', m_space_s: 'Planets, stars and rockets', m_ocean_s: 'Creatures of the deep', m_baseball_s: 'Bats, balls and brainy plays',
    m_numbers_s: 'Add, multiply and puzzle', m_words_s: 'Reading and spelling', m_logic_s: 'Patterns and clever clues', m_wild_s: 'Science and geography', m_mix_s: 'A little of everything',
    topicMath: 'Numbers', topicReading: 'Reading', topicWords: 'Spelling & words', topicScience: 'Science', topicWorld: 'World', topicLogic: 'Logic',
  },
  es: {
    m_sharks: 'Patrulla de tiburones', m_dinos: 'Excavación de dinos', m_space: 'Estación espacial', m_ocean: 'Inmersión profunda', m_baseball: 'Duelo de ideas en el estadio',
    m_numbers: 'Laboratorio de números', m_words: 'Mago de las palabras', m_logic: 'Rompecabezas', m_wild: 'Mundo salvaje', m_mix: 'Misión sorpresa',
    m_sharks_s: 'Tiburones y misterios del mar', m_dinos_s: 'Fósiles, placas y gigantes', m_space_s: 'Planetas, estrellas y cohetes', m_ocean_s: 'Criaturas de las profundidades', m_baseball_s: 'Bates, pelotas y jugadas ingeniosas',
    m_numbers_s: 'Suma, multiplica y resuelve', m_words_s: 'Lectura y ortografía', m_logic_s: 'Patrones y pistas astutas', m_wild_s: 'Ciencias y geografía', m_mix_s: 'Un poco de todo',
    topicMath: 'Números', topicReading: 'Lectura', topicWords: 'Ortografía y palabras', topicScience: 'Ciencias', topicWorld: 'Mundo', topicLogic: 'Lógica',
  },
});
