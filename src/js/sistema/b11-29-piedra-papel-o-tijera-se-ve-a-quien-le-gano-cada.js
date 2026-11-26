GAME_TAGS.dungeon = ['miniatures']; GAME_TAGS.ovni = ['miniatures', 'puzzle'];
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.dungeon && (H.phase === 'dg-go' || H.phase === 'dg-ready')) {
      const gd = H.gd, s = gd.ps[p.id]; if (!s) return; const M = p._dg || (p._dg = { b: 0, wd: 0, dir: [1, 0] });
      const act = (x, y) => joyAct(p, { a: 'joy', x, y, b: M.b });
      if (H.phase === 'dg-ready') return act(0, 0);
      const near = (arr) => arr.slice().sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y))[0];
      const gh = near(gd.ghosts.filter(g => g.spawn <= 0)), tg = gh && Math.hypot(gh.x - s.x, gh.y - s.y) < 90 ? gh : near(gd.chests) || near(gd.coins);
      if (!tg) return act(0, 0);
      const dx = tg.x - s.x, dy = tg.y - s.y, d = Math.hypot(dx, dy) || 1;
      if (gh && tg === gh && d < 65 && s.cd <= 0) M.b++;
      if (M.wd > 0) { M.wd -= .2; return act(...M.dir); }
      if (Math.abs(s.x - (M.lx || 0)) + Math.abs(s.y - (M.ly || 0)) < 2) { M.st = (M.st || 0) + 1; if (M.st > 4) { M.st = 0; M.wd = .8; const a = Math.random() * 6.28; M.dir = [Math.cos(a), Math.sin(a)]; } } else M.st = 0;
      M.lx = s.x; M.ly = s.y;
      return act(dx / d, dy / d);
    }
    return ob(p);
  };
})();
