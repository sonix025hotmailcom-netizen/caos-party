/* ---------- bots para tanques y dados ---------- */
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.dice && H.phase === 'dc-go') {
      const gd = H.gd, s = gd.st[p.id]; if (!s || s.done) return;
      const M = p._dc || (p._dc = {}); const k = gd.r + ':' + s.rolls; if (M.k !== k) { M.k = k; M.t = Date.now() + 1100 + rand(2200); }
      if (Date.now() < M.t) return; M.t = Date.now() + 99999;
      if (!s.rolls) return GAMES.dice.onAct(p, { a: 'roll' });
      const sc = GAMES.dice.score(s.d, s.rolls); if (sc.b >= 30 || (sc.b >= 15 && Math.random() < .3)) return GAMES.dice.onAct(p, { a: 'stand' });
      const c = [0, 0, 0, 0, 0, 0, 0]; s.d.forEach(v => c[v]++);
      let keep = c.indexOf(Math.max(...c)); if (c[keep] === 1) keep = Math.random() < .5 ? gd.lucky : 6;
      s.d.forEach((v, i) => { const want = v === keep ? 1 : 0; if (s.hold[i] !== want) GAMES.dice.onAct(p, { a: 'hold', i }); });
      return GAMES.dice.onAct(p, { a: 'roll' });
    }
    if (H.game === GAMES.tanks && (H.phase === 'tk-go' || H.phase === 'tk-ready')) {
      const gd = H.gd, s = gd.ps[p.id]; if (!s) return;
      const M = p._tk || (p._tk = { b: 0, side: 1, lx: s.x, ly: s.y, st: 0, wander: 0, dir: [1, 0] });
      const act = (x, y) => joyAct(p, { a: 'joy', x, y, b: M.b });
      if (!s.alive || H.phase === 'tk-ready') return act(0, 0);
      M.st += .22; if (M.st > 1.2) { if (Math.hypot(s.x - M.lx, s.y - M.ly) < 12) { M.wander = .8; const a = Math.random() * 6.28; M.dir = [Math.cos(a), Math.sin(a)]; } M.lx = s.x; M.ly = s.y; M.st = 0; }
      if (M.wander > 0) { M.wander -= .22; return act(...M.dir); }
      const foes = gd.ids.filter(id => id !== p.id && gd.ps[id].alive).map(id => gd.ps[id]).sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
      const f = foes[0]; if (!f) return act(0, 0);
      const dx = f.x - s.x, dy = f.y - s.y, d = Math.hypot(dx, dy) || 1, aim = Math.atan2(dy, dx);
      let da = aim - s.a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (s.cd <= .05 && d < 470) { if (Math.abs(da) < .16 + Math.random() * .1) M.b++; return act(dx / d * .3, dy / d * .3); }
      if (Math.random() < .02) M.side *= -1;
      if (d > 260) act(dx / d + (Math.random() - .5) * .4, dy / d + (Math.random() - .5) * .4);
      else act(-dy / d * M.side + dx / d * .2, dx / d * M.side + dy / d * .2);
      return;
    }
    return ob(p);
  };
})();
