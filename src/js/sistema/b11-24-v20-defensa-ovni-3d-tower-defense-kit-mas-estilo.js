(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.ovni && (H.phase === 'ov-go' || H.phase === 'ov-ready')) {
      const gd = H.gd, tw = gd.towers[p.id]; if (!tw) return; const M = p._ov || (p._ov = { b: 0, aim: .8 + Math.random() * .4 });
      const tg = gd.ufos.filter(u => Math.hypot(u.x - tw.x, u.z - tw.z) < 9.5).sort((a, b) => b.s - a.s)[0];
      if (!tg) return joyAct(p, { a: 'joy', x: 0, y: 0, b: M.b });
      const lead = .35, [fx, fz] = GAMES.ovni.posAt(tg.s + tg.sp * lead), dx = fx - tw.x, dz = fz - tw.z, d = Math.hypot(dx, dz) || 1;
      let da = Math.atan2(dx, dz) - tw.a; da = Math.atan2(Math.sin(da), Math.cos(da));
      if (Math.abs(da) < .18 * M.aim && tw.cd <= 0 && Math.random() < .85) M.b++;
      return joyAct(p, { a: 'joy', x: dx / d, y: dz / d, b: M.b });
    }
    return ob(p);
  };
})();
