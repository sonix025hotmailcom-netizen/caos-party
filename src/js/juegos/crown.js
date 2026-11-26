/* ================== v48c — JUEGO NUEVO: REY DE LA CORONA 3D (quedate solo en la zona dorada) ================== */
Object.assign(GAMES, {
  crown: {
    name: 'Rey de la Corona 3D', emoji: '👑', color: '#eab308', R: 7.4, ZR: 1.9, DUR: 70,
    desc: '¡Hay una zona DORADA con una corona 👑! Adentro sumás puntos: si estás SOLO sumás 5 veces más rápido. Usá el botón para dar un EMPUJÓN 💥 (espacio) y sacar a los demás. Del cielo caen 🔨 MARTILLOS (empujón doble) y ⚡ RAYOS (súper velocidad)... ¡y BOMBAS 💣 cada vez más seguido! La zona se mueve cada rato. Si te caés de la plataforma volvés en 2 segundos. ¡El que junte más puntos gana!',
    start() {
      const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id))));
      const ps = {}; ids.forEach((id, k) => { const a = k / ids.length * 6.28; ps[id] = { id, x: Math.sin(a) * 5.2, z: Math.cos(a) * 5.2, y: 0, vx: 0, vz: 0, vy: 0, lb: 0, cd: 0, dash: 0, face: a + Math.PI, pts: 0, dead: 0, hit: 0, by: null, ham: 0, fast: 0 }; });
      H.inp = {}; H.gd = { ids, ps, items: [], bombs: [], iid: 0, t: 0, zx: 0, zz: 0, nx: 0, nz: 0, moveT: 10, warn: 0, msgs: [], king: null, sid: rid(), build3D: T => GAMES.crown.build(T) };
      setPhase('cr-ready', 3600, () => { SFX.go(); GAMES.crown.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.crown.draw);
    },
    go() { setPhase('cr-go', this.DUR * 1000, () => GAMES.crown.end()); attachArena(H.gd); rtLoop(dt => GAMES.crown.step(dt), GAMES.crown.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'cr-ready' || H.phase === 'cr-go') return joyView(p, '🕹️ Corré a la zona dorada (WASD) · Botón = EMPUJÓN (espacio)', '💥 EMPUJÓN', 2.2);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'cr-ready' || H.phase === 'cr-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, go = H.phase === 'cr-go', G = GAMES.crown; gd.t += dt;
      if (go) { gd.moveT -= dt; if (gd.moveT < 2.2 && !gd.warn) { gd.warn = 1; const a = Math.random() * 6.28, d = Math.random() * (G.R - G.ZR - .8); gd.nx = Math.sin(a) * d; gd.nz = Math.cos(a) * d; gd.msgs.push({ t: '👑 ¡La corona se va a mover!', k: gd.t }); }
        if (gd.moveT <= 0) { gd.moveT = Math.max(5, 9 - gd.t * .05) + Math.random() * 3; gd.warn = 0; gd.zx = gd.nx; gd.zz = gd.nz; SND.play('ui_pluck_002', .4, .7); } }
      /* armas y bombas que caen del cielo, cada vez más seguido */
      if (go) { gd.itT = (gd.itT ?? 3) - dt; gd.bT = (gd.bT ?? 7) - dt;
        if (gd.itT <= 0) { gd.itT = Math.max(3.2, 8 - gd.t * .07); const a = Math.random() * 6.28, d = Math.random() * (G.R - 1.3); gd.items.push({ k: ++gd.iid, type: Math.random() < .55 ? 'hammer' : 'bolt', x: Math.sin(a) * d, z: Math.cos(a) * d, y: 12, vy: 0, age: 0 }); }
        if (gd.bT <= 0) { gd.bT = Math.max(1.2, 5.5 - gd.t * .075); const n = gd.t > 45 ? 3 : gd.t > 22 ? 2 : 1;
          for (let q = 0; q < n; q++) { const tgt = q === 0 && gd.king && Math.random() < .6 ? gd.ps[gd.king] : null, a = Math.random() * 6.28, d = Math.random() * (G.R - .8); gd.bombs.push({ k: ++gd.iid, x: tgt ? tgt.x : Math.sin(a) * d, z: tgt ? tgt.z : Math.cos(a) * d, t: 1.8 }); } } }
      for (const it of gd.items) { if (it.y > 0) { it.vy -= 22 * dt; it.y = Math.max(0, it.y + it.vy * dt); } else it.age += dt; }
      gd.items = gd.items.filter(it => !it.got && it.age < 12);
      for (const b of gd.bombs) { b.t -= dt; if (b.t <= 0 && !b.boom) { b.boom = 1; SND.play('sf_explosionCrunch_000', .55, .9);
        for (const id of gd.ids) { const s = gd.ps[id]; if (s.dead > 0) continue; const dx = s.x - b.x, dz = s.z - b.z, d = Math.hypot(dx, dz) || .01; if (d < 2.2 && s.y < 1.6) { const k = (2.5 - d) * 5 + 6; s.vx = dx / d * k; s.vz = dz / d * k; s.vy = 8.5; s.hit = .8; s.by = null; s.ham = 0; } } } }
      gd.bombs = gd.bombs.filter(b => !b.boom);
      const live = [];
      for (const id of gd.ids) {
        const s = gd.ps[id];
        if (s.dead > 0) { s.dead -= dt; s.vy -= 24 * dt; s.y += s.vy * dt; s.x += s.vx * dt; s.z += s.vz * dt; if (s.dead <= 0) { const a = Math.random() * 6.28; s.x = Math.sin(a) * 4; s.z = Math.cos(a) * 4; s.y = 9; s.vy = 0; s.vx = s.vz = 0; s.hit = 0; } continue; }
        live.push(s); const i = go ? inp(id) : { x: 0, y: 0, b: s.lb }, mag = Math.min(1, Math.hypot(i.x, i.y)); s.cd -= dt; s.dash -= dt; s.hit -= dt;
        s.fast -= dt; const sp = s.fast > 0 ? 7.8 : 5, tvx = mag > .15 ? i.x / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, tvz = mag > .15 ? i.y / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, k = Math.min(1, dt * (s.hit > 0 ? 1.5 : s.dash > 0 ? 1 : 10));
        s.vx += (tvx - s.vx) * k; s.vz += (tvz - s.vz) * k; if (mag > .15) s.face = Math.atan2(i.x, i.y);
        if (go && i.b !== s.lb) { const pr = i.b > s.lb || i.b === 1; s.lb = i.b; if (pr && s.cd <= 0) { s.cd = 2.2; s.dash = .28; s.vx = Math.sin(s.face) * 13; s.vz = Math.cos(s.face) * 13; SND.play('sf_thrusterFire_000', .3, 1.4); } }
        s.x += s.vx * dt; s.z += s.vz * dt; s.vy -= 24 * dt; s.y += s.vy * dt;
        const r = Math.hypot(s.x, s.z); if (r <= G.R && s.y <= 0 && s.y > -1) { s.y = 0; s.vy = 0; }
        for (const it of gd.items) if (!it.got && it.y < .4 && Math.hypot(it.x - s.x, it.z - s.z) < 1) { it.got = 1; const nm = esc(pl(id)?.name || ''); if (it.type === 'hammer') { s.ham = 1; gd.msgs.push({ t: `🔨 ¡${nm} agarró el MARTILLO! Su empujón es doble`, k: gd.t }); } else { s.fast = 6; gd.msgs.push({ t: `⚡ ¡${nm} va SÚPER rápido!`, k: gd.t }); } SND.play('ui_confirmation_002', .5); }
        if (s.y < -5 && go) { s.dead = 2; s.pts = Math.max(0, s.pts - 3); gd.msgs.push({ t: `💦 ${esc(pl(id)?.name || '')} se cayó${s.by ? ` (empujón de ${esc(pl(s.by)?.name || '')})` : ''}`, k: gd.t }); s.by = null; SFX.bad(); }
      }
      for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) { const A = live[a], B = live[b]; if (Math.abs(A.y - B.y) > 1) continue; const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz) || .01; if (d < .9) {
        const nx = dx / d, nz = dz / d, o = (.9 - d) / 2; A.x -= nx * o; A.z -= nz * o; B.x += nx * o; B.z += nz * o;
        for (const [P, Q, sg] of [[A, B, 1], [B, A, -1]]) if (P.dash > 0) { const K = P.ham ? 22 : 11; if (P.ham) { P.ham = 0; gd.msgs.push({ t: `🔨 ¡MARTILLAZO de ${esc(pl(P.id)?.name || '')}!`, k: gd.t }); shakeScreen(); } Q.vx = nx * sg * K; Q.vz = nz * sg * K; Q.vy = K > 11 ? 9 : 4; Q.hit = .6; Q.by = P.id; P.dash = 0; P.vx *= .2; P.vz *= .2; SND.play('impactSoft_heavy_000', .5, 1); CARX && gd.r3 && CARX.burst(gd.r3, (A.x + B.x) / 2, .8, (A.z + B.z) / 2, 20, 6, '#fde047'); } } }
      /* puntos: solo si estás solo en la zona */
      const inZ = live.filter(s => s.y > -.5 && Math.hypot(s.x - gd.zx, s.z - gd.zz) < G.ZR);
      gd.king = go && inZ.length === 1 ? inZ[0].id : null; gd.crowd = inZ.length;
      if (gd.king) gd.ps[gd.king].pts += dt; else if (go) inZ.forEach(q => q.pts += dt * .2);
    },
    end() {
      if (H.phase !== 'cr-go') return;
      const gd = H.gd, sc = id => Math.round(gd.ps[id].pts * 10) / 10, g = rankGains(gd.ids, sc, true, id => gd.ps[id].pts > 0);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `👑 ${sc(id).toFixed(1)} puntos`, gain: g[id] || 0 }));
      setPhase('cr-res', 6000, () => finishGame(g), 0, false); confetti(100); SFX.win();
    },
    render(ph) {
      if (ph === 'cr-ready') return canvasHTML(true, '👑 ¡Quedate SOLO en la zona dorada!');
      if (ph === 'cr-go') return canvasHTML(false);
      return `<h1 class="title-pop">👑 La realeza del día</h1>${resultsList(H.gd.rows)}`;
    },
    build(T) {
      const gd = H.gd, G = GAMES.crown, r = arena3D(T, { bg: '#fde68a' }), add = o => (r.scene.add(o), o), M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .6 }, o));
      r.scene.background = CARX.sky(T, ['#1e3a8a', '#6366f1', '#f0abfc', '#fde68a']); r.scene.fog = new T.Fog('#e9d5ff', 35, 95);
      r.cam.fov = 44; r.cam.far = 220; r.cam.updateProjectionMatrix();
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-7, 20, 9); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: .5, far: 60 }); sun.shadow.camera.updateProjectionMatrix(); }
      /* castillo de nubes abajo */
      const cm = M('#ffffff', { roughness: 1 }); for (let k = 0; k < 26; k++) { const a = Math.PI * (.68 + Math.random() * .64), d = 15 + Math.random() * 25, c = add(new T.Mesh(new T.SphereGeometry(1.5 + Math.random() * 2.5, 14, 10), cm)); c.position.set(Math.sin(a) * d, -5 - Math.random() * 4, Math.cos(a) * d); c.scale.y = .6; }
      /* plataforma de pasto con borde de piedra de castillo */
      const gr = CARX.tex(T, 512, 512, (g, w, h) => { g.fillStyle = '#65a30d'; g.fillRect(0, 0, w, h); for (let k = 0; k < 3000; k++) { g.fillStyle = ['#4d7c0f', '#84cc16', '#3f6212'][k % 3]; g.fillRect(Math.random() * w, Math.random() * h, 2, 5); } for (let k = 0; k < 40; k++) { g.fillStyle = ['#fde047', '#f9a8d4', '#ffffff'][k % 3]; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 3, 0, 7); g.fill(); } });
      const stone = CARX.tex(T, 256, 128, (g, w, h) => { g.fillStyle = '#a8a29e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 32; x < w; x += 64) { g.fillStyle = ['#d6d3d1', '#a8a29e', '#c4c0bc'][(x + y) % 3]; g.fillRect(x + 2, y + 2, 60, 28); } }, [10, 1]);
      const plat = add(new T.Mesh(new T.CylinderGeometry(G.R, G.R * .8, 2.4, 48), [M('#ffffff', { map: stone }), M('#ffffff', { map: gr }), M('#78716c')])); plat.position.y = -1.2; plat.receiveShadow = true;
      for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28, b = add(new T.Mesh(new T.BoxGeometry(.9, .7, .6), M('#d6d3d1'))); b.position.set(Math.sin(a) * (G.R + .1), .1, Math.cos(a) * (G.R + .1)); b.rotation.y = a; b.castShadow = true; if (k % 2) b.visible = false; }
      /* torres con banderas */
      for (let k = 0; k < 4; k++) { const a = Math.PI * (.6 + k * .27), g = add(new T.Group()), d = G.R + 4.4; g.position.set(Math.sin(a) * d, -5.6, Math.cos(a) * d); g.scale.setScalar(.85); const tw = new T.Mesh(new T.CylinderGeometry(1, 1.1, 6, 16), M('#ffffff', { map: stone })); tw.position.y = 3; g.add(tw); const rf = new T.Mesh(new T.ConeGeometry(1.3, 1.8, 16), M('#7c3aed')); rf.position.y = 6.9; g.add(rf); const fl = new T.Mesh(new T.PlaneGeometry(.9, .55), new T.MeshStandardMaterial({ color: ['#ef4444', '#3b82f6', '#22c55e', '#facc15'][k], side: T.DoubleSide })); fl.position.set(.45, 8.3, 0); g.add(fl); const pole = new T.Mesh(new T.CylinderGeometry(.03, .03, 1, 6), M('#78716c')); pole.position.y = 8.1; g.add(pole); (r.flags = r.flags || []).push(fl); }
      /* zona dorada: aro brillante + rayo de luz + corona flotante */
      const zone = add(new T.Group()); r.zone = zone;
      const disk = new T.Mesh(new T.CircleGeometry(G.ZR, 48), new T.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: .35, depthWrite: false })); disk.rotation.x = -Math.PI / 2; disk.position.y = .03; zone.add(disk); r.disk = disk;
      const ring = new T.Mesh(new T.TorusGeometry(G.ZR, .09, 8, 48), M('#facc15', { emissive: '#f59e0b', emissiveIntensity: 1 })); ring.rotation.x = Math.PI / 2; ring.position.y = .06; zone.add(ring); r.ring = ring;
      const beam = new T.Mesh(new T.CylinderGeometry(G.ZR * .95, G.ZR, 9, 32, 1, true), new T.MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: .12, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending })); beam.position.y = 4.5; zone.add(beam); r.beam = beam;
      const crown = new T.Group(); const gm = M('#facc15', { metalness: .8, roughness: .25, emissive: '#b45309', emissiveIntensity: .25 }); const band = new T.Mesh(new T.CylinderGeometry(.5, .45, .35, 20, 1, true), gm); band.material.side = T.DoubleSide; crown.add(band); for (let q = 0; q < 5; q++) { const sp = new T.Mesh(new T.ConeGeometry(.12, .38, 8), gm); const a = q / 5 * 6.28; sp.position.set(Math.sin(a) * .47, .34, Math.cos(a) * .47); crown.add(sp); const gem = new T.Mesh(new T.SphereGeometry(.07, 8, 6), M(['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f43f5e'][q], { emissive: '#ffffff', emissiveIntensity: .2 })); gem.position.set(Math.sin(a) * .5, 0, Math.cos(a) * .5); crown.add(gem); }
      crown.position.y = 3; zone.add(crown); r.crown = crown;
      r.ghost = add(new T.Mesh(new T.TorusGeometry(G.ZR, .07, 8, 48), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .0 }))); r.ghost.rotation.x = Math.PI / 2; r.ghost.position.y = .05;
      CARX.sparks(T, r, 160); r.bots = {}; r.itM = new Map(); r.bmM = new Map(); r.flashes = [];
      /* antorchas con fuego */
      const fireC = document.createElement('canvas'); fireC.width = fireC.height = 64; { const g = fireC.getContext('2d'), gr = g.createRadialGradient(32, 40, 0, 32, 40, 30); gr.addColorStop(0, '#fff7cc'); gr.addColorStop(.35, '#fbbf24'); gr.addColorStop(.7, '#f9731688'); gr.addColorStop(1, '#f9731600'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); } const fireT = new T.CanvasTexture(fireC);
      r.fires = []; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28 + .39, x = Math.sin(a) * (G.R + .25), z = Math.cos(a) * (G.R + .25); const st = add(new T.Mesh(new T.CylinderGeometry(.08, .1, 1.3, 8), M('#78350f'))); st.position.set(x, .65, z); const bowl = add(new T.Mesh(new T.CylinderGeometry(.22, .12, .2, 10), M('#57534e', { metalness: .5 }))); bowl.position.set(x, 1.35, z); const fl = add(new T.Sprite(new T.SpriteMaterial({ map: fireT, blending: T.AdditiveBlending, depthWrite: false, transparent: true }))); fl.position.set(x, 1.7, z); fl.scale.set(.8, 1.1, 1); r.fires.push(fl); }
      /* chispitas doradas que suben de la zona */
      r.glit = []; const gm2 = new T.SpriteMaterial({ map: fireT, color: '#fde047', blending: T.AdditiveBlending, depthWrite: false, transparent: true }); for (let k = 0; k < 26; k++) { const sp = new T.Sprite(gm2); sp.scale.setScalar(.18); r.zone.add(sp); r.glit.push({ sp, a: Math.random() * 6.28, d: Math.random() * G.ZR, y: Math.random() * 3, v: .6 + Math.random() }); }
      /* modelos de armas */
      r.mk = { hammer: () => { const g = new T.Group(); const h = new T.Mesh(new T.CylinderGeometry(.07, .07, .9, 8), M('#a16207')); h.position.y = .45; g.add(h); const hd = new T.Mesh(new T.BoxGeometry(.55, .32, .32), M('#facc15', { metalness: .7, roughness: .25, emissive: '#b45309', emissiveIntensity: .3 })); hd.position.y = .92; g.add(hd); return g; },
        bolt: () => { const g = new T.Group(), sh = new T.Shape(); sh.moveTo(.1, .6); sh.lineTo(-.25, 0); sh.lineTo(0, 0); sh.lineTo(-.12, -.6); sh.lineTo(.28, .1); sh.lineTo(.03, .1); sh.lineTo(.18, .6); const m = new T.Mesh(new T.ExtrudeGeometry(sh, { depth: .12, bevelEnabled: false }), M('#fde047', { emissive: '#facc15', emissiveIntensity: .8 })); m.position.set(0, .7, -.06); g.add(m); return g; },
        bomb: () => { const g = new T.Group(); const b = new T.Mesh(new T.SphereGeometry(.45, 18, 14), M('#111827', { metalness: .4, roughness: .3 })); g.add(b); const f = new T.Mesh(new T.SphereGeometry(.12, 8, 6), M('#fb923c', { emissive: '#f97316', emissiveIntensity: 2 })); f.position.y = .52; g.add(f); return g; } };
      r.beamM = new T.MeshBasicMaterial({ color: '#fef08a', transparent: true, opacity: .25, depthWrite: false, blending: T.AdditiveBlending });
      r.warnM = new T.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: .45, depthWrite: false });
      gd.ids.forEach(id => C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.5), tintFor(g, id)); a.play('Idle'); const hold = new T.Group(); hold.add(a.obj); add(hold); const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, pl(id)?.color || '#fff'); lb.position.y = 2.3; lb.scale.set(2.6, .65, 1); lb.material.depthTest = false; lb.renderOrder = 10; hold.add(lb); const sh = new T.Mesh(new T.CircleGeometry(.45, 20), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .28, depthWrite: false })); sh.rotation.x = -Math.PI / 2; add(sh); a.hold = hold; a.sh = sh; r.bots[id] = a; }).catch(() => {}));
      return r;
    },
    draw(ctx) {
      const G = GAMES.crown, gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
        r.zone.position.x += (gd.zx - r.zone.position.x) * Math.min(1, dt * 5); r.zone.position.z += (gd.zz - r.zone.position.z) * Math.min(1, dt * 5);
        const contested = gd.crowd > 1; r.disk.material.color.set(gd.king ? '#fde047' : contested ? '#f87171' : '#fef9c3'); r.disk.material.opacity = .28 + Math.sin(tt * 4) * .08; r.ring.material.emissiveIntensity = .6 + Math.sin(tt * 6) * .4;
        const K = gd.king && r.bots[gd.king]; if (K) { r.crown.position.lerp(new r.T.Vector3(K.hold.position.x - r.zone.position.x, K.hold.position.y + 2.95, K.hold.position.z - r.zone.position.z), Math.min(1, dt * 10)); } else r.crown.position.lerp(new r.T.Vector3(0, 2.6 + Math.sin(tt * 2) * .25, 0), Math.min(1, dt * 4));
        r.crown.rotation.y += dt * 2;
        r.fires.forEach((f, k) => { const s = .75 + Math.sin(tt * 13 + k * 2) * .08 + Math.random() * .08; f.scale.set(s, s * 1.4, 1); });
        r.glit.forEach(g => { g.y += g.v * dt; if (g.y > 3.5) { g.y = 0; g.a = Math.random() * 6.28; g.d = Math.random() * G.ZR; } g.sp.position.set(Math.sin(g.a + tt * .5) * g.d, g.y, Math.cos(g.a + tt * .5) * g.d); g.sp.material.opacity = 1 - g.y / 3.5; });
        if (gd.king) { const s = gd.ps[gd.king]; const whole = Math.floor(s.pts); if (whole !== r.lastPt) { r.lastPt = whole; CARX.burst(r, s.x, 2.4, s.z, 8, 3, '#facc15'); } }
        /* armas que caen */
        const seenI = new Set(); for (const it of gd.items) { seenI.add(it.k); let m = r.itM.get(it.k); if (!m) { m = potAdd(r, new r.T.Group()); const o = r.mk[it.type](); m.add(o); m.o = o; const bm = new r.T.Mesh(new r.T.CylinderGeometry(.5, .5, 14, 16, 1, true), r.beamM); bm.position.y = 7; m.add(bm); m.bm = bm; const ring = new r.T.Mesh(new r.T.RingGeometry(.5, .7, 24), new r.T.MeshBasicMaterial({ color: it.type === 'hammer' ? '#facc15' : '#38bdf8', transparent: true, opacity: .8, side: r.T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .04; m.add(ring); r.itM.set(it.k, m); }
          m.position.set(it.x, 0, it.z); m.o.position.y = it.y + .2 + (it.y <= 0 ? Math.sin(tt * 3 + it.k) * .12 : 0); m.o.rotation.y += dt * 2.5; m.bm.visible = it.y <= 0; if (it.y <= 0 && !m.landed) { m.landed = 1; CARX.burst(r, it.x, .2, it.z, 12, 4, '#ffffff'); } m.visible = !(it.age > 9 && Math.floor(tt * 8) % 2); }
        for (const [k, m] of r.itM) if (!seenI.has(k)) { CARX.burst(r, m.position.x, .8, m.position.z, 18, 5, '#fde047'); r.scene.remove(m); r.itM.delete(k); }
        /* bombas: círculo rojo de aviso + bomba cayendo + explosión */
        const seenB = new Set(); for (const b of gd.bombs) { seenB.add(b.k); let m = r.bmM.get(b.k); if (!m) { m = potAdd(r, new r.T.Group()); const w = new r.T.Mesh(new r.T.CircleGeometry(2.2, 40), r.warnM.clone()); w.rotation.x = -Math.PI / 2; w.position.y = .05; m.add(w); m.w = w; const o = r.mk.bomb(); m.add(o); m.o = o; r.bmM.set(b.k, m); m.bx = b.x; m.bz = b.z; }
          m.position.set(b.x, 0, b.z); const u = Math.max(0, b.t / 1.8); m.o.position.y = .45 + u * u * 11; m.o.rotation.x += dt * 4; m.w.material.opacity = .25 + (1 - u) * .4 + Math.sin(tt * (8 + (1 - u) * 20)) * .12; m.w.scale.setScalar(.6 + (1 - u) * .4); }
        for (const [k, m] of r.bmM) if (!seenB.has(k)) { CARX.burst(r, m.bx, .6, m.bz, 50, 9, '#f97316'); CARX.burst(r, m.bx, .6, m.bz, 30, 7, '#fde047'); const fl = potAdd(r, new r.T.Mesh(new r.T.SphereGeometry(1, 20, 14), new r.T.MeshBasicMaterial({ color: '#fde047', transparent: true, depthWrite: false }))); fl.position.set(m.bx, .6, m.bz); r.flashes.push({ fl, t: 0 }); r.scene.remove(m); r.bmM.delete(k); }
        r.flashes = r.flashes.filter(f => { f.t += dt; f.fl.scale.setScalar(.5 + f.t * 6); f.fl.material.opacity = Math.max(0, 1 - f.t / .35); if (f.t > .35) { r.scene.remove(f.fl); f.fl.geometry.dispose(); return false; } return true; });
        r.ghost.material.opacity = gd.warn ? .5 + Math.sin(tt * 12) * .4 : 0; r.ghost.position.x = gd.nx; r.ghost.position.z = gd.nz;
        (r.flags || []).forEach((f, k) => f.rotation.y = Math.sin(tt * 3 + k) * .4);
        for (const id of gd.ids) {
          const a = r.bots[id], s = gd.ps[id]; if (!a) continue; a.hold.position.set(s.x, s.y, s.z); a.hold.visible = s.y > -12; a.obj.rotation.y = s.face;
          const sp = Math.hypot(s.vx, s.vz); a.play(s.dead > 0 ? 'Jump' : s.hit > 0 ? 'No' : s.dash > 0 ? 'Punch' : s.y > .05 ? 'Jump' : sp > .8 ? 'Running' : gd.king === id ? 'Dance' : 'Idle'); a.mixer.update(dt);
          a.sh.visible = s.dead <= 0 && Math.hypot(s.x, s.z) <= G.R; a.sh.position.set(s.x, .03, s.z);
          if (!a.hm && r.mk) { a.hm = r.mk.hammer(); a.hm.scale.setScalar(.85); a.hold.add(a.hm); a.aura = new r.T.Mesh(new r.T.RingGeometry(.55, .78, 24), new r.T.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: .85, side: r.T.DoubleSide, depthWrite: false })); a.aura.rotation.x = -Math.PI / 2; a.aura.position.y = .06; a.hold.add(a.aura); }
          if (a.hm) { a.hm.visible = !!s.ham; a.hm.position.set(Math.sin(s.face + 1.3) * .5, .55 + (s.dash > 0 ? .3 : 0), Math.cos(s.face + 1.3) * .5); a.hm.rotation.set(s.dash > 0 ? 1.4 : .35, s.face, 0); a.aura.visible = s.fast > 0; a.aura.rotation.z += dt * 6; if (s.fast > 0 && Math.random() < .35) CARX.burst(r, s.x, .2, s.z, 1, 1.5, '#38bdf8'); }
        }
        CARX.tickSparks(r, dt);
        r.cam.position.set(0, 13.4, 11.8); r.cam.lookAt(0, -.4, .7); r.renderer.render(r.scene, r.cam);
        const srt = gd.ids.slice().sort((a, b) => gd.ps[b].pts - gd.ps[a].pts), msgs = gd.msgs.filter(m => gd.t - m.k < 2.6).slice(-3);
        CARX.overlay(r, `<div class="cxtop">${srt.map((id, k) => { const p = pl(id); return `<span class="cxpill${gd.ps[id].dead > 0 ? ' off' : ''}" style="--c:${p?.color || '#888'}">${gd.king === id ? '👑 ' : ''}${p?.emoji || ''} ${esc(p?.name || '')} ${gd.ps[id].pts.toFixed(0)}</span>`; }).join('')}</div>${H.phase === 'cr-go' && gd.crowd > 1 ? '<div class="cxbig" style="top:13%;font-size:1.15em">⚔️ ¡Zona en disputa! Suman muy poquito</div>' : ''}<div class="cxmsgs">${msgs.map(m => `<div class="cxmsg">${m.t}</div>`).join('')}</div>`);
        return;
      }
      ctx.fillStyle = '#84cc16'; ctx.fillRect(0, 0, 1000, 600); const S = 34; ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(500 + gd.zx * S, 300 + gd.zz * S, G.ZR * S, 0, 7); ctx.fill();
      for (const id of gd.ids) { const s = gd.ps[id]; if (s.dead > 0) continue; emo(ctx, pl(id)?.emoji || '?', 500 + s.x * S, 300 + s.z * S, 30); }
    }
  }
});
