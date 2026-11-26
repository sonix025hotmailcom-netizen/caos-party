GAME_TAGS.crown = ['miniatures', 'interaction'];
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    const gd = H.gd, G = GAMES.crown;
    if (H.game === G && gd.ps && (H.phase === 'cr-go' || H.phase === 'cr-ready')) {
      const s = gd.ps[p.id]; if (!s) return; if (H.phase === 'cr-ready' || s.dead > 0) return joyAct(p, { a: 'joy', x: 0, y: 0, b: s.lb });
      const M = p._cr || (p._cr = { b: 0, skill: .5 + Math.random() * .5, ox: (Math.random() - .5) * 1.6, oz: (Math.random() - .5) * 1.6, wait: 0 }); M.wait -= .22; if (M.wait <= 0 && gd.crowd > 2 && Math.random() < .08) M.wait = 2 + Math.random() * 3;
      let tx = gd.zx + M.ox * (M.wait > 0 ? 2.6 : .6), tz = gd.zz + M.oz * (M.wait > 0 ? 2.6 : .6);
      const near = (gd.items || []).filter(it => it.y < 3).sort((a, b) => Math.hypot(a.x - s.x, a.z - s.z) - Math.hypot(b.x - s.x, b.z - s.z))[0]; if (near && Math.hypot(near.x - s.x, near.z - s.z) < 3.5 && !s.ham) { tx = near.x; tz = near.z; }
      const bomb = (gd.bombs || []).find(b => Math.hypot(b.x - s.x, b.z - s.z) < 2.6); if (bomb && Math.random() < .5 + M.skill * .5) { const dx = s.x - bomb.x, dz = s.z - bomb.z, dd = Math.hypot(dx, dz) || 1; tx = s.x + dx / dd * 3; tz = s.z + dz / dd * 3; } if (Math.hypot(s.x, s.z) > G.R - 1) { tx = 0; tz = 0; }
      let x = tx - s.x, y = tz - s.z; const d = Math.hypot(x, y); if (d < .35) { x = 0; y = 0; } else { x /= d; y /= d; }
      const foe = gd.ids.map(i => gd.ps[i]).find(o => o !== s && o.dead <= 0 && Math.hypot(o.x - s.x, o.z - s.z) < 1.6 && Math.hypot(o.x - gd.zx, o.z - gd.zz) < G.ZR + .5);
      if (foe && s.cd <= 0 && Math.random() < .35 * M.skill) { const fx = foe.x - s.x, fz = foe.z - s.z, fd = Math.hypot(fx, fz) || 1; x = fx / fd; y = fz / fd; M.b++; }
      return joyAct(p, { a: 'joy', x, y, b: M.b });
    }
    return ob(p);
  };
})();
