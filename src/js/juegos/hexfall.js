/* ================== v38 — JUEGO NUEVO: PISO QUE SE CAE (robots sobre hexágonos) ================== */
Object.assign(GAMES, {
  hexfall: {
    name: 'Piso Que Se Cae 3D', emoji: '🕳️', color: '#ec4899', N: 8, S: 1.05, LAYERS: [0, -6, -12], DEAD: -19, FALL: 1.35,
    desc: '¡Robots sobre un piso de hexágonos que se caen! 😱 Cada hexágono que pisás tiembla y a los segundos se cae. Hay TRES pisos: si caés al de abajo seguís jugando. Corré con el joystick (o WASD) y SALTÁ con el botón (ESPACIO). ¡El último robot que quede arriba gana!',
    start() {
      const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id))));
      const tiles = [], N = this.N; this.LAYERS.forEach((y, li) => { for (let q = -N; q <= N; q++) for (let r = Math.max(-N, -q - N); r <= Math.min(N, -q + N); r++) tiles.push({ q, r, li, y, t0: 0, fall: 0, dy: 0 }); });
      const idx = {}; tiles.forEach((t, k) => idx[`${t.li},${t.q},${t.r}`] = k);
      const ps = {}; ids.forEach((id, k) => { const a = k / ids.length * 6.28; ps[id] = { id, x: Math.sin(a) * 6.5, z: Math.cos(a) * 6.5, y: 0, vx: 0, vz: 0, vy: 0, gr: true, lb: 0, out: 0, face: a + Math.PI, jumpT: 0 }; });
      H.inp = {}; H.gd = { ids, tiles, idx, ps, t: 0, order: [], msgs: [], sid: rid(), build3D: T => GAMES.hexfall.build(T) };
      setPhase('hx-ready', 3600, () => { SFX.go(); GAMES.hexfall.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.hexfall.draw);
    },
    go() { setPhase('hx-go', 120000, () => GAMES.hexfall.end()); attachArena(H.gd); rtLoop(dt => GAMES.hexfall.step(dt), GAMES.hexfall.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps?.[p.id]; if (s && s.out) return { screen: 'msg', big: '🕳️', title: '¡Te caíste!', text: 'Mirá la tele y apoyá a los que quedan 😄' };
      if (H.phase === 'hx-ready' || H.phase === 'hx-go') return joyView(p, '🕹️ Corré hacia donde querés (WASD) · Botón = SALTAR (espacio) · ¡no te quedés quieto!', '⬆️ SALTAR', 0);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'hx-ready' || H.phase === 'hx-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'hx-go' && !!H.gd.ps?.[id]?.out; },
    axial(x, z) { const S = this.S; let q = (2 / 3 * x) / S, r = (-1 / 3 * x + Math.sqrt(3) / 3 * z) / S, s = -q - r; let rq = Math.round(q), rr = Math.round(r), rs = Math.round(s); const dq = Math.abs(rq - q), dr = Math.abs(rr - r), ds = Math.abs(rs - s); if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs; return [rq, rr]; },
    pos(t) { const S = this.S; return [S * 1.5 * t.q, S * Math.sqrt(3) * (t.r + t.q / 2)]; },
    solidAt(li, x, z) { const gd = H.gd, [q, r] = this.axial(x, z), k = gd.idx[`${li},${q},${r}`]; if (k == null) return null; const t = gd.tiles[k]; return t.fall ? null : t; },
    step(dt) {
      const gd = H.gd, go = H.phase === 'hx-go'; gd.t += dt;
      for (const t of gd.tiles) { if (t.t0 && !t.fall && gd.t - t.t0 > this.FALL) t.fall = gd.t; if (t.fall) { t.dy -= 18 * dt * Math.min(1, gd.t - t.fall + .2); } }
      const live = [];
      for (const id of gd.ids) {
        const s = gd.ps[id]; if (s.out) continue; live.push(s);
        const i = go ? inp(id) : { x: 0, y: 0, b: s.lb }, mag = Math.min(1, Math.hypot(i.x, i.y)), sp = 4.8;
        const tvx = mag > .15 ? i.x / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, tvz = mag > .15 ? i.y / Math.max(1, Math.hypot(i.x, i.y)) * sp * mag : 0, k = Math.min(1, dt * (s.gr ? 12 : 4));
        s.vx += (tvx - s.vx) * k; s.vz += (tvz - s.vz) * k; if (mag > .15) s.face = Math.atan2(i.x, i.y);
        if (go && i.b !== s.lb) { const pr = i.b > s.lb || i.b === 1; s.lb = i.b; if (pr && s.gr) { s.vy = 8.2; s.gr = false; s.jumpT = gd.t; SND.play('ui_pluck_002', .35, 1.2, 0); } }
        s.x += s.vx * dt; s.z += s.vz * dt; const py = s.y; s.vy -= 24 * dt; s.y += s.vy * dt; s.gr = false;
        for (let li = 0; li < this.LAYERS.length; li++) { const ly = this.LAYERS[li]; if (py >= ly - .05 && s.y <= ly + .02) { const t = this.solidAt(li, s.x, s.z); if (t) { s.y = ly; s.vy = 0; s.gr = true; if (go && !t.t0) t.t0 = gd.t; s.li = li; break; } } }
        if (go && s.y < this.DEAD) { s.out = Date.now(); gd.order.push(id); SFX.bad(); gd.msgs.push({ t: `🕳️ ${esc(pl(id)?.name || '')} se cayó al vacío`, k: gd.t }); sync(); updateStrip(); }
      }
      for (let a = 0; a < live.length; a++) for (let b = a + 1; b < live.length; b++) { const A = live[a], B = live[b]; if (Math.abs(A.y - B.y) > 1.2) continue; const dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); if (d > 0 && d < .9) { const o = (.9 - d) / 2; A.x -= dx / d * o; A.z -= dz / d * o; B.x += dx / d * o; B.z += dz / d * o; } }
      const alive = gd.ids.filter(id => !gd.ps[id].out);
      if (go && gd.ids.length > 1 && alive.length <= 1 && !gd.ending) { gd.ending = true; if (alive[0]) { gd.msgs.push({ t: `🏆 ¡${esc(pl(alive[0])?.name || '')} sobrevivió!`, k: gd.t }); confetti(120); } const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.hexfall.end(); }, 2400); }
    },
    end() {
      if (H.phase !== 'hx-go') return;
      const gd = H.gd, sc = id => gd.ps[id].out ? gd.order.indexOf(id) : 1000 - (gd.ps[id].li || 0), g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => { const s = gd.ps[id]; return { id, val: s.out ? `🕳️ Se cayó (${(gd.order.indexOf(id) + 1)}º en caer)` : `🏆 Sobrevivió en el piso ${(s.li || 0) + 1}`, gain: g[id] || 0 }; });
      setPhase('hx-res', 6000, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      if (ph === 'hx-ready') return canvasHTML(true, '😱 ¡No te quedés quieto: el piso se cae!');
      if (ph === 'hx-go') return canvasHTML(false);
      return `<h1 class="title-pop">🕳️ Los que no se cayeron</h1>${resultsList(H.gd.rows)}`;
    },
    build(T) {
      const gd = H.gd, r = arena3D(T, { bg: '#fbcfe8' }), add = o => { r.scene.add(o); return o; };
      r.scene.background = CARX.sky(T, ['#60a5fa', '#c4b5fd', '#fbcfe8', '#fde68a']); r.scene.fog = new T.Fog('#f5d0fe', 40, 95);
      r.cam.fov = 45; r.cam.far = 300; r.cam.updateProjectionMatrix();
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-8, 26, 12); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: .5, far: 70 }); sun.shadow.camera.updateProjectionMatrix(); }
      const hemi = r.scene.children.find(c => c.isHemisphereLight); if (hemi) { hemi.color.set('#fff1f2'); hemi.groundColor.set('#7c3aed'); hemi.intensity = 1.3; }
      /* hexágonos (uno por instancia, con su color) */
      const geo = new T.CylinderGeometry(this.S * .93, this.S * .93, .45, 6); geo.rotateY(Math.PI / 6); geo.translate(0, -.225, 0);
      const mat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .45, metalness: .05 });
      const cnt = this.LAYERS.map(() => 0); gd.tiles.forEach(t => { t.j = cnt[t.li]++; }); r.ims = this.LAYERS.map((y, li) => { const g2 = geo.clone(), aA = new T.InstancedBufferAttribute(new Float32Array(cnt[li]).fill(1), 1); aA.setUsage(T.DynamicDrawUsage); g2.setAttribute('aA', aA); const mt = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .45, metalness: .05, transparent: true, opacity: 1 }); mt.onBeforeCompile = sh => { sh.vertexShader = 'attribute float aA;\nvarying float vA;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvA = aA;'); sh.fragmentShader = 'varying float vA;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.a *= vA;'); }; const m = new T.InstancedMesh(g2, mt, cnt[li]); m.aA = aA; m.castShadow = true; m.receiveShadow = true; add(m); return m; }); r.op = this.LAYERS.map(() => 1);
      const PAL = [['#f472b6', '#f9a8d4', '#ec4899'], ['#60a5fa', '#93c5fd', '#3b82f6'], ['#fbbf24', '#fde68a', '#f59e0b']]; r.base = gd.tiles.map((t, k) => { const p = PAL[t.li]; return new T.Color(p[(Math.abs(t.q * 3 + t.r * 5)) % 3]); });
      const tmp = new T.Object3D(); r.tmp = tmp; r.col = new T.Color(); r.warnC = new T.Color('#ef4444'); r.whiteC = new T.Color('#ffffff');
      gd.tiles.forEach((t, k) => { const [x, z] = this.pos(t); tmp.position.set(x, t.y, z); tmp.rotation.set(0, 0, 0); tmp.updateMatrix(); r.ims[t.li].setMatrixAt(t.j, tmp.matrix); r.ims[t.li].setColorAt(t.j, r.base[k]); });
      /* bordes dorados de cada piso */
      r.rings = []; this.LAYERS.forEach(y => { const ring = add(new T.Mesh(new T.TorusGeometry(this.S * 1.5 * this.N + 1.3, .14, 8, 6), new T.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: .4 }))); ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI / 6; ring.position.y = y - .2; r.rings.push(ring); });
      /* abajo: mar de gelatina rosa */
      const sl = CARX.tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#db2777'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { const x = Math.random() * w, y = Math.random() * h, rr = 6 + Math.random() * 22, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, '#fbcfe8cc'); gr.addColorStop(1, '#fbcfe800'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }, [12, 12]);
      const sea = add(new T.Mesh(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({ map: sl, emissive: '#be185d', emissiveIntensity: .35, roughness: .3 }))); sea.rotation.x = -Math.PI / 2; sea.position.y = this.DEAD - 3; r.sea = sl;
      /* nubes y islitas flotando */
      const cm = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }); for (let k = 0; k < 14; k++) { const g = add(new T.Group()), a = Math.PI * (.5 + k / 13), d = 30 + Math.random() * 16; g.position.set(Math.sin(a) * d * 1.2, -12 + Math.random() * 12, Math.cos(a) * d - 4); for (let q = 0; q < 4; q++) { const b = new T.Mesh(new T.SphereGeometry(1.4 + Math.random() * 1.2, 12, 10), cm); b.position.set(q * 1.6 - 2.4, Math.random() * .6, Math.random() - .5); g.add(b); } }
      r.bots = {};
      gd.ids.forEach(id => C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.65), tintFor(g, id)); a.play('Idle'); const hold = new T.Group(); hold.add(a.obj); add(hold); const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, pl(id)?.color || '#fff'); lb.position.y = 2.45; lb.scale.set(2.8, .7, 1); lb.material.depthTest = false; lb.renderOrder = 10; hold.add(lb); const sh = new T.Mesh(new T.CircleGeometry(.5, 20), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3, depthWrite: false })); sh.rotation.x = -Math.PI / 2; add(sh); a.hold = hold; a.sh = sh; r.bots[id] = a; }).catch(() => {}));
      r.cy = 0; r.cx = 0; r.cz = 0; r.cd = 17;
      return r;
    },
    draw(ctx) {
      const G = GAMES.hexfall, gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
        r.sea.offset.x = (r.sea.offset.x + dt * .01) % 1;
        const dirty = G.LAYERS.map(() => false);
        gd.tiles.forEach((t, k) => {
          if (!t.t0 && !t.fall) return; if (t.dy < -30) return; dirty[t.li] = true;
          const [x, z] = G.pos(t), shake = t.t0 && !t.fall ? Math.min(1, (gd.t - t.t0) / G.FALL) : 0;
          r.tmp.position.set(x + (shake > .4 ? (Math.random() - .5) * .12 * shake : 0), t.y + t.dy, z + (shake > .4 ? (Math.random() - .5) * .12 * shake : 0)); r.tmp.rotation.set(t.fall ? (gd.t - t.fall) * 1.5 : 0, 0, t.fall ? (gd.t - t.fall) : 0); r.tmp.updateMatrix(); r.ims[t.li].setMatrixAt(t.j, r.tmp.matrix);
          r.col.copy(r.base[k]).lerp(shake > .5 ? r.warnC : r.whiteC, t.fall ? .6 : shake * .75); r.ims[t.li].setColorAt(t.j, r.col);
        });
        r.ims.forEach((m, li) => { if (!dirty[li]) return; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
        let ax = 0, az = 0, ay = 0, n = 0, mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
        for (const id of gd.ids) {
          const a = r.bots[id], s = gd.ps[id]; if (!a) continue; a._v = a.hold.visible = !s.out || s.y > G.DEAD - 2; a.hold.position.set(s.x, s.y, s.z); a.obj.rotation.y = s.face;
          const sp = Math.hypot(s.vx, s.vz); a.play(!s.gr ? 'Jump' : sp > 1 ? 'Running' : 'Idle'); a.mixer.timeScale = s.gr && sp > 1 ? Math.max(.7, sp / 5) : 1; a.mixer.update(dt);
          let gy = null; for (let li = 0; li < G.LAYERS.length; li++) if (G.LAYERS[li] <= s.y + .05 && G.solidAt(li, s.x, s.z)) { gy = G.LAYERS[li]; break; }
          a.sh.visible = gy != null && !s.out; if (gy != null) { a.sh.position.set(s.x, gy + .02, s.z); a.sh.scale.setScalar(Math.max(.4, 1 - (s.y - gy) / 6)); }
          if (!s.out) { ax += s.x; az += s.z; ay += Math.max(G.LAYERS[G.LAYERS.length - 1], s.y); n++; mnx = Math.min(mnx, s.x); mxx = Math.max(mxx, s.x); mnz = Math.min(mnz, s.z); mxz = Math.max(mxz, s.z); }
        }
        /* cámara principal: el piso donde hay más robots. Los pisos de arriba se esconden en esa vista,
           y cada otro piso con robots vivos sale en su propia ventanita (así nadie se pierde) */
        const cntL = G.LAYERS.map(() => 0); for (const id of gd.ids) { const s = gd.ps[id]; if (!s.out) cntL[s.li || 0]++; }
        let mL = cntL.findIndex(c => c > 0); if (mL < 0) mL = r.mL ?? 0; r.mL = mL;
        const kk = Math.min(1, dt * 1.4); r.cy += (G.LAYERS[mL] - r.cy) * kk;
        const vis = L => { r.ims.forEach((m, li) => m.visible = li >= L); r.rings.forEach((m, li) => m.visible = li >= L); for (const id of gd.ids) { const a = r.bots[id]; if (a) a.hold.visible = !!(a._v && ((gd.ps[id].li || 0) === L || gd.ps[id].out)); } };
        const R0 = r.renderer, sz = R0.getSize(r.v2 || (r.v2 = new r.T.Vector2())), W = sz.x, Hh = sz.y;
        const hasP = cntL.some((c, li) => li !== mL && c > 0); r.cxo = (r.cxo || 0) + ((hasP ? 5.5 : 0) - (r.cxo || 0)) * kk; vis(mL); r.cam.position.set(r.cxo, r.cy + 24, 20.5); r.cam.lookAt(r.cxo, r.cy - 1.2, 1.2); R0.setViewport(0, 0, W, Hh); R0.render(r.scene, r.cam);
        const others = cntL.map((c, li) => li).filter(li => li !== mL && cntL[li] > 0); let pip = '';
        if (others.length) {
          const cam2 = r.cam2 || (r.cam2 = new r.T.PerspectiveCamera(48, 1, .5, 200)), pw = Math.round(W * .36), ph = Math.round(Hh * .4), M = 10, TOP = Math.round(Hh * .13);
          cam2.aspect = pw / ph; cam2.updateProjectionMatrix(); R0.setScissorTest(true);
          others.forEach((L, k) => {
            let ax = 0, az = 0, n2 = 0, x0b = 1e9, x1b = -1e9, z0b = 1e9, z1b = -1e9; const nm = []; for (const id of gd.ids) { const s = gd.ps[id]; if (!s.out && (s.li || 0) === L) { ax += s.x; az += s.z; n2++; x0b = Math.min(x0b, s.x); x1b = Math.max(x1b, s.x); z0b = Math.min(z0b, s.z); z1b = Math.max(z1b, s.z); nm.push(esc(pl(id)?.name || '')); } } ax = (x0b + x1b) / 2; az = (z0b + z1b) / 2;
            const pk = r.pk || (r.pk = {}), P = pk[L] || (pk[L] = { x: ax, z: az }); const span = Math.max(x1b - x0b, (z1b - z0b) * 1.3); P.d = (P.d || 9) + (Math.max(8, Math.min(16, 6.5 + span * .6)) - (P.d || 9)) * kk; P.x += (ax - P.x) * kk; P.z += (az - P.z) * kk; const y = G.LAYERS[L];
            cam2.position.set(P.x, y + P.d * 1.05, P.z + P.d * .9); cam2.lookAt(P.x, y, P.z + .3); vis(L);
            const x0 = W - pw - M, y0 = Math.max(M, Hh - TOP - ph - k * (ph + M)); R0.setScissor(x0, y0, pw, ph); R0.setViewport(x0, y0, pw, ph); R0.render(r.scene, cam2);
            pip += `<div class="hxpip" style="right:${(M / W * 100).toFixed(2)}%;bottom:${(y0 / Hh * 100).toFixed(2)}%;width:${(pw / W * 100).toFixed(2)}%;height:${(ph / Hh * 100).toFixed(2)}%;--c:${['#ec4899', '#3b82f6', '#f59e0b'][L]}"><span>${['🩷', '💙', '💛'][L]} Piso ${L + 1} · ${nm.join(', ')}</span></div>`;
          });
          R0.setScissorTest(false); R0.setViewport(0, 0, W, Hh);
        }
        r.pip = pip;
        const alive = gd.ids.filter(id => !gd.ps[id].out).length, msgs = gd.msgs.filter(m => gd.t - m.k < 3).slice(-3);
        CARX.overlay(r, `<div class="cxtop"><span class="cxpill" style="--c:#ec4899">🕳️ Quedan ${alive}</span>${gd.ids.map(id => { const s = gd.ps[id], p = pl(id); return `<span class="cxpill${s.out ? ' off' : ''}" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}${s.out ? ' 🕳️' : (s.li ? ' ⬇️' : '')}</span>`; }).join('')}</div>${H.phase === 'hx-go' && gd.t < 2 ? '<div class="cxbig" style="top:82%;font-size:1.7em">🏃 ¡Muévanse! Lo que pisan se cae</div>' : ''}${r.pip || ''}<div class="cxmsgs">${msgs.map(m => `<div class="cxmsg">${m.t}</div>`).join('')}</div>`);
        return;
      }
      ctx.fillStyle = '#fbcfe8'; ctx.fillRect(0, 0, 1000, 600); const S = 22;
      for (const t of gd.tiles) { if (t.fall || t.li) continue; const [x, z] = G.pos(t); ctx.fillStyle = t.t0 ? '#ef4444' : '#f472b6'; ctx.beginPath(); ctx.arc(500 + x * S, 300 + z * S, S * .9, 0, 7); ctx.fill(); }
      for (const id of gd.ids) { const s = gd.ps[id]; if (s.out) continue; emo(ctx, pl(id)?.emoji || '?', 500 + s.x * S, 300 + s.z * S, 26); }
    }
  }
});
