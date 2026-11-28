Object.assign(GAMES, {
  /* =================================================================== */
  /* ⚽ FÚTBOL DE AUTOS 3D — rojos contra azules                          */
  /* =================================================================== */
  carball: {
    name: 'Fútbol de Autos 3D', emoji: '⚽', color: '#16a34a', FW: 21, FH: 12.5, GW: 4.8, GH: 4, CR: 1.15, BR: 1.3,
    P: { acc: 27, max: 14.5, turbo: 24, turn: 4.6, grip: 7.5, kick: 12, cd: 2.2 },
    TEAMS: [{ n: 'ROJO', c: '#ef4444', e: '🔴' }, { n: 'AZUL', c: '#3b82f6', e: '🔵' }],
    desc: '¡Fútbol con autos! ⚽🚗 Se arman dos equipos: ROJO ataca hacia la derecha y AZUL hacia la izquierda. Mové el joystick (o WASD) hacia donde querés ir y chocá la pelota gigante. El botón (ESPACIO) hace SALTAR el auto ⬆️ para cabecear la pelota en el aire, y si lo volvés a tocar en el aire es TURBO 💨 para pegarle más fuerte (y hasta hacerla volar). ¡Gana el equipo con más goles!',
    start() {
      const ids = shuffle(onlineIds()); CARX.MODELS.concat(['grandStandCovered', 'grandStand', 'lightPostLarge', 'billboard', 'flagCheckers']).forEach(n => C3D.load(Rk(n)).catch(() => {}));
      const team = {}; ids.forEach((id, k) => team[id] = k % 2);
      const ps = {}; ids.forEach(id => ps[id] = { id, x: 0, z: 0, a: 0, vx: 0, vz: 0, lb: 0, cd: 0, turbo: 0, hit: 0, by: null, byT: 0 });
      H.inp = {}; H.gd = { ids, team, ps, ball: { x: 0, y: this.BR, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, rz: 0 }, score: [0, 0], goals: {}, touch: {}, last: null, freeze: 0, t: 0, msgs: [], sid: rid(), build3D: T => GAMES.carball.build(T) };
      this.kickoff();
      setPhase('cb-ready', 3600, () => { SFX.go(); GAMES.carball.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.carball.draw);
    },
    go() { setPhase('cb-go', 100000, () => GAMES.carball.end()); attachArena(H.gd); rtLoop(dt => GAMES.carball.step(dt), GAMES.carball.draw); },
    kickoff() {
      const gd = H.gd, FW = this.FW; gd.scored = false; Object.assign(gd.ball, { x: 0, y: this.BR + 1.5, z: 0, vx: 0, vy: 0, vz: 0 }); gd.last = null;
      [0, 1].forEach(t => { const mine = gd.ids.filter(id => gd.team[id] === t), sd = t ? 1 : -1; mine.forEach((id, k) => { const s = gd.ps[id], rowZ = (k - (mine.length - 1) / 2) * 4.2; Object.assign(s, { x: sd * (FW * .42 + (k % 2) * 3), z: rowZ, a: t ? -Math.PI / 2 : Math.PI / 2, vx: 0, vz: 0, turbo: 0, hit: 0 }); }); });
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'cb-ready' || H.phase === 'cb-go') { const t = this.TEAMS[H.gd.team[p.id] || 0]; return joyView(p, `${t.e} Sos del ${t.n} · atacás hacia la ${H.gd.team[p.id] ? 'IZQUIERDA ⬅️' : 'DERECHA ➡️'} · 🕹️ mové hacia donde querés ir · Botón = SALTAR (y en el aire otra vez = TURBO)`, '⬆️ SALTAR / 💨', this.P.cd); }
      return watch();
    },
    onAct(p, m) { if (H.phase === 'cb-ready' || H.phase === 'cb-go') joyAct(p, m); },
    isDone() { return false; },
    step(dt) {
      const gd = H.gd, go = H.phase === 'cb-go', P = this.P, FW = this.FW, FH = this.FH, CR = this.CR, BR = this.BR, b = gd.ball; gd.t += dt;
      CARX.push = .35; CARX.pushT = .9;
      if (gd.freeze > 0) { gd.freeze -= dt; if (gd.freeze <= 0) { this.kickoff(); SND.play('ui_switch_002', .5); } }
      const list = gd.ids.map(id => gd.ps[id]);
      for (const s of list) {
        const i = go ? inp(s.id) : { x: 0, y: 0, b: s.lb }; s.cd -= dt; s.turbo -= dt; s.hit -= dt;
        /* botón: en el piso SALTA; en el aire, TURBO (impulso hacia adelante) */
        if (go && i.b !== s.lb) { const pr = i.b > s.lb || i.b === 1; s.lb = i.b; if (pr) { if (!(s.cy > 0)) { s.cvy = 9.5; s.cy = .02; s.dj = 1; SND.play('ui_pluck_002', .3, 1.4); } else if (s.dj && s.cd <= 0) { s.dj = 0; s.cd = P.cd; s.turbo = .55; s.vx += Math.sin(s.a) * P.kick; s.vz += Math.cos(s.a) * P.kick; s.cvy = Math.max(s.cvy, 2.5); SND.play('sf_thrusterFire_000', .55, 1.1, 0); } } }
        if (s.cy > 0 || s.cvy) { s.cvy -= 24 * dt; s.cy = Math.max(0, (s.cy || 0) + s.cvy * dt); if (s.cy <= 0) { if (s.cvy < -6) SND.play('impactSoft_heavy_000', .2, 1.5, 30); s.cvy = 0; } }
        CARX.drive(s, i, dt, P);
        if (Math.abs(s.x) > FW - CR) { s.x = Math.sign(s.x) * (FW - CR); s.vx *= -.35; } if (Math.abs(s.z) > FH - CR) { s.z = Math.sign(s.z) * (FH - CR); s.vz *= -.35; }
      }
      CARX.collide(list, CR, .7, (x, z, rel) => { if (rel > 7) { gd.hits = gd.hits || []; gd.hits.push({ x, z, rel }); SND.play('impactPunch_medium_000', Math.min(.6, .15 + rel / 35), 1, 60); } });
      if (gd.freeze > 0 && gd.scored) { b.y = -20; return; }
      /* la pelota */
      const sub = 3, h = dt / sub;
      for (let q = 0; q < sub; q++) {
        b.vy -= 24 * h; b.x += b.vx * h; b.y += b.vy * h; b.z += b.vz * h;
        if (b.y < BR) { b.y = BR; if (b.vy < -2.5) { b.vy = -b.vy * .55; if (b.vy > 4) SND.play('impactSoft_heavy_000', .25, 1.3, 70); } else b.vy = 0; }
        const fr = b.y <= BR + .01 ? .55 : .12; const k = Math.exp(-fr * h); b.vx *= k; b.vz *= k;
        if (Math.abs(b.z) > FH - BR) { b.z = Math.sign(b.z) * (FH - BR); b.vz *= -.8; }
        const inMouth = Math.abs(b.z) < this.GW - BR * .4 && b.y < this.GH - BR * .2;
        if (!inMouth && Math.abs(b.x) > FW - BR) { b.x = Math.sign(b.x) * (FW - BR); b.vx *= -.8; }
        if (inMouth && Math.abs(b.x) > FW + 3.2 - BR) { b.x = Math.sign(b.x) * (FW + 3.2 - BR); b.vx *= -.3; }
        if (b.y > 14) { b.y = 14; b.vy = -Math.abs(b.vy) * .5; }
        for (const s of list) {
          const dx = b.x - s.x, dz = b.z - s.z, d = Math.hypot(dx, dz); if (d >= CR + BR || Math.abs(b.y - (s.cy || 0) - .55) > 1.9 || d < 1e-4) continue;
          const nx = dx / d, nz = dz / d; b.x = s.x + nx * (CR + BR); b.z = s.z + nz * (CR + BR);
          const rel = (s.vx - b.vx) * nx + (s.vz - b.vz) * nz; if (rel <= -.5) continue;
          const pw = Math.max(0, rel) * 1.3 + 3.5 + (s.turbo > 0 ? 6 : 0); b.vx += nx * pw; b.vz += nz * pw; b.vy = Math.min(15, Math.max(b.vy, (s.turbo > 0 ? 6 : 1.5) + rel * .22 + (s.cvy > 0 ? s.cvy * .6 : 0)));
          s.vx -= nx * rel * .25; s.vz -= nz * rel * .25;
          if (gd.lastT !== s.id || gd.t - (gd.lastK || 0) > .25) { gd.touch[s.id] = (gd.touch[s.id] || 0) + 1; SND.play(pw > 16 ? 'impactPunch_heavy_000' : 'impactSoft_heavy_000', Math.min(.7, .2 + pw / 40), 1.2, 40); if (pw > 15) { gd.hits = gd.hits || []; gd.hits.push({ x: b.x, z: b.z, rel: pw * .6 }); } }
          gd.last = s.id; gd.lastT = s.id; gd.lastK = gd.t;
        }
        b.rx += b.vz * h / BR; b.rz -= b.vx * h / BR;
        if (go && gd.freeze <= 0 && Math.abs(b.x) > FW + BR * .6 && Math.abs(b.z) < this.GW && b.y < this.GH) { this.goal(b.x > 0 ? 0 : 1); break; }
      }
    },
    goal(tm) {
      const gd = H.gd, T0 = this.TEAMS[tm], by = gd.last; gd.score[tm]++; gd.freeze = 3.2; gd.scored = true;
      const own = by && gd.team[by] !== tm; if (by && !own) gd.goals[by] = (gd.goals[by] || 0) + 1;
      gd.boom = { x: gd.ball.x, y: gd.ball.y, z: gd.ball.z, c: T0.c };
      gd.msgs.push({ t: `⚽ ¡GOOOL ${T0.e} ${T0.n}!`, s: by ? (own ? `😅 gol en contra de ${esc(pl(by)?.name || '')}` : `de ${pl(by)?.emoji || ''} ${esc(pl(by)?.name || '')}`) : '', k: gd.t, big: 1 });
      confetti(140); SFX.win(); shakeScreen(); sync(); updateStrip();
    },
    end() {
      if (H.phase !== 'cb-go') return;
      const gd = H.gd, [a, b] = gd.score, win = a === b ? -1 : a > b ? 0 : 1;
      const sc = id => (win === -1 ? 1000 : gd.team[id] === win ? 2000 : 0) + (gd.goals[id] || 0) * 100 + (gd.touch[id] || 0), g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((x, y) => sc(y) - sc(x)).map(id => { const t = this.TEAMS[gd.team[id]]; return { id, val: `${t.e} ${t.n} · ⚽ ${gd.goals[id] || 0} gol${(gd.goals[id] || 0) === 1 ? '' : 'es'} · 🦶 ${gd.touch[id] || 0} toques`, gain: g[id] || 0 }; });
      gd.final = win === -1 ? `🤝 Empate ${a} a ${b}` : `🏆 ¡Ganó ${this.TEAMS[win].e} ${this.TEAMS[win].n} ${Math.max(a, b)} a ${Math.min(a, b)}!`;
      setPhase('cb-res', 6500, () => finishGame(g), 0, false); SFX.win(); if (win !== -1) confetti(150);
    },
    render(ph) {
      if (ph === 'cb-ready') return canvasHTML(true, `⚽ 🔴 ROJO ➡️ ataca a la derecha · ⬅️ AZUL 🔵 ataca a la izquierda`);
      if (ph === 'cb-go') return canvasHTML(false);
      return `<h1 class="title-pop">${H.gd.final || '⚽ Final del partido'}</h1>${resultsList(H.gd.rows)}`;
    },
    build(T) {
      const gd = H.gd, FW = this.FW, FH = this.FH, GW = this.GW, GH = this.GH, r = arena3D(T, { bg: '#0f172a' }), add = o => { r.scene.add(o); return o; };
      r.scene.background = CARX.sky(T, ['#0b1026', '#1e3a8a', '#7c3aed', '#f472b6']); r.scene.fog = new T.Fog('#2e1065', 70, 150);
      r.cam.fov = 47; r.cam.far = 400; r.cam.updateProjectionMatrix();
      const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-14, 30, 18); sun.intensity = 2; Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 22, bottom: -22, far: 90 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.mapSize.set(4096, 4096); }
      const hemi = r.scene.children.find(c => c.isHemisphereLight); if (hemi) { hemi.intensity = 1.25; hemi.groundColor.set('#1e3a8a'); }
      /* cancha con franjas y líneas */
      const M = 4, Wt = (FW + M) * 2, Ht = (FH + M) * 2, px = 1024 / Wt;
      const ft = CARX.tex(T, 1024, Math.round(1024 * Ht / Wt), (g, w, h) => {
        for (let k = 0; k < 16; k++) { g.fillStyle = k % 2 ? '#3f9d3a' : '#48ad42'; g.fillRect(k * w / 16, 0, w / 16 + 1, h); }
        for (let k = 0; k < 9000; k++) { g.fillStyle = Math.random() < .5 ? '#0000000c' : '#ffffff0c'; g.fillRect(Math.random() * w, Math.random() * h, 2, 3); }
        const X = x => (x + FW + M) * px, Z = z => (z + FH + M) * px; g.strokeStyle = '#f8fafc'; g.lineWidth = .22 * px;
        g.strokeRect(X(-FW), Z(-FH), FW * 2 * px, FH * 2 * px); g.beginPath(); g.moveTo(X(0), Z(-FH)); g.lineTo(X(0), Z(FH)); g.stroke();
        g.beginPath(); g.arc(X(0), Z(0), 4.2 * px, 0, 7); g.stroke(); g.fillStyle = '#f8fafc'; g.beginPath(); g.arc(X(0), Z(0), .35 * px, 0, 7); g.fill();
        for (const sd of [-1, 1]) { const x0 = sd < 0 ? X(-FW) : X(FW - 6.5), x1 = sd < 0 ? X(-FW + 2.6) : X(FW - 2.6); g.strokeRect(x0, Z(-9), 6.5 * px, 18 * px); g.strokeRect(sd < 0 ? X(-FW) : X(FW - 2.6), Z(-GW - 1.2), 2.6 * px, (GW + 1.2) * 2 * px); g.beginPath(); g.arc(sd < 0 ? X(-FW + 6.5) : X(FW - 6.5), Z(0), 2.8 * px, sd < 0 ? -1.2 : Math.PI - 1.2, sd < 0 ? 1.2 : Math.PI + 1.2); g.stroke(); void x1; }
        g.fillStyle = '#00000022'; g.fillRect(0, 0, w, Z(-FH) - 2); g.fillRect(0, Z(FH) + 2, w, h); g.fillRect(0, 0, X(-FW) - 2, h); g.fillRect(X(FW) + 2, 0, w, h);
      });
      ft.wrapS = ft.wrapT = T.ClampToEdgeWrapping;
      const field = add(new T.Mesh(new T.PlaneGeometry(Wt, Ht), new T.MeshStandardMaterial({ map: ft, roughness: .95 }))); field.rotation.x = -Math.PI / 2; field.receiveShadow = true;
      const outer = add(new T.Mesh(new T.PlaneGeometry(260, 260), new T.MeshStandardMaterial({ color: '#1f2937', roughness: 1 }))); outer.rotation.x = -Math.PI / 2; outer.position.y = -.02;
      /* paredes de vidrio con luces de color */
      const glass = new T.MeshStandardMaterial({ color: '#bfdbfe', transparent: true, opacity: .16, roughness: .1, metalness: .2, depthWrite: false });
      const neon = c => new T.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4 });
      const wall = (x, z, w, d, c) => { const m = add(new T.Mesh(new T.BoxGeometry(w, 1.6, d), glass)); m.position.set(x, .8, z); const t = add(new T.Mesh(new T.BoxGeometry(w + .02, .14, d + .02), neon(c))); t.position.set(x, 1.62, z); const bse = add(new T.Mesh(new T.BoxGeometry(w + .02, .25, d + .02), new T.MeshStandardMaterial({ color: '#0f172a' }))); bse.position.set(x, .12, z); };
      wall(-FW / 2, -FH - .15, FW, .3, '#ef4444'); wall(FW / 2, -FH - .15, FW, .3, '#3b82f6'); wall(-FW / 2, FH + .15, FW, .3, '#ef4444'); wall(FW / 2, FH + .15, FW, .3, '#3b82f6');
      for (const sd of [-1, 1]) { const c = sd < 0 ? '#ef4444' : '#3b82f6', len = FH - GW; wall(sd * (FW + .15), -GW - len / 2, .3, len, c); wall(sd * (FW + .15), GW + len / 2, .3, len, c); }
      /* arcos con red */
      const net = CARX.tex(T, 128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#ffffffcc'; g.lineWidth = 3; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(k * 16, 0); g.lineTo(k * 16, h); g.stroke(); g.beginPath(); g.moveTo(0, k * 16); g.lineTo(w, k * 16); g.stroke(); } });
      const post = new T.MeshStandardMaterial({ color: '#f8fafc', roughness: .3, metalness: .3 });
      for (const sd of [-1, 1]) {
        const g = add(new T.Group()); g.position.x = sd * FW; const c = sd < 0 ? '#ef4444' : '#3b82f6';
        for (const z of [-GW, GW]) { const p = new T.Mesh(new T.CylinderGeometry(.18, .18, GH, 12), post); p.position.set(0, GH / 2, z); p.castShadow = true; g.add(p); }
        const bar = new T.Mesh(new T.CylinderGeometry(.18, .18, GW * 2 + .36, 12), post); bar.rotation.x = Math.PI / 2; bar.position.y = GH; g.add(bar);
        const nm = new T.MeshBasicMaterial({ map: net, transparent: true, side: T.DoubleSide, depthWrite: false }); const nt = net.clone(); nt.needsUpdate = true; nt.repeat.set(GW * 2 / 1.2, GH / 1.2);
        const back = new T.Mesh(new T.PlaneGeometry(GW * 2, GH), nm); back.rotation.y = Math.PI / 2; back.position.set(sd * 3.2, GH / 2, 0); g.add(back);
        const topN = new T.Mesh(new T.PlaneGeometry(3.2, GW * 2), nm); topN.rotation.x = -Math.PI / 2; topN.position.set(sd * 1.6, GH, 0); g.add(topN);
        for (const z of [-GW, GW]) { const sn = new T.Mesh(new T.PlaneGeometry(3.2, GH), nm); sn.position.set(sd * 1.6, GH / 2, z); g.add(sn); }
        const pad = new T.Mesh(new T.PlaneGeometry(3.2, GW * 2), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .35, depthWrite: false })); pad.rotation.x = -Math.PI / 2; pad.position.set(sd * 1.6, .03, 0); g.add(pad);
        const lt = new T.PointLight(c, 30, 14, 1.5); lt.position.set(sd * 1.5, 3, 0); g.add(lt);
      }
      /* estadio: tribunas, focos y carteles */
      const put = (n, o, x, z, rot) => fitModel(T, Rk(n), o).then(m => { m.position.set(x, 0, z); m.rotation.y = rot; add(m); }).catch(() => {});
      for (let k = -2; k <= 2; k++) { put(k % 2 ? 'grandStand' : 'grandStandCovered', { size: 8 }, k * 8.4, -FH - 6.5, 0); }
      for (const [x, z] of [[-FW - 4, -FH - 4], [FW + 4, -FH - 4], [-FW - 4, FH + 4], [FW + 4, FH + 4]]) put('lightPostLarge', { h: 9 }, x, z, Math.atan2(-x, -z));
      for (const sd of [-1, 1]) for (const z of [-6, 6]) put('billboard', { size: 6 }, sd * (FW + 6.5), z, sd < 0 ? Math.PI / 2 : -Math.PI / 2);
      /* gente en las tribunas */
      const crowd = new T.InstancedMesh(new T.SphereGeometry(.28, 8, 6), new T.MeshStandardMaterial({ color: '#fff' }), 260), tmp = new T.Object3D(), cc = new T.Color();
      for (let k = 0; k < 260; k++) { const row = k % 5, x = (Math.random() - .5) * 40; tmp.position.set(x, 1.4 + row * .85, -FH - 4.2 - row * 1.05); tmp.updateMatrix(); crowd.setMatrixAt(k, tmp.matrix); crowd.setColorAt(k, cc.set(pickR(['#ef4444', '#3b82f6', '#facc15', '#f8fafc', '#22c55e', '#f472b6', '#a855f7']))); }
      add(crowd); r.crowd = crowd;
      /* la pelota */
      const bt = CARX.tex(T, 512, 256, (g, w, h) => { g.fillStyle = '#f8fafc'; g.fillRect(0, 0, w, h); g.fillStyle = '#111827'; const hex = (x, y, s) => { g.beginPath(); for (let q = 0; q < 5; q++) { const a = q / 5 * 6.28 - Math.PI / 2; g.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s * .9); } g.closePath(); g.fill(); }; for (let q = 0; q < 6; q++) { hex(q * w / 6 + 20, h * .22, 26); hex(q * w / 6 + 62, h * .55, 30); hex(q * w / 6 + 20, h * .86, 26); } g.strokeStyle = '#94a3b8'; g.lineWidth = 2; for (let q = 0; q < 12; q++) { g.beginPath(); g.moveTo(q * w / 12, 0); g.lineTo(q * w / 12 + 20, h); g.stroke(); } });
      const ball = add(new T.Mesh(new T.SphereGeometry(this.BR, 40, 24), new T.MeshStandardMaterial({ map: bt, roughness: .45 }))); ball.castShadow = true; r.ball = ball;
      const bsh = add(new T.Mesh(new T.CircleGeometry(this.BR, 28), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .35, depthWrite: false }))); bsh.rotation.x = -Math.PI / 2; bsh.position.y = .03; r.bsh = bsh;
      const mark = add(new T.Mesh(new T.RingGeometry(this.BR + .25, this.BR + .45, 36), new T.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: .8, depthWrite: false }))); mark.rotation.x = -Math.PI / 2; mark.position.y = .04; r.mark = mark;
      r.cars = {}; gd.ids.forEach((id, k) => { const t = this.TEAMS[gd.team[id]]; r.cars[id] = CARX.car(T, r, id, k, { ring: t.c, lab: t.c }); });
      CARX.sparks(T, r, 80); r.cx = 0;
      return r;
    },
    draw(ctx) {
      const G = GAMES.carball, gd = H.gd, r = gd.r3, b = gd.ball;
      if (r && r.renderer.domElement.isConnected) {
        const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const tt = now / 1000;
        r.ball.visible = r.bsh.visible = r.mark.visible = b.y > -5; r.ball.position.set(b.x, b.y, b.z); r.ball.rotation.set(b.rx, 0, b.rz);
        r.bsh.position.x = r.mark.position.x = b.x; r.bsh.position.z = r.mark.position.z = b.z; const hh = Math.max(0, b.y - G.BR); r.bsh.scale.setScalar(Math.max(.35, 1 - hh / 10)); r.mark.visible = hh > .6 && b.y > -5;
        if (gd.hits) { gd.hits.forEach(h => CARX.burst(r, h.x, .9, h.z, Math.min(12, 3 + h.rel / 2 | 0), Math.min(8, 2 + h.rel * .25))); gd.hits = null; }
        if (gd.boom) { CARX.burst(r, gd.boom.x, Math.max(1, gd.boom.y), gd.boom.z, 70, 12, gd.boom.c); gd.boom = null; }
        CARX.tickSparks(r, dt);
        for (const id of gd.ids) { const g = r.cars[id], s = gd.ps[id]; if (!g) continue; g.position.set(s.x, s.cy || 0, s.z); g.rotation.y = s.a; g.rotation.x = -Math.max(-.35, Math.min(.35, (s.cvy || 0) * .035)); g.userData.fl.visible = s.turbo > 0; g.userData.fl.scale.set(1, .8 + Math.random() * .6, 1); }
        if (r.crowd && Math.floor(tt * 8) % 2 === 0) { const tmp = new r.T.Object3D(), mm = new r.T.Matrix4(); const hype = gd.freeze > 0 ? .5 : .08; for (let k = 0; k < 260; k += 3) { r.crowd.getMatrixAt(k, mm); tmp.position.setFromMatrixPosition(mm); tmp.position.y += (Math.random() - .5) * hype; tmp.position.y = Math.max(1.2, Math.min(6, tmp.position.y)); tmp.updateMatrix(); r.crowd.setMatrixAt(k, tmp.matrix); } r.crowd.instanceMatrix.needsUpdate = true; }
        const want = Math.max(-9, Math.min(9, (b.y > -5 ? b.x : 0) * .6)); r.cx += (want - r.cx) * Math.min(1, dt * 2.2);
        r.cam.position.set(r.cx, 22.5, 20.5); r.cam.lookAt(r.cx, 0, 1.4);
        r.renderer.render(r.scene, r.cam);
        const [s0, s1] = gd.score, big = gd.msgs.filter(m => gd.t - m.k < 3).pop();
        const side = t => gd.ids.filter(id => gd.team[id] === t).map(id => { const p = pl(id); return `<span class="cxpill" style="--c:${p?.color || '#888'}">${p?.emoji || ''} ${esc(p?.name || '')}${gd.goals[id] ? ' ⚽' + gd.goals[id] : ''}</span>`; }).join('');
        CARX.overlay(r, `<div class="cbsb"><div class="cbteam" style="--c:#ef4444">${side(0)}</div><div class="cbscore"><b style="background:#ef4444">🔴 ${s0}</b><i>:</i><b style="background:#3b82f6">${s1} 🔵</b></div><div class="cbteam r" style="--c:#3b82f6">${side(1)}</div></div><div class="cbdir"><span>⬅️ acá meten gol los 🔵</span><span>acá meten gol los 🔴 ➡️</span></div>${big ? `<div class="cxbig cbgoal">${big.t}<small>${big.s}</small></div>` : ''}`);
        return;
      }
      ctx.fillStyle = '#16a34a'; ctx.fillRect(0, 0, 1000, 600); const S = 22, X = x => 500 + x * S, Z = z => 300 + z * S;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(X(-G.FW), Z(-G.FH), G.FW * 2 * S, G.FH * 2 * S);
      for (const id of gd.ids) { const s = gd.ps[id]; ctx.fillStyle = G.TEAMS[gd.team[id]].c; ctx.beginPath(); ctx.arc(X(s.x), Z(s.z), 18, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X(b.x), Z(b.z), 20, 0, 7); ctx.fill();
    }
  }
});
