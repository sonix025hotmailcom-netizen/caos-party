/* ================== v16 — 🃏 MAYOR O MENOR, ☄️ ASTEROIDES, 🔵 CARRERA DE CANICAS ================== */
const tintImg = tkTint;   // (img, color) → canvas teñido, con caché
const CARD_SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'], CARD_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardImg = c => c ? `assets/deck/card${c.s}${c.r}.png` : 'assets/deck/cardBack_red2.png';
const CHIP_COL = ['RedWhite', 'BlueWhite', 'GreenWhite', 'BlackWhite'];
const chipStack = (n, max = 12) => { let h = ''; const k = Math.min(n, max); for (let i = 0; i < k; i++) h += `<img src="assets/deck/chip${CHIP_COL[Math.floor(i / 5) % 4]}_sideBorder.png" style="bottom:${i * 5}px" alt="">`; return `<span class="chips" style="height:${24 + k * 5}px">${h}</span>`; };
