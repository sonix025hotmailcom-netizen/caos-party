/* ================== v37 — CARRERA ALOCADA EN 3D: robots corriendo en un estadio ================== */
(() => {
  const R = GAMES.race, oRender = R.render, L = 40, X0 = -L / 2, LW = 1.7;
  R.desc = 'Toquen IZQUIERDA y DERECHA alternando, como si fueran pies 🦶🦶. Tu robot corre en la pista del estadio. Si tocan el mismo dos veces, no avanza. ¡Primero en romper la cinta gana!';
  R.start = function () {
    const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id))));
    H.gd = { ids, steps: Object.fromEntries(ids.map(i => [i, 0])), fin: [], sid: rid(), disp: Object.fromEntries(ids.map(i => [i, 0])), t: 0, build3D: T => R.build(T) };
    setPhase('race-ready', 3500, () => { SFX.go(); setPhase('race-go', 30000, () => GAMES.race.end()); R.live(); }, 0, false);
    R.live();
  };
  R.live = function () { attachArena(H.gd); rtLoop(dt => { H.gd.t += dt; }, R.draw); };
  R.render = function (ph) {
    if (ph === 'race-ready') return canvasHTML(true, '🦶 ¡En sus marcas, listos…!');
    if (ph === 'race-go') return canvasHTML(false);
    return oRender.call(this, ph);
  };
  const laneZ = (k, n) => (k - (n - 1) / 2) * LW;
  R.build = function (T) {
    const gd = H.gd, n = gd.ids.length, r = arena3D(T, { bg: '#7dd3fc' }), add = o => { r.scene.add(o); return o; }, span = Math.max(n, 4) * LW + 3;
    r.scene.background = CARX.sky(T, ['#38bdf8', '#7dd3fc', '#e0f2fe']); r.scene.fog = new T.Fog('#cfeefe', 45, 120);
    r.cam.fov = 40; r.cam.far = 300; r.cam.updateProjectionMatrix();
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-12, 28, 16); Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 18, bottom: -18, far: 90 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.mapSize.set(4096, 2048); }
    /* pista de tartán con carriles, salida y meta */
    const TW = L + 16, TH = span + 2, ppu = 1024 / TW;
    const tt = CARX.tex(T, 1024, Math.round(TH * ppu), (g, w, h) => {
      g.fillStyle = '#b4462b'; g.fillRect(0, 0, w, h); for (let k = 0; k < 14000; k++) { g.fillStyle = Math.random() < .5 ? '#00000014' : '#ffffff10'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      const X = x => (x + TW / 2) * ppu, Z = z => (z + TH / 2) * ppu; g.fillStyle = '#f8fafc';
      for (let k = 0; k <= n; k++) { const z = laneZ(k, n) - LW / 2; g.fillRect(0, Z(z) - 2, w, 4); }
      g.fillRect(X(X0) - 3, Z(laneZ(0, n) - LW / 2), 6, n * LW * ppu);
      const cs = LW * ppu / 4; for (let k = 0; k < n * 4; k++) for (let q = 0; q < 2; q++) { g.fillStyle = (k + q) % 2 ? '#111827' : '#f8fafc'; g.fillRect(X(X0 + L) + q * cs - cs, Z(laneZ(0, n) - LW / 2) + k * cs, cs, cs); }
      g.font = `900 ${Math.round(LW * ppu * .55)}px Nunito, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffffcc';
      for (let k = 0; k < n; k++) { g.save(); g.translate(X(X0 - 2.2), Z(laneZ(k, n))); g.rotate(Math.PI / 2); g.fillText(String(k + 1), 0, 0); g.restore(); }
    });
    tt.wrapS = tt.wrapT = T.ClampToEdgeWrapping;
    const track = add(new T.Mesh(new T.PlaneGeometry(TW, TH), new T.MeshStandardMaterial({ map: tt, roughness: .9 }))); track.rotation.x = -Math.PI / 2; track.receiveShadow = true;
    const gt = CARX.tex(T, 256, 256, (g, w, h) => { for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#4caf50' : '#43a047'; g.fillRect(k * 32, 0, 32, h); } for (let k = 0; k < 1500; k++) { g.fillStyle = Math.random() < .5 ? '#0000000f' : '#ffffff0f'; g.fillRect(Math.random() * w, Math.random() * h, 2, 3); } }, [24, 24]);
    const grass = add(new T.Mesh(new T.PlaneGeometry(240, 240), new T.MeshStandardMaterial({ map: gt, roughness: 1 }))); grass.rotation.x = -Math.PI / 2; grass.position.y = -.02; grass.receiveShadow = true;
    const curbM = new T.MeshStandardMaterial({ color: '#e2e8f0', roughness: .6 });
    for (const sd of [-1, 1]) { const c = add(new T.Mesh(new T.BoxGeometry(TW, .18, .25), curbM)); c.position.set(0, .09, sd * (TH / 2 + .12)); c.receiveShadow = true; }
    /* tribuna con gente detrás de la pista */
    const zb = -TH / 2 - 1.2, stM = new T.MeshStandardMaterial({ color: '#cbd5e1', roughness: .8 }), stM2 = new T.MeshStandardMaterial({ color: '#94a3b8', roughness: .8 });
    for (let k = 0; k < 7; k++) { const s = add(new T.Mesh(new T.BoxGeometry(TW + 30, .7, 1.4), k % 2 ? stM : stM2)); s.position.set(0, .35 + k * .7, zb - k * 1.3); s.receiveShadow = true; s.castShadow = true; }
    const roof = add(new T.Mesh(new T.BoxGeometry(TW + 30, .3, 6), new T.MeshStandardMaterial({ color: '#1d4ed8' }))); roof.position.set(0, 9.3, zb - 6.5); roof.castShadow = true;
    for (let k = -4; k <= 4; k++) { const p = add(new T.Mesh(new T.CylinderGeometry(.18, .18, 9.3, 8), new T.MeshStandardMaterial({ color: '#334155' }))); p.position.set(k * 9, 4.65, zb - 9.2); }
    const NC = 520, crowd = new T.InstancedMesh(new T.CapsuleGeometry(.22, .35, 3, 8), new T.MeshStandardMaterial({ color: '#fff', roughness: .7 }), NC), tmp = new T.Object3D(), cc = new T.Color(), base = [];
    for (let k = 0; k < NC; k++) { const row = k % 7, x = (Math.random() - .5) * (TW + 26); tmp.position.set(x, .7 + row * .7 + .45, zb - row * 1.3); tmp.updateMatrix(); crowd.setMatrixAt(k, tmp.matrix); crowd.setColorAt(k, cc.set(pickR(['#ef4444', '#3b82f6', '#facc15', '#f8fafc', '#22c55e', '#f472b6', '#a855f7', '#fb923c', '#0ea5e9']))); base.push([tmp.position.x, tmp.position.y, tmp.position.z, Math.random() * 6]); }
    add(crowd); r.crowd = crowd; r.cbase = base; crowd.castShadow = false;
    /* carteles y banderas */
    const ban = CARX.tex(T, 1024, 64, (g, w, h) => { const cs = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']; for (let k = 0; k < 8; k++) { g.fillStyle = cs[k % 5]; g.fillRect(k * 128, 0, 128, h); g.fillStyle = '#fff'; g.font = '900 38px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['CAOS', 'PARTY', '¡VAMOS!', '🏃'][k % 4], k * 128 + 64, h / 2 + 2); } });
    const banner = add(new T.Mesh(new T.PlaneGeometry(TW + 20, 1.1), new T.MeshBasicMaterial({ map: ban }))); banner.position.set(0, .6, -TH / 2 - .55);
    /* meta: arco con cinta */
    const gate = add(new T.Group()); gate.position.x = X0 + L; const gm = new T.MeshStandardMaterial({ color: '#111827' });
    for (const sd of [-1, 1]) { const c = new T.Mesh(new T.BoxGeometry(.3, 4.6, .3), gm); c.position.set(0, 2.3, sd * (TH / 2 + .3)); c.castShadow = true; gate.add(c); }
    const ck = CARX.tex(T, 256, 32, (g, w, h) => { for (let i = 0; i < 32; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(i * 8, j * 8, 8, 8); } g.fillStyle = '#facc15'; g.font = '900 22px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ef4444'; g.fillRect(96, 4, 64, 24); g.fillStyle = '#fff'; g.fillText('META', 128, 17); });
    const beam = new T.Mesh(new T.BoxGeometry(.4, .8, TH + .9), new T.MeshStandardMaterial({ map: ck })); beam.position.y = 4.6; gate.add(beam);
    const tape = new T.Mesh(new T.BoxGeometry(.06, .12, n * LW), new T.MeshStandardMaterial({ color: '#ef4444', emissive: '#ef4444', emissiveIntensity: .3 })); tape.position.y = 1.15; gate.add(tape); r.tape = tape;
    for (let k = 0; k < 16; k++) { const f = add(new T.Mesh(new T.ConeGeometry(.35, .9, 4), new T.MeshStandardMaterial({ color: ['#ef4444', '#facc15', '#3b82f6', '#22c55e'][k % 4] }))); f.rotation.z = Math.PI / 2; f.position.set(X0 - 8 + k * 4, 8.2, zb - 6.5 + 3); }
    for (let k = 0; k < 30; k++) { const x = (Math.random() - .5) * 140, z = TH / 2 + 8 + Math.random() * 40; fitModel(T, Rk(Math.random() < .5 ? 'treeLarge' : 'treeSmall'), { size: 2.5 + Math.random() * 2.5 }).then(o => { o.position.set(x, 0, z); add(o); }).catch(() => {}); }
    /* robots */
    r.bots = {};
    gd.ids.forEach((id, k) => C3D.load(charURL(charOf(pl(id)))).then(g => {
      if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 2), tintFor(g, id)); a.play('Idle');
      const holder = new T.Group(); holder.add(a.obj); a.obj.rotation.y = Math.PI / 2; holder.position.set(X0 - .8, 0, laneZ(k, n)); r.scene.add(holder);
      const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, pl(id)?.color || '#fff'); lb.position.y = 2.85; lb.scale.set(2.6, .65, 1); holder.add(lb);
      a.holder = holder; r.bots[id] = a;
    }).catch(() => {}));
    r.cx = X0 + 6; r.parts = []; CARX.sparks(T, r, 60);
    return r;
  };
  R.draw = function (ctx) {
    const gd = H.gd, r = gd.r3, n = gd.ids.length;
    if (r && r.renderer.domElement.isConnected) {
      const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
      let lead = -1e9, sum = 0;
      gd.ids.forEach((id, k) => {
        const target = Math.min(1, gd.steps[id] / R.GOAL), prev = gd.disp[id]; gd.disp[id] += (target - prev) * Math.min(1, dt * 6);
        const fin = gd.fin.indexOf(id), x = X0 + gd.disp[id] * L + (fin >= 0 ? Math.min(3, (gd.t - (gd.finT?.[id] || gd.t)) * 3) : 0), vel = (gd.disp[id] - prev) * L / Math.max(dt, .001);
        const a = r.bots[id]; if (a) { a.holder.position.x = x; if (fin >= 0) { a.play(gd.t - (gd.finT?.[id] || 0) > .9 ? 'Dance' : 'Running'); a.mixer.timeScale = 1; } else if (vel > .25) { a.play('Running'); a.mixer.timeScale = Math.max(.5, Math.min(2.2, vel / 3.2)); } else { a.play('Idle'); a.mixer.timeScale = 1; } a.mixer.update(dt); }
        lead = Math.max(lead, x); sum += x;
      });
      gd.fin.forEach(id => { gd.finT = gd.finT || {}; if (gd.finT[id] == null) { gd.finT[id] = gd.t; CARX.burst(r, X0 + L, 1.4, laneZ(gd.ids.indexOf(id), n), 30, 7, pl(id)?.color); } });
      r.tape.visible = !gd.fin.length; CARX.tickSparks(r, dt);
      if (r.crowd) { const hype = gd.fin.length ? 2.2 : .9, tmp = new r.T.Object3D(); r.cbase.forEach(([x, y, z, ph], k) => { tmp.position.set(x, y + Math.max(0, Math.sin(tt * (5 + hype) + ph)) * .12 * hype, z); tmp.updateMatrix(); r.crowd.setMatrixAt(k, tmp.matrix); }); r.crowd.instanceMatrix.needsUpdate = true; }
      const want = Math.max(X0 + 6, Math.min(X0 + L - 4, (lead * .65 + sum / Math.max(1, n) * .35) + 1.5)); r.cx += (want - r.cx) * Math.min(1, dt * 2.5);
      const span = Math.max(n, 4) * LW; r.cam.position.set(r.cx - 4.5, 8.5 + span * .45, span / 2 + 7.5 + span * .25); r.cam.lookAt(r.cx + 1.5, .4, -.3);
      r.renderer.render(r.scene, r.cam);
      const ord = gd.ids.slice().sort((a, b) => { const fa = gd.fin.indexOf(a), fb = gd.fin.indexOf(b); if (fa >= 0 || fb >= 0) return (fa < 0 ? 99 : fa) - (fb < 0 ? 99 : fb); return gd.steps[b] - gd.steps[a]; });
      CARX.overlay(r, `<div class="cxtop">${ord.map((id, k) => { const p = pl(id), f = gd.fin.indexOf(id); return `<span class="cxpill" style="--c:${p?.color || '#888'}">${f >= 0 ? medal(f) : (k + 1) + 'º'} ${p?.emoji || ''} ${esc(p?.name || '')} · ${Math.round(Math.min(1, gd.steps[id] / R.GOAL) * 100)}%</span>`; }).join('')}</div>${H.phase === 'race-go' && gd.t < 1.6 ? '<div class="cxbig" style="top:80%;font-size:1.8em">🦶 ¡IZQ, DER, IZQ, DER!</div>' : ''}${gd.fin.length && gd.t - gd.finT[gd.fin[0]] < 2.5 ? `<div class="cxbig">🏁 ¡${esc(pl(gd.fin[0])?.name || '')} rompió la cinta!</div>` : ''}`);
      return;
    }
    ctx.fillStyle = '#b4462b'; ctx.fillRect(0, 0, 1000, 600); const lh = Math.min(80, 520 / Math.max(1, n));
    gd.ids.forEach((id, k) => { const y = 40 + k * lh; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(40, y, 900, lh); const x = 60 + Math.min(1, gd.steps[id] / R.GOAL) * 840; emo(ctx, pl(id)?.emoji || '?', x, y + lh / 2, lh * .7); });
  };
})();
