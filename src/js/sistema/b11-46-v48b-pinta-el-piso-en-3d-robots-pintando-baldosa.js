/* ================== v48b — PINTA EL PISO en 3D: robots pintando baldosas que saltan al cambiar de color ================== */
const PAINT3 = {
  X: px => (px - 500) / 40, Z: py => (py - 300) / 40,
  build(T) {
    const gd = H.gd, r = arena3D(T, { bg: '#fce7f3' }), add = o => (r.scene.add(o), o), M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .6 }, o));
    r.scene.background = CARX.sky(T, ['#a78bfa', '#f0abfc', '#fbcfe8', '#fef3c7']); r.scene.fog = new T.Fog('#fbcfe8', 40, 95);
    r.cam.fov = 42; r.cam.far = 200; r.cam.updateProjectionMatrix();
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-8, 22, 12); Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 11, bottom: -11, near: .5, far: 70 }); sun.shadow.camera.updateProjectionMatrix(); }
    /* piso de afuera con manchas de pintura */
    const out = CARX.tex(T, 512, 512, (g, w, h) => { g.fillStyle = '#f5f5f4'; g.fillRect(0, 0, w, h); const C = ['#f43f5e', '#3b82f6', '#22c55e', '#facc15', '#a855f7', '#f97316']; for (let k = 0; k < 26; k++) { g.fillStyle = C[k % C.length] + 'aa'; const x = Math.random() * w, y = Math.random() * h, rr = 8 + Math.random() * 26; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); for (let q = 0; q < 7; q++) { g.beginPath(); g.arc(x + (Math.random() - .5) * rr * 3, y + (Math.random() - .5) * rr * 3, 2 + Math.random() * 5, 0, 7); g.fill(); } } }, [8, 8]);
    const fl = add(new T.Mesh(new T.PlaneGeometry(160, 160), new T.MeshStandardMaterial({ map: out, roughness: .9 }))); fl.rotation.x = -Math.PI / 2; fl.position.y = -.42; fl.receiveShadow = true;
    /* base del tablero */
    const base = add(new T.Mesh(new T.BoxGeometry(gd.cols + 1, .5, gd.rows + 1), M('#312e81', { roughness: .4 }))); base.position.y = -.25; base.receiveShadow = true;
    /* baldosas (una instancia por celda) */
    const geo = new T.BoxGeometry(.92, .22, .92); geo.translate(0, .11, 0);
    const im = new T.InstancedMesh(geo, M('#ffffff', { roughness: .35 }), gd.grid.length); im.receiveShadow = true; im.castShadow = true; add(im); r.im = im;
    r.tmp = new T.Object3D(); r.col = new T.Color(); r.pop = new Float32Array(gd.grid.length); r.own = new Array(gd.grid.length).fill(undefined); r.pc = {};
    gd.ids.forEach(id => r.pc[id] = new T.Color(pl(id)?.color || '#888'));
    r.e0 = new T.Color('#e9e5f5'); r.e1 = new T.Color('#d8d2ee');
    for (let k = 0; k < gd.grid.length; k++) PAINT3.tile(r, gd, k, 0);
    /* baldes de pintura en las esquinas y borde de colores */
    const C = gd.ids.map(id => pl(id)?.color || '#888'); const W2 = gd.cols / 2 + 1.6, D2 = gd.rows / 2 + 1.6;
    [[-W2, -D2], [W2, -D2], [-W2, D2], [W2, D2], [0, -D2 - .4], [-W2 - .4, 0], [W2 + .4, 0]].forEach(([x, z], k) => { const g = add(new T.Group()), c = C[k % C.length]; const b = new T.Mesh(new T.CylinderGeometry(.75, .62, 1.3, 20), M('#cbd5e1', { metalness: .6, roughness: .3 })); b.position.y = .25; b.castShadow = true; g.add(b); const p = new T.Mesh(new T.CylinderGeometry(.68, .68, .08, 20), M(c, { roughness: .15 })); p.position.y = .88; g.add(p); const drip = new T.Mesh(new T.CapsuleGeometry(.12, .5, 4, 8), M(c, { roughness: .15 })); drip.position.set(.7, .5, 0); g.add(drip); const hd = new T.Mesh(new T.TorusGeometry(.6, .04, 6, 20, Math.PI), M('#64748b')); hd.position.y = .9; hd.rotation.y = Math.random() * 3; g.add(hd); g.position.set(x, -.4, z); });
    const rim = CARX.tex(T, 512, 32, (g, w, h) => { const cc = C.length ? C : ['#f43f5e']; for (let x = 0; x < w; x += 32) { g.fillStyle = cc[(x / 32) % cc.length]; g.fillRect(x, 0, 32, h); } }, [8, 1]);
    [[0, -(gd.rows + 1) / 2, gd.cols + 1, 0], [0, (gd.rows + 1) / 2, gd.cols + 1, 0], [-(gd.cols + 1) / 2, 0, gd.rows + 1, 1], [(gd.cols + 1) / 2, 0, gd.rows + 1, 1]].forEach(([x, z, L, rot]) => { const m = add(new T.Mesh(new T.BoxGeometry(L, .35, .2), new T.MeshStandardMaterial({ map: rim, roughness: .4 }))); m.position.set(x, .05, z); m.rotation.y = rot ? Math.PI / 2 : 0; });
    /* ondas de bomba y salpicaduras */
    r.waves = []; CARX.sparks(T, r, 140);
    r.bots = {};
    gd.ids.forEach(id => C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.35), tintFor(g, id)); a.play('Idle'); const hold = new T.Group(); hold.add(a.obj); add(hold); const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, pl(id)?.color || '#fff'); lb.position.y = 2.05; lb.scale.set(2.5, .62, 1); lb.material.depthTest = false; lb.renderOrder = 10; hold.add(lb);
      const brush = new T.Group(); const st = new T.Mesh(new T.CylinderGeometry(.04, .04, .7, 6), M('#a16207')); st.position.y = .35; brush.add(st); const bh = new T.Mesh(new T.BoxGeometry(.28, .2, .1), M(pl(id)?.color || '#888', { roughness: .2 })); bh.position.y = .75; brush.add(bh); brush.position.set(.42, .55, .2); brush.rotation.z = -.5; hold.add(brush);
      a.hold = hold; a.brush = brush; r.bots[id] = a; }).catch(() => {}));
    return r;
  },
  tile(r, gd, k, h) { const x = (k % gd.cols) - gd.cols / 2 + .5, z = Math.floor(k / gd.cols) - gd.rows / 2 + .5; r.tmp.position.set(x, h, z); r.tmp.scale.set(1, 1 + h * 4, 1); r.tmp.updateMatrix(); r.im.setMatrixAt(k, r.tmp.matrix);
    const o = gd.grid[k]; if (o && r.pc[o]) r.col.copy(r.pc[o]); else r.col.copy(((k % gd.cols) + Math.floor(k / gd.cols)) % 2 ? r.e0 : r.e1); if (h > 0) r.col.lerp(r.e0.clone().setRGB(1, 1, 1), h * 1.2); r.im.setColorAt(k, r.col); },
  draw(ctx) {
    const gd = H.gd, r = gd.r3;
    if (!(r && r.renderer.domElement.isConnected)) return PAINT3.o2d.call(GAMES.paint, ctx);
    const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const T = r.T;
    let dirty = false;
    for (let k = 0; k < gd.grid.length; k++) { if (r.own[k] !== gd.grid[k]) { if (r.own[k] !== undefined) r.pop[k] = 1; r.own[k] = gd.grid[k]; PAINT3.tile(r, gd, k, 0); dirty = true; }
      if (r.pop[k] > 0) { r.pop[k] = Math.max(0, r.pop[k] - dt * 4); const u = r.pop[k]; PAINT3.tile(r, gd, k, Math.sin(u * Math.PI) * .18); dirty = true; } }
    if (dirty) { r.im.instanceMatrix.needsUpdate = true; if (r.im.instanceColor) r.im.instanceColor.needsUpdate = true; }
    for (const b of gd.blasts) if (!b._3) { b._3 = 1; const x = PAINT3.X(b.x), z = PAINT3.Z(b.y), w = new T.Mesh(new T.TorusGeometry(1, .14, 8, 40), new T.MeshBasicMaterial({ color: b.c || '#fff', transparent: true })); w.rotation.x = -Math.PI / 2; w.position.set(x, .35, z); r.scene.add(w); r.waves.push({ w, t: 0 }); CARX.burst(r, x, .6, z, 40, 7, b.c); }
    r.waves = r.waves.filter(q => { q.t += dt; const u = q.t / .55; q.w.scale.setScalar(.4 + u * 2.6); q.w.material.opacity = Math.max(0, 1 - u); if (u >= 1) { r.scene.remove(q.w); q.w.geometry.dispose(); q.w.material.dispose(); return false; } return true; });
    for (const id of gd.ids) { const a = r.bots[id], p = gd.ps[id]; if (!a) continue; const x = PAINT3.X(p.x), z = PAINT3.Z(p.y); const px = a.hold.position.x, pz = a.hold.position.z, mv = Math.hypot(x - px, z - pz) / Math.max(dt, .001);
      if (mv > .5 && dt > 0) a.obj.rotation.y = Math.atan2(x - px, z - pz); a.hold.position.set(x, .22, z); a.play(mv > 1 ? 'Running' : 'Idle'); a.brush.rotation.x = Math.sin(now / 90) * (mv > 1 ? .6 : .1); a.mixer.update(dt); }
    CARX.tickSparks(r, dt);
    r.cam.position.set(0, 19.5, 14.2); r.cam.lookAt(0, -.6, .8); r.renderer.render(r.scene, r.cam);
    const tot = gd.cols * gd.rows, srt = gd.ids.slice().sort((a, b) => gd.ps[b].n - gd.ps[a].n);
    CARX.overlay(r, `<div class="cxtop">${srt.map((id, k) => { const p = pl(id); return `<span class="cxpill" style="--c:${p?.color || '#888'}">${k === 0 && gd.ps[id].n ? '👑 ' : ''}${p?.emoji || ''} ${esc(p?.name || '')} ${Math.round(gd.ps[id].n / tot * 100)}%</span>`; }).join('')}</div><div class="pt3bar">${gd.ids.map(id => `<i style="width:${gd.ps[id].n / tot * 100}%;background:${pl(id)?.color || '#888'}"></i>`).join('')}</div>`);
  }
};
(() => {
  const G = GAMES.paint, oStart = G.start, oGo = G.go; PAINT3.o2d = G.draw;
  G.draw = PAINT3.draw;
  G.start = function () { preloadChars(onlineIds().map(id => charOf(pl(id)))); oStart.apply(this, arguments); H.gd.build3D = T => PAINT3.build(T); attachArena(H.gd); };
  G.go = function () { oGo.apply(this, arguments); attachArena(H.gd); };
  G.name = 'Pinta el Piso 3D';
})();
