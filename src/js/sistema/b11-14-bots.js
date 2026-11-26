/* ---------- bots ---------- */
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.hilo && H.phase === 'hl-go') {
      const gd = H.gd; if (gd.bet[p.id] || !gd.chips[p.id]) return;
      const M = p._hl || (p._hl = {}); if (M.k !== gd.turn) { M.k = gd.turn; M.t = Date.now() + 1200 + rand(4000); }
      if (Date.now() < M.t) return;
      const v = gd.cur.v, c = Math.random() < .04 ? 'eq' : (v < 6 ? 'up' : v > 6 ? 'down' : pickR(['up', 'down'])), conf = Math.abs(v - 6);
      return GAMES.hilo.onAct(p, { a: 'hilo', c, n: conf > 4 ? 3 : conf > 2 ? 2 : 1 });
    }
    if (H.game === GAMES.rocks && (H.phase === 'as-go' || H.phase === 'as-ready')) {
      const gd = H.gd, s = gd.ps[p.id]; if (!s) return; const M = p._as || (p._as = { b: 0 });
      const act = (x, y) => joyAct(p, { a: 'joy', x, y, b: M.b });
      if (!s.alive || H.phase === 'as-ready') return act(0, 0);
      const tg = gd.ufos[0] || gd.rocks.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0]; if (!tg) return act(0, 0);
      const dx = tg.x - s.x, dy = tg.y - s.y, d = Math.hypot(dx, dy) || 1, aim = Math.atan2(dy, dx); let da = aim - s.a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) < .25 && d < 420 && s.cd <= 0) M.b++;
      if (d < 130) return act(-dx / d, -dy / d);
      return act(dx / d * (d > 300 ? 1 : .25), dy / d * (d > 300 ? 1 : .25));
    }
    if (H.game === GAMES.marbles && (H.phase === 'mb-go' || H.phase === 'mb-ready') && H.gd.ps) {
      const gd = H.gd, s = gd.ps[p.id], Mb = GAMES.marbles; if (!s || s.done) return; const M = p._mb || (p._mb = { b: 0, sk: 0, skill: .7 + Math.random() * .3 });
      const look = 60 + Math.max(0, s.vx) * .28, ahead = Mb.groundY(s.x + look), here = Mb.groundY(s.x);
      const danger = gd.boxes.some(b => b.x - s.x > 10 && b.x - s.x < look + 20) || gd.spins.some(b => b.x - s.x > 20 && b.x - s.x < look + 70) || gd.saws.some(w => w.x - s.x > 30 && w.x - s.x < look + 60) || gd.spikes.some(q => q.x0 - s.x > 5 && q.x0 - s.x < look + 10);
      if (Math.abs(s.vx) < 30) M.sk += .22; else M.sk = 0;
      if ((ahead == null || danger || (here != null && ahead < here - 30) || M.sk > .8) && s.gnd > 0 && Math.random() < M.skill) { M.b++; M.sk = 0; }
      return joyAct(p, { a: 'joy', x: Math.random() < .95 ? M.skill + .05 : .2, y: 0, b: M.b });
    }
    return ob(p);
  };
})();
