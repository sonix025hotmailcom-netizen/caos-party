/* ---------- bots para los juegos nuevos ---------- */
const _botBrain0 = botBrain;
botBrain = function (p) {
  if (H.game === GAMES.tower && H.phase === 'tw-go') {
    const gd = H.gd; if (gd.state === 'aim' && GAMES.tower.cur() === p.id) {
      if (!p._tw || p._tw.d !== gd.drops) { const topB = gd.blocks.reduce((a, b) => !a || b.position.y < a.position.y ? b : a, null); p._tw = { d: gd.drops, t0: Date.now(), tol: 12 + rand(30) + gd.drops * 4, aim: topB ? topB.position.x + (Math.random() - .5) * gd.drops * 3 : 500 }; }
      const x = GAMES.tower.craneX();
      if (Date.now() - p._tw.t0 > 1200 && Math.abs(x - p._tw.aim) < p._tw.tol) GAMES.tower.onAct(p, { a: 'drop' });
    }
    return;
  }
  return _botBrain0(p);
};
const _botJoy0 = botJoy;
botJoy = function (p, M, act) {
  const gd = H.gd, g = H.game; let x = 0, y = 0;
  if (g === GAMES.futbol && gd.ball) {
    const b = gd.bodies[p.id], bl = gd.ball.position, dir = gd.team[p.id] ? -1 : 1;
    const tx = bl.x - dir * 34, ty = bl.y, dx = tx - b.position.x, dy = ty - b.position.y, d = Math.hypot(dx, dy) || 1;
    x = dx / d; y = dy / d;
    if (Math.hypot(bl.x - b.position.x, bl.y - b.position.y) < 60 && Math.random() < .35) M.b++;
  } else if (g === GAMES.meteor && gd.ps) {
    const s = gd.ps[p.id]; if (!s || !s.alive) return;
    let fx = -s.x * .08, fz = -s.z * .08;
    for (const m of gd.ms) { const dx = s.x - m.x, dz = s.z - m.z, d = Math.hypot(dx, dz); if (d < m.r + 1.5) { fx += dx / (d || .1) * 2; fz += dz / (d || .1) * 2; } }
    const n = Math.hypot(fx, fz); if (n > .05) { x = fx / n; y = fz / n; }
  } else return _botJoy0(p, M, act);
  act({ a: 'joy', x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), b: M.b });
};
