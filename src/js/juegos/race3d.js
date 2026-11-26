Object.assign(GAMES, {
  /* =================================================================== */
  /* 🏎️ GRAN PREMIO 3D                                                   */
  /* =================================================================== */
  race3d: {
    name: 'Gran Premio 3D', emoji: '🏎️', color: '#dc2626', LAPS: 3, W: 7.5,
    desc: '¡Carrera en pantalla dividida! 🏎️ Cada uno ve SU auto desde atrás, como en Mario Kart. Joystick ▲ (W) acelera, ▼ (S) frena y da reversa, ◀ ▶ (A/D) giran. El botón (ESPACIO) es el TURBO 🚀. Pista gigante en forma de 8 con puente: pasás por arriba y por abajo. Las flechas del piso dan turbo gratis y los conos te frenan. ¡3 vueltas! 🏁',
    MODELS: ['raceCarRed', 'raceCarGreen', 'raceCarOrange', 'raceCarWhite', 'treeLarge', 'treeSmall', 'grandStandRound', 'grandStandCovered', 'overheadRound', 'flagCheckers', 'lightPostModern', 'tentLong', 'billboardLow', 'bannerTowerRed', 'bannerTowerGreen', 'pylon', 'barrierWall', 'pitsGarage'],
    start() {
      const ids = onlineIds(), M = 720, W = this.W;
      this.MODELS.forEach(n => C3D.load(Rk(n)).catch(() => {}));
      /* pista en forma de 8 (lemniscata) con variaciones al azar; el cruce queda siempre en el centro */
      const A = 76 + Math.random() * 16, B = 84 + Math.random() * 16, p1 = Math.random() * 6.28, p2 = Math.random() * 6.28, k1 = .08 + Math.random() * .1, k2 = .08 + Math.random() * .12, flip = Math.random() < .5 ? -1 : 1, t0 = 1.5 * Math.PI + .85;
      const BR = 4.6, wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
      const raw = []; const RN = 6000;
      for (let i = 0; i <= RN; i++) { const t = t0 + i / RN * Math.PI * 2; raw.push([flip * A * Math.cos(t) * (1 + k1 * Math.sin(2 * t + p1)), B * Math.sin(t) * Math.cos(t) * (1 + k2 * Math.sin(t + p2)), BR * Math.exp(-((wrap(t - Math.PI / 2) / .4) ** 2))]); }
      const cum = [0]; for (let i = 1; i <= RN; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
      const L = cum[RN], pts = []; let j = 0;
      for (let i = 0; i < M; i++) { const d = i / M * L; while (cum[j + 1] < d) j++; const f = (d - cum[j]) / ((cum[j + 1] - cum[j]) || 1); pts.push([0, 1, 2].map(k => raw[j][k] + (raw[j + 1][k] - raw[j][k]) * f)); }
      const dirs = pts.map((_, i) => { const a = pts[(i + 1) % M], b = pts[(i - 1 + M) % M]; return Math.atan2(a[0] - b[0], a[1] - b[1]); });
      const ds = L / M, at = (i, lat) => { i = ((i % M) + M) % M; const a = dirs[i]; return [pts[i][0] + Math.cos(a) * lat, pts[i][1] - Math.sin(a) * lat, pts[i][2]]; };
      /* zonas especiales: el puente (punto más alto) y el paso de abajo */
      let bridge = 0; pts.forEach((p, i) => { if (p[2] > pts[bridge][2]) bridge = i; });
      let under = 0, bu = 1e9; pts.forEach((p, i) => { const cd = Math.min(Math.abs(i - bridge), M - Math.abs(i - bridge)); if (cd < M * .25) return; const r2 = p[0] ** 2 + p[1] ** 2; if (r2 < bu) { bu = r2; under = i; } });
      const far = (i, m) => [0, bridge, under].every(c => Math.min(Math.abs(i - c), M - Math.abs(i - c)) > m);
      /* turbos en el piso y conos (los conos solo tapan media pista: siempre hay paso) */
      const pads = [], cones = [];
      for (let t = 0; t < 60 && pads.length < 4; t++) { const i = 40 + rand(M - 80); if (!far(i, 45) || pads.some(p => Math.abs(p.i - i) < 90)) continue; pads.push({ i, lat: (Math.random() - .5) * (W - 3) }); }
      for (let t = 0; t < 80 && cones.length < 18; t++) { const i = 40 + rand(M - 80); if (!far(i, 40) || pads.some(p => Math.abs(p.i - i) < 30) || cones.some(c => Math.abs(c.i - i) < 50 && c.i !== i)) continue; const side = Math.random() < .5 ? -1 : 1, n = 3 + rand(3); for (let k = 0; k < n; k++) { const ii = i + k * 3, lat = side * (.6 + Math.random() * (W / 2 - 1.3)); const [x, z] = at(ii, lat); cones.push({ i, x, z, lat, hit: 0, vx: 0, vz: 0, vy: 0, y: 0, x0: x, z0: z }); } }
      /* largada en grilla de a dos, detrás de la línea */
      const ps = {}; ids.forEach((id, k) => { const row = Math.floor(k / 2), idx = (M - 5 - row * Math.round(4.2 / ds) + M) % M, lat = (k % 2 ? 1 : -1) * W * .22, [x, z] = at(idx, lat); ps[id] = { x, z, y: pts[idx][2], a: dirs[idx], v: 0, idx, lap: 0, half: false, done: 0, place: 0, lb: 0, turbo: 0, cd: 0, off: false, lat, steer: 0, stuck: 0, wrong: 0, pad: 0, camA: dirs[idx], flash: 0 }; });
      H.inp = {}; H.gd = { ids, pts, dirs, M, ds, L, ps, pads, cones, bridge, under, order: [], t: 0, sid: rid(), build3D: T => GAMES.race3d.build(T) };
      setPhase('rc-ready', 4200, () => { SFX.go(); GAMES.race3d.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.race3d.draw);
    },
    go() { const gd = H.gd; gd.t0 = Date.now(); setPhase('rc-go', 180000, () => GAMES.race3d.end()); attachArena(gd); rtLoop(dt => GAMES.race3d.step(dt), GAMES.race3d.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps?.[p.id];
      if (s && s.done) return { screen: 'msg', big: '🏁', title: `¡Llegaste ${s.place}º!`, text: 'Mirá la tele y apoyá a los demás 😄' };
      if (H.phase === 'rc-ready' || H.phase === 'rc-go') return joyView(p, '▲ W acelerar · ▼ S frenar/reversa · ◀ ▶ A/D girar · Botón/ESPACIO = TURBO', '🚀 TURBO', 4);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'rc-ready' || H.phase === 'rc-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'rc-go' && !!H.gd.ps?.[id]?.done; },
    near(s) { const gd = H.gd; let best = s.idx, bd = 1e9; for (let k = -10; k <= 30; k++) { const i = (s.idx + k + gd.M) % gd.M, d = (gd.pts[i][0] - s.x) ** 2 + (gd.pts[i][1] - s.z) ** 2; if (d < bd) { bd = d; best = i; } } return best; },
    respawn(s) { const gd = H.gd, i = s.idx, a = gd.dirs[i]; s.x = gd.pts[i][0]; s.z = gd.pts[i][1]; s.y = gd.pts[i][2]; s.a = s.camA = a; s.v = 5; s.stuck = 0; s.wrong = 0; s.flash = 1.2; SND.play('ui_switch_002', .5); },
    step(dt) {
      const gd = H.gd, go = H.phase === 'rc-go', W = this.W, M = gd.M; gd.t += dt;
      for (const id of gd.ids) {
        const s = gd.ps[id], i = inp(id); s.cd -= dt; s.turbo -= dt; s.pad -= dt; s.flash -= dt;
        if (!go || s.done) { s.v *= Math.pow(.15, dt); s.x += Math.sin(s.a) * s.v * dt; s.z += Math.cos(s.a) * s.v * dt; s.lb = i.b; continue; }
        if (i.b !== s.lb) { s.lb = i.b; if (s.cd <= 0) { s.cd = 4; s.turbo = 1.4; SND.play('sf_thrusterFire_000', .5, 1, 0); } }
        /* dónde está respecto a la pista */
        const prev = s.idx; s.idx = this.near(s); const ni = s.idx, a0 = gd.dirs[ni], nx = Math.cos(a0), nz = -Math.sin(a0);
        s.lat = (s.x - gd.pts[ni][0]) * nx + (s.z - gd.pts[ni][1]) * nz;
        const hy = gd.pts[ni][2], raised = hy > .3;
        if (raised && Math.abs(s.lat) > W / 2 - .8) { const cl = Math.sign(s.lat) * (W / 2 - .8); s.x += nx * (cl - s.lat); s.z += nz * (cl - s.lat); s.lat = cl; s.v *= Math.pow(.6, dt); } /* barandas del puente */
        s.off = Math.abs(s.lat) > W / 2 + .4;
        s.y += ((s.off ? 0 : hy) - s.y) * Math.min(1, dt * 14);
        if (prev > M * .42 && prev < M * .58) s.half = true;
        if (prev > M - 40 && ni < 40 && s.half) { s.lap++; s.half = false; if (s.lap >= this.LAPS) { s.done = Date.now() - gd.t0; gd.order.push(id); s.place = gd.order.length; SFX.win(); if (s.place === 1) { gd.firstT = Date.now(); confetti(100); toastHost(`🏁 ¡${pl(id)?.name || ''} ganó la carrera!`); } } else { SND.play('ui_confirmation_001', .5); s.flash = 0; s.lapFx = 1.6; } }
        s.lapFx = (s.lapFx || 0) - dt;
        /* manejo: ▲ acelera · ▼ frena y reversa · ◀ ▶ giran · sin tocar nada rueda y se frena solo */
        const max = (s.turbo > 0 ? 31 : 22) * (s.off ? .42 : 1);
        const steer = Math.abs(i.x) > .15 ? Math.max(-1, Math.min(1, i.x)) : 0, gas = i.y < -.3 ? Math.min(1, -i.y * 1.3) : 0, brake = i.y > .3;
        s.steer += (steer - s.steer) * Math.min(1, dt * 9);
        const grip = Math.min(1, Math.abs(s.v) / 3.5), rate = 2.3 - .7 * Math.min(1, Math.abs(s.v) / 22);
        s.a -= s.steer * rate * grip * dt * (s.v < 0 ? -1 : 1);
        if (s.turbo > 0) { if (s.v < max) s.v = Math.min(max, s.v + 26 * dt); }
        else if (brake) s.v = s.v > 0 ? Math.max(0, s.v - 32 * dt) : Math.max(-7, s.v - 10 * dt);
        else if (gas) s.v += (s.v < 0 ? 30 : 15 * gas * (1 - .45 * Math.max(0, s.v) / 22)) * dt;
        else s.v -= Math.sign(s.v) * Math.min(Math.abs(s.v), 6 * dt);
        if (s.v > max) s.v = Math.max(max, s.v - 20 * dt);
        s.x += Math.sin(s.a) * s.v * dt; s.z += Math.cos(s.a) * s.v * dt;
        /* turbos del piso */
        for (const p of gd.pads) { const dd = Math.min(Math.abs(ni - p.i), M - Math.abs(ni - p.i)); if (dd < 4 && Math.abs(s.lat - p.lat) < 1.8 && s.pad <= 0 && !raised) { s.turbo = Math.max(s.turbo, 1); s.pad = .8; SND.play('sf_thrusterFire_000', .4, 1.3, 0); } }
        /* conos: te frenan y salen volando */
        for (const c of gd.cones) { if (c.hit > 0 || s.y > 1) continue; const dx = s.x - c.x, dz = s.z - c.z, d = Math.hypot(dx, dz); if (d < 1.25) { c.hit = 5; c.vx = Math.sin(s.a) * s.v * .7 + dx * -2; c.vz = Math.cos(s.a) * s.v * .7 + dz * -2; c.vy = 6; s.v *= .55; SND.play('impactPlate_light_000', .5); } }
        /* pilares del puente (solo los de abajo chocan) */
        if (s.y < 1 && gd.pillars) for (const [px, pz] of gd.pillars) { const dx = s.x - px, dz = s.z - pz, d = Math.hypot(dx, dz); if (d < 1.4 && d > 0) { s.x = px + dx / d * 1.4; s.z = pz + dz / d * 1.4; s.v *= .5; } }
        /* al revés / trabado → vuelve a la pista solo */
        const fwd = Math.cos(angTo(s.a, a0));
        s.wrong = fwd < -.3 && s.v > 3 ? s.wrong + dt : Math.max(0, s.wrong - dt * 2);
        s.stuck = (s.off && Math.abs(s.v) < 2) || Math.abs(s.lat) > W / 2 + 14 ? s.stuck + dt : 0;
        if (s.stuck > 2.2 || s.wrong > 4 || Math.abs(s.x) > 170 || Math.abs(s.z) > 170) this.respawn(s);
      }
      for (let a = 0; a < gd.ids.length; a++) for (let b = a + 1; b < gd.ids.length; b++) { const A = gd.ps[gd.ids[a]], B = gd.ps[gd.ids[b]]; if (Math.abs(A.y - B.y) > 1.2) continue; const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); if (d > 0 && d < 1.9) { const k = (1.9 - d) / 2; A.x -= dx / d * k; A.z -= dz / d * k; B.x += dx / d * k; B.z += dz / d * k; if (d < 1.6) { A.v *= .97; B.v *= .97; } } }
      for (const c of gd.cones) if (c.hit > 0) { c.hit -= dt; if (c.hit > 3.6) { c.x += c.vx * dt; c.z += c.vz * dt; c.vy -= 20 * dt; c.y = Math.max(0, c.y + c.vy * dt); c.spin = (c.spin || 0) + dt * 12; } else if (c.hit <= 0) { c.x = c.x0; c.z = c.z0; c.y = 0; c.spin = 0; } }
      if (go && (gd.order.length === gd.ids.length || (gd.firstT && Date.now() - gd.firstT > 30000))) this.end();
    },
    pos() { const gd = H.gd; return gd.ids.slice().sort((a, b) => { const A = gd.ps[a], B = gd.ps[b]; return (A.done && B.done) ? A.done - B.done : B.done ? 1 : A.done ? -1 : (B.lap * gd.M + B.idx) - (A.lap * gd.M + A.idx); }); },
    build(T) {
      const gd = H.gd, r = arena3D(T, { bg: '#8fd3fe' }), W = this.W, M = gd.M, P = gd.pts, D = gd.dirs;
      const add = o => { r.scene.add(o); return o; };
      r.scene.fog = new T.Fog('#bfe6ff', 90, 280); r.scene.background = new T.Color('#8fd3fe');
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-40, 90, 30); Object.assign(sun.shadow.camera, { left: -130, right: 130, top: 110, bottom: -110, far: 320 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.mapSize.set(4096, 4096); }
      r.renderer.shadowMap.autoUpdate = false; r.renderer.shadowMap.needsUpdate = true; r.shadowT = [1, 2.5, 5];
      const tex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; if (rep) t.repeat.set(...rep); return t; };
      /* pasto con franjas y montañas lejos */
      const gt = tex(256, 256, (g, w, h) => { g.fillStyle = '#5fae3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#69b843'; for (let k = 0; k < 8; k += 2) g.fillRect(k * 32, 0, 32, h); for (let k = 0; k < 900; k++) { g.fillStyle = Math.random() < .5 ? '#0000000d' : '#ffffff0d'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [58, 58]);
      const ground = add(new T.Mesh(new T.PlaneGeometry(760, 760), new T.MeshStandardMaterial({ map: gt, roughness: 1 }))); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
      const hill = new T.MeshStandardMaterial({ color: '#4d8f3a', flatShading: true, roughness: 1 }), snow = new T.MeshStandardMaterial({ color: '#7c9a6a', flatShading: true });
      for (let k = 0; k < 26; k++) { const a = k / 26 * Math.PI * 2 + Math.random() * .2, rr = 235 + Math.random() * 60, h = 35 + Math.random() * 50; const m = add(new T.Mesh(new T.ConeGeometry(24 + Math.random() * 26, h, 6 + rand(3)), k % 3 ? hill : snow)); m.position.set(Math.cos(a) * rr, h / 2 - 2, Math.sin(a) * rr); m.rotation.y = Math.random() * 3; }
      /* asfalto, bordes pintados y pianitos (siguen la altura del puente) */
      const strip = (l0, l1, y, mat, colors) => { const pos = [], idx = [], uv = [], col = []; let acc = 0; for (let i = 0; i <= M; i++) { const k = i % M, a = D[k], nx = Math.cos(a), nz = -Math.sin(a), [x, z, h] = P[k]; pos.push(x + nx * l0, h + y, z + nz * l0, x + nx * l1, h + y, z + nz * l1); uv.push(0, acc / 8, 1, acc / 8); acc += gd.ds; if (colors) { const c = new T.Color(colors[Math.floor(i / 3) % colors.length]); col.push(c.r, c.g, c.b, c.r, c.g, c.b); } if (i < M) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); } } const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); if (colors) g.setAttribute('color', new T.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = add(new T.Mesh(g, mat)); m.receiveShadow = true; return m; };
      const at = tex(256, 256, (g, w, h) => { g.fillStyle = '#3f4550'; g.fillRect(0, 0, w, h); for (let k = 0; k < 2500; k++) { const v = 50 + rand(40); g.fillStyle = `rgb(${v},${v + 4},${v + 10})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = '#f8fafc'; g.fillRect(w / 2 - 3, 0, 6, h * .55); g.fillRect(6, 0, 7, h); g.fillRect(w - 13, 0, 7, h); }, [1, 1]);
      strip(-W / 2, W / 2, .06, new T.MeshStandardMaterial({ map: at, roughness: .85, side: T.DoubleSide }));
      const curbM = new T.MeshStandardMaterial({ vertexColors: true, roughness: .6, side: T.DoubleSide });
      strip(-W / 2 - .9, -W / 2, .08, curbM, ['#ef4444', '#f8fafc']); strip(W / 2, W / 2 + .9, .08, curbM, ['#ef4444', '#f8fafc']);
      /* puente: costados, barandas, pilares (que no tapen la pista de abajo) */
      const conc = new T.MeshStandardMaterial({ color: '#cbd5e1', roughness: .8 }), railM = new T.MeshStandardMaterial({ color: '#f59e0b', roughness: .5 }), pil = new T.MeshStandardMaterial({ color: '#94a3b8', roughness: .9 });
      gd.pillars = [];
      const nearUnder = (x, z) => { for (let k = -60; k <= 60; k++) { const q = P[(gd.under + k + M) % M]; if (Math.hypot(q[0] - x, q[1] - z) < W / 2 + 2.5) return true; } return false; };
      for (let i = 0; i < M; i++) {
        const [x, z, h] = P[i], a = D[i], nx = Math.cos(a), nz = -Math.sin(a); if (h < .25) continue;
        const seg = gd.ds * 1.04;
        for (const sd of [-1, 1]) { const lx = x + nx * sd * (W / 2 + .9), lz = z + nz * sd * (W / 2 + .9); const rail = add(new T.Mesh(new T.BoxGeometry(.35, .75, seg), railM)); rail.position.set(lx, h + .42, lz); rail.rotation.y = a; rail.castShadow = true; }
        const deck = add(new T.Mesh(new T.BoxGeometry(W + 2.2, Math.min(h, .7), seg), conc)); deck.position.set(x, h - Math.min(h, .7) / 2 + .02, z); deck.rotation.y = a; deck.castShadow = true;
        if (h > 1.4 && i % 14 === 0) for (const sd of [-1, 1]) { const px = x + nx * sd * (W / 2 - .2), pz = z + nz * sd * (W / 2 - .2); if (nearUnder(px, pz)) continue; const p = add(new T.Mesh(new T.CylinderGeometry(.55, .7, h - .5, 10), pil)); p.position.set(px, (h - .5) / 2, pz); p.castShadow = true; gd.pillars.push([px, pz]); }
      }
      /* línea de largada a cuadros + pórtico */
      const ck = tex(64, 16, (g) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(i * 4, j * 4, 4, 4); } }); ck.magFilter = T.NearestFilter;
      const fin = add(new T.Mesh(new T.PlaneGeometry(W, 1.4), new T.MeshBasicMaterial({ map: ck }))); fin.rotation.x = -Math.PI / 2; fin.rotation.z = D[0]; fin.position.set(P[0][0], .1, P[0][1]);
      const gate = new T.Group(); gate.position.set(P[0][0], 0, P[0][1]); gate.rotation.y = D[0]; add(gate);
      const gm = new T.MeshStandardMaterial({ color: '#1f2937', roughness: .5 }), bm = new T.MeshBasicMaterial({ map: ck });
      for (const sd of [-1, 1]) { const c = new T.Mesh(new T.BoxGeometry(.5, 6, .5), gm); c.position.set(sd * (W / 2 + 1.4), 3, 0); c.castShadow = true; gate.add(c); }
      const beam = new T.Mesh(new T.BoxGeometry(W + 3.3, 1.3, .5), [gm, gm, gm, gm, bm, bm]); beam.position.y = 6.2; beam.castShadow = true; gate.add(beam);
      /* flechas de turbo (animadas) */
      const pt = tex(64, 128, (g, w, h) => { g.fillStyle = '#f97316'; g.fillRect(0, 0, w, h); g.fillStyle = '#fde047'; for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(8, 50 + k * 64); g.lineTo(32, 18 + k * 64); g.lineTo(56, 50 + k * 64); g.lineTo(56, 64 + k * 64); g.lineTo(32, 32 + k * 64); g.lineTo(8, 64 + k * 64); g.fill(); } }, [1, 2]); r.padTex = pt;
      for (const p of gd.pads) { const [x, z] = [P[p.i][0] + Math.cos(D[p.i]) * p.lat, P[p.i][1] - Math.sin(D[p.i]) * p.lat]; const m = add(new T.Mesh(new T.PlaneGeometry(2.6, 4.2), new T.MeshBasicMaterial({ map: pt, transparent: true, opacity: .95 }))); m.rotation.x = -Math.PI / 2; m.rotation.z = D[p.i] + Math.PI; m.position.set(x, .1, z); }
      /* conos */
      r.cones = gd.cones.map(c => { const g = add(new T.Group()); g.position.set(c.x, 0, c.z); fitModel(T, Rk('pylon'), { h: .95 }).then(o => g.add(o)).catch(() => { const m = new T.Mesh(new T.ConeGeometry(.35, .9, 12), new T.MeshStandardMaterial({ color: '#f97316' })); m.position.y = .45; g.add(m); }); return g; });
      /* decoración: tribunas, carpas, carteles, postes y árboles fuera de la pista */
      const clear = (x, z, m) => { for (let i = 0; i < M; i += 2) if ((P[i][0] - x) ** 2 + (P[i][1] - z) ** 2 < (W / 2 + m) ** 2) return false; return true; };
      const put = (n, o, x, z, rot) => fitModel(T, Rk(n), o).then(g => { g.position.set(x, 0, z); g.rotation.y = rot; add(g); r.renderer.shadowMap.needsUpdate = true; }).catch(() => {});
      const side = (i, n, o, dist, rot, m) => { const a = D[i], [x, z] = [P[i][0] + Math.cos(a) * dist, P[i][1] - Math.sin(a) * dist]; if (clear(x, z, m)) put(n, o, x, z, a + rot); };
      side(30, 'grandStandRound', { size: 13 }, -(W / 2 + 11), Math.PI / 2, 6); side(60, 'grandStandCovered', { size: 12 }, W / 2 + 11, -Math.PI / 2, 6); side(95, 'pitsGarage', { size: 8 }, -(W / 2 + 10), Math.PI / 2, 5);
      side(M - 30, 'tentLong', { size: 7 }, W / 2 + 7, Math.PI / 2, 3); side(M - 60, 'bannerTowerRed', { h: 7 }, -(W / 2 + 4), 0, 2); side(100, 'bannerTowerGreen', { h: 7 }, W / 2 + 4, 0, 2);
      for (let i = 20; i < M; i += 45) side(i, 'billboardLow', { size: 6 }, (i % 90 ? 1 : -1) * (W / 2 + 6), (i % 90 ? -1 : 1) * Math.PI / 2, 3);
      for (let i = 8; i < M; i += 24) if (P[i][2] < .2) side(i, 'lightPostModern', { h: 6 }, (i % 48 ? 1 : -1) * (W / 2 + 2.4), (i % 48 ? -1 : 1) * Math.PI / 2, 1.6);
      for (let k = 0; k < 170; k++) { const x = (Math.random() - .5) * 320, z = (Math.random() - .5) * 270; if (!clear(x, z, 6)) continue; put(Math.random() < .55 ? 'treeLarge' : 'treeSmall', { size: 2.5 + Math.random() * 2.5 }, x, z, Math.random() * 6.28); }
      /* autos: chasis del color del jugador, sombra, fuego del turbo y nombre */
      const CARS = ['raceCarRed', 'raceCarGreen', 'raceCarOrange', 'raceCarWhite']; r.cars = {}; r.cams = {}; r.marks = {};
      gd.ids.forEach((id, k) => {
        const g = add(new T.Group()); g.rotation.order = 'YXZ'; r.cars[id] = g; const col = pl(id)?.color || '#ffffff';
        const body = new T.Group(); g.add(body);
        fitModel(T, Rk(CARS[k % 4]), { size: 2.3, clone: true }).then(o => { o.traverse(q => { if (q.isMesh) { q.castShadow = false; [].concat(q.material).forEach(mm => { if (!/tire|glass|grey|black|dark/i.test(mm.name)) mm.color.set(col); }); } }); o.rotation.y = this.CAR_ROT; body.add(o); }).catch(() => {});
        const sh = new T.Mesh(new T.PlaneGeometry(1.5, 2.6), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .09; g.add(sh);
        const fl = new T.Mesh(new T.ConeGeometry(.22, .9, 10), new T.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: .9 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .35, -1.45); fl.visible = false; g.add(fl); g.userData.fl = fl;
        const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, col); lb.position.y = 2; lb.scale.set(2.2, .55, 1); lb.layers.set(2 + k); g.add(lb);
        const cam = new T.PerspectiveCamera(62, 1, .1, 600); cam.layers.enableAll(); cam.layers.disable(1); cam.layers.disable(2 + k); r.cams[id] = cam;
        const mk = add(new T.Mesh(new T.CircleGeometry(4.2, 20), new T.MeshBasicMaterial({ color: col }))); mk.rotation.x = -Math.PI / 2; mk.position.y = 8; mk.layers.set(1); r.marks[id] = mk;
        const mo = add(new T.Mesh(new T.CircleGeometry(5.6, 20), new T.MeshBasicMaterial({ color: '#fff' }))); mo.rotation.x = -Math.PI / 2; mo.position.y = 7.9; mo.layers.set(1); r.marks[id + '_o'] = mo;
      });
      const xs = P.map(p => p[0]), zs = P.map(p => p[1]), ext = Math.max(Math.max(...xs) - Math.min(...xs), (Math.max(...zs) - Math.min(...zs)) * 1.6) / 2 + 10;
      r.mini = new T.OrthographicCamera(-ext, ext, ext / 1.6, -ext / 1.6, 1, 300); r.marks && Object.values(r.marks).forEach(m => m.scale.setScalar(ext / 75)); r.mini.position.set((Math.max(...xs) + Math.min(...xs)) / 2, 150, (Math.max(...zs) + Math.min(...zs)) / 2); r.mini.lookAt(r.mini.position.x, 0, r.mini.position.z); r.mini.layers.enable(1);
      r.miniAspect = 1.6;
      return r;
    },
    CAR_ROT: 0,
    layout(n) { const rows = n <= 1 ? 1 : n <= 8 ? 2 : 3, cols = n === 2 ? 1 : Math.ceil(n / rows); return { rows: n === 2 ? 2 : rows, cols }; },
    draw(ctx, dt0) {
      const G = GAMES.race3d, gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const T = r.T, now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; r.age = (r.age || 0) + dt;
        if (r.shadowT.length && r.age > r.shadowT[0]) { r.shadowT.shift(); r.renderer.shadowMap.needsUpdate = true; }
        r.padTex.offset.y = (r.padTex.offset.y + dt * 1.5) % 1;
        for (const id of gd.ids) {
          const g = r.cars[id], s = gd.ps[id]; if (!g) continue;
          const ni = s.idx, M = gd.M, slope = (gd.pts[(ni + 3) % M][2] - gd.pts[(ni - 3 + M) % M][2]) / (6 * gd.ds), onRoad = !s.off;
          g.position.set(s.x, s.y + (s.off ? Math.sin(gd.t * 30) * .03 : 0), s.z); g.rotation.y = s.a; g.rotation.x = onRoad ? -Math.atan(slope) * Math.cos(angTo(s.a, gd.dirs[ni])) : 0; g.rotation.z = -s.steer * Math.min(1, Math.abs(s.v) / 20) * .06;
          g.visible = !(s.flash > 0 && Math.floor(s.flash * 10) % 2);
          if (g.userData.fl) { g.userData.fl.visible = s.turbo > 0; g.userData.fl.scale.y = .8 + Math.random() * .6; }
          r.marks[id].position.x = r.marks[id + '_o'].position.x = s.x; r.marks[id].position.z = r.marks[id + '_o'].position.z = s.z;
          /* cámara que persigue al auto desde atrás (suave) */
          s.camA += angTo(s.camA, s.a) * Math.min(1, dt * 4.5); const cam = r.cams[id], back = 6.3, ca = s.camA;
          const tx = s.x - Math.sin(ca) * back, tz = s.z - Math.cos(ca) * back, ty = s.y + 2.8;
          if (!s.camInit) { s.camY = ty; s.camInit = 1; } s.camY += (ty - s.camY) * Math.min(1, dt * 6); cam.position.set(tx, s.camY, tz); /* pegada al auto: el auto siempre se ve igual de cerca */
          cam.lookAt(s.x + Math.sin(ca) * 6, s.y + 1, s.z + Math.cos(ca) * 6);
          const fov = 62 + (s.turbo > 0 ? 10 : 0) + Math.max(0, s.v) / 22 * 6; if (Math.abs(cam.fov - fov) > .1) { cam.fov += (fov - cam.fov) * Math.min(1, dt * 4); }
        }
        gd.cones.forEach((c, k) => { const m = r.cones[k]; if (!m) return; m.position.set(c.x, c.y, c.z); m.rotation.x = c.spin || 0; });
        /* pantalla dividida */
        const n = gd.ids.length, { rows, cols } = G.layout(n), VW = 1000, VH = 600, w = VW / cols, h = VH / rows, R = r.renderer;
        R.setScissorTest(true); R.setClearColor('#0b1020'); R.setViewport(0, 0, VW, VH); R.setScissor(0, 0, VW, VH); R.clear();
        const order = gd.ids, cells = [];
        order.forEach((id, k) => { const c = k % cols, ro = Math.floor(k / cols), x = c * w, y = VH - (ro + 1) * h; cells.push({ id, x, y, w, h }); const cam = r.cams[id]; cam.aspect = (w - 4) / (h - 4); cam.updateProjectionMatrix(); R.setViewport(x + 2, y + 2, w - 4, h - 4); R.setScissor(x + 2, y + 2, w - 4, h - 4); R.render(r.scene, cam); });
        /* mapa: en la celda libre si sobra una, si no chiquito al centro */
        const free = rows * cols > n; let mx, my, mw, mh;
        if (free) { const k = n, c = k % cols, ro = Math.floor(k / cols); mw = w - 4; mh = h - 4; mx = c * w + 2; my = VH - (ro + 1) * h + 2; } else { mw = n === 1 ? 260 : 180; mh = mw / 1.6; mx = n === 1 ? VW - mw - 12 : (VW - mw) / 2; my = n === 1 ? 12 : (VH - mh) / 2; }
        const fog = r.scene.fog; r.scene.fog = null; const ar = mw / mh, e = r.mini.right; r.mini.top = e / ar; r.mini.bottom = -e / ar; r.mini.updateProjectionMatrix();
        R.setViewport(mx, my, mw, mh); R.setScissor(mx, my, mw, mh); R.setClearColor('#14532d'); R.clear(); R.render(r.scene, r.mini); r.scene.fog = fog;
        R.setScissorTest(false);
        G.overlay(r, cells, { mx, my, mw, mh, free });
        return;
      }
      ctx.fillStyle = '#4ade80'; ctx.fillRect(0, 0, 1000, 600); const S = 3.4, X = x => 500 + x * S, Z = z => 300 + z * S;
      ctx.strokeStyle = '#374151'; ctx.lineWidth = G.W * S; ctx.beginPath(); gd.pts.forEach(([x, z], i) => i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z))); ctx.closePath(); ctx.stroke();
      for (const id of gd.ids) { const s = gd.ps[id]; ctx.fillStyle = pl(id)?.color || '#888'; ctx.beginPath(); ctx.arc(X(s.x), Z(s.z), 7, 0, 7); ctx.fill(); }
    },
    overlay(r, cells, mm) {
      const gd = H.gd, cv = r.renderer.domElement, wrap = cv.parentElement; if (!wrap) return;
      let ov = wrap.querySelector('.rcov'); if (!ov) { ov = document.createElement('div'); ov.className = 'rcov'; wrap.appendChild(ov); }
      const L = cv.offsetLeft + 'px', Tp = cv.offsetTop + 'px', Wd = cv.offsetWidth + 'px', Hd = cv.offsetHeight + 'px';
      if (ov.style.left !== L || ov.style.top !== Tp || ov.style.width !== Wd || ov.style.height !== Hd) Object.assign(ov.style, { left: L, top: Tp, width: Wd, height: Hd });
      const now = performance.now(); if (r.ovT && now - r.ovT < 150) return; r.ovT = now;
      const pos = this.pos(), fs = Math.max(10, Math.min(18, cv.offsetWidth / 1000 * (cells.length > 4 ? 14 : 18)));
      const pc = (v, t) => (v / t * 100).toFixed(2) + '%';
      let html = cells.map(c => { const s = gd.ps[c.id], p = pl(c.id), place = pos.indexOf(c.id) + 1, top = 600 - c.y - c.h;
        const mid = s.done ? `<div class="rcbig">🏁 ${s.place}º</div>` : H.phase === 'rc-ready' ? '' : s.wrong > .6 ? `<div class="rcbig rcwarn">↩️ ¡Al revés!</div>` : s.lapFx > 0 ? `<div class="rcbig">${s.lap === this.LAPS - 1 ? '🔔 ¡Última vuelta!' : `Vuelta ${s.lap + 1}`}</div>` : s.off && s.stuck > .8 ? `<div class="rcbig rcwarn">🔄 Volviendo a la pista…</div>` : '';
        return `<div class="rcv" style="left:${pc(c.x, 1000)};top:${pc(top, 600)};width:${pc(c.w, 1000)};height:${pc(c.h, 600)}"><span class="rcn" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}</span><span class="rcp">${place}º</span><span class="rcl">🏁 ${Math.min(this.LAPS, s.lap + 1)}/${this.LAPS}${s.turbo > 0 ? ' 🚀' : s.cd > 0 ? ` · 🚀${Math.ceil(s.cd)}s` : ' · 🚀 listo'}</span><span class="rcs">${Math.round(Math.abs(s.v) * 6)} km/h</span>${mid}</div>`; }).join('');
      ov.style.fontSize = fs + 'px'; if (ov._h !== html) { ov._h = html; ov.innerHTML = html; }
    },
    end() {
      if (H.phase !== 'rc-go') return;
      const gd = H.gd, sc = id => { const s = gd.ps[id]; return s.done ? 1e6 - s.done : s.lap * gd.M + s.idx; };
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => { const s = gd.ps[id]; return { id, val: s.done ? `🏁 ${(s.done / 1000).toFixed(1)} s` : `🏎️ vuelta ${Math.min(this.LAPS, s.lap + 1)} de ${this.LAPS}`, gain: g[id] || 0 }; });
      setPhase('rc-res', 6000, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      if (ph === 'rc-ready') return canvasHTML(true, '🏎️ ¡A sus marcas! Cada uno mira su pantalla');
      if (ph === 'rc-go') return canvasHTML(false);
      return `<h1 class="title-pop">🏁 Podio del Gran Premio</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
