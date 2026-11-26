/* ================== v17 — 🁫 DOMINÓ VELOZ y ✋ LO QUE SIMÓN DIGA ================== */
const DOM_STYLES = ['Light', 'Stars', 'Gingerbread'];
const domSrc = (st, a, b) => `assets/domino/${st}/tile_${Math.min(a, b)}_${Math.max(a, b)}.png`;
/* ficha acostada: el valor `l` queda a la izquierda */
const domFlat = (st, l, r, cls = '') => `<span class="dmt ${l === r ? 'dbl' : ''} ${cls}"><img src="${domSrc(st, l, r)}" style="transform:rotate(${l === r ? 0 : l <= r ? -90 : 90}deg)" alt="${l}|${r}"></span>`;
const handImg = (col, g) => col === 'yellow' ? `hand_yellow_${g}.png` : `${col}_hand_${g}.png`;
const GESTOS = [['open', '✋', 'Mano abierta'], ['closed', '✊', 'Puño'], ['peace', '✌️', 'Paz'], ['point', '👉', 'Señalar'], ['rock', '🤘', 'Rock'], ['thumb', '👍', 'Pulgar']];
