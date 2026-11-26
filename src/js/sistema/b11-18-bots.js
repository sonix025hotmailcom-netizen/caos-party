/* ---------- bots ---------- */
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.domino && H.phase === 'dm-go') {
      const gd = H.gd, M = p._dm || (p._dm = { t: 0 }); if (Date.now() < M.t) return; M.t = Date.now() + 1300 + rand(2600);
      const h = gd.hand[p.id], i = h.findIndex(t => GAMES.domino.fits(t));
      return i >= 0 ? GAMES.domino.onAct(p, { a: 'play', i }) : GAMES.domino.onAct(p, { a: 'draw' });
    }
    if (H.game === GAMES.manos && H.phase === 'mn-go') {
      const gd = H.gd, c = gd.cur, M = p._mn || (p._mn = {}); if (gd.ans[p.id]) return;
      if (M.r !== gd.r) { M.r = gd.r; M.t = Date.now() + 450 + rand(1400); M.fool = c.trap && Math.random() < .3; M.miss = Math.random() < .12; }
      if (Date.now() < M.t || (c.trap && !M.fool)) return;
      return GAMES.manos.onAct(p, { a: 'gesto', g: M.miss ? rand(6) : c.g });
    }
    return ob(p);
  };
})();
