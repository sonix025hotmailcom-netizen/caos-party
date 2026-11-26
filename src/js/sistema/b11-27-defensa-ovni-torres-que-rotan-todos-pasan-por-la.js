/* ---------- Defensa Ovni: torres que rotan (todos pasan por la entrada), puntos por impacto y tema nevado ---------- */
(() => {
  const O = GAMES.ovni, os = O.start, ostep = O.step, ob = O.build, odraw = O.draw;
  O.desc = '¡En 3D! Los ovnis 🛸 siguen el camino hacia la base. Joystick para APUNTAR y botón para DISPARAR. Cada impacto da 1 punto y derribarlos da extra. Para que sea justo, cada 15 segundos ¡las torres rotan de lugar! 🔄 Si la base sobrevive, todos ganan +5.';
  O.start = function () {
    os.call(this); const gd = H.gd;
    gd.snow = Math.random() < .4;
    gd.slots = gd.ids.map(id => ({ x: gd.towers[id].x, z: gd.towers[id].z }));
    gd.ids.forEach((id, i) => { gd.towers[id].slot = i; gd.towers[id].hits = 0; });
    gd.rotT = 15;
  };
  O.step = function (dt) {
    ostep.call(this, dt); const gd = H.gd;
    if (H.phase === 'ov-go' && gd.ids.length > 1) {
      gd.rotT -= dt;
      if (gd.rotT <= 0) { gd.rotT = 15; gd.ids.forEach(id => { const tw = gd.towers[id]; tw.slot = (tw.slot + 1) % gd.slots.length; tw.x = gd.slots[tw.slot].x; tw.z = gd.slots[tw.slot].z; }); toastHost('🔄 ¡Cambio de torres!'); SND.play('ui_maximize_006', .5); sync(); }
    }
  };
  O.build = function (T) {
    const gd = H.gd;
    if (gd.snow) { const map = { 'tile': 'snow-tile', 'detail-tree-large': 'snow-detail-tree-large', 'detail-tree': 'snow-detail-tree', 'detail-rocks': 'snow-detail-rocks', 'detail-rocks-large': 'snow-detail-rocks-large', 'detail-crystal-large': 'snow-detail-crystal-large' }; gd.deco.forEach(d => d.m = map[d.m] || d.m); gd._tileName = 'snow-tile'; }
    const r = ob.call(this, T);
    if (gd.snow) { r.scene.background = new T.Color('#cbd5e1'); r.scene.fog = new T.Fog('#cbd5e1', 32, 70); r.snow = new T.Points(new T.BufferGeometry().setAttribute('position', new T.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => i % 3 === 1 ? Math.random() * 14 : (Math.random() - .5) * (i % 3 ? 18 : 30)), 3)), new T.PointsMaterial({ color: '#ffffff', size: .12 })); r.scene.add(r.snow); }
    return r;
  };
  O.draw = function (ctx) {
    const gd = H.gd, r = gd.r3;
    if (r && r.tw) for (const id of gd.ids) { const o = r.tw[id], tw = gd.towers[id]; if (!o) continue; const g = o.g, dx = tw.x - g.position.x, dz = tw.z - g.position.z, d = Math.hypot(dx, dz); if (d > .01) { g.position.x += dx * .12; g.position.z += dz * .12; g.position.y = .2 + Math.sin(Math.min(1, d / 4) * Math.PI) * 1.2; } else g.position.y = .2; }
    if (r && r.snow) { const a = r.snow.geometry.attributes.position; for (let i = 1; i < a.array.length; i += 3) { a.array[i] -= .03; if (a.array[i] < 0) a.array[i] = 14; } a.needsUpdate = true; }
    return odraw.call(this, ctx);
  };
})();
