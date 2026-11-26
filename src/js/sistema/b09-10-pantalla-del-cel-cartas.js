/* ---------- pantalla del cel: cartas ---------- */
XS.memo = function (v) {
  app.innerHTML = shell(`<div class="turnlbl ${v.myTurn ? 'me' : ''}">${v.myTurn ? '¡TU TURNO! Volteá 2 cartas' : `Turno de ${esc(v.who)}…`}</div>
    <div class="pmemo">${v.cards.map((c, i) => { const f = c ? c.slice(2) : '', st = c ? c[0] : ''; return `<button class="pmc ${st === 'm' ? 'done' : st === 'o' ? 'open' : ''}" data-i="${i}" ${!v.myTurn || c ? 'disabled' : ''} style="background-image:url(${c ? cardSrc(f) : 'assets/cards/0_CardBack.webp'})"><b>${i + 1}</b></button>`; }).join('')}</div>`, v.myTurn);
  app.querySelectorAll('.pmc').forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'flip', i: +b.dataset.i }); b.disabled = true; b.classList.add('open'); if (navigator.vibrate) navigator.vibrate(15); });
};
/* bots */
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.memo && H.phase === 'mm-go') {
      const gd = H.gd; if (gd.busy || GAMES.memo.cur() !== p.id) return;
      if (!p._mm || p._mm.k !== gd.turnId + ':' + gd.open.length) p._mm = { k: gd.turnId + ':' + gd.open.length, t0: Date.now() };
      if (Date.now() - p._mm.t0 < 1100) return;
      const hidden = gd.state.map((s, i) => s || gd.open.includes(i) ? -1 : i).filter(i => i >= 0); if (!hidden.length) return;
      let pick = null;
      if (gd.open.length === 1 && Math.random() < .7) pick = hidden.find(i => gd.seen[i] === gd.deck[gd.open[0]]);
      if (pick == null && gd.open.length === 0 && Math.random() < .7) { for (const i of hidden) { const j = hidden.find(k => k !== i && gd.seen[k] && gd.seen[k] === gd.seen[i]); if (gd.seen[i] && j != null) { pick = i; break; } } }
      if (pick == null) pick = pickR(hidden.filter(i => !gd.seen[i]).length ? hidden.filter(i => !gd.seen[i]) : hidden);
      GAMES.memo.onAct(p, { a: 'flip', i: pick });
      return;
    }
    return ob(p);
  };
  const oj = botJoy;
  botJoy = function (p, M, act) {
    const gd = H.gd;
    if (H.game === GAMES.planes && gd.ps) {
      const s = gd.ps[p.id]; if (!s || !s.alive) return;
      const foes = gd.ids.filter(id => id !== p.id && gd.ps[id].alive).map(id => gd.ps[id]);
      let x = Math.cos(s.ang), y = Math.sin(s.ang);
      if (foes.length) {
        const f = foes.sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0], dx = f.x - s.x, dy = f.y - s.y, d = Math.hypot(dx, dy) || 1;
        x = dx / d + (Math.random() - .5) * .6; y = dy / d + (Math.random() - .5) * .6;
        let da = Math.atan2(dy, dx) - s.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < .35 && d < 450 && Math.random() < .5) M.b++;
      }
      act({ a: 'joy', x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), b: M.b });
      return;
    }
    return oj(p, M, act);
  };
})();
/* créditos */
(() => { const os = showHome; showHome = function () { os(); const c = app.querySelector('.credit'); if (c) c.innerHTML = 'Arte CC0: personajes, cartas y robot de Quaternius · sprites, banderas, aviones y cielos de Kenney · Hecho con three.js, Matter.js, GSAP, anime.js y Tone.js'; }; })();


