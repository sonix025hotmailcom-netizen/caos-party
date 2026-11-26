/* ================== v49 — SUMO GALÁCTICO en 3D: robots dentro de bolas de hámster en el espacio ================== */
const SUMO3 = {
  K: 30, X: v => (v - 500) / 30, Z: v => (v - 300) / 30,
  build(T) {
    const gd = H.gd, r = arena3D(T, { bg: '#0b0820' }), add = o => (r.scene.add(o), o), M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .5 }, o));
    r.cam.fov = 44; r.cam.far = 400; r.cam.updateProjectionMatrix();
    new T.TextureLoader().load('assets/sky_nebula.jpg', tx => { tx.colorSpace = T.SRGBColorSpace; tx.mapping = T.EquirectangularReflectionMapping; if (H.gd === gd) r.scene.background = tx; });
    r.scene.background = new T.Color('#0b0820');
    const hemi = r.scene.children.find(c => c.isHemisphereLight); if (hemi) { hemi.color.set('#c4b5fd'); hemi.groundColor.set('#1e1b4b'); }
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-8, 20, 8); sun.color.set('#e0e7ff'); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: .5, far: 60 }); sun.shadow.camera.updateProjectionMatrix(); }
    /* estrellas y planetas */
    const sg = new T.BufferGeometry(), pts = []; for (let k = 0; k < 900; k++) { const a = Math.random() * 6.28, b = Math.acos(Math.random() * 2 - 1), d = 120 + Math.random() * 60; pts.push(Math.sin(b) * Math.cos(a) * d, Math.cos(b) * d, Math.sin(b) * Math.sin(a) * d); } sg.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); add(new T.Points(sg, new T.PointsMaterial({ color: '#ffffff', size: .7, sizeAttenuation: true })));
    const pl1 = add(new T.Mesh(new T.SphereGeometry(7, 32, 24), M('#f472b6', { emissive: '#831843', emissiveIntensity: .3 }))); pl1.position.set(-26, -10, -30);
    const ringP = new T.Mesh(new T.TorusGeometry(10.5, .9, 4, 64), M('#fde68a', { emissive: '#92400e', emissiveIntensity: .3 })); ringP.rotation.x = 1.2; pl1.add(ringP);
    const pl2 = add(new T.Mesh(new T.SphereGeometry(3.2, 24, 16), M('#38bdf8', { emissive: '#0c4a6e', emissiveIntensity: .4 }))); pl2.position.set(24, -6, -24); r.pl = [pl1, pl2];
    /* plataforma que se encoge: disco hexagonal de neón */
    const top = CARX.tex(T, 512, 512, (g, w, h) => { const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, '#4c1d95'); gr.addColorStop(.7, '#2e1065'); gr.addColorStop(1, '#1e1b4b'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = '#a78bfa55'; g.lineWidth = 2; for (let x = -w; x < w * 2; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h * .577, h); g.stroke(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x - h * .577, h); g.stroke(); } g.strokeStyle = '#f0abfc'; g.lineWidth = 6; g.beginPath(); g.arc(c, c, c * .25, 0, 7); g.stroke(); });
    const plat = add(new T.Group()); r.plat = plat;
    const disc = new T.Mesh(new T.CylinderGeometry(1, .82, .6, 64), [M('#312e81', { metalness: .6 }), M('#ffffff', { map: top, roughness: .35, metalness: .3 }), M('#1e1b4b')]); disc.position.y = -.3; disc.receiveShadow = true; plat.add(disc);
    const edge = new T.Mesh(new T.TorusGeometry(1, .035, 8, 96), new T.MeshBasicMaterial({ color: '#22d3ee' })); edge.rotation.x = Math.PI / 2; edge.position.y = .02; plat.add(edge); r.edge = edge;
    const glow = new T.Mesh(new T.RingGeometry(.985, 1.045, 96), new T.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: .35, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = .03; plat.add(glow); r.glow = glow;
    /* bolas de hámster con robot adentro */
    CARX.sparks(T, r, 120); r.b = {};
    const glass = new T.MeshPhysicalMaterial({ color: '#e0f2fe', roughness: .05, metalness: 0, transmission: .0, transparent: true, opacity: .22, clearcoat: 1, depthWrite: false });
    gd.ids.forEach(id => { const col = pl(id)?.color || '#888', G = add(new T.Group()), ball = new T.Mesh(new T.SphereGeometry(.97, 32, 24), glass); ball.renderOrder = 5; G.add(ball);
      const bands = new T.Group(); [0, 1].forEach(k => { const t = new T.Mesh(new T.TorusGeometry(.97, .045, 6, 48), M(col, { emissive: col, emissiveIntensity: .5 })); t.rotation.y = k * Math.PI / 2; bands.add(t); }); G.add(bands);
      const sh = add(new T.Mesh(new T.CircleGeometry(.9, 24), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .35, depthWrite: false }))); sh.rotation.x = -Math.PI / 2;
      const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, col); lb.position.y = 1.7; lb.scale.set(2.4, .6, 1); lb.material.depthTest = false; lb.renderOrder = 10; G.add(lb);
      const S = r.b[id] = { G, bands, sh, ball, q: new T.Quaternion(), face: 0 };
      C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.15), tintFor(g, id)); a.obj.position.y = -.82; a.play('Idle'); G.add(a.obj); S.a = a; }).catch(() => {}); });
    r.ax = new T.Vector3(); r.qq = new T.Quaternion();
    return r;
  },
  draw(ctx) {
    const gd = H.gd, r = gd.r3;
    if (!(r && r.renderer.domElement.isConnected)) return SUMO3.o2d.call(GAMES.sumo, ctx);
    const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
    const R = gd.R / SUMO3.K; r.plat.scale.set(R, 1, R); r.edge.scale.set(1, 1, 1); r.glow.material.opacity = .25 + Math.sin(tt * 5) * .12 + (gd.R < 160 ? .25 : 0); r.edge.material.color.set(gd.R < 160 ? '#f43f5e' : '#22d3ee');
    r.pl[0].rotation.y += dt * .05; r.pl[1].rotation.y -= dt * .2;
    for (const id of gd.ids) {
      const S = r.b[id], b = gd.bs[id]; if (!S) continue; const x = SUMO3.X(b.x), z = SUMO3.Z(b.y), vx = b.vx / SUMO3.K, vz = b.vy / SUMO3.K, sp = Math.hypot(vx, vz);
      let y = .97; if (!b.alive) { y -= b.fall * b.fall * 9; S.G.scale.setScalar(Math.max(.05, 1 - b.fall * .35)); if (!S.fx) { S.fx = 1; CARX.burst(r, x, .5, z, 30, 6, pl(id)?.color); } }
      S.G.position.set(x, y, z); S.sh.visible = b.alive; S.sh.position.set(x, .02, z);
      if (sp > .05) { r.ax.set(vz, 0, -vx).normalize(); r.qq.setFromAxisAngle(r.ax, sp * dt / .97); S.bands.quaternion.premultiply(r.qq); S.face = Math.atan2(vx, vz); }
      if (S.a) { S.a.obj.rotation.y = S.face; S.a.play(!b.alive ? 'Jump' : b.dash > 0 ? 'Punch' : sp > 1.2 ? 'Running' : sp > .3 ? 'Walking' : 'Idle'); S.a.mixer.update(dt); }
      if (b.dash > .25 && !S.dfx) { S.dfx = 1; CARX.burst(r, x, .4, z, 12, 4, '#a5f3fc'); } if (b.dash <= 0) S.dfx = 0;
    }
    CARX.tickSparks(r, dt);
    r.cam.position.set(0, 16.2, 14); r.cam.lookAt(0, -.5, .9); r.renderer.render(r.scene, r.cam);
    const alive = gd.ids.filter(id => gd.bs[id].alive).length;
    CARX.overlay(r, `<div class="cxtop"><span class="cxpill" style="--c:#22d3ee">🪐 Quedan ${alive}</span>${gd.ids.map(id => { const p = pl(id), o = !gd.bs[id].alive; return `<span class="cxpill${o ? ' off' : ''}" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}${o ? ' 💫' : ''}</span>`; }).join('')}</div>${gd.R < 160 && H.phase === 'sumo-go' ? '<div class="cxbig" style="top:86%;font-size:1.4em">⚠️ ¡La plataforma se achica!</div>' : ''}`);
  }
};
(() => {
  const G = GAMES.sumo, oStart = G.start, oGo = G.go; SUMO3.o2d = G.draw;
  G.draw = SUMO3.draw; G.name = 'Sumo Galáctico 3D';
  G.start = function () { preloadChars(onlineIds().map(id => charOf(pl(id)))); oStart.apply(this, arguments); H.gd.build3D = T => SUMO3.build(T); attachArena(H.gd); };
  G.go = function () { oGo.apply(this, arguments); attachArena(H.gd); };
})();
