/* ================== v48 — JUEGO NUEVO: BARREDORA LOCA 3D (saltar la barra que gira) ================== */
Object.assign(GAMES, {
  sweep: {
    name: 'Barredora Loca 3D', emoji: '🌀', color: '#06b6d4', R: 7.2, PR: 1.05,
    desc: '¡Una barra gigante gira en el centro y barre la plataforma! 🌀 SALTÁ con el botón (ESPACIO) cuando llegue o salís volando. Cada vez gira más rápido, cambia de sentido sin avisar y a los 18 segundos salen DOS barras. ¡El último robot en pie gana!',
    start() {
      const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id))));
      const ps = {}; ids.forEach((id, k) => { const a = k / ids.length * 6.28 + .3; ps[id] = { id, x: Math.sin(a) * 4.6, z: Math.cos(a) * 4.6, y: 0, vx: 0, vz: 0, vy: 0, gr: true, lb: 0, out: 0, face: a + Math.PI, fly: null }; });
      H.inp = {}; H.gd = { ids, ps, t: 0, th: 0, w: 1.15, dir: 1, bars: 1, order: [], msgs: [], flipT: 22, sid: rid(), build3D: T => GAMES.sweep.build(T) };
      setPhase('sw-ready', 3600, () => { SFX.go(); GAMES.sweep.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.sweep.draw);
    },
    go() { setPhase('sw-go', 100000, () => GAMES.sweep.end()); attachArena(H.gd); rtLoop(dt => GAMES.sweep.step(dt), GAMES.sweep.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps?.[p.id]; if (s && s.out) return { screen: 'msg', big: '🌀', title: '¡Te barrieron!', text: 'Mirá la tele y apoyá a los que quedan 😄' };
      if (H.phase === 'sw-ready' || H.phase === 'sw-go') return joyView(p, '🕹️ Moverte (WASD) · Botón = SALTAR (espacio) cuando llegue la barra', '⬆️ SALTAR', 0);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'sw-ready' || H.phase === 'sw-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'sw-go' && !!H.gd.ps?.[id]?.out; },
    knock(gd, s, ang) {
      const tx = Math.cos(ang) * gd.dir, tz = -Math.sin(ang) * gd.dir, r = Math.hypot(s.x, s.z) || 1;
      s.out = Date.now(); s.fly = { vx: (tx * 8 + s.x / r * 6), vz: (tz * 8 + s.z / r * 6), vy: 10, sp: (Math.random() < .5 ? -1 : 1) * 12 }; gd.order.push(s.id);
      gd.msgs.push({ t: `🌀 ¡${esc(pl(s.id)?.name || '')} salió volando!`, k: gd.t }); SND.play('sf_explosionCrunch_001', .35, 1.6); SFX.bad(); sync(); updateStrip();
    },
    step(dt) {
      const gd = H.gd, go = H.phase === 'sw-go', G = GAMES.sweep; gd.t += dt;
      if (go) {
        gd.w = Math.min(3.7, 1.45 + gd.t * .042) * Math.min(1, gd.t / 2) * gd.dir;
        if (gd.t > gd.flipT) { gd.dir *= -1; gd.flipT = gd.t + 5 + Math.random() * 7; gd.msgs.push({ t: '🔄 ¡Cambió de sentido!', k: gd.t }); SND.play('ui_pluck_002', .4, .6); }
        if (gd.bars < 2 && gd.t > 18) { gd.bars = 2; gd.msgs.push({ t: '⚠️ ¡Ahora son DOS barras!', k: gd.t }); SFX.bad(); }
      }
      const th0 = gd.th; if (go) gd.th += gd.w * dt;
      const live = [];
      for (const id of gd.ids) {
        const s = gd.ps[id];
        if (s.fly) { s.x += s.fly.vx * dt; s.z += s.fly.vz * dt; s.fly.vy -= 22 * dt; s.y += s.fly.vy * dt; continue; }
        live.push(s);
        const i = go ? inp(id) : { x: 0, y: 0, b: s.lb }, mag = Math.min(1, Math.hypot(i.x, i.y)), sp = 4.6;
        const tvx = mag > .15 ? i.x / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, tvz = mag > .15 ? i.y / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, k = Math.min(1, dt * (s.gr ? 12 : 3));
        s.vx += (tvx - s.vx) * k; s.vz += (tvz - s.vz) * k; if (mag > .15) s.face = Math.atan2(i.x, i.y);
        if (go && i.b !== s.lb) { const pr = i.b > s.lb || i.b === 1; s.lb = i.b; if (pr && s.gr) { s.vy = 8.6; s.gr = false; SND.play('ui_pluck_002', .3, 1.3); } }
        s.x += s.vx * dt; s.z += s.vz * dt; s.vy -= 24 * dt; s.y += s.vy * dt;
        let r = Math.hypot(s.x, s.z);
        if (r < G.PR + .45) { const f = (G.PR + .45) / (r || 1); s.x *= f; s.z *= f; r = G.PR + .45; }
        if (r <= G.R) { if (s.y <= 0) { s.y = 0; s.vy = 0; s.gr = true; } }
        else s.gr = false;
        if (go && s.y < -6) { s.out = Date.now(); s.fly = { vx: s.vx, vz: s.vz, vy: s.vy, sp: 4 }; gd.order.push(id); gd.msgs.push({ t: `💦 ${esc(pl(id)?.name || '')} se cayó al agua`, k: gd.t }); SFX.bad(); sync(); updateStrip(); continue; }
        /* ¿la barra pasó por donde está el robot? */
        if (go && s.y < .62 && r > G.PR) { const phi = Math.atan2(s.x, s.z);
          for (let b = 0; b < gd.bars; b++) { const off = b * Math.PI, a0 = th0 + off, a1 = gd.th + off, w = .32 / r;
            const d0 = Math.atan2(Math.sin(phi - a0), Math.cos(phi - a0)), d1 = Math.atan2(Math.sin(phi - a1), Math.cos(phi - a1));
            const crossed = Math.sign(d0) !== Math.sign(d1) && Math.abs(d0) < 1.5 && Math.abs(gd.w) > .25, front = Math.abs(d1) < w && d1 * Math.sign(gd.w) > 0 && Math.abs(gd.w) > .6;
            if (crossed || front) { G.knock(gd, s, a1); break; }
            if (Math.abs(d1) < w) { const np = a1 + Math.sign(d1 || 1) * w; s.x = Math.sin(np) * r; s.z = Math.cos(np) * r; } } }
      }
      for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) { const A = live[a], B = live[b]; if (A.out || B.out) continue; const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); if (d > 0 && d < .85) { const o = (.85 - d) / 2; A.x -= dx / d * o; A.z -= dz / d * o; B.x += dx / d * o; B.z += dz / d * o; } }
      const alive = gd.ids.filter(id => !gd.ps[id].out);
      if (go && gd.ids.length > 1 && alive.length <= 1 && !gd.ending) { gd.ending = true; if (alive[0]) { gd.msgs.push({ t: `🏆 ¡${esc(pl(alive[0])?.name || '')} aguantó!`, k: gd.t }); confetti(120); } const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.sweep.end(); }, 2400); }
    },
    end() {
      if (H.phase !== 'sw-go') return;
      const gd = H.gd, sc = id => gd.ps[id].out ? gd.order.indexOf(id) : 1000, g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.ps[id].out ? `🌀 Barrido (${gd.order.indexOf(id) + 1}º en salir)` : '🏆 ¡Quedó en pie!', gain: g[id] || 0 }));
      setPhase('sw-res', 6000, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      if (ph === 'sw-ready') return canvasHTML(true, '🌀 ¡Saltá cuando llegue la barra!');
      if (ph === 'sw-go') return canvasHTML(false);
      return `<h1 class="title-pop">🌀 Los que aguantaron la barredora</h1>${resultsList(H.gd.rows)}`;
    },
    build(T) {
      const gd = H.gd, G = GAMES.sweep, r = arena3D(T, { bg: '#7dd3fc' }), add = o => (r.scene.add(o), o), M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .55 }, o));
      r.scene.background = CARX.sky(T, ['#0ea5e9', '#38bdf8', '#a5f3fc', '#fef9c3']); r.scene.fog = new T.Fog('#bae6fd', 35, 90);
      r.cam.fov = 44; r.cam.far = 200; r.cam.updateProjectionMatrix();
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-7, 20, 10); Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: .5, far: 60 }); sun.shadow.camera.updateProjectionMatrix(); }
      /* agua de piscina */
      const wt = CARX.tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#0891b2'; g.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(255,255,255,${.12 + Math.random() * .25})`; g.lineWidth = 2 + Math.random() * 3; g.beginPath(); const x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 15, y - 10, x + 34, y); g.stroke(); } }, [16, 16]);
      const sea = add(new T.Mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ map: wt, roughness: .15, metalness: .1 }))); sea.rotation.x = -Math.PI / 2; sea.position.y = -3; r.water = wt;
      /* plataforma de dulce con rayas */
      const top = CARX.tex(T, 512, 512, (g, w, h) => { const cx = w / 2; for (let k = 0; k < 16; k++) { g.fillStyle = k % 2 ? '#fde68a' : '#fb7185'; g.beginPath(); g.moveTo(cx, cx); g.arc(cx, cx, cx, k / 16 * 6.283, (k + 1) / 16 * 6.283); g.fill(); } g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cx, cx * .2, 0, 7); g.fill(); for (let k = 0; k < 3; k++) { g.strokeStyle = '#ffffffaa'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cx, cx * (.45 + k * .18), 0, 7); g.stroke(); } });
      const plat = add(new T.Mesh(new T.CylinderGeometry(G.R, G.R * .92, 1.2, 64), [M('#be185d'), M('#ffffff', { map: top }), M('#9d174d')])); plat.position.y = -.6; plat.receiveShadow = true;
      const rim = add(new T.Mesh(new T.TorusGeometry(G.R, .16, 10, 64), M('#ffffff', { emissive: '#ffffff', emissiveIntensity: .25 }))); rim.rotation.x = Math.PI / 2; rim.position.y = .02;
      /* columna central con engranaje */
      const col = add(new T.Mesh(new T.CylinderGeometry(G.PR, G.PR * 1.1, 1.6, 24), M('#334155', { metalness: .6, roughness: .35 }))); col.position.y = .3; col.castShadow = true;
      const gear = add(new T.Group()); gear.position.y = 1.15; r.gear = gear; const gm = M('#facc15', { metalness: .7, roughness: .3 }); gear.add(new T.Mesh(new T.CylinderGeometry(.75, .75, .3, 20), gm)); for (let k = 0; k < 10; k++) { const tth = new T.Mesh(new T.BoxGeometry(.25, .3, .3), gm); tth.position.set(Math.sin(k / 10 * 6.28) * .85, 0, Math.cos(k / 10 * 6.28) * .85); tth.rotation.y = k / 10 * 6.28; gear.add(tth); }
      /* barras rayadas rojo/blanco con luces en la punta */
      const st = CARX.tex(T, 256, 32, (g, w, h) => { for (let x = -h; x < w + h; x += 32) { g.fillStyle = (x / 32) % 2 ? '#ffffff' : '#ef4444'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, 0); g.lineTo(x + 16 - h, h); g.lineTo(x - h, h); g.fill(); } }, [6, 1]);
      r.bars = [0, 1].map(b => { const grp = add(new T.Group()); const bar = new T.Mesh(new T.CylinderGeometry(.24, .24, G.R + .4, 16), M('#ffffff', { map: st, roughness: .35 })); bar.rotation.x = Math.PI / 2; bar.position.set(0, .34, (G.R + .4) / 2); bar.castShadow = true; grp.add(bar);
        const tip = new T.Mesh(new T.SphereGeometry(.36, 16, 12), M('#fde047', { emissive: '#f59e0b', emissiveIntensity: .9 })); tip.position.set(0, .34, G.R + .45); grp.add(tip); grp.visible = b === 0; return grp; });
      /* flotadores y palmeras alrededor */
      const ring = [M('#f43f5e'), M('#ffffff')]; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28 + .2, d = G.R + 5 + (k % 3) * 2.5, f = add(new T.Mesh(new T.TorusGeometry(.8, .32, 10, 24), ring[k % 2])); f.rotation.x = Math.PI / 2; f.position.set(Math.sin(a) * d, -2.85, Math.cos(a) * d); f.userData.ph = Math.random() * 6; (r.floats = r.floats || []).push(f); }
      const trunk = M('#a16207'), leaf = M('#16a34a'); for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28, d = 26 + Math.random() * 8, g = add(new T.Group()); g.position.set(Math.sin(a) * d, -3, Math.cos(a) * d); const tr = new T.Mesh(new T.CylinderGeometry(.25, .35, 6, 8), trunk); tr.position.y = 3; tr.rotation.z = .15; g.add(tr); for (let q = 0; q < 6; q++) { const l = new T.Mesh(new T.ConeGeometry(.5, 3.2, 4), leaf); l.position.set(Math.sin(q) * 1.2 + .4, 6, Math.cos(q) * 1.2); l.rotation.set(Math.cos(q) * 1.2, 0, -Math.sin(q) * 1.2); g.add(l); } }
      CARX.sparks(T, r, 140); r.bots = {}; r.rings = [];
      /* zona de peligro delante de cada barra + estela de la barra */
      const wedgeG = (() => { const g = new T.BufferGeometry(), v = [0, 0, 0], L = .6, N = 18; for (let k = 0; k <= N; k++) { const f = k / N * L; v.push(Math.sin(f) * G.R, 0, Math.cos(f) * G.R); } const idx = []; for (let k = 1; k <= N; k++) idx.push(0, k, k + 1); g.setAttribute('position', new T.Float32BufferAttribute(v, 3)); g.setIndex(idx); return g; })();
      r.bars.forEach(b => { const wm = new T.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: .2, depthWrite: false, side: T.DoubleSide }); const w = new T.Mesh(wedgeG, wm); w.position.y = .03; w.visible = false; b.add(w); b.wedge = w;
        b.ghosts = [1, 2, 3].map(k => { const gb = new T.Mesh(new T.BoxGeometry(.4, .4, G.R), new T.MeshBasicMaterial({ color: '#fecaca', transparent: true, opacity: .22 / k, depthWrite: false })); gb.position.set(0, .34, G.R / 2); const piv = new T.Group(); piv.add(gb); b.add(piv); return piv; }); });
      /* luces que corren alrededor del borde */
      r.bulbs = [M('#fde047', { emissive: '#fde047', emissiveIntensity: 1.4 }), M('#f472b6', { emissive: '#f472b6', emissiveIntensity: .15 })]; const bgeo = new T.SphereGeometry(.11, 8, 6); for (let k = 0; k < 40; k++) { const a = k / 40 * 6.28, b = add(new T.Mesh(bgeo, r.bulbs[k % 2])); b.position.set(Math.sin(a) * (G.R + .02), .2, Math.cos(a) * (G.R + .02)); }
      /* patito inflable gigante y pelotas de playa */
      const duck = add(new T.Group()); const yel = M('#facc15', { roughness: .3 }); const body = new T.Mesh(new T.SphereGeometry(1.6, 20, 16), yel); body.scale.set(1.3, .8, 1); duck.add(body); const head = new T.Mesh(new T.SphereGeometry(.9, 18, 14), yel); head.position.set(1.4, 1.3, 0); duck.add(head); const beak = new T.Mesh(new T.ConeGeometry(.35, .7, 12), M('#f97316')); beak.rotation.z = -Math.PI / 2; beak.position.set(2.4, 1.2, 0); duck.add(beak); [-.35, .35].forEach(z => { const e = new T.Mesh(new T.SphereGeometry(.12, 8, 6), M('#111827')); e.position.set(2.05, 1.55, z); duck.add(e); }); duck.position.set(-15, -2.6, -15); duck.rotation.y = .6; r.duck = duck;
      r.balls = []; const bc = ['#ef4444', '#3b82f6', '#facc15']; for (let k = 0; k < 3; k++) { const bb = add(new T.Mesh(new T.SphereGeometry(.7, 16, 12), M(bc[k], { roughness: .3 }))); bb.position.set(12 - k * 6, -2.4, -11 + k * 3); bb.userData.ph = k * 2; r.balls.push(bb); }
      gd.ids.forEach(id => C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.5), tintFor(g, id)); a.play('Idle'); const hold = new T.Group(); hold.add(a.obj); add(hold); const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, pl(id)?.color || '#fff'); lb.position.y = 2.3; lb.scale.set(2.6, .65, 1); lb.material.depthTest = false; lb.renderOrder = 10; hold.add(lb); const sh = new T.Mesh(new T.CircleGeometry(.45, 20), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .28, depthWrite: false })); sh.rotation.x = -Math.PI / 2; add(sh); a.hold = hold; a.sh = sh; r.bots[id] = a; }).catch(() => {}));
      return r;
    },
    draw(ctx) {
      const G = GAMES.sweep, gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
        r.water.offset.x = (r.water.offset.x + dt * .02) % 1; r.water.offset.y = (r.water.offset.y + dt * .013) % 1;
        (r.floats || []).forEach(f => { f.position.y = -2.85 + Math.sin(tt * 1.4 + f.userData.ph) * .12; f.rotation.z = Math.sin(tt + f.userData.ph) * .2; });
        r.bars.forEach((b, k) => { b.visible = k < gd.bars; b.rotation.y = gd.th + k * Math.PI; const fx = Math.min(1, Math.abs(gd.w) / 3.1); if (b.wedge) { b.wedge.scale.x = gd.dir < 0 ? -1 : 1; b.wedge.material.opacity = .22 + fx * .33 + Math.sin(tt * 10) * .05; b.wedge.material.color.set('#b91c1c'); b.ghosts.forEach((gp, q) => gp.rotation.y = -Math.sign(gd.w || 1) * (q + 1) * .05 * (.3 + fx)); } }); r.gear.rotation.y = gd.th * 2;
        const bl = Math.floor(tt * (3 + Math.abs(gd.w) * 2)) % 2; r.bulbs[0].emissiveIntensity = bl ? 1.4 : .15; r.bulbs[1].emissiveIntensity = bl ? .15 : 1.4;
        r.duck.position.y = -2.6 + Math.sin(tt * 1.2) * .15; r.duck.rotation.z = Math.sin(tt * .9) * .06; r.balls.forEach(bb => { bb.position.y = -2.4 + Math.sin(tt * 1.6 + bb.userData.ph) * .12; bb.rotation.x += dt * .4; });
        r.rings = r.rings.filter(q => { q.t += dt; q.m.scale.setScalar(.4 + q.t * 3.2); q.m.material.opacity = Math.max(0, .8 - q.t * .8); if (q.t > 1) { r.scene.remove(q.m); return false; } return true; });
        for (const id of gd.ids) {
          const a = r.bots[id], s = gd.ps[id]; if (!a) continue; a.hold.position.set(s.x, s.y, s.z); a.hold.visible = s.y > -10;
          if (s.fly) { a.hold.rotation.x += s.fly.sp * dt; a.hold.rotation.z += s.fly.sp * .6 * dt; if (!a._fl) { a._fl = 1; a.play('Jump', true); CARX.burst(r, s.x, .8, s.z, 26, 6, pl(id)?.color); } if (s.y < -2.9 && !a._sp) { a._sp = 1; CARX.burst(r, s.x, -2.8, s.z, 30, 5, '#e0f2fe'); const rg = potAdd(r, new r.T.Mesh(new r.T.TorusGeometry(1, .08, 6, 32), new r.T.MeshBasicMaterial({ color: '#ffffff', transparent: true, depthWrite: false }))); rg.rotation.x = Math.PI / 2; rg.position.set(s.x, -2.95, s.z); r.rings.push({ m: rg, t: 0 }); SND.play('sf_explosionCrunch_000', .2, 2); } }
          else { a.obj.rotation.y = s.face; const sp = Math.hypot(s.vx, s.vz); a.play(!s.gr ? 'Jump' : sp > .8 ? 'Running' : 'Idle'); }
          a.mixer.update(dt);
          a.sh.visible = !s.out && Math.hypot(s.x, s.z) <= G.R; a.sh.position.set(s.x, .03, s.z); a.sh.scale.setScalar(Math.max(.4, 1 - s.y / 4));
        }
        CARX.tickSparks(r, dt);
        r.cam.position.set(0, 13.2, 11.6); r.cam.lookAt(0, -.4, .7);
        r.renderer.render(r.scene, r.cam);
        const alive = gd.ids.filter(id => !gd.ps[id].out).length, msgs = gd.msgs.filter(m => gd.t - m.k < 2.6).slice(-3), spd = Math.round(Math.abs(gd.w) / 3.7 * 100);
        CARX.overlay(r, `<div class="cxtop"><span class="cxpill" style="--c:#06b6d4">🌀 Quedan ${alive}</span><span class="cxpill" style="--c:#ef4444">⚡ Velocidad ${spd}%</span>${gd.ids.map(id => { const s = gd.ps[id], p = pl(id); return `<span class="cxpill${s.out ? ' off' : ''}" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}${s.out ? ' 💦' : ''}</span>`; }).join('')}</div><div class="cxmsgs">${msgs.map(m => `<div class="cxmsg">${m.t}</div>`).join('')}</div>`);
        return;
      }
      ctx.fillStyle = '#7dd3fc'; ctx.fillRect(0, 0, 1000, 600); const S = 34; ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(500, 300, G.R * S, 0, 7); ctx.fill();
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 14; for (let b = 0; b < gd.bars; b++) { const a = gd.th + b * Math.PI; ctx.beginPath(); ctx.moveTo(500, 300); ctx.lineTo(500 + Math.sin(a) * G.R * S, 300 + Math.cos(a) * G.R * S); ctx.stroke(); }
      for (const id of gd.ids) { const s = gd.ps[id]; if (s.out) continue; emo(ctx, pl(id)?.emoji || '?', 500 + s.x * S, 300 + s.z * S - s.y * 10, 30); }
    }
  }
});
