GAME_TAGS.hexfall = ['miniatures', 'stopwatch'];
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    const gd = H.gd, G = GAMES.hexfall;
    if (H.game === G && gd.ps && (H.phase === 'hx-go' || H.phase === 'hx-ready')) {
      const s = gd.ps[p.id]; if (!s || s.out) return; if (H.phase === 'hx-ready') return joyAct(p, { a: 'joy', x: 0, y: 0, b: s.lb });
      const M = p._hx || (p._hx = { b: 0, tgt: null, tT: 0, skill: .5 + Math.random() * .45 }); M.tT -= .1;
      const li = s.li || 0, here = G.solidAt(li, s.x, s.z);
      if (!M.tgt || M.tT <= 0 || M.tgt.fall || M.tgt.t0 || Math.hypot(G.pos(M.tgt)[0] - s.x, G.pos(M.tgt)[1] - s.z) < .7) {
        const cand = gd.tiles.filter(t => t.li === li && !t.t0 && !t.fall); let best = null, bs = -1e9;
        for (let k = 0; k < 40 && cand.length; k++) { const t = pickR(cand), [x, z] = G.pos(t), d = Math.hypot(x - s.x, z - s.z); if (d > 6) continue; const sc = -Math.abs(d - 2.5) - Math.hypot(x, z) * .15 * M.skill + Math.random(); if (sc > bs) { bs = sc; best = t; } }
        M.tgt = best; M.tT = 1 + Math.random();
      }
      let x = 0, y = 0; if (M.tgt) { const [tx, tz] = G.pos(M.tgt), d = Math.hypot(tx - s.x, tz - s.z) || 1; x = (tx - s.x) / d; y = (tz - s.z) / d; }
      if (s.gr && here && here.t0 && gd.t - here.t0 > G.FALL * (.55 + M.skill * .3) && Math.random() < .5) M.b++;
      return joyAct(p, { a: 'joy', x, y, b: M.b });
    }
    return ob(p);
  };
})();
