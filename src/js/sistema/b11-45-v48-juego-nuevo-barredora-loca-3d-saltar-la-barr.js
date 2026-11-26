GAME_TAGS.sweep = ['miniatures', 'stopwatch'];
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    const gd = H.gd, G = GAMES.sweep;
    if (H.game === G && gd.ps && (H.phase === 'sw-go' || H.phase === 'sw-ready')) {
      const s = gd.ps[p.id]; if (!s || s.out) return; if (H.phase === 'sw-ready') return joyAct(p, { a: 'joy', x: 0, y: 0, b: s.lb });
      const M = p._sw || (p._sw = { b: 0, skill: .7 + Math.random() * .3, tx: 0, tz: 0, tT: 0 }); M.tT -= .1;
      if (M.tT <= 0) { const a = Math.random() * 6.28, d = 2.4 + Math.random() * 3.2; M.tx = Math.sin(a) * d; M.tz = Math.cos(a) * d; M.tT = 1.5 + Math.random() * 2; }
      let x = M.tx - s.x, y = M.tz - s.z; const d = Math.hypot(x, y); if (d < .4) { x = 0; y = 0; } else { x /= d; y /= d; }
      const r = Math.hypot(s.x, s.z), phi = Math.atan2(s.x, s.z), w = gd.w;
      for (let b = 0; b < gd.bars; b++) { let diff = Math.atan2(Math.sin(phi - (gd.th + b * Math.PI)), Math.cos(phi - (gd.th + b * Math.PI))) * Math.sign(w); if (diff < 0) diff += 6.283; const tArr = diff / Math.max(.3, Math.abs(w));
        if (s.gr && tArr < .52 - (1 - M.skill) * .12 && tArr > .1 && Math.random() < .6 + M.skill * .38) M.b++; }
      return joyAct(p, { a: 'joy', x, y, b: M.b });
    }
    return ob(p);
  };
})();
