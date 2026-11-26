Object.assign(GAMES, {
  /* =================================================================== */
  /* 💥 AUTOS CHOCONES 3D — empujá a los demás a la lava                  */
  /* =================================================================== */
  bumper: {
    name: 'Autos Chocones 3D', emoji: '💥', color: '#f97316', R0: 14.5, Rmin: 5.6, CR: 1.15,
    P: { acc: 22, max: 11.5, turbo: 19, turn: 4.4, grip: 7, kick: 11, cd: 3, push: .14, pushT: .6, e: .6, sgrip: 3, hdrag: 1.4 },
    desc: '¡Chocones arriba de una plataforma sobre LAVA! 🌋 Mové el joystick (o WASD) hacia donde querés ir y tu auto gira solo. El botón (ESPACIO) es una EMBESTIDA 💨 que empuja fuerte. Los hongos rojos rebotan y la plataforma se achica… ¡el último que quede arriba gana!',
    start() {
      const ids = onlineIds(); CARX.MODELS.concat(['grandStandRound', 'lightPostLarge', 'bannerTowerRed', 'bannerTowerGreen', 'flagCheckers']).forEach(n => C3D.load(Rk(n)).catch(() => {}));
      const ps = {}; ids.forEach((id, k) => { const a = k / ids.length * Math.PI * 2 + .4; ps[id] = { id, x: Math.sin(a) * 8.5, z: Math.cos(a) * 8.5, a: a + Math.PI, vx: 0, vz: 0, y: 0, vy: 0, lb: 0, cd: 0, turbo: 0, hit: 0, by: null, byT: 0, out: 0, kos: 0 }; });
      const n = 3 + (ids.length > 5 ? 1 : 0), ph = Math.random() * 6.28, bumps = Array.from({ length: n }, (_, k) => ({ x: Math.sin(ph + k / n * 6.28) * 4.3, z: Math.cos(ph + k / n * 6.28) * 4.3, r: .95, f: 0 }));
      H.inp = {}; H.gd = { ids, ps, bumps, R: this.R0, t: 0, order: [], msgs: [], sid: rid(), build3D: T => GAMES.bumper.build(T) };
      setPhase('bp-ready', 3600, () => { SFX.go(); GAMES.bumper.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.bumper.draw);
    },
    go() { setPhase('bp-go', 80000, () => GAMES.bumper.end()); attachArena(H.gd); rtLoop(dt => GAMES.bumper.step(dt), GAMES.bumper.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps?.[p.id];
      if (s && s.out) return { screen: 'msg', big: '🌋', title: '¡Te tiraron a la lava!', text: 'Mirá la tele y apoyá a los que quedan 😄' };
      if (H.phase === 'bp-ready' || H.phase === 'bp-go') return joyView(p, '🕹️ Mové hacia donde querés ir (WASD / flechas) · Botón = EMBESTIDA (espacio)', '💨 EMBESTIR', this.P.cd);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'bp-ready' || H.phase === 'bp-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'bp-go' && !!H.gd.ps?.[id]?.out; },
    msg(t) { const gd = H.gd; gd.msgs.push({ t, k: gd.t }); if (gd.msgs.length > 3) gd.msgs.shift(); },
    step(dt) {
      const gd = H.gd, go = H.phase === 'bp-go', P = this.P; gd.t += dt;
      gd.R = gd.t < 15 ? this.R0 : Math.max(this.Rmin, this.R0 - (gd.t - 15) * (this.R0 - this.Rmin) / 50); CARX.push = P.push; CARX.pushT = P.pushT;
      const live = [];
      for (const id of gd.ids) {
        const s = gd.ps[id], i = go ? inp(id) : { x: 0, y: 0, b: s.lb }; s.cd -= dt; s.turbo -= dt; s.hit -= dt; s.byT -= dt;
        if (s.out) { s.vy -= 26 * dt; s.y += s.vy * dt; s.x += s.vx * dt; s.z += s.vz * dt; s.spin = (s.spin || 0) + dt * 5; continue; }
        if (go && CARX.dash(s, i, P)) gd.fxDash = { x: s.x, z: s.z };
        CARX.drive(s, i, dt, P); live.push(s);
        for (const b of gd.bumps) { const dx = s.x - b.x, dz = s.z - b.z, d = Math.hypot(dx, dz), m = b.r + this.CR * .85; if (d < m && d > 1e-4) { const nx = dx / d, nz = dz / d; s.x = b.x + nx * m; s.z = b.z + nz * m; const vn = s.vx * nx + s.vz * nz; const out = Math.max(9, -vn * 1.5); s.vx += nx * (out - vn); s.vz += nz * (out - vn); s.hit = .45; b.f = .3; SND.play('impactBell_heavy_000', .3, 1.6, 60); } }
        if (go && Math.hypot(s.x, s.z) > gd.R + .65) {
          s.out = Date.now(); s.vy = 3; gd.order.push(id); SFX.bad(); shakeScreen();
          const k = s.byT > 0 && s.by && gd.ps[s.by] && !gd.ps[s.by].out ? s.by : null; if (k) gd.ps[k].kos++;
          this.msg(k ? `💥 ${esc(pl(k)?.name || '')} tiró a ${esc(pl(id)?.name || '')}` : `🌋 ${esc(pl(id)?.name || '')} se cayó solito`); gd.splash = { x: s.x, z: s.z }; sync(); updateStrip();
        }
      }
      CARX.collide(live, this.CR, P.e, (x, z, rel) => { if (rel > 5) { gd.hits = gd.hits || []; gd.hits.push({ x, z, rel }); SND.play(rel > 13 ? 'impactPunch_heavy_000' : 'impactPunch_medium_000', Math.min(.7, .2 + rel / 30), 1, 50); if (rel > 13) shakeScreen(); } });
      for (const b of gd.bumps) b.f = Math.max(0, b.f - dt);
      const alive = gd.ids.filter(id => !gd.ps[id].out);
      if (go && gd.ids.length > 1 && alive.length <= 1 && !gd.ending) { gd.ending = true; if (alive[0]) { this.msg(`🏆 ¡${esc(pl(alive[0])?.name || '')} es el último en pie!`); confetti(120); } const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.bumper.end(); }, 2600); }
    },
    end() {
      if (H.phase !== 'bp-go') return;
      const gd = H.gd, sc = id => gd.ps[id].out ? gd.order.indexOf(id) : 1000 + gd.ps[id].kos, g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => { const s = gd.ps[id]; return { id, val: `${s.out ? '🌋 Cayó' : '🏆 Quedó en pie'} · 💥 ${s.kos} derribo${s.kos === 1 ? '' : 's'}`, gain: g[id] || 0 }; });
      setPhase('bp-res', 6000, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      if (ph === 'bp-ready') return canvasHTML(true, '💥 ¡Empujen a los demás a la lava! 🌋');
      if (ph === 'bp-go') return canvasHTML(false);
      return `<h1 class="title-pop">💥 Campeones de los Chocones</h1>${resultsList(H.gd.rows)}`;
    },
    build(T) {
      const gd = H.gd, r = arena3D(T, { bg: '#1c0a2e' }), R0 = this.R0, add = o => { r.scene.add(o); return o; };
      r.scene.background = CARX.sky(T, ['#120625', '#4c1d95', '#be185d', '#fb923c']); r.scene.fog = new T.Fog('#5b1d4f', 45, 110);
      r.cam.fov = 46; r.cam.far = 400; r.cam.updateProjectionMatrix(); r.cam.position.set(0, 24, 21); r.cam.lookAt(0, 0, 0);
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.color.set('#ffd8b0'); sun.position.set(-10, 26, 14); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 }); sun.shadow.camera.updateProjectionMatrix(); }
      const hemi = r.scene.children.find(c => c.isHemisphereLight); if (hemi) { hemi.color.set('#ffe4f1'); hemi.groundColor.set('#7c2d12'); hemi.intensity = 1.15; }
      /* lava que brilla y se mueve */
      const lt = CARX.tex(T, 512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ff7a1a'); gr.addColorStop(.5, '#ffb020'); gr.addColorStop(1, '#ff5a1a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        /* costras oscuras con rendijas brillantes entre ellas (se repite sin cortes) */
        const pts = Array.from({ length: 46 }, () => [Math.random() * w, Math.random() * h]);
        for (const [cx, cy] of pts) for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { const x = cx + ox, y = cy + oy; if (x < -90 || x > w + 90 || y < -90 || y > h + 90) continue; const n = 7, rr = 30 + ((cx * 7 + cy * 3) % 22); g.beginPath(); for (let q = 0; q < n; q++) { const a = q / n * 6.28, k = rr * (.75 + ((q * 37 + cx) % 10) / 30); g.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k); } g.closePath(); const cg = g.createRadialGradient(x, y, 2, x, y, rr); cg.addColorStop(0, '#2a0b07'); cg.addColorStop(.7, '#3d1209'); cg.addColorStop(1, '#7a2410'); g.fillStyle = cg; g.fill(); }
      }, [9, 9]);
      const lava = add(new T.Mesh(new T.PlaneGeometry(320, 320), new T.MeshStandardMaterial({ map: lt, emissive: '#ffffff', emissiveMap: lt, emissiveIntensity: .85, roughness: .9 }))); lava.rotation.x = -Math.PI / 2; lava.position.y = -3.2; r.lava = lt;
      const glow = add(new T.PointLight('#ff6a2b', 60, 50, 1.6)); glow.position.set(0, -1.5, 0); r.glow = glow;
      /* la plataforma: pista con dianas, borde de pianito rojo/blanco */
      const top = CARX.tex(T, 1024, 1024, (g, w, h) => { const c = w / 2; g.fillStyle = '#334155'; g.fillRect(0, 0, w, h); for (let k = 0; k < 6000; k++) { const v = 45 + rand(30); g.fillStyle = `rgb(${v},${v + 5},${v + 14})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
        [[.98, '#1e293b'], [.86, '#f97316'], [.82, '#334155'], [.56, '#facc15'], [.52, '#334155'], [.26, '#f97316'], [.2, '#1e293b']].forEach(([f, col]) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, c * f, 0, 7); g.fill(); });
        g.strokeStyle = '#ffffff44'; g.lineWidth = 6; g.setLineDash([28, 22]); g.beginPath(); g.arc(c, c, c * .69, 0, 7); g.stroke(); g.setLineDash([]);
        g.save(); g.translate(c, c); g.rotate(-Math.PI / 2); g.font = '900 120px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fde047'; g.strokeStyle = '#1e1b4b'; g.lineWidth = 14; g.strokeText('CAOS', 0, 0); g.fillText('CAOS', 0, 0); g.restore(); }, [1, 1]);
      top.wrapS = top.wrapT = T.ClampToEdgeWrapping;
      const plat = add(new T.Group()); r.plat = plat;
      const disc = new T.Mesh(new T.CylinderGeometry(R0, R0 * .97, .8, 96), [new T.MeshStandardMaterial({ color: '#475569', roughness: .7 }), new T.MeshStandardMaterial({ map: top, roughness: .75 }), new T.MeshStandardMaterial({ color: '#334155' })]); disc.position.y = -.4; disc.receiveShadow = true; plat.add(disc);
      const rock = new T.Mesh(new T.ConeGeometry(R0 * .97, 7, 18, 3), new T.MeshStandardMaterial({ color: '#3f2a2a', roughness: 1, flatShading: true })); rock.rotation.x = Math.PI; rock.position.y = -4.3; plat.add(rock);
      const kt = CARX.tex(T, 512, 16, (g, w, h) => { for (let k = 0; k < 32; k++) { g.fillStyle = k % 2 ? '#ef4444' : '#f8fafc'; g.fillRect(k * 16, 0, 16, h); } }, [1, 1]);
      const curb = new T.Mesh(new T.TorusGeometry(R0, .3, 10, 128), new T.MeshStandardMaterial({ map: kt, roughness: .5 })); curb.rotation.x = Math.PI / 2; curb.position.y = .02; plat.add(curb); r.curb = curb;
      const warn = new T.Mesh(new T.TorusGeometry(R0 + .25, .1, 8, 128), new T.MeshBasicMaterial({ color: '#ff2d55' })); warn.rotation.x = Math.PI / 2; warn.position.y = .12; plat.add(warn); r.warn = warn;
      /* hongos que rebotan */
      r.bumps = gd.bumps.map(b => { const g = add(new T.Group()); g.position.set(b.x, 0, b.z); const st = new T.Mesh(new T.CylinderGeometry(.45, .55, .7, 20), new T.MeshStandardMaterial({ color: '#f8fafc' })); st.position.y = .35; st.castShadow = true; g.add(st); const cap = new T.Mesh(new T.SphereGeometry(b.r, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: '#ef4444', roughness: .35, emissive: '#ef4444', emissiveIntensity: .05 })); cap.position.y = .6; cap.scale.y = .7; cap.castShadow = true; g.add(cap); for (let q = 0; q < 6; q++) { const d = new T.Mesh(new T.SphereGeometry(.15, 10, 8), new T.MeshStandardMaterial({ color: '#fff' })); const a = q / 6 * 6.28; d.position.set(Math.cos(a) * .55, .95, Math.sin(a) * .55); g.add(d); } g.userData.cap = cap; return g; });
      /* islas con tribunas, faroles y banderas */
      const isl = new T.MeshStandardMaterial({ color: '#44403c', roughness: 1, flatShading: true });
      const put = (n, o, x, z, rot, y = 0) => fitModel(T, Rk(n), o).then(m => { m.position.set(x, y, z); m.rotation.y = rot; add(m); }).catch(() => {});
      for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 + .3, d = 27 + (k % 2) * 4, x = Math.sin(a) * d, z = Math.cos(a) * d; if (z > 14) continue; const m = add(new T.Mesh(new T.CylinderGeometry(6, 4.5, 6, 9), isl)); m.position.set(x, -3, z); put('grandStandRound', { size: 10 }, x, z, Math.atan2(-x, -z), 0); }
      const fireM = new T.MeshBasicMaterial({ color: '#ffb020' }), fireM2 = new T.MeshBasicMaterial({ color: '#fff3b0' }); r.torches = [];
      for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28 + .39, x = Math.sin(a) * (R0 + 3), z = Math.cos(a) * (R0 + 3); const m = add(new T.Mesh(new T.CylinderGeometry(.75, 1.1, 8, 7), isl)); m.position.set(x, -2.6, z); const bowl = add(new T.Mesh(new T.CylinderGeometry(.9, .5, .6, 10), new T.MeshStandardMaterial({ color: '#1f2937', metalness: .6, roughness: .4 }))); bowl.position.set(x, 1.6, z); const f = add(new T.Mesh(new T.ConeGeometry(.6, 1.6, 10), fireM)); f.position.set(x, 2.6, z); const f2 = new T.Mesh(new T.ConeGeometry(.32, .9, 8), fireM2); f2.position.y = -.25; f.add(f2); r.torches.push(f); }
      for (let k = 0; k < 26; k++) { const m = add(new T.Mesh(new T.IcosahedronGeometry(.5 + Math.random() * 1.4, 0), isl)); const a = Math.random() * 6.28, d = 19 + Math.random() * 30; m.position.set(Math.sin(a) * d, -3 + Math.random() * 1.2, Math.cos(a) * d); m.rotation.set(Math.random() * 3, Math.random() * 3, 0); }
      r.cars = {}; gd.ids.forEach((id, k) => { r.cars[id] = CARX.car(T, r, id, k); });
      CARX.sparks(T, r, 60);
      r.cxy = { x: 0, z: 0, h: 24 };
      return r;
    },
    draw(ctx) {
      const G = GAMES.bumper, gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
        r.lava.offset.x = (r.lava.offset.x + dt * .012) % 1; r.lava.offset.y = (r.lava.offset.y + dt * .008) % 1; r.glow.intensity = 55 + Math.sin(tt * 3) * 10;
        const k = gd.R / G.R0; r.plat.scale.set(k, 1, k); r.warn.visible = gd.t > 14 && gd.R > G.Rmin + .05 && Math.floor(tt * 4) % 2 === 0;
        r.torches.forEach((f, q) => { const s2 = 1 + Math.sin(tt * 9 + q * 1.7) * .12; f.scale.set(1 / s2, s2, 1 / s2); }); r.bumps.forEach((m, q) => { const f = gd.bumps[q].f; m.userData.cap.scale.set(1 + f, .7 - f, 1 + f); m.userData.cap.material.emissiveIntensity = .05 + f * 3; });
        if (gd.hits) { gd.hits.forEach(h => CARX.burst(r, h.x, .7, h.z, Math.min(14, 4 + h.rel | 0), Math.min(9, 3 + h.rel * .3))); gd.hits = null; }
        if (gd.splash) { CARX.burst(r, gd.splash.x, -2.6, gd.splash.z, 18, 9, '#fb923c'); gd.splash = null; }
        CARX.tickSparks(r, dt);
        let mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9, n = 0;
        for (const id of gd.ids) {
          const g = r.cars[id], s = gd.ps[id]; if (!g) continue;
          g.position.set(s.x, Math.max(-6, s.y), s.z); g.rotation.set(s.out ? s.spin : 0, s.a, s.out ? s.spin * .6 : 0); g.visible = s.y > -5.5; g.userData.sh.visible = !s.out;
          g.userData.fl.visible = s.turbo > 0; g.userData.fl.scale.set(1, .8 + Math.random() * .6, 1);
          if (!s.out) { mnx = Math.min(mnx, s.x); mxx = Math.max(mxx, s.x); mnz = Math.min(mnz, s.z); mxz = Math.max(mxz, s.z); n++; }
        }
        /* cámara de transmisión: encuadra a todos los que quedan */
        const cx = n ? (mnx + mxx) / 2 * .45 : 0, cz = n ? (mnz + mxz) / 2 * .45 : 0, ext = n ? Math.max(mxx - mnx, (mxz - mnz) * 1.4, 8) : 20, h = Math.max(15, Math.min(27, 10 + ext * .75)), kk = Math.min(1, dt * 1.6);
        r.cxy.x += (cx - r.cxy.x) * kk; r.cxy.z += (cz - r.cxy.z) * kk; r.cxy.h += (h - r.cxy.h) * kk;
        r.cam.position.set(r.cxy.x, r.cxy.h, r.cxy.z + r.cxy.h * .82); r.cam.lookAt(r.cxy.x, 0, r.cxy.z - 1);
        r.renderer.render(r.scene, r.cam);
        const alive = gd.ids.filter(id => !gd.ps[id].out).length, msgs = gd.msgs.filter(m => gd.t - m.k < 3);
        const shrink = gd.t > 13 && gd.t < 15.2 ? '<div class="cxbig cxwarn">⚠️ ¡La plataforma se achica!</div>' : '';
        CARX.overlay(r, `<div class="cxtop"><span class="cxpill" style="--c:#f97316">🌋 Quedan ${alive}</span>${gd.ids.map(id => { const s = gd.ps[id], p = pl(id); return `<span class="cxpill${s.out ? ' off' : ''}" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}${s.kos ? ' 💥' + s.kos : ''}${s.out ? ' ☠️' : s.cd > 0 ? '' : ' 💨'}</span>`; }).join('')}</div>${shrink}<div class="cxmsgs">${msgs.map(m => `<div class="cxmsg">${m.t}</div>`).join('')}</div>`);
        return;
      }
      ctx.fillStyle = '#7f1d1d'; ctx.fillRect(0, 0, 1000, 600); const S = 20; ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(500, 300, gd.R * S, 0, 7); ctx.fill();
      for (const id of gd.ids) { const s = gd.ps[id]; if (s.out) continue; ctx.fillStyle = pl(id)?.color || '#888'; ctx.beginPath(); ctx.arc(500 + s.x * S, 300 + s.z * S, 18, 0, 7); ctx.fill(); }
    }
  }
});
