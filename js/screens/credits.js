// Photo, map and software credits.
import { h } from '../core/dom.js';
import { t, addStrings, L } from '../core/i18n.js';
import { go } from '../core/router.js';
import { icons } from '../core/icons.js';
import { PROVIDERS } from '../world/tilemap.js';

addStrings({
  en: {
    crTitle: 'Credits', crMaps: 'Maps', crLand: 'Land outlines: Natural Earth (public domain). Pins are approximate.', crPhotos: 'Photos', crPhotosNote: 'Photos come from Wikimedia Commons and keep their creators’ credits and licenses.',
    crMade: 'About this app', crMadeText: 'Max’s Lab is original code made for one family. The Fathom logo and icons are original drawings. Sounds are made on the spot in your browser. Nothing is tracked.',
  },
  es: {
    crTitle: 'Créditos', crMaps: 'Mapas', crLand: 'Contornos de la tierra: Natural Earth (dominio público). Los puntos son aproximados.', crPhotos: 'Fotos', crPhotosNote: 'Las fotos vienen de Wikimedia Commons y conservan los créditos y licencias de sus autores.',
    crMade: 'Sobre esta app', crMadeText: 'El Laboratorio de Max es código original hecho para una familia. El logotipo Fathom y los íconos son dibujos originales. Los sonidos se crean al momento en tu navegador. No se rastrea nada.',
  },
});

export async function mount(el) {
  const places = (await import('../../data/places.js')).default;
  const link = (u, txt) => h('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, txt);
  el.append(
    h('div', { class: 'screen-head' }, h('button', { class: 'btn ghost icon', 'aria-label': t('back'), onclick: () => history.length > 1 ? history.back() : go('/home'), html: icons.back(34) }), h('h1', {}, t('crTitle'))),
    h('section', { class: 'card' }, h('h2', {}, t('crMaps')), h('p', {}, t('crLand')), h('ul', {}, [...new Map(PROVIDERS.map((p) => [p.attr, p])).values()].map((p) => h('li', {}, p.attr)))),
    h('section', { class: 'card' }, h('h2', {}, t('crMade')), h('p', {}, t('crMadeText'))),
    h('section', { class: 'card' }, h('h2', {}, t('crPhotos')), h('p', { class: 'muted' }, t('crPhotosNote')),
      h('ul', { class: 'credlist' }, places.map((p) => h('li', {}, h('strong', {}, L(p.name)), ' — ', link(p.photo.source, p.photo.credit), ' · ', p.photo.licenseUrl ? link(p.photo.licenseUrl, p.photo.license) : p.photo.license)))));
  return () => {};
}
