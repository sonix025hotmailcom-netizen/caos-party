const T3C = c => parseInt(c.replace('#', ''), 16);
GAME_TAGS.race3d = ['miniatures', 'stopwatch']; GAME_TAGS.golf = ['miniatures', 'puzzle']; GAME_TAGS.qcambio = ['puzzle'];

XS.qcambio = function (v) {
  app.innerHTML = shell(`<div class="pqc"><div class="pmn-top">Ronda ${v.r}/${v.N} · <b>¿Qué cambió?</b></div>${v.opts.map((o, i) => `<button class="btn big pqcb ${v.picked === i ? 'on' : ''}" data-i="${i}" ${v.picked >= 0 ? 'disabled' : ''}><b>${'ABCD'[i]}</b> ${esc(o)}</button>`).join('')}</div>`, true);
  app.querySelectorAll('.pqcb').forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'qc', i: +b.dataset.i }); app.querySelectorAll('.pqcb').forEach(x => { x.disabled = true; x.classList.toggle('on', x === b); }); if (navigator.vibrate) navigator.vibrate(20); });
  P.onKey = (k, first) => { const m = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }; if (first && k in m) app.querySelectorAll('.pqcb')[m[k]]?.click(); };
};

(() => {
  const ob = botBrain;
  botBrain = function (p) {
    const gd = H.gd;
    if (H.game === GAMES.race3d && (H.phase === 'rc-go' || H.phase === 'rc-ready') && gd.ps) {
      const s = gd.ps[p.id]; if (!s) return; const M = p._rc || (p._rc = { b: 0, look: 16 + rand(8), lane: (Math.random() - .5) * 3, skill: .85 + Math.random() * .15 });
      if (H.phase === 'rc-ready') return joyAct(p, { a: 'joy', x: 0, y: 0, b: M.b });
      let lane = M.lane; for (const c of gd.cones) { if (c.hit > 0) continue; const d = (c.i - s.idx + gd.M) % gd.M; if (d < 45 && Math.abs(c.lat - lane) < 1.8) lane = -Math.sign(c.lat) * 2.2; }
      const j = (s.idx + M.look) % gd.M, a = gd.dirs[j], tx = gd.pts[j][0] + Math.cos(a) * lane, tz = gd.pts[j][1] - Math.sin(a) * lane;
      const da = angTo(s.a, Math.atan2(tx - s.x, tz - s.z)), turn = Math.abs(da);
      if (s.cd <= 0 && turn < .1 && Math.random() < .05) M.b++;
      return joyAct(p, { a: 'joy', x: Math.max(-1, Math.min(1, -da * 2.6)) * M.skill, y: turn > .9 ? 1 : turn > .45 && s.v > 15 ? 0 : -1, b: M.b });
    }
    if (H.game === GAMES.golf && H.phase === 'gf-go' && gd.b) {
      const b = gd.b[p.id]; if (!b || b.in) return; const M = p._gf || (p._gf = { b: 0, skill: .7 + Math.random() * .25 }), G = GAMES.golf;
      if (!G.still(b) || b.strokes >= 8) { M.plan = null; return joyAct(p, { a: 'joy', x: 0, y: 0, b: M.b }); }
      if (!M.plan || M.plan.s !== b.strokes || M.plan.h !== gd.hole) M.plan = { ...G.plan(b, gd.L, gd.t + 1, M.skill), s: b.strokes, h: gd.hole };
      const da = angTo(b.a, M.plan.a), dp = M.plan.pw - b.pw;
      if (Math.abs(da) < .025 && Math.abs(dp) < .035) { M.b++; M.plan = null; return joyAct(p, { a: 'joy', x: 0, y: 0, b: M.b }); }
      return joyAct(p, { a: 'joy', x: Math.abs(da) >= .025 ? Math.max(-1, Math.min(1, -da * 4)) : 0, y: Math.abs(dp) >= .035 ? (dp > 0 ? -1 : 1) * Math.min(1, Math.abs(dp) * 5 + .2) : 0, b: M.b });
    }
    if (H.game === GAMES.qcambio && H.phase === 'qc-go') {
      const M = p._qc || (p._qc = {}); if (gd.ans[p.id] != null) return;
      if (M.r !== gd.r) { M.r = gd.r; M.t = Date.now() + 2000 + rand(6000); } if (Date.now() < M.t) return;
      return GAMES.qcambio.onAct(p, { a: 'qc', i: Math.random() < .55 ? gd.okIdx : rand(gd.opts.length) });
    }
    return ob(p);
  };
})();
