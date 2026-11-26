/* ---------- el locutor: rondas, cuenta regresiva y ganador ---------- */
(() => {
  const onr = nextRound;
  nextRound = function () {
    onr();
    if (H.phase === 'intro') {
      const last = H.roundIdx === H.order.length - 1, n = H.roundIdx + 1;
      if (last && n > 1) setTimeout(() => SND.voice('final_round'), 700);   // solo se anuncia la ronda final
    } else if (H.phase === 'final') { setTimeout(() => SND.voice('game_over'), 300); setTimeout(() => SND.voice('winner'), 2300); }
  };
  /* números 3-2-1 y "¡FIGHT!" en las cuentas regresivas de los juegos (no en la presentación) */
  let lastCd = '';
  setInterval(() => {
    const c = document.querySelector('#cdown'); if (!c || !H.code || H.phase === 'intro' || H.phase === 'lobby') { lastCd = ''; return; }
    const t = c.textContent.trim(); if (t === lastCd) return; lastCd = t;
    if (t === '3' || t === '2' || t === '1') SND.voice(t, .8);
    else if (/YA/.test(t)) SND.voice(pickR(['fight', 'fight', 'begin']), .95);
  }, 60);
  /* al mostrar resultados de un minijuego */
  const osp = setPhase;
  setPhase = function (ph, ...a) {
    const r = osp(ph, ...a);
    if (/-res$/.test(ph) && H.code) setTimeout(() => SND.voice(Math.random() < .15 ? 'flawless_victory' : 'winner'), 450);
    return r;
  };
})();

/* =================================================================== */
/* 💥 GUERRA DE TANQUES                                                 */
/* =================================================================== */
const TK = { R: 20, SPD: 175, BSPD: 560, CD: .5, HP: 3, T: 60000 };
const tkTint = (() => { const cache = {}; return (img, col) => {
  const k = img.src + col; if (cache[k]) return cache[k]; if (!img.complete || !img.naturalWidth) return null;
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const g = c.getContext('2d');
  g.drawImage(img, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(img, 0, 0); return cache[k] = c;
}; })();
