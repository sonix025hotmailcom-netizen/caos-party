/* ---------- bots ---------- */
(() => {
  const oj = botJoy;
  botJoy = function (p, M, act) {
    const gd = H.gd;
    if (H.game === GAMES.chef && gd.ps) {
      const s = gd.ps[p.id]; let tx = 0, tz = 0, best = 1e9;
      gd.claim = gd.claim || {}; let bestId = null;
      for (const it of gd.items) { if (it.done || (gd.claim[it.id] && gd.claim[it.id] !== p.id && gd.ps[gd.claim[it.id]])) continue; const tl = Math.sqrt(Math.max(0, it.y) / 6.5), d = Math.hypot(it.x - s.x, it.z - s.z), w = it.type === 'bomb' ? -1 : it.type === 'gold' ? 2.5 : 1; if (w < 0) continue; const sc = d / 8 - tl - w * .3; const reach = d / 8 < tl + .6, sc2 = reach ? sc : 50 + d; if (sc2 < best) { best = sc2; tx = it.x; tz = it.z; bestId = it.id; } }
      for (const k in gd.claim) if (gd.claim[k] === p.id) delete gd.claim[k]; if (bestId != null) gd.claim[bestId] = p.id;
      let x = best < 1e9 ? tx - s.x : -s.x * .2, y = best < 1e9 ? tz - s.z : -s.z * .2;
      for (const it of gd.items) if (it.type === 'bomb' && !it.done && it.y < 6) { const dx = s.x - it.x, dz = s.z - it.z, d = Math.hypot(dx, dz); if (d < 1.8) { x += dx / (d || .1) * 3; y += dz / (d || .1) * 3; } }
      for (const rt of gd.rats) if (Math.abs(rt.z - s.z) < 1.3 && Math.sign(s.x - rt.x) === Math.sign(rt.vx) && Math.abs(s.x - rt.x) < 4) y += s.z > rt.z ? 3 : -3;
      const m = Math.hypot(x, y); act({ a: 'joy', x: m > .2 ? x / m : 0, y: m > .2 ? y / m : 0, b: 0 }); return;
    }
    if (H.game === GAMES.paintball && gd.ps) {
      const s = gd.ps[p.id]; if (!s || !s.alive) return;
      const foes = gd.ids.filter(id => id !== p.id && gd.ps[id].alive).map(id => gd.ps[id]); let x = 0, y = 0;
      if (foes.length) {
        const f = foes.sort((a, b) => Math.hypot(a.x - s.x, a.z - s.z) - Math.hypot(b.x - s.x, b.z - s.z))[0], dx = f.x - s.x, dz = f.z - s.z, d = Math.hypot(dx, dz) || 1;
        M.strafe = M.strafe || (Math.random() < .5 ? 1 : -1); if (Math.random() < .01) M.strafe *= -1;
        const want = d > 6 ? 1 : d < 3.5 ? -1 : 0;
        x = dx / d * want + (-dz / d) * M.strafe * .8 + (Math.random() - .5) * .3; y = dz / d * want + (dx / d) * M.strafe * .8 + (Math.random() - .5) * .3;
        let da = Math.atan2(dx, dz) - s.face; da = Math.atan2(Math.sin(da), Math.cos(da));
        const lead = Math.atan2(dx + (f.moving ? Math.sin(f.face) * d * .12 : 0), dz + (f.moving ? Math.cos(f.face) * d * .12 : 0));
        if (Math.abs(da) < .35 && d < 12 && Math.random() < .7) M.b++;
        if (Math.abs(da) > .35 || Math.random() < .35) { x = Math.sin(lead); y = Math.cos(lead); }
      }
      const m = Math.hypot(x, y) || 1; act({ a: 'joy', x: x / m, y: y / m, b: M.b }); return;
    }
    return oj(p, M, act);
  };
})();
