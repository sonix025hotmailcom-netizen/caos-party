Object.assign(GAMES, {
  /* =================================================================== */
  /* ⛳ MINI GOLF 3D                                                       */
  /* =================================================================== */
  golf: {
    name: 'Mini Golf 3D', emoji: '⛳', color: '#16a34a', HOLES: 3, R: .14,
    desc: '¡Todos juegan al mismo tiempo, cada uno con su cámara! ⛳ ◀ ▶ (A/D) apuntan, ▲ ▼ (W/S) suben o bajan la fuerza, botón (ESPACIO) le pega. Los puntitos muestran por dónde va a salir. Ojo: molinos que giran, bloques que se mueven, cintas que empujan, arena que frena y agua (+1 golpe). Menos golpes = mejor.',
    /* hoyos: poly = borde de afuera · segs = paredes de adentro · obs = obstáculos (circ, box, spin = barra giratoria, mv = se mueve) · zones = water / sand / belt */
    LAYOUTS: [
      { name: 'El Molino', par: 3, poly: [[-11, -2.6], [11, -2.6], [11, 2.6], [-11, 2.6]], tee: [-9.5, 0], cup: [9.5, 0], segs: [],
        obs: [{ k: 'spin', x: -1, z: 0, len: 2.35, sp: 1.4 }, { k: 'circ', x: 5, z: -1.3, r: .38, bump: 1 }, { k: 'circ', x: 5, z: 1.3, r: .38, bump: 1 }, { k: 'circ', x: 7.1, z: 0, r: .38, bump: 1 }],
        zones: [{ k: 'sand', x0: 7.8, z0: -2.6, x1: 11, z1: -1.1 }, { k: 'sand', x0: 7.8, z0: 1.1, x1: 11, z1: 2.6 }], deco: [['windmill', -1, -5.2, 3.6], ['castle', 7, 5, 3]] },
      { name: 'La Serpiente', par: 4, poly: [[-11, -6], [11, -6], [11, 6], [-11, 6]], tee: [-8, -3.5], cup: [8, 3.5], segs: [[-3.7, -6, -3.7, 2.4], [3.7, -2.4, 3.7, 6]],
        obs: [{ k: 'circ', x: 0, z: -4.2, r: .42, bump: 1 }, { k: 'box', x: -7.5, z: 2.2, w: 1.6, d: .5 }],
        zones: [{ k: 'belt', x0: -2.6, z0: -1.4, x1: 2.6, z1: 1.4, fx: 0, fz: 4.2 }, { k: 'sand', x0: 6, z0: -6, x1: 11, z1: -3.6 }], deco: [['castle', 0, -8.5, 3]] },
      { name: 'La Laguna', par: 3, poly: [[-11, -5.5], [11, -5.5], [11, 5.5], [-11, 5.5]], tee: [-9, 3.5], cup: [9, -3.2], segs: [],
        obs: [{ k: 'circ', x: 7, z: 1.2, r: .42, bump: 1 }, { k: 'box', x: 6.2, z: -3.6, w: .5, d: 1.5, mv: { ax: 0, az: 1.4, sp: 1.2 } }],
        zones: [{ k: 'water', x: -1.5, z: .3, r: 2.7 }, { k: 'water', x0: 3, z0: -5.5, x1: 4.6, z1: 1.4 }, { k: 'sand', x: 7.6, z: -1.2, r: 1 }], deco: [['windmill', -9, -8, 3.2]] },
      { name: 'Las Cintas', par: 3, poly: [[-11, -4], [11, -4], [11, 4], [-11, 4]], tee: [-9.5, 0], cup: [9.5, 0], segs: [],
        obs: [{ k: 'box', x: 8, z: -2.2, w: .6, d: 2.8 }, { k: 'box', x: 8, z: 2.2, w: .6, d: 2.8 }],
        zones: [{ k: 'belt', x0: -5, z0: -4, x1: -3, z1: 4, fx: 0, fz: 5 }, { k: 'belt', x0: -.5, z0: -4, x1: 1.5, z1: 4, fx: 0, fz: -5 }, { k: 'belt', x0: 4, z0: -4, x1: 6, z1: 4, fx: 0, fz: 5 }], deco: [['castle', 0, -7, 3]] },
      { name: 'La Esquina', par: 3, poly: [[-11, -6], [11, -6], [11, 6], [5, 6], [5, -1], [-11, -1]], tee: [-9, -3.5], cup: [8, 4.6], segs: [],
        obs: [{ k: 'box', x: 8, z: 1.6, w: 1.4, d: .5, mv: { ax: 1.9, az: 0, sp: 1.3 } }, { k: 'circ', x: -1, z: -3.5, r: .42, bump: 1 }, { k: 'spin', x: 3, z: -3.5, len: 2.2, sp: -1.2 }],
        zones: [{ k: 'water', x: 8.6, z: -3.9, r: 1.1 }], deco: [['castle', -2, 2.8, 3.2], ['windmill', 3, -8.5, 3]] },
      { name: 'El Pinball', par: 3, poly: [[-8, -6], [8, -6], [8, 6], [-8, 6]], tee: [0, 4.8], cup: [0, -4.9], segs: [[-2.6, -3.3, -1, -4.3], [2.6, -3.3, 1, -4.3]],
        obs: [[0, 1.5], [-1.7, -.2], [1.7, -.2], [-3.4, -1.9], [0, -1.9], [3.4, -1.9]].map(([x, z]) => ({ k: 'circ', x, z, r: .42, bump: 1 })),
        zones: [{ k: 'sand', x0: -8, z0: -6, x1: -5, z1: -3 }, { k: 'sand', x0: 5, z0: -6, x1: 8, z1: -3 }], deco: [['castle', -11, -3, 3], ['windmill', 11, -2, 3]] },
      { name: 'El Túnel', par: 3, poly: [[-11, -4], [11, -4], [11, 4], [-11, 4]], tee: [-9.5, 0], cup: [9, 0], segs: [[0, -4, 0, -.65], [0, .65, 0, 4]],
        obs: [{ k: 'box', x: -2.2, z: 0, w: .5, d: 1.4, mv: { ax: 0, az: 2.3, sp: 1.6 } }],
        zones: [{ k: 'water', x0: 4, z0: -4, x1: 6, z1: -1.4 }, { k: 'water', x0: 4, z0: 1.4, x1: 6, z1: 4 }], deco: [['castle', -6, -7, 3]], tunnel: [0, 0] },
    ],
    start() {
      const ids = onlineIds(); ['windmill', 'castle', 'flag-large-red', 'tunnel-wide'].forEach(n => C3D.load(Gk(n)).catch(() => {})); ['treeLarge', 'treeSmall'].forEach(n => C3D.load(Rk(n)).catch(() => {}));
      H.gd = { ids, hole: 0, total: Object.fromEntries(ids.map(i => [i, 0])), per: Object.fromEntries(ids.map(i => [i, []])), pars: [], order: shuffle(this.LAYOUTS.map((_, i) => i)), sid: rid() };
      this.newHole();
    },
    /* copia el hoyo dado vuelta al azar (más variedad) */
    mkLayout(src) {
      const fx = Math.random() < .5 ? -1 : 1, fz = Math.random() < .5 ? -1 : 1, P = ([x, z]) => [x * fx, z * fz];
      const L = { name: src.name, par: src.par, poly: src.poly.map(P), tee: P(src.tee), cup: P(src.cup), segs: src.segs.map(([a, b, c, d]) => [a * fx, b * fz, c * fx, d * fz]), deco: src.deco.map(([n, x, z, s]) => [n, x * fx, z * fz, s]), tunnel: src.tunnel && P(src.tunnel) };
      if (fx * fz < 0) L.poly.reverse();
      L.obs = src.obs.map(o => ({ ...o, x: o.x * fx, z: o.z * fz, sp: o.sp ? o.sp * fx * fz : o.sp, mv: o.mv ? { ...o.mv, ax: o.mv.ax * fx, az: o.mv.az * fz } : null }));
      L.zones = src.zones.map(z => z.r ? { ...z, x: z.x * fx, z: z.z * fz } : { ...z, x0: Math.min(z.x0 * fx, z.x1 * fx), x1: Math.max(z.x0 * fx, z.x1 * fx), z0: Math.min(z.z0 * fz, z.z1 * fz), z1: Math.max(z.z0 * fz, z.z1 * fz), fx: (z.fx || 0) * fx, fz: (z.fz || 0) * fz });
      L.walls = L.poly.map((p, i) => [p[0], p[1], L.poly[(i + 1) % L.poly.length][0], L.poly[(i + 1) % L.poly.length][1]]).concat(L.segs);
      return L;
    },
    newHole() {
      const gd = H.gd; gd.hole++; const L = this.mkLayout(this.LAYOUTS[gd.order[(gd.hole - 1) % this.LAYOUTS.length]]);
      gd.L = L; gd.pars.push(L.par);
      const aim = Math.atan2(L.cup[0] - L.tee[0], L.cup[1] - L.tee[1]);
      gd.b = {}; gd.ids.forEach((id, i) => { const off = (i - (gd.ids.length - 1) / 2) * .38; gd.b[id] = { x: L.tee[0] + Math.cos(aim) * off, z: L.tee[1] - Math.sin(aim) * off, sx: 0, sz: 0, vx: 0, vz: 0, a: aim, pw: .5, strokes: 0, in: false, lb: 0, msg: '', msgT: 0, camA: aim }; });
      gd.t = 0; try { if (gd.r3) { gd.r3.renderer.dispose(); gd.r3.renderer.forceContextLoss && gd.r3.renderer.forceContextLoss(); } } catch (e) {} gd.r3 = null; gd.r3loading = null; gd.build3D = T => GAMES.golf.build(T);
      H.inp = {};
      setPhase('gf-ready', 3500, () => { SFX.go(); setPhase('gf-go', 70000, () => GAMES.golf.endHole()); attachArena(H.gd); rtLoop(dt => GAMES.golf.step(dt), GAMES.golf.draw); }, 0, false);
      attachArena(gd); rtLoop(null, GAMES.golf.draw);
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const b = H.gd.b?.[p.id];
      if (b && b.in) return { screen: 'msg', big: '⛳', title: `¡Embocaste en ${b.strokes} golpe${b.strokes > 1 ? 's' : ''}!`, text: 'Esperá a los demás 😎' };
      if (H.phase === 'gf-ready' || H.phase === 'gf-go') return joyView(p, '◀ ▶ apuntar (A/D) · ▲ ▼ fuerza (W/S) · Botón = GOLPE (espacio)', '🏌️ GOLPE', 0);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'gf-ready' || H.phase === 'gf-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'gf-go' && !!H.gd.b?.[id]?.in; },
    power(b) { return b.pw ?? .5; },
    inside(x, z, L) { const P = (L || H.gd.L).poly; let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > z) !== (P[j][1] > z)) && (x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; },
    inZone(z, x, y) { return z.r ? (x - z.x) ** 2 + (y - z.z) ** 2 < z.r * z.r : x > z.x0 && x < z.x1 && y > z.z0 && y < z.z1; },
    obsAt(o, t) { return o.mv ? [o.x + o.mv.ax * Math.sin(t * o.mv.sp), o.z + o.mv.az * Math.sin(t * o.mv.sp)] : [o.x, o.z]; },
    /* física de un pasito (la usan el juego, los bots y la línea de puntitos) */
    phys(b, h, t, L, fx) {
      const R = this.R, px = b.x, pz = b.z; let fr = 1;
      for (const z of L.zones) if (this.inZone(z, b.x, b.z)) { if (z.k === 'water') return 'water'; if (z.k === 'sand') fr = 3.4; if (z.k === 'belt') { b.vx += z.fx * h; b.vz += z.fz * h; } }
      b.x += b.vx * h; b.z += b.vz * h;
      const hitSeg = (ax, az, cx, cz, th, rest, vx0, vz0) => { const ex = cx - ax, ez = cz - az, l2 = ex * ex + ez * ez || 1, k = Math.max(0, Math.min(1, ((b.x - ax) * ex + (b.z - az) * ez) / l2)), qx = ax + ex * k, qz = az + ez * k, dx = b.x - qx, dz = b.z - qz, d = Math.hypot(dx, dz); if (d >= R + th) return false; const nx = d ? dx / d : 0, nz = d ? dz / d : 1; b.x = qx + nx * (R + th); b.z = qz + nz * (R + th); const rvx = b.vx - (vx0 || 0), rvz = b.vz - (vz0 || 0), vn = rvx * nx + rvz * nz; if (vn < 0) { b.vx -= rest * vn * nx; b.vz -= rest * vn * nz; } return Math.abs(vn) > .8; };
      let hit = 0;
      for (const w of L.walls) if (hitSeg(w[0], w[1], w[2], w[3], .08, 1.72)) hit = 1;
      for (const o of L.obs) {
        if (o.k === 'spin') { const a = t * o.sp; for (const q of [0, Math.PI / 2]) { const c = Math.cos(a + q) * o.len, s = Math.sin(a + q) * o.len; const mx = (b.x - o.x), mz = (b.z - o.z); if (hitSeg(o.x - c, o.z - s, o.x + c, o.z + s, .1, 1.6, -o.sp * mz, o.sp * mx)) hit = 2; } continue; }
        const [ox, oz] = this.obsAt(o, t), vx0 = o.mv ? o.mv.ax * o.mv.sp * Math.cos(t * o.mv.sp) : 0, vz0 = o.mv ? o.mv.az * o.mv.sp * Math.cos(t * o.mv.sp) : 0;
        if (o.k === 'circ') { const dx = b.x - ox, dz = b.z - oz, d = Math.hypot(dx, dz); if (d < R + o.r) { const nx = dx / (d || 1), nz = dz / (d || 1); b.x = ox + nx * (R + o.r); b.z = oz + nz * (R + o.r); const vn = b.vx * nx + b.vz * nz; if (vn < 0) { b.vx -= (o.bump ? 2.05 : 1.75) * vn * nx; b.vz -= (o.bump ? 2.05 : 1.75) * vn * nz; if (o.bump) { const sp = Math.hypot(b.vx, b.vz); if (sp < 5.5) { b.vx += nx * 1.6; b.vz += nz * 1.6; } } hit = o.bump ? 3 : 1; if (fx) o.flash = .25; } } }
        else { const cx = Math.max(ox - o.w / 2, Math.min(ox + o.w / 2, b.x)), cz = Math.max(oz - o.d / 2, Math.min(oz + o.d / 2, b.z)), dx = b.x - cx, dz = b.z - cz, d = Math.hypot(dx, dz);
          if (d < R) { let nx, nz; if (d > 1e-6) { nx = dx / d; nz = dz / d; } else { const ex = (o.w / 2) - Math.abs(b.x - ox), ez = (o.d / 2) - Math.abs(b.z - oz); if (ex < ez) { nx = Math.sign(b.x - ox) || 1; nz = 0; } else { nx = 0; nz = Math.sign(b.z - oz) || 1; } }
            if (d > 1e-6) { b.x = cx + nx * R; b.z = cz + nz * R; } else { if (nx) b.x = ox + nx * (o.w / 2 + R); else b.z = oz + nz * (o.d / 2 + R); }
            const rvx = b.vx - vx0, rvz = b.vz - vz0, vn = rvx * nx + rvz * nz; if (vn < 0) { b.vx -= 1.72 * vn * nx; b.vz -= 1.72 * vn * nz; } hit = 1; } }
      }
      if (!this.inside(b.x, b.z, L)) { b.x = px; b.z = pz; b.vx *= -.5; b.vz *= -.5; }
      const dc = Math.hypot(b.x - L.cup[0], b.z - L.cup[1]), sp = Math.hypot(b.vx, b.vz);
      if (dc < .23 && sp < 5.2) return 'in';
      if (dc < .55 && sp < 6.5) { b.vx += (L.cup[0] - b.x) * 2.6 * h; b.vz += (L.cup[1] - b.z) * 2.6 * h; }
      if (sp > 0) { const ns = Math.max(0, sp - (.55 + sp * .7) * fr * h); b.vx *= ns / sp; b.vz *= ns / sp; }
      return hit ? 'hit' + hit : null;
    },
    still(b) { return Math.hypot(b.vx, b.vz) < .05; },
    shoot(b, a, pw) { b.sx = b.x; b.sz = b.z; b.vx = Math.sin(a) * pw * 13.5; b.vz = Math.cos(a) * pw * 13.5; b.strokes++; },
    step(dt) {
      const gd = H.gd, L = gd.L; gd.t += dt; const go = H.phase === 'gf-go';
      for (const o of L.obs) if (o.flash) o.flash = Math.max(0, o.flash - dt);
      for (const id of gd.ids) {
        const b = gd.b[id], i = inp(id); b.msgT -= dt; if (b.in) continue;
        const still = this.still(b);
        if (still) { b.vx = b.vz = 0; const ax = Math.abs(i.x) > .1 ? i.x : 0, ay = Math.abs(i.y) > .1 ? i.y : 0;
          b.a -= Math.sign(ax) * Math.pow(Math.abs(ax), 1.6) * 1.6 * dt; b.pw = Math.max(.06, Math.min(1, b.pw - ay * .7 * dt)); }
        if (i.b !== b.lb) { b.lb = i.b; if (still && go && b.strokes < 8) { this.shoot(b, b.a, b.pw); SND.play('impactPlate_light_000', .6, 1.4, 0); sync(); } }
        const steps = 6, h = dt / steps;
        for (let k = 0; k < steps; k++) {
          const ev = this.phys(b, h, gd.t, L, true);
          if (ev === 'in') { b.in = true; b.x = L.cup[0]; b.z = L.cup[1]; b.vx = b.vz = 0; SND.play('ui_confirmation_001', .6); b.msg = b.strokes === 1 ? '🏆 ¡HOYO EN UNO!' : b.strokes < L.par ? '🐦 ¡Birdie!' : b.strokes === L.par ? '👌 ¡Par!' : `⛳ Adentro en ${b.strokes}`; b.msgT = 99; if (b.strokes === 1) { confetti(120); toastHost(`🏆 ¡HOYO EN UNO de ${pl(id)?.name || ''}!`); } sync(); updateStrip(); break; }
          if (ev === 'water') { SND.play('impactGlass_light_000', .5, .6); const wx = b.x, wz = b.z; b.x = b.sx; b.z = b.sz; b.vx = b.vz = 0; b.strokes++; b.msg = '💦 ¡Al agua! +1 golpe'; b.msgT = 2; b.splash = { wx, wz, t: 0 }; sync(); break; }
          if (ev === 'hit3') SND.play('impactBell_heavy_000', .25, 1.8, 80); else if (ev) SND.play('impactWood_medium_000', .22, 1.6, 70);
        }
      }
      if (go && gd.ids.every(id => gd.b[id].in || !pl(id)?.online || (gd.b[id].strokes >= 8 && this.still(gd.b[id])))) { if (!gd.endT) { gd.endT = 1; const tok = H.token; setTimeout(() => { if (tok === H.token && H.phase === 'gf-go') this.endHole(); }, 1500); } }
    },
    /* el bot prueba muchos tiros con la misma física y elige el mejor */
    plan(b, L, t, skill) {
      let best = null; const cup = L.cup, direct = Math.atan2(cup[0] - b.x, cup[1] - b.z);
      for (let k = 0; k < 70; k++) {
        const a = k < 30 ? direct + (Math.random() - .5) * .9 : Math.random() * Math.PI * 2, pw = .12 + Math.random() * .88, s = { x: b.x, z: b.z, vx: Math.sin(a) * pw * 13.5, vz: Math.cos(a) * pw * 13.5 };
        let ev = null, tt = t; for (let n = 0; n < 700 && Math.hypot(s.vx, s.vz) > .05; n++) { ev = this.phys(s, 1 / 120, tt, L); tt += 1 / 120; if (ev === 'in' || ev === 'water') break; }
        const sc = ev === 'in' ? -10 : ev === 'water' ? 60 : Math.hypot(s.x - cup[0], s.z - cup[1]) + (L.zones.some(z => z.k !== 'sand' && this.inZone(z, s.x, s.z)) ? 4 : 0);
        if (!best || sc < best.sc) best = { a, pw, sc };
      }
      best.a += (Math.random() - .5) * (1 - skill) * .25; best.pw = Math.max(.06, Math.min(1, best.pw + (Math.random() - .5) * (1 - skill) * .2));
      return best;
    },
    /* puntitos: por dónde sale el tiro (solo el primer tramo, para que no sea tan fácil) */
    preview(b, L, t) { const s = { x: b.x, z: b.z, vx: Math.sin(b.a) * b.pw * 13.5, vz: Math.cos(b.a) * b.pw * 13.5 }, out = []; let dist = 0, lx = s.x, lz = s.z, bounces = 0; const max = 1.6 + b.pw * 3.2;
      for (let n = 0; n < 400 && dist < max; n++) { const ev = this.phys(s, 1 / 120, t + n / 120, L); if (ev === 'water' || ev === 'in') break; if (ev) { bounces++; if (bounces > 1) break; } const d = Math.hypot(s.x - lx, s.z - lz); dist += d; lx = s.x; lz = s.z; if (out.length < Math.floor(dist / .3)) out.push([s.x, s.z]); if (Math.hypot(s.vx, s.vz) < .05) break; } return out; },
    build(T) {
      const gd = H.gd, L = gd.L, G = GAMES.golf, r = arena3D(T, { bg: '#93d5fb' }), add = o => { r.scene.add(o); return o; };
      r.scene.fog = new T.Fog('#c7ebff', 40, 110);
      r.renderer.shadowMap.autoUpdate = false; r.renderer.shadowMap.needsUpdate = true; r.shadowT = [.8, 2, 4];
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-12, 26, 14); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 16, bottom: -16, far: 80 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.mapSize.set(4096, 4096); sun.shadow.radius = 3; }
      const tex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep) t.repeat.set(...rep); return t; };
      const noise = (g, w, h, n, a, b) => { for (let k = 0; k < n; k++) { g.fillStyle = Math.random() < .5 ? a : b; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 3); } };
      const shapeOf = (pts) => { const s = new T.Shape(); pts.forEach(([x, z], k) => k ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); return s; };
      const flat = (geo, mat, y, ord) => { const m = add(new T.Mesh(geo, mat)); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; m.renderOrder = ord || 0; return m; };
      const po = (m, f) => { m.polygonOffset = true; m.polygonOffsetFactor = -f; m.polygonOffsetUnits = -f * 4; return m; };
      /* afuera: pasto con franjas, cerros, árboles, flores */
      const gt = tex(256, 256, (g, w, h) => { g.fillStyle = '#5da83a'; g.fillRect(0, 0, w, h); g.fillStyle = '#67b443'; for (let k = 0; k < 4; k++) g.fillRect(k * 64, 0, 32, h); noise(g, w, h, 1400, '#00000010', '#ffffff10'); }, [30, 30]);
      flat(new T.PlaneGeometry(300, 300), new T.MeshStandardMaterial({ map: gt, roughness: 1 }), -.42);
      const hill = new T.MeshStandardMaterial({ color: '#4f9a3c', flatShading: true }); for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, rr = 75 + Math.random() * 25, h = 14 + Math.random() * 18; const m = add(new T.Mesh(new T.ConeGeometry(14 + Math.random() * 12, h, 7), hill)); m.position.set(Math.cos(a) * rr, h / 2 - 1, Math.sin(a) * rr); }
      const xs = L.poly.map(p => p[0]), zs = L.poly.map(p => p[1]), minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
      const outside = (x, z, m) => x < minX - m || x > maxX + m || z < minZ - m || z > maxZ + m;
      for (let k = 0; k < 70; k++) { const x = (Math.random() - .5) * 70, z = (Math.random() - .5) * 50; if (!outside(x, z, 3)) continue; fitModel(T, Rk(Math.random() < .5 ? 'treeLarge' : 'treeSmall'), { size: 1.4 + Math.random() * 1.4 }).then(o => { o.position.set(x, -.42, z); add(o); r.renderer.shadowMap.needsUpdate = true; }).catch(() => {}); }
      const fl = ['#f472b6', '#facc15', '#f8fafc', '#a78bfa', '#fb7185']; for (let k = 0; k < 160; k++) { const x = (Math.random() - .5) * 50, z = (Math.random() - .5) * 36; if (!outside(x, z, 1.2)) continue; const m = add(new T.Mesh(new T.SphereGeometry(.09, 6, 4), new T.MeshBasicMaterial({ color: pickR(fl) }))); m.position.set(x, -.36, z); }
      for (let k = 0; k < 30; k++) { const x = (Math.random() - .5) * 46, z = (Math.random() - .5) * 34; if (!outside(x, z, 1.5)) continue; const m = add(new T.Mesh(new T.IcosahedronGeometry(.45 + Math.random() * .4, 0), new T.MeshStandardMaterial({ color: '#3f8f35', flatShading: true }))); m.position.set(x, -.25, z); m.castShadow = true; }
      for (const [n, x, z, s] of L.deco) fitModel(T, Gk(n), { size: s }).then(o => { o.position.set(x, -.42, z); o.rotation.y = Math.atan2(-x, -z); add(o); r.renderer.shadowMap.needsUpdate = true; }).catch(() => {});
      /* la cancha: base de piedra, césped de green con franjas */
      const shp = shapeOf(L.poly);
      const stone = tex(256, 128, (g, w, h) => { g.fillStyle = '#a8a29e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 * 32; x < w + 64; x += 64) { g.fillStyle = ['#a8a29e', '#9c958f', '#b5aea8'][Math.floor(Math.random() * 3)]; g.fillRect(x - 64 + 2, y + 2, 60, 28); } }, [1, 1]);
      const base = add(new T.Mesh(new T.ExtrudeGeometry(shp, { depth: .42, bevelEnabled: false }), [new T.MeshStandardMaterial({ color: '#78716c' }), new T.MeshStandardMaterial({ map: stone, roughness: .9 })])); base.rotation.x = -Math.PI / 2; base.position.y = -.42; base.castShadow = true; base.receiveShadow = true;
      const turf = tex(512, 512, (g, w, h) => { g.fillStyle = '#2fa84f'; g.fillRect(0, 0, w, h); g.fillStyle = '#37b558'; for (let k = 0; k < 8; k += 2) g.fillRect(k * 64, 0, 64, h); noise(g, w, h, 9000, '#0000000c', '#ffffff0e'); }, [.35, .35]);
      flat(new T.ShapeGeometry(shp), po(new T.MeshStandardMaterial({ map: turf, roughness: .95 }), 1), .002, 1);
      /* zonas: agua animada, arena, cintas que empujan */
      const zoneGeo = z => z.r ? new T.CircleGeometry(z.r, 48) : new T.ShapeGeometry(shapeOf([[z.x0, z.z0], [z.x1, z.z0], [z.x1, z.z1], [z.x0, z.z1]]));
      const wt = tex(256, 256, (g, w, h) => { g.fillStyle = '#1d8fd8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7dd3fc88'; g.lineWidth = 3; for (let k = 0; k < 26; k++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.arc(x, y, 8 + Math.random() * 14, .2, 2.6); g.stroke(); } }, [.4, .4]); r.water = wt;
      const st = tex(256, 256, (g, w, h) => { g.fillStyle = '#f1d38c'; g.fillRect(0, 0, w, h); noise(g, w, h, 6000, '#c8a2524a', '#fff5d855'); }, [.5, .5]);
      const bt = tex(64, 128, (g, w, h) => { g.fillStyle = '#334155'; g.fillRect(0, 0, w, h); g.fillStyle = '#facc15'; for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(8, 50 + k * 64); g.lineTo(32, 20 + k * 64); g.lineTo(56, 50 + k * 64); g.lineTo(56, 62 + k * 64); g.lineTo(32, 34 + k * 64); g.lineTo(8, 62 + k * 64); g.fill(); } }); r.belts = [];
      for (const z of L.zones) {
        if (z.k === 'water') { flat(zoneGeo(z), po(new T.MeshStandardMaterial({ map: wt, roughness: .15, metalness: .1 }), 3), .004, 2); const edge = z.r ? new T.RingGeometry(z.r, z.r + .14, 48) : null; if (edge) flat(edge, po(new T.MeshStandardMaterial({ color: '#cbd5e1' }), 4), .006, 3); else for (const [a, b, c, d] of [[z.x0, z.z0, z.x1, z.z0], [z.x1, z.z0, z.x1, z.z1], [z.x1, z.z1, z.x0, z.z1], [z.x0, z.z1, z.x0, z.z0]]) { const m = add(new T.Mesh(new T.BoxGeometry(Math.hypot(c - a, d - b) + .14, .05, .14), new T.MeshStandardMaterial({ color: '#cbd5e1' }))); m.position.set((a + c) / 2, .02, (b + d) / 2); m.rotation.y = -Math.atan2(d - b, c - a); } }
        else if (z.k === 'sand') flat(zoneGeo(z), po(new T.MeshStandardMaterial({ map: st, roughness: 1 }), 3), .004, 2);
        else { const w = z.x1 - z.x0, d = z.z1 - z.z0, t2 = bt.clone(); t2.needsUpdate = true; const ang = Math.atan2(z.fx, z.fz); const along = Math.abs(Math.cos(ang)) > .5 ? d : w, across = Math.abs(Math.cos(ang)) > .5 ? w : d; t2.repeat.set(Math.max(1, Math.round(across / 1.1)), along / 1.1); const m = add(new T.Mesh(new T.PlaneGeometry(across, along), po(new T.MeshBasicMaterial({ map: t2 }), 3))); m.rotation.x = -Math.PI / 2; m.rotation.z = ang + Math.PI; m.position.set((z.x0 + z.x1) / 2, .006, (z.z0 + z.z1) / 2); m.renderOrder = 2; r.belts.push({ t: t2, sp: Math.hypot(z.fx, z.fz) / 2.2 }); }
      }
      /* paredes de madera con tapa blanca */
      const wood = tex(256, 64, (g, w, h) => { g.fillStyle = '#9a5b2e'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { g.fillStyle = Math.random() < .5 ? '#7c4a26' : '#b06d3a'; g.fillRect(0, Math.random() * h, w, 1 + Math.random() * 2); } g.fillStyle = '#5b3418'; g.fillRect(0, h / 2 - 1, w, 2); }, [1, 1]);
      const wm = new T.MeshStandardMaterial({ map: wood, roughness: .7 }), cap = new T.MeshStandardMaterial({ color: '#f8fafc', roughness: .35 });
      for (const [a, b, c, d] of L.walls) { const len = Math.hypot(c - a, d - b) + .16, ang = -Math.atan2(d - b, c - a); const w = add(new T.Mesh(new T.BoxGeometry(len, .34, .16), wm)); w.position.set((a + c) / 2, .17, (b + d) / 2); w.rotation.y = ang; w.castShadow = true; w.receiveShadow = true; const t = add(new T.Mesh(new T.BoxGeometry(len + .02, .06, .22), cap)); t.position.set(w.position.x, .37, w.position.z); t.rotation.y = ang; t.castShadow = true; }
      for (const [x, z] of L.poly) { const p = add(new T.Mesh(new T.CylinderGeometry(.17, .17, .5, 16), new T.MeshStandardMaterial({ color: '#e11d48', roughness: .4 }))); p.position.set(x, .25, z); p.castShadow = true; const k = add(new T.Mesh(new T.SphereGeometry(.19, 16, 10), new T.MeshStandardMaterial({ color: '#facc15', roughness: .3 }))); k.position.set(x, .55, z); }
      /* obstáculos */
      r.obs = L.obs.map(o => {
        if (o.k === 'spin') { const g = add(new T.Group()); g.position.set(o.x, 0, o.z); const bm = new T.MeshStandardMaterial({ map: tex(128, 16, (q, w, h) => { for (let k = 0; k < 8; k++) { q.fillStyle = k % 2 ? '#f8fafc' : '#dc2626'; q.fillRect(k * 16, 0, 16, h); } }) }); for (const q of [0, Math.PI / 2]) { const m = new T.Mesh(new T.BoxGeometry(o.len * 2, .26, .2), bm); m.position.y = .2; m.rotation.y = -q; g.add(m); } const hub = new T.Mesh(new T.CylinderGeometry(.32, .38, .5, 18), new T.MeshStandardMaterial({ color: '#facc15', metalness: .3, roughness: .3 })); hub.position.y = .25; g.add(hub); return g; }
        if (o.k === 'circ') { const g = add(new T.Group()); g.position.set(o.x, 0, o.z); const body = new T.Mesh(new T.CylinderGeometry(o.r, o.r * 1.05, .4, 28), new T.MeshStandardMaterial({ color: o.bump ? '#ef4444' : '#94a3b8', roughness: .4 })); body.position.y = .2; body.castShadow = true; g.add(body); const ring = new T.Mesh(new T.TorusGeometry(o.r * .78, .05, 8, 28), new T.MeshStandardMaterial({ color: '#f8fafc', metalness: .4, roughness: .2 })); ring.rotation.x = Math.PI / 2; ring.position.y = .41; g.add(ring); const top = new T.Mesh(new T.CylinderGeometry(o.r * .5, o.r * .5, .08, 20), new T.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: .1 })); top.position.y = .44; g.add(top); g.userData.top = top; return g; }
        const g = add(new T.Group()); const mat = o.mv ? new T.MeshStandardMaterial({ map: tex(64, 64, (q, w, h) => { q.fillStyle = '#facc15'; q.fillRect(0, 0, w, h); q.fillStyle = '#111827'; for (let k = -2; k < 4; k++) { q.beginPath(); q.moveTo(k * 24, 0); q.lineTo(k * 24 + 12, 0); q.lineTo(k * 24 + 12 + h, h); q.lineTo(k * 24 + h, h); q.fill(); } }) }) : new T.MeshStandardMaterial({ map: stone, roughness: .9 });
        const m = new T.Mesh(new T.BoxGeometry(o.w, .45, o.d), mat); m.position.y = .225; m.castShadow = true; g.add(m); g.position.set(o.x, 0, o.z); return g;
      });
      if (L.tunnel) fitModel(T, Gk('tunnel-wide'), { size: 1.9 }).then(o => { o.position.set(L.tunnel[0], 0, L.tunnel[1]); o.rotation.y = Math.abs(L.segs[0][0] - L.segs[0][2]) < .01 ? Math.PI / 2 : 0; add(o); }).catch(() => {});
      /* hoyo de verdad (con fondo), bandera grande, tee */
      const hm = flat(new T.CircleGeometry(.26, 32), po(new T.MeshBasicMaterial({ color: '#0b0f19' }), 6), .008, 5); hm.position.x = L.cup[0]; hm.position.z = L.cup[1];
      const rim = flat(new T.RingGeometry(.26, .33, 32), po(new T.MeshStandardMaterial({ color: '#f8fafc' }), 6), .009, 5); rim.position.x = L.cup[0]; rim.position.z = L.cup[1];
      fitModel(T, Gk('flag-large-red'), { h: 2.4 }).then(o => { o.position.set(L.cup[0], 0, L.cup[1]); add(o); r.flag = o; }).catch(() => fitModel(T, Gk('flag-red'), { h: 2.2 }).then(o => { o.position.set(L.cup[0], 0, L.cup[1]); add(o); r.flag = o; }));
      const tm = flat(new T.RingGeometry(.75, .85, 40), po(new T.MeshBasicMaterial({ color: '#f8fafc', transparent: true, opacity: .8 }), 3), .006, 2); tm.position.x = L.tee[0]; tm.position.z = L.tee[1]; for (const sd of [-1, 1]) { const ta = Math.atan2(L.cup[0] - L.tee[0], L.cup[1] - L.tee[1]), mk = add(new T.Mesh(new T.SphereGeometry(.12, 12, 8), new T.MeshStandardMaterial({ color: '#2563eb' }))); mk.position.set(L.tee[0] + Math.cos(ta) * sd * 1.1, .1, L.tee[1] - Math.sin(ta) * sd * 1.1); }
      /* bolas */
      r.balls = {}; r.cams = {}; r.marks = {};
      gd.ids.forEach((id, k) => {
        const col = pl(id)?.color || '#fff', g = add(new T.Group());
        const ball = new T.Mesh(new T.SphereGeometry(G.R, 24, 16), new T.MeshStandardMaterial({ color: '#ffffff', roughness: .3 })); ball.position.y = G.R; g.add(ball);
        const band = new T.Mesh(new T.TorusGeometry(G.R + .003, .03, 8, 24), new T.MeshStandardMaterial({ color: col })); band.rotation.x = Math.PI / 2; ball.add(band);
        const shadow = new T.Mesh(new T.CircleGeometry(G.R * 1.1, 20), po(new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3, depthWrite: false }), 8)); shadow.rotation.x = -Math.PI / 2; shadow.position.y = .012; g.add(shadow);
        const ring = new T.Mesh(new T.RingGeometry(.22, .28, 28), po(new T.MeshBasicMaterial({ color: col, transparent: true, opacity: .85, depthWrite: false }), 8)); ring.rotation.x = -Math.PI / 2; ring.position.y = .014; g.add(ring);
        const dots = []; for (let q = 0; q < 26; q++) { const d = add(new T.Mesh(new T.SphereGeometry(.05, 8, 6), new T.MeshBasicMaterial({ color: '#ffffff' }))); d.visible = false; dots.push(d); }
        const arrow = new T.Mesh(new T.ConeGeometry(.16, .34, 14), new T.MeshBasicMaterial({ color: col })); arrow.rotation.x = Math.PI / 2; const ag = new T.Group(); ag.add(arrow); arrow.position.z = .5; ag.position.y = .14; g.add(ag);
        const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, col); lb.position.y = .75; lb.scale.set(1.4, .35, 1); lb.layers.set(2 + k); g.add(lb);
        const trail = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 20 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: col, transparent: true, opacity: .7 })); add(trail);
        const cam = new T.PerspectiveCamera(55, 1, .05, 300); cam.layers.enableAll(); cam.layers.disable(1); cam.layers.disable(2 + k); r.cams[id] = cam;
        const mk = add(new T.Mesh(new T.CircleGeometry(.55, 20), new T.MeshBasicMaterial({ color: col }))); mk.rotation.x = -Math.PI / 2; mk.position.y = 3; mk.layers.set(1); const mo = add(new T.Mesh(new T.CircleGeometry(.72, 20), new T.MeshBasicMaterial({ color: '#fff' }))); mo.rotation.x = -Math.PI / 2; mo.position.y = 2.9; mo.layers.set(1); r.marks[id] = [mk, mo];
        const spl = new T.Mesh(new T.RingGeometry(.1, .2, 24), new T.MeshBasicMaterial({ color: '#e0f2fe', transparent: true, side: T.DoubleSide })); spl.rotation.x = -Math.PI / 2; spl.visible = false; add(spl);
        r.balls[id] = { g, ball, dots, ag, arrow, ring, trail, hist: [], spl };
      });
      const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2, ext = Math.max(maxX - minX, (maxZ - minZ) * 1.6) / 2 + 1.5;
      r.mini = new T.OrthographicCamera(-ext, ext, ext / 1.6, -ext / 1.6, 1, 100); r.mini.position.set(cx, 40, cz); r.mini.lookAt(cx, 0, cz); r.mini.layers.enable(1);
      r.over = new T.PerspectiveCamera(50, 1, .1, 300); r.over.position.set(cx, Math.max(14, ext * 1.25), cz + ext * .9); r.over.lookAt(cx, 0, cz + .5);
      return r;
    },
    draw(ctx) {
      const gd = H.gd, r = gd.r3, G = GAMES.golf, L = gd.L;
      if (r && r.renderer.domElement.isConnected) {
        const T = r.T, now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; r.age = (r.age || 0) + dt; const tt = now / 1000;
        if (r.shadowT.length && r.age > r.shadowT[0]) { r.shadowT.shift(); r.renderer.shadowMap.needsUpdate = true; }
        r.water.offset.x = (r.water.offset.x + dt * .03) % 1; r.water.offset.y = (r.water.offset.y + dt * .02) % 1; r.belts.forEach(b => { b.t.offset.y = (b.t.offset.y - dt * b.sp) % 1; });
        if (r.flag) r.flag.rotation.y = Math.sin(tt * 1.5) * .12;
        L.obs.forEach((o, k) => { const m = r.obs[k]; if (!m) return; if (o.k === 'spin') m.rotation.y = -gd.t * o.sp; else { const [x, z] = G.obsAt(o, gd.t); m.position.x = x; m.position.z = z; if (m.userData.top) m.userData.top.material.emissiveIntensity = o.flash ? 1.2 : .1; if (o.k === 'circ') m.scale.setScalar(o.flash ? 1.08 : 1); } });
        const play = H.phase === 'gf-go';
        r.pv = (r.pv || 0) + 1;
        for (const id of gd.ids) {
          const o = r.balls[id], b = gd.b[id]; if (!o) continue;
          o.g.position.set(b.x, b.in ? -.3 : 0, b.z); const still = G.still(b) && !b.in && play && b.strokes < 8;
          o.ag.visible = o.ring.visible = still; o.ring.scale.setScalar(1 + Math.sin(tt * 5) * .12);
          if (still) { o.ag.rotation.y = b.a; o.arrow.material.color.setHSL(.33 - b.pw * .33, .9, .5); o.arrow.position.z = .35 + b.pw * .5;
            if (r.pv % 3 === 0 || !o.pts) o.pts = G.preview(b, L, gd.t); o.dots.forEach((d, q) => { const p = o.pts[q]; d.visible = !!p; if (p) { d.position.set(p[0], .1, p[1]); d.scale.setScalar(1 - q / 34); } }); }
          else o.dots.forEach(d => d.visible = false);
          o.ball.rotation.x += Math.hypot(b.vx, b.vz) * .07; o.ball.rotation.z += b.vx * .04;
          if (Math.hypot(b.vx, b.vz) > .25) { o.hist.push([b.x, b.z]); if (o.hist.length > 20) o.hist.shift(); } else if (o.hist.length) o.hist.shift();
          const pa = o.trail.geometry.attributes.position; for (let q = 0; q < 20; q++) { const h = o.hist[Math.max(0, o.hist.length - 20 + q)] || [b.x, b.z]; pa.setXYZ(q, h[0], G.R, h[1]); } pa.needsUpdate = true; o.trail.visible = o.hist.length > 1;
          if (b.splash) { b.splash.t += dt; o.spl.visible = b.splash.t < .8; o.spl.position.set(b.splash.wx ?? b.x, .05, b.splash.wz ?? b.z); o.spl.scale.setScalar(1 + b.splash.t * 6); o.spl.material.opacity = 1 - b.splash.t / .8; }
          r.marks[id].forEach(m => { m.position.x = b.x; m.position.z = b.z; m.visible = !b.in; });
          /* cámara detrás de la bola, mirando hacia donde apunta (o hacia donde rueda) */
          const cam = r.cams[id]; const sp = Math.hypot(b.vx, b.vz), want = b.in ? b.camA + dt * .5 : sp > .6 ? Math.atan2(b.vx, b.vz) : b.a;
          b.camA += angTo(b.camA, want) * Math.min(1, dt * (sp > .6 ? 1.6 : 7)); const back = b.in ? 5 : 4.3, hgt = b.in ? 3.6 : 2.7;
          const tx = b.x - Math.sin(b.camA) * back, tz = b.z - Math.cos(b.camA) * back;
          if (!b.camI) { b.cx = tx; b.cz = tz; b.camI = 1; } const kk = Math.min(1, dt * 6); b.cx += (tx - b.cx) * kk; b.cz += (tz - b.cz) * kk;
          cam.position.set(b.cx, hgt, b.cz); cam.lookAt(b.x + Math.sin(b.camA) * 2.4, 0, b.z + Math.cos(b.camA) * 2.4);
        }
        const n = gd.ids.length, { rows, cols } = GAMES.race3d.layout(n), VW = 1000, VH = 600, w = VW / cols, h = VH / rows, R = r.renderer, cells = [];
        R.setScissorTest(true); R.setClearColor('#0b1020'); R.setViewport(0, 0, VW, VH); R.setScissor(0, 0, VW, VH); R.clear();
        if (H.phase === 'gf-ready') { r.over.aspect = VW / VH; r.over.updateProjectionMatrix(); R.render(r.scene, r.over); }
        else gd.ids.forEach((id, k) => { const c = k % cols, ro = Math.floor(k / cols), x = c * w, y = VH - (ro + 1) * h; cells.push({ id, x, y, w, h }); const cam = r.cams[id]; cam.aspect = (w - 4) / (h - 4); cam.updateProjectionMatrix(); R.setViewport(x + 2, y + 2, w - 4, h - 4); R.setScissor(x + 2, y + 2, w - 4, h - 4); R.render(r.scene, cam); });
        if (H.phase !== 'gf-ready') { const free = rows * cols > n; let mx, my, mw, mh; if (free) { const c = n % cols, ro = Math.floor(n / cols); mw = w - 4; mh = h - 4; mx = c * w + 2; my = VH - (ro + 1) * h + 2; } else { mw = n === 1 ? 250 : 180; mh = mw / 1.6; mx = n === 1 ? VW - mw - 10 : (VW - mw) / 2; my = n === 1 ? 10 : (VH - mh) / 2; }
          const fog = r.scene.fog; r.scene.fog = null; const ar = mw / mh, e = r.mini.right; r.mini.top = e / ar; r.mini.bottom = -e / ar; r.mini.updateProjectionMatrix(); R.setViewport(mx, my, mw, mh); R.setScissor(mx, my, mw, mh); R.render(r.scene, r.mini); r.scene.fog = fog; }
        R.setScissorTest(false);
        G.overlay(r, cells);
        return;
      }
      ctx.fillStyle = '#65a30d'; ctx.fillRect(0, 0, 1000, 600); const S = 40, X = x => 500 + x * S, Z = z => 300 + z * S;
      ctx.fillStyle = '#22c55e'; ctx.beginPath(); L.poly.forEach(([x, z], i) => i ? ctx.lineTo(X(x), Z(z)) : ctx.moveTo(X(x), Z(z))); ctx.closePath(); ctx.fill();
      for (const id of gd.ids) { const b = gd.b[id]; ctx.fillStyle = pl(id)?.color || '#fff'; ctx.beginPath(); ctx.arc(X(b.x), Z(b.z), 6, 0, 7); ctx.fill(); }
    },
    overlay(r, cells) {
      const gd = H.gd, cv = r.renderer.domElement, wrap = cv.parentElement; if (!wrap) return;
      let ov = wrap.querySelector('.rcov'); if (!ov) { ov = document.createElement('div'); ov.className = 'rcov'; wrap.appendChild(ov); }
      Object.assign(ov.style, { left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px' });
      const now = performance.now(); if (r.ovT && now - r.ovT < 120) return; r.ovT = now;
      const pc = (v, t) => (v / t * 100).toFixed(2) + '%', L = gd.L;
      const head = `<div class="gfhead">⛳ Hoyo ${gd.hole}/${this.HOLES} · ${esc(L.name)} · Par ${L.par}</div>`;
      const html = head + cells.map(c => { const b = gd.b[c.id], p = pl(c.id), top = 600 - c.y - c.h, still = this.still(b) && !b.in;
        const mid = b.msgT > 0 && b.msg ? `<div class="rcbig${b.msg.startsWith('💦') ? ' rcwarn' : ''}">${b.msg}</div>` : b.strokes >= 8 && !b.in ? `<div class="rcbig">😵 Sin golpes</div>` : '';
        return `<div class="rcv" style="left:${pc(c.x, 1000)};top:${pc(top, 600)};width:${pc(c.w, 1000)};height:${pc(c.h, 600)}"><span class="rcn" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}</span><span class="rcl">🏌️ ${b.strokes} golpe${b.strokes === 1 ? '' : 's'}</span>${still && !b.in ? `<span class="gfpow"><i style="width:${Math.round(b.pw * 100)}%;background:hsl(${120 - b.pw * 120},85%,50%)"></i></span>` : ''}${mid}</div>`; }).join('');
      ov.style.fontSize = Math.max(10, Math.min(17, cv.offsetWidth / 1000 * (cells.length > 4 ? 13 : 17))) + 'px'; if (ov._h !== html) { ov._h = html; ov.innerHTML = html; }
    },
    endHole() {
      const gd = H.gd; if (H.phase !== 'gf-go') return; gd.endT = 0;
      gd.ids.forEach(id => { const b = gd.b[id], s = b.in ? b.strokes : Math.max(b.strokes + 2, gd.L.par + 3); gd.per[id].push(s); gd.total[id] += s; });
      gd.last = gd.ids.slice().sort((a, b) => gd.per[a][gd.hole - 1] - gd.per[b][gd.hole - 1]);
      if (gd.hole >= this.HOLES) return this.end();
      setPhase('gf-sub', 5000, () => GAMES.golf.newHole(), 0, false); SFX.win();
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.total[id], false), par = gd.pars.reduce((a, b) => a + b, 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.total[a] - gd.total[b]).map(id => { const d = gd.total[id] - par; return { id, val: `⛳ ${gd.total[id]} golpes (${d > 0 ? '+' + d : d === 0 ? 'par' : d}) · ${gd.per[id].join(' · ')}`, gain: g[id] || 0 }; });
      setPhase('gf-res', 6000, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'gf-ready') return canvasHTML(true, `⛳ Hoyo ${gd.hole} de ${this.HOLES} · ${esc(gd.L.name)} · Par ${gd.L.par}`);
      if (ph === 'gf-go') return canvasHTML(false);
      if (ph === 'gf-sub') { const par = gd.L.par; return `<div class="round-lbl">Hoyo ${gd.hole} de ${this.HOLES} · Par ${par}</div><h2 class="title-pop">⛳ Así quedó el hoyo</h2>${resultsList(gd.last.map(id => { const s = gd.per[id][gd.hole - 1], d = s - par; return { id, val: `${s} golpes (${d > 0 ? '+' + d : d === 0 ? 'par' : d}) · total ${gd.total[id]}`, gain: 0 }; }))}`; }
      return `<h1 class="title-pop">⛳ Campeones del mini golf</h1>${resultsList(gd.rows)}`;
    }
  }
});
