/* ================== CAOS PARTY v3 — MÁS MINIJUEGOS ================== */
const SC = [['ROJO', '#ef4444'], ['AZUL', '#3b82f6'], ['VERDE', '#22c55e'], ['AMARILLO', '#facc15'], ['MORADO', '#a855f7'], ['NARANJA', '#f97316']];
const BASTA_CATS = ['Nombre', 'Animal', 'Comida o fruta', 'País o ciudad', 'Cosa', 'Color', 'Marca', 'Profesión', 'Parte del cuerpo', 'Película o serie'];
const BASTA_LETTERS = 'ABCDEFGIJLMNOPRSTV';
const FIND_THEMES = [
  { n: 'el bosque', d: ['🌳', '🌲', '🌿', '🍀', '🌵', '🌴', '🍄', '🌾'], t: '🐸' },
  { n: 'el mar', d: ['🐟', '🐠', '🐡', '🦀', '🐚', '🦑', '🦐'], t: '🐙' },
  { n: 'la ciudad', d: ['🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🚐'], t: '🛵' },
  { n: 'la fiesta', d: ['🎈', '🎉', '🎊', '🎁', '🎂', '🍰', '🧁'], t: '🍩' },
  { n: 'las caritas', d: ['😀', '😃', '😄', '😁', '😆', '😅', '🙂', '😊'], t: '🙃' },
  { n: 'la granja', d: ['🐄', '🐖', '🐑', '🐐', '🐓', '🐴', '🦆'], t: '🦄' },
  { n: 'el espacio', d: ['⭐', '🌟', '✨', '🌙', '🪐', '☄️', '🌍'], t: '👽' },
  { n: 'la frutería', d: ['🍎', '🍓', '🍒', '🍅', '🌶️', '🍉', '🫐'], t: '🍋' },
];
const pname = id => id === 'cpu' ? '🤖 CPU' : who(id);
