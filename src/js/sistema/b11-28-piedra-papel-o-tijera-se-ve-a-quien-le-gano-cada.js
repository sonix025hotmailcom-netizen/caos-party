/* ---------- Piedra, Papel o Tijera: se ve a quién le ganó cada uno ---------- */
(() => {
  const G = GAMES.ppt, or = G.render;
  G.desc = '¡Todos contra todos a la vez (no es torneo)! Elegí piedra ✊, papel ✋ o tijera ✌️. Tu jugada se compara con la de TODOS: ganás 1 punto por cada jugador al que le ganés. Si somos 6 y sos el único con piedra contra 3 tijeras, ¡+3! Hay rondas AL REVÉS 🙃.';
  G.render = function (ph) {
    const h = or.call(this, ph); if (ph !== 'pp-rev') return h;
    const gd = H.gd;
    setTimeout(() => document.querySelectorAll('.ppcard').forEach(card => { const name = card.querySelector('b')?.textContent || ''; const id = gd.ids.find(i => name.includes(pl(i)?.name || '\u0000')); if (!id || gd.pick[id] < 0) return; const beat = gd.ids.filter(o => o !== id && gd.pick[o] >= 0 && G.beats(gd.pick[id], gd.pick[o], gd.rev) > 0); if (beat.length) card.insertAdjacentHTML('beforeend', `<small class="ppbeat">le ganó a ${beat.map(o => pl(o)?.emoji).join('')}</small>`); }), 30);
    return h;
  };
})();

/* =================================================================== */
/* ⚔️ CALABOZO LOCO                                                     */
/* =================================================================== */
const DGW = ['weapon_sword', 'weapon_axe', 'weapon_hammer', 'weapon_spear', 'weapon_longsword', 'weapon_axe_double', 'weapon_staff', 'weapon_dagger'];
