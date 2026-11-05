// Small helpers shared by the home screen and the map without loading the whole passport screen.
import { S } from '../core/store.js';
export const stampCount = () => Object.keys(S.passport.stamps).length;
export const peopleCount = () => Object.keys(S.passport.people).length;
