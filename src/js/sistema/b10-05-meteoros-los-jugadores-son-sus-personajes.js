/* ---------- ☄️ Meteoros: los jugadores son sus personajes ---------- */
(() => {
  const M = GAMES.meteor, ob = M.build3D, od = M.draw, os = M.start;
  M.start = function () { preloadChars(onlineIds().map(id => charOf(pl(id)))); return os.call(this); };
  M.build3D = function (T) {
    const r = ob.call(this, T), gd = H.gd; r.chars = {};
    for (const id of gd.ids) {
      C3D.load(charURL(charOf(pl(id)))).then(g => {
        const grp = r.pm[id]; if (!grp || H.gd !== gd) return;
        const a = C3D.make(g, hFor(g, 2.0), tintFor(g, id)); a.play('Idle'); grp.add(a.obj); r.chars[id] = a;
        grp.children.forEach(c => { if (c.isMesh && c.geometry && c.geometry.type === 'SphereGeometry') c.visible = false; if (c.isSprite) c.position.y = 2.1; });
      }).catch(() => {});
    }
    r.last = performance.now();
    return r;
  };
  M.draw = function (ctx) {
    const gd = H.gd, r = gd.r3;
    if (r && r.chars) {
      const now = performance.now(), dt = Math.min(.05, (now - r.last) / 1000); r.last = now;
      for (const id of gd.ids) {
        const a = r.chars[id]; if (!a) continue; const p = gd.ps[id];
        const dx = p.x - (a.px ?? p.x), dz = p.z - (a.pz ?? p.z); a.px = p.x; a.pz = p.z;
        const sp = Math.hypot(dx, dz) / Math.max(dt, .001);
        if (sp > .6) { a.obj.rotation.y = Math.atan2(dx, dz); a.play('Run'); } else a.play('Idle');
        a.mixer.update(dt);
      }
    }
    return od.call(this, ctx);
  };
})();
