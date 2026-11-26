/* el botón de habilidad cuenta sus toques en P._joyB para que el teclado y el touch no se pisen */

/* ================== ☄️ METEOROS: MUCHO MÁS DIFÍCIL ================== */
Object.assign(GAMES.meteor, {
  desc: '¡En 3D! Caen meteoros cada vez más rápido y la plataforma se va ENCOGIENDO 😱. Cada tanto cae un MEGA meteoro. Miren las sombras rojas y esquiven con el joystick (o WASD).',
  step(dt) {
    const gd = H.gd; gd.t += dt; gd.spawn -= dt; gd.mega = (gd.mega ?? 8) - dt;
    gd.R = Math.max(5.5, 10 - gd.t * .075);
    const R = gd.R, alive = gd.ids.filter(id => gd.ps[id].alive);
    const add = (x, z, T0, r, mega) => gd.ms.push({ id: gd.mid++, x, z, t: T0, T: T0, r, mega });
    const spot = () => { if (alive.length && Math.random() < .82) { const t = gd.ps[pickR(alive)]; return [t.x + (Math.random() - .5) * 2.6, t.z + (Math.random() - .5) * 2.6]; } const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * R; return [Math.cos(a) * r, Math.sin(a) * r]; };
    if (gd.spawn <= 0) {
      gd.spawn = Math.max(.16, .75 - gd.t * .018);
      const n = 1 + Math.floor(gd.t / 14), T0 = Math.max(.6, 1.25 - gd.t * .012);
      for (let k = 0; k < n; k++) { const [x, z] = spot(); add(x, z, T0 + k * .08, 1.6 + Math.random() * .7); }
    }
    if (gd.mega <= 0) { gd.mega = Math.max(4.5, 9 - gd.t * .07); const [x, z] = spot(); add(x, z, 1.5, 3.3, true); beep(70, .6, 'sawtooth', .07); }
    for (const id of alive) { const p = gd.ps[id], i = inp(id); p.x += i.x * 7.2 * dt; p.z += i.y * 7.2 * dt; const d = Math.hypot(p.x, p.z); if (d > R - .45) { p.x *= (R - .45) / d; p.z *= (R - .45) / d; } }
    for (const m of gd.ms) {
      m.t -= dt;
      if (m.t <= 0 && !m.hit) {
        m.hit = true; gd.fx.push({ id: m.id, x: m.x, z: m.z, t: 0, r: m.r }); beep(m.mega ? 55 : 90, .35, 'sawtooth', .07); if (m.mega) shakeScreen();
        for (const id of alive) { const p = gd.ps[id]; if (p.alive && Math.hypot(p.x - m.x, p.z - m.z) < m.r) { p.alive = false; gd.out.push(id); SFX.bad(); shakeScreen(); sync(); updateStrip(); } }
      }
    }
    gd.ms = gd.ms.filter(m => !m.hit); gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < .6);
    if (gd.r3) { const s = R / GAMES.meteor.R; gd.r3.scene.children.forEach(o => { if (o.userData.plat) o.scale.set(s, 1, s); }); }
    const left = gd.ids.filter(id => gd.ps[id].alive).length;
    if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.meteor.end(); }, 1300); }
  },
});
const _build3D0 = GAMES.meteor.build3D;
GAMES.meteor.build3D = function (T) {
  const r = _build3D0.call(this, T);
  r.scene.children.forEach(o => { if (o.geometry && (o.geometry.type === 'CylinderGeometry' || o.geometry.type === 'TorusGeometry')) o.userData.plat = true; });
  return r;
};
const _mdraw0 = GAMES.meteor.draw;
GAMES.meteor.draw = function (ctx) {
  const gd = H.gd, R0 = GAMES.meteor.R; if (!gd.r3 && gd.R) { GAMES.meteor.R = gd.R; try { _mdraw0.call(GAMES.meteor, ctx); } finally { GAMES.meteor.R = R0; } return; }
  return _mdraw0.call(GAMES.meteor, ctx);
};


