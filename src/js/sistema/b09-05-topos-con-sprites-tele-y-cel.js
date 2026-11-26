/* ---------- 🐹 Topos con sprites (tele y cel) ---------- */
const MOLE_IMG = { mole: 'plat/mouse_rest.png', gold: 'plat/star.png', bomb: 'plat/bomb.png' };
(() => {
  const M = GAMES.mole, oStart = M.start;
  M.start = function () { preload(Object.values(MOLE_IMG)); return oStart.call(this); };
  const oCell = M.cell;
  M.cell = function (i, popIn) {
    oCell.call(this, i, popIn);
    const el = $('#mh' + i), h = H.gd.holes[i]; if (!el || !h || h.hit) return;
    const sp = el.querySelector('span'); if (sp) { sp.innerHTML = `<img class="mimg" src="assets/${MOLE_IMG[h.type]}" alt="">`; if (popIn) A({ targets: sp, translateY: [40, 0], scale: [.3, 1], duration: 300, easing: 'easeOutBack' }); }
  };
})();
(() => {
  const og = XS.grid9;
  XS.grid9 = function (v) {
    og(v);
    const bs = [...app.querySelectorAll('#pg button')], prev = P.onLive;
    P.onLive = m => {
      if (m.kind === 'mole') { m.h.forEach((s, i) => { const sp = bs[i].firstChild, key = String(s); if (sp.dataset.k === key) return; sp.dataset.k = key; sp.innerHTML = !s ? '' : String(s)[0] === 'x' ? '💥' + String(s).slice(1) : `<img class="mimg" src="assets/${MOLE_IMG[s]}" alt="">`; bs[i].className = s && String(s)[0] !== 'x' ? 'up ' + s : ''; }); return; }
      if (prev) prev(m);
    };
  };
})();
