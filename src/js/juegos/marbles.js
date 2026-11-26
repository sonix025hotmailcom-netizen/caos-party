Object.assign(GAMES, {
  /* =================================================================== */
  /* 🔵 CARRERA DE CANICAS (Matter.js)                                    */
  /* =================================================================== */
  marbles: {
    name: 'Carrera de Canicas', emoji: '🔵', color: '#0891b2', L: 10500,
    desc: 'Cada uno es una canica 🔵. Joystick (o A/D) para rodar y botón (o ESPACIO) para SALTAR, ¡también mientras te movés! Saltá huecos, sierras y barras que giran. Si te quedás muy atrás, una burbuja te trae de vuelta 🫧. ¡Llegá primero a la meta! 🏁',
    /* física propia (más suave y controlable que un motor genérico): suelo por tramos, cajas, barras y sierras */
    K: { R: 17, G: 1700, ACC: 1150, AIR: .6, MAX: 430, JUMP: 640, COY: .12, BUF: .16, FRIC: 2.2 },
    THEMES: {
      dia: { name: 'Pradera', sky: ['#38bdf8', '#bae6fd', '#f0f9ff'], mts: ['#a7d8c0', '#7cc49f'], hill: '#5fbf6e', top: '#22c55e', top2: '#86efac', dirt: ['#8b5a2b', '#6f4520', '#a0693a'], liquid: ['#38bdf8', '#0ea5e9'], deco: ['tree', 'tree', 'bush', 'flowers', 'rock'], cloud: '#ffffff' },
      tarde: { name: 'Atardecer', sky: ['#6d28d9', '#f97316', '#fde68a'], mts: ['#8b5cf6', '#6d28d9'], hill: '#9a3412', top: '#65a30d', top2: '#bef264', dirt: ['#7c2d12', '#5c1f0b', '#9a3d1a'], liquid: ['#f97316', '#dc2626'], deco: ['tree', 'bush', 'rock', 'cactus', 'lamp'], cloud: '#fed7aa', sun: 1 },
      noche: { name: 'Noche', sky: ['#020617', '#1e1b4b', '#4338ca'], mts: ['#312e81', '#1e1b4b'], hill: '#172554', top: '#10b981', top2: '#6ee7b7', dirt: ['#3b2a4a', '#2a1d36', '#4c3760'], liquid: ['#1d4ed8', '#1e3a8a'], deco: ['lamp', 'tree', 'bush', 'rock', 'lamp'], cloud: '#475569', stars: 1, moon: 1 },
      nieve: { name: 'Nieve', sky: ['#7dd3fc', '#dbeafe', '#f8fafc'], mts: ['#e2e8f0', '#cbd5e1'], hill: '#e0f2fe', top: '#f8fafc', top2: '#ffffff', dirt: ['#64748b', '#475569', '#7c8ba1'], liquid: ['#7dd3fc', '#38bdf8'], deco: ['pine', 'pine', 'rock', 'snowman', 'pine'], cloud: '#ffffff', snow: 1 }
    },
    start() {
      const ids = onlineIds(), L = this.L, segs = [], boxes = [], spins = [], saws = [], deco = [], checks = [0], plats = [], springs = [], spikes = [];
      const theme = pickR(Object.keys(this.THEMES));
      let x = -400, y = 360; const seg = (x0, y0, x1, y1) => segs.push({ x0, y0, x1, y1 });
      seg(-400, 360, 460, 360); x = 460; let k = 0, last = '';
      /* la pista se arma por tramos; mientras más avanzás, más difíciles y más seguidos son */
      while (x < L - 500) {
        const d = Math.max(0, Math.min(1, x / L)); k++;
        const opts = [['slope', 2.2], ['gap', 2 + d * 1.5], ['crates', 1.4], ['spin', 1.3 + d], ['saw', 1.1 + d], ['spikes', 1 + d * 1.6], ['platgap', .6 + d * 2], ['spring', .9 + d * .6], ['drop', 1.2], ['combo', d > .4 ? 1.5 * d : 0]].filter(o => o[0] !== last);
        let r = Math.random() * opts.reduce((a, o) => a + o[1], 0), t = opts[0][0]; for (const o of opts) { r -= o[1]; if (r <= 0) { t = o[0]; break; } } last = t;
        if (t === 'slope') { const nx = x + 260 + rand(220), ny = Math.max(240, Math.min(470, y + (Math.random() < .5 ? -1 : 1) * (40 + rand(80)))); seg(x, y, nx, ny); x = nx; y = ny; }
        else if (t === 'gap') { const w = Math.min(245, 115 + rand(60) + d * 80); x += w; const ny = Math.max(250, Math.min(470, y + rand(70) - 45)); const nx = x + 220 + rand(120); seg(x, ny, nx, ny); x = nx; y = ny; }
        else if (t === 'crates') { const nx = x + 340 + rand(80); seg(x, y, nx, y); const n = 1 + (d > .5 && Math.random() < .5 ? 1 : 0); for (let q = 0; q < n; q++) boxes.push({ x: x + 110 + q * 120 + rand(40), y, w: 46, h: Math.random() < .5 ? 46 : 70 }); x = nx; }
        else if (t === 'spin') { const nx = x + 320; seg(x, y, nx, y); spins.push({ x: x + 160, y: y - 82, len: 74 + d * 16, sp: (Math.random() < .5 ? -1 : 1) * (1.6 + Math.random() * .6 + d * .8), a: Math.random() * 3 }); x = nx; }
        else if (t === 'saw') { const nx = x + 320; seg(x, y, nx, y); saws.push({ x: x + 160, y: y - 10, r: 30, amp: 70 + rand(40), ph: Math.random() * 6, sp: 2 + Math.random() + d * .8 }); x = nx; }
        else if (t === 'spikes') { const nx = x + 340; seg(x, y, nx, y); const w = 64 + rand(20) + d * 50; spikes.push({ x0: x + 150, x1: x + 150 + w, y }); x = nx; }
        else if (t === 'platgap') { const w = 360 + rand(60) + d * 60; plats.push({ x: x + w / 2, y: y - 6, w: 120, ax: 85 + d * 40, ay: 0, sp: 1.2 + Math.random() * .5, ph: Math.random() * 6 }); x += w; const nx = x + 240; seg(x, y, nx, y); x = nx; }
        else if (t === 'spring') { if (y - 175 < 230) { const nx = x + 260, ny = Math.min(470, y + 110); seg(x, y, nx, ny); x = nx; y = ny; continue; } const nx = x + 300; seg(x, y, nx, y); springs.push({ x: nx - 70, y, t: 0 }); y -= 175; const n2 = nx + 260; seg(nx, y, n2, y); x = n2; }
        else if (t === 'drop') { const nx = x + 300 + rand(180), ny = Math.min(480, y + 60 + rand(70)); seg(x, y, nx, ny); x = nx; y = ny; }
        else { const nx = x + 520; seg(x, y, nx, y); spins.push({ x: x + 150, y: y - 82, len: 80, sp: 2.2, a: Math.random() * 3 }); saws.push({ x: x + 370, y: y - 10, r: 30, amp: 90, ph: Math.random() * 6, sp: 2.6 }); x = nx; }
        if (x - checks[checks.length - 1] > 1150) checks.push(x - 80);
      }
      seg(x, y, L + 800, y);
      segs.forEach((g, i) => { g.lw = !segs[i - 1] || segs[i - 1].x1 !== g.x0 || segs[i - 1].y1 !== g.y0; g.rw = !segs[i + 1] || segs[i + 1].x0 !== g.x1 || segs[i + 1].y0 !== g.y1; });
      /* decoración del mismo mundo (árboles, flores, faroles…) lejos de los obstáculos */
      const T = this.THEMES[theme], busy = [...boxes.map(b => b.x), ...spins.map(b => b.x), ...saws.map(b => b.x), ...springs.map(b => b.x), ...spikes.map(b => (b.x0 + b.x1) / 2)];
      for (let X = -300; X < L + 600; X += 90 + rand(160)) { const g = segs.find(s => X >= s.x0 + 30 && X <= s.x1 - 30); if (!g || Math.abs(g.y1 - g.y0) > 60 || busy.some(b => Math.abs(b - X) < 110)) continue; deco.push({ x: X, kind: pickR(T.deco), s: .75 + Math.random() * .5, seed: Math.random() }); }
      const ps = {}; ids.forEach((id, i) => { ps[id] = { x: -60 - i * 40, y: 360 - this.K.R, vx: 0, vy: 0, gnd: 0, buf: 0, lb: 0, rot: 0, cp: 0, done: 0, falls: 0, rescues: 0, out: 0, place: 0 }; });
      H.inp = {}; H.gd = { ids, segs, boxes, spins, saws, plats, springs, spikes, deco, checks, finish: L, ps, order: [], t: 0, sid: rid(), cam: { x: 200, y: 330, z: .8 }, theme, fx: [], acc: 0, stars: Array.from({ length: 70 }, () => [Math.random() * 1000, Math.random() * 330, Math.random()]) };
      setPhase('mb-ready', 3600, () => { SFX.go(); GAMES.marbles.go(); }, 0, false);
      rtLoop(null, GAMES.marbles.draw);
    },
    platAt(q, t) { const s = Math.sin(t * q.sp + q.ph), c = Math.cos(t * q.sp + q.ph); return [q.x + q.ax * s, q.y + q.ay * s, q.ax * q.sp * c, q.ay * q.sp * c]; },
    go() { const gd = H.gd; gd.t0 = Date.now(); setPhase('mb-go', 85000, () => GAMES.marbles.end()); rtLoop(dt => GAMES.marbles.step(dt), GAMES.marbles.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'mb-ready' || H.phase === 'mb-go') { const s = H.gd.ps?.[p.id]; return s && s.done ? { screen: 'msg', big: '🏁', title: `¡Llegaste ${s.place}º!`, text: 'Mirá la tele y apoyá a los demás 😄' } : joyView(p, '🕹️ Rodá → · Botón = SALTAR (también mientras rodás)', '⬆️ SALTAR', 0); }
      return watch();
    },
    onAct(p, m) { if (H.phase === 'mb-ready' || H.phase === 'mb-go') joyAct(p, m); },
    isDone(id) { return H.phase === 'mb-go' && !!H.gd.ps?.[id]?.done; },
    seg(x) { for (const s of H.gd.segs) if (x >= s.x0 && x <= s.x1) return s; return null; },
    groundY(x) { const s = GAMES.marbles.seg(x); return s ? s.y0 + (s.y1 - s.y0) * (x - s.x0) / (s.x1 - s.x0) : null; },
    safeX(x) { let X = x; for (let k = 0; k < 60; k++) { const s = GAMES.marbles.seg(X); if (s && X - s.x0 > 30 && s.x1 - X > 30) return X; X += 20; } return x; },
    respawn(s, x, why) {
      const gd = H.gd, X = this.safeX(x), gy = this.groundY(X) ?? 360;
      Object.assign(s, { x: X, y: gy - this.K.R - 40, vx: 0, vy: 0, gnd: 0 });
      gd.fx.push({ k: why === 'bubble' ? 'bubble' : 'txt', x: X, y: gy - 80, t: 0, txt: why === 'bubble' ? '🫧 ¡Al rescate!' : '¡Al hueco! 😵', c: why === 'bubble' ? '#38bdf8' : '#ef4444' });
      SND.play(why === 'bubble' ? 'ui_glass_002' : 'ui_error_004', .4);
    },
    phys(id, s, i, dt) {
      const K = this.K, go = H.phase === 'mb-go', gd = H.gd, ix = go ? Math.max(-1, Math.min(1, i.x)) : 0;
      s.gnd -= dt; s.buf -= dt;
      if (i.b !== s.lb) { s.lb = i.b; if (go) s.buf = K.BUF; }
      const onG = s.gnd > 0, sg = this.seg(s.x), slope = sg ? (sg.y1 - sg.y0) / (sg.x1 - sg.x0) : 0;
      if (onG) {
        s.vx += ix * K.ACC * dt + slope * K.G * .55 * dt;
        if (!ix) s.vx *= Math.max(0, 1 - K.FRIC * dt);
        if (ix && Math.sign(ix) !== Math.sign(s.vx)) s.vx *= Math.max(0, 1 - 5 * dt);   // frenar rápido al cambiar de dirección
      } else s.vx += ix * K.ACC * K.AIR * dt;
      const mx = K.MAX * (1 + Math.max(0, slope) * .8); s.vx = Math.max(-mx, Math.min(mx, s.vx));
      if (s.buf > 0 && s.gnd > -K.COY) { s.vy = -K.JUMP; s.gnd = -1; s.buf = 0; SND.play('ui_pluck_002', .35, 1.3, 0); gd.fx.push({ k: 'dust', x: s.x, y: s.y + K.R, t: 0 }); }
      s.vy += K.G * dt; if (s.vy > 1400) s.vy = 1400;
      const px = s.x, py = s.y; s.x += s.vx * dt; s.y += s.vy * dt;
      /* suelo */
      const gy = this.groundY(s.x);
      if (gy != null) {
        if (s.y + K.R > gy) {
          if (py + K.R <= gy + 18 || s.vy >= 0 && s.y + K.R - gy < 28) { s.y = gy - K.R; if (s.vy > 0) s.vy = s.vy > 650 ? -s.vy * .22 : 0; s.gnd = K.COY; }
          else { s.x = px; s.vx = -s.vx * .25; }   // chocó contra el borde de una plataforma más alta
        } else if (s.gnd > 0 && s.vy >= 0 && gy - (s.y + K.R) < 14) { s.y = gy - K.R; s.gnd = K.COY; }   // seguir las bajadas sin despegar
      }
      /* cajas */
      for (const b of gd.boxes) {
        const cx = Math.max(b.x - b.w / 2, Math.min(b.x + b.w / 2, s.x)), cy = Math.max(b.y - b.h, Math.min(b.y, s.y)), dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy);
        if (d < K.R && d > 0) { const nx = dx / d, ny = dy / d, pen = K.R - d; s.x += nx * pen; s.y += ny * pen; if (ny < -.6) { if (s.vy > 0) s.vy = 0; s.gnd = K.COY; } else { const vn = s.vx * nx + s.vy * ny; if (vn < 0) { s.vx -= 1.3 * vn * nx; s.vy -= 1.3 * vn * ny; } } }
        else if (d === 0) s.y = b.y - b.h - K.R;
      }
      /* barras que giran: empujan con la velocidad de su punta */
      for (const b of gd.spins) {
        const ca = Math.cos(b.a), sa = Math.sin(b.a), ax = b.x - ca * b.len, ay = b.y - sa * b.len, bx = b.x + ca * b.len, by = b.y + sa * b.len;
        const t = Math.max(0, Math.min(1, ((s.x - ax) * (bx - ax) + (s.y - ay) * (by - ay)) / ((2 * b.len) ** 2))), qx = ax + (bx - ax) * t, qy = ay + (by - ay) * t, dx = s.x - qx, dy = s.y - qy, d = Math.hypot(dx, dy);
        if (d < K.R + 9 && d > 0) { const nx = dx / d, ny = dy / d; s.x = qx + nx * (K.R + 9); s.y = qy + ny * (K.R + 9); const rr = (t - .5) * 2 * b.len, tvx = -sa * rr * b.sp, tvy = ca * rr * b.sp; const vn = (s.vx - tvx) * nx + (s.vy - tvy) * ny; if (vn < 0) { s.vx -= 1.6 * vn * nx; s.vy -= 1.6 * vn * ny; SND.play('impactPlate_light_000', .3, 1.2); } if (ny < -.7) s.gnd = K.COY; }
      }
      /* sierras: rebote fuerte hacia atrás */
      for (const w of gd.saws) {
        const wy = w.y - Math.abs(Math.sin(gd.t * w.sp + w.ph)) * w.amp, d = Math.hypot(s.x - w.x, s.y - wy);
        if (d < K.R + w.r - 6 && !s.saw) { s.saw = .5; s.vx = (s.x < w.x ? -1 : 1) * 420; s.vy = -420; SFX.hit(); gd.fx.push({ k: 'txt', x: s.x, y: s.y - 30, t: 0, txt: '¡Auch! 🪚', c: '#f97316' }); }
      }
      /* plataformas que se mueven: te llevan encima */
      for (const q of gd.plats) { const [px, py, pvx, pvy] = this.platAt(q, gd.t), cx = Math.max(px - q.w / 2, Math.min(px + q.w / 2, s.x)), cy = Math.max(py, Math.min(py + 18, s.y)), dx = s.x - cx, dy = s.y - cy, d = Math.hypot(dx, dy);
        if (d < K.R) { const nx = d ? dx / d : 0, ny = d ? dy / d : -1; s.x = cx + nx * K.R; s.y = cy + ny * K.R; if (ny < -.6) { if (s.vy > pvy) s.vy = pvy; s.gnd = K.COY; s.x += pvx * dt; } else { const vn = (s.vx - pvx) * nx + (s.vy - pvy) * ny; if (vn < 0) { s.vx -= 1.3 * vn * nx; s.vy -= 1.3 * vn * ny; } } } }
      /* resortes: te lanzan bien alto */
      for (const q of gd.springs) if (Math.abs(s.x - q.x) < 28 && s.y + K.R > q.y - 46 && s.y < q.y && s.vy > -200) { s.vy = -1120; s.gnd = -1; s.buf = 0; q.t = .25; SND.play('ui_pluck_002', .5, .7, 0); gd.fx.push({ k: 'dust', x: q.x, y: q.y - 20, t: 0 }); }
      /* pinchos: rebote hacia atrás */
      for (const q of gd.spikes) if (!s.saw && s.x + K.R * .6 > q.x0 && s.x - K.R * .6 < q.x1 && s.y + K.R > q.y - 22) { s.saw = .5; s.vx = -300; s.vy = -420; SFX.hit(); gd.fx.push({ k: 'txt', x: s.x, y: s.y - 30, t: 0, txt: '¡Pinchos! 😵', c: '#f97316' }); }
      if (s.saw) { s.saw -= dt; if (s.saw <= 0) s.saw = 0; }
      s.rot += s.vx * dt / K.R;
    },
    step(dt) {
      const gd = H.gd, K = this.K; gd.t += dt;
      gd.spins.forEach(b => b.a += b.sp * dt); gd.springs.forEach(q => q.t -= dt);
      gd.acc += dt; let n = 0;
      while (gd.acc >= 1 / 120 && n++ < 10) {
        const h = 1 / 120; gd.acc -= h;
        for (const id of gd.ids) { const s = gd.ps[id]; if (s.done) { s.vx *= .97; s.x += s.vx * h; const gy = this.groundY(s.x); if (gy != null) s.y = gy - K.R; s.rot += s.vx * h / K.R; continue; } this.phys(id, s, inp(id), h); }
        /* choques entre canicas */
        for (let a = 0; a < gd.ids.length; a++) for (let b = a + 1; b < gd.ids.length; b++) {
          const A = gd.ps[gd.ids[a]], B = gd.ps[gd.ids[b]], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
          if (d > 0 && d < K.R * 2) { const nx = dx / d, ny = dy / d, pen = (K.R * 2 - d) / 2; A.x -= nx * pen; A.y -= ny * pen; B.x += nx * pen; B.y += ny * pen; const vn = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny; if (vn < 0) { const j = -vn * .9; A.vx -= j * nx; A.vy -= j * ny; B.vx += j * nx; B.vy += j * ny; } if (ny < -.6) B.gnd = K.COY; if (ny > .6) A.gnd = K.COY; }
        }
      }
      const camL = gd.cam.x - 500 / gd.cam.z;
      for (const id of gd.ids) {
        const s = gd.ps[id]; if (s.done) continue;
        while (s.cp + 1 < gd.checks.length && s.x > gd.checks[s.cp + 1]) { s.cp++; SND.play('ui_select_003', .3); }
        if (s.y > 572 && !s.wet) { s.wet = 1; gd.fx.push({ k: 'splash', x: s.x, y: 560, t: 0 }); SND.play('impactGlass_light_000', .35, .6); }
        if (s.y > 660) { s.falls++; s.wet = 0; this.respawn(s, gd.checks[s.cp] + 40, 'fall'); }
        /* nadie se queda fuera de la tele: si se sale por la izquierda, una burbuja lo trae */
        if (H.phase === 'mb-go' && s.x < camL + 10) { s.out += dt; if (s.out > .35) { s.out = 0; s.rescues++; this.respawn(s, camL + 230, 'bubble'); } } else s.out = 0;
        if (s.x >= gd.finish) { s.done = Date.now() - gd.t0; gd.order.push(id); s.place = gd.order.length; SFX.win(); if (s.place === 1) { SND.voice('winner'); confetti(80); } gd.fx.push({ k: 'txt', x: s.x, y: s.y - 50, t: 0, txt: `🏁 ${s.place}º`, c: '#facc15' }); sync(); updateStrip();
          if (gd.ids.every(q => gd.ps[q].done || !pl(q)?.online)) setTimeout(() => { if (H.phase === 'mb-go' && H.gd === gd) this.end(); }, 1500); }
      }
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < 1.1);
    },
    /* texturas del suelo hechas una sola vez por tema */
    dirtPat(ctx, T) {
      const gd = H.gd; if (gd.dirt && gd.dirtc === ctx) return gd.dirt;
      const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
      g.fillStyle = T.dirt[0]; g.fillRect(0, 0, 128, 128);
      for (let k = 0; k < 26; k++) { g.fillStyle = k % 2 ? T.dirt[1] : T.dirt[2]; g.globalAlpha = .55; g.beginPath(); g.ellipse(Math.random() * 128, Math.random() * 128, 6 + Math.random() * 12, 3 + Math.random() * 6, Math.random() * 3, 0, 7); g.fill(); }
      g.globalAlpha = .35; g.fillStyle = '#000'; for (let k = 0; k < 40; k++) g.fillRect(Math.random() * 128, Math.random() * 128, 3, 3);
      g.globalAlpha = .25; g.fillStyle = '#fff'; for (let k = 0; k < 18; k++) { g.beginPath(); g.arc(Math.random() * 128, Math.random() * 128, 1.5 + Math.random() * 2, 0, 7); g.fill(); }
      gd.dirtc = ctx; gd.dirt = ctx.createPattern(c, 'repeat'); return gd.dirt;
    },
    drawDeco(ctx, d, gy, T, t) {
      const s = d.s, x = d.x;
      ctx.save(); ctx.translate(x, gy); ctx.scale(s, s);
      if (d.kind === 'tree') { ctx.fillStyle = '#7c4a26'; ctx.fillRect(-7, -70, 14, 70); const sway = Math.sin(t * 1.2 + d.seed * 6) * 3; ctx.fillStyle = T.top; [[0, -95, 38], [-24, -78, 28], [24, -78, 28], [0, -122, 28]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a + sway, b, r, 0, 7); ctx.fill(); }); ctx.fillStyle = '#ffffff22'; ctx.beginPath(); ctx.arc(-10 + sway, -110, 14, 0, 7); ctx.fill(); }
      else if (d.kind === 'pine') { ctx.fillStyle = '#5b3418'; ctx.fillRect(-5, -26, 10, 26); for (let q = 0; q < 3; q++) { ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.moveTo(-36 + q * 7, -20 - q * 32); ctx.lineTo(0, -70 - q * 32); ctx.lineTo(36 - q * 7, -20 - q * 32); ctx.fill(); ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(-14 + q * 3, -52 - q * 32); ctx.lineTo(0, -70 - q * 32); ctx.lineTo(14 - q * 3, -52 - q * 32); ctx.fill(); } }
      else if (d.kind === 'bush') { ctx.fillStyle = T.top; [[-20, -14, 18], [0, -22, 22], [20, -14, 18]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fill(); }); ctx.fillStyle = '#ffffff30'; ctx.beginPath(); ctx.arc(-4, -30, 8, 0, 7); ctx.fill(); }
      else if (d.kind === 'flowers') { for (let q = 0; q < 5; q++) { const fx = -30 + q * 15, fh = 14 + (q * 7) % 12; ctx.strokeStyle = '#15803d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx, -fh); ctx.stroke(); ctx.fillStyle = ['#f472b6', '#facc15', '#ffffff', '#a78bfa', '#fb7185'][q]; ctx.beginPath(); ctx.arc(fx, -fh, 6, 0, 7); ctx.fill(); ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(fx, -fh, 2.5, 0, 7); ctx.fill(); } }
      else if (d.kind === 'rock') { ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-24, -22); ctx.lineTo(-4, -32); ctx.lineTo(20, -24); ctx.lineTo(30, 0); ctx.fill(); ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(-4, -30); ctx.lineTo(4, -18); ctx.fill(); }
      else if (d.kind === 'cactus') { ctx.fillStyle = '#4d7c0f'; ctx.fillRect(-9, -70, 18, 70); ctx.fillRect(-28, -46, 12, 26); ctx.fillRect(-28, -28, 24, 10); ctx.fillRect(16, -56, 12, 30); ctx.fillRect(6, -34, 22, 10); }
      else if (d.kind === 'snowman') { ctx.fillStyle = '#fff'; [[0, -18, 20], [0, -50, 15], [0, -73, 11]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fill(); }); ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(2, -73); ctx.lineTo(16, -71); ctx.lineTo(2, -69); ctx.fill(); ctx.fillStyle = '#1f2937'; ctx.fillRect(-12, -88, 24, 5); ctx.fillRect(-8, -102, 16, 15); }
      else if (d.kind === 'lamp') { ctx.fillStyle = '#334155'; ctx.fillRect(-3, -90, 6, 90); ctx.fillRect(-10, -96, 20, 8); const glow = ctx.createRadialGradient(0, -86, 2, 0, -86, 60); glow.addColorStop(0, '#fde68acc'); glow.addColorStop(1, '#fde68a00'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, -86, 60, 0, 7); ctx.fill(); ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.arc(0, -84, 7, 0, 7); ctx.fill(); }
      ctx.restore();
    },
    draw(ctx) {
      const gd = H.gd, M = GAMES.marbles, R = M.K.R, T = M.THEMES[gd.theme] || M.THEMES.dia, t = gd.t, lowq = window.__lowq;
      /* cámara: sigue al de adelante y nunca retrocede; los que quedan atrás los rescata la burbuja */
      const live = gd.ids.filter(id => !gd.ps[id].done), xs = (live.length ? live : gd.ids).map(id => gd.ps[id].x), lead = Math.max(...xs), tail = Math.min(...xs);
      const z = Math.max(.7, Math.min(.95, 1000 / (lead - tail + 520))), want = Math.max(gd.cam.x, Math.min(lead - 220, (lead + tail) / 2 + 150));
      gd.cam.z += (z - gd.cam.z) * .04; gd.cam.x += (want - gd.cam.x) * .09;
      const gyc = M.groundY(gd.cam.x) ?? 360; gd.cam.y += (Math.min(420, Math.max(260, gyc - 40)) - gd.cam.y) * .06;
      const c = gd.cam;
      /* cielo, sol/luna, estrellas, nubes, montañas en capas */
      if (!gd.skyG || gd.skyC !== ctx) { gd.skyC = ctx; gd.skyG = ctx.createLinearGradient(0, 0, 0, 600); T.sky.forEach((col, i) => gd.skyG.addColorStop(i / (T.sky.length - 1), col)); }
      ctx.fillStyle = gd.skyG; ctx.fillRect(0, 0, 1000, 600);
      if (T.stars) for (const [sx, sy, sz] of gd.stars) { ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * 2 + sz * 9)); ctx.fillStyle = '#fff'; ctx.fillRect((sx - c.x * .02 + 2000) % 1000, sy, 1 + sz * 2, 1 + sz * 2); } ctx.globalAlpha = 1;
      if (T.sun) { ctx.fillStyle = '#fde68a'; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(760, 300, 80, 0, 7); ctx.fill(); ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(760, 300, 120, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      if (T.moon) { ctx.fillStyle = '#e0e7ff33'; ctx.beginPath(); ctx.arc(800, 110, 62, 0, 7); ctx.fill(); ctx.fillStyle = '#f1f5f9'; ctx.beginPath(); ctx.arc(800, 110, 40, 0, 7); ctx.fill(); ctx.fillStyle = '#cbd5e1'; [[788, 100, 8], [812, 118, 6], [804, 94, 4], [790, 124, 5]].forEach(([a, b, r]) => { ctx.beginPath(); ctx.arc(a, b, r, 0, 7); ctx.fill(); }); }
      ctx.fillStyle = T.cloud; ctx.globalAlpha = T.stars ? .35 : .9; for (let k = 0; k < 5; k++) { const cx = ((k * 280 - c.x * .08 - t * 6) % 1400 + 1400) % 1400 - 200, cy = 60 + (k % 3) * 48; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 7); ctx.arc(cx + 30, cy - 14, 32, 0, 7); ctx.arc(cx + 64, cy, 24, 0, 7); ctx.rect(cx, cy, 64, 20); ctx.fill(); } ctx.globalAlpha = 1;
      [[.06, T.mts[0], 330, 140, .0025], [.14, T.mts[1], 380, 110, .004], [.3, T.hill, 440, 60, .007]].forEach(([par, col, base, amp, f]) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 600); for (let X = 0; X <= 1000; X += 25) { const wx = X + c.x * par; const h = Math.abs(Math.sin(wx * f)) * amp + Math.sin(wx * f * 2.7) * amp * .25; ctx.lineTo(X, base - h); } ctx.lineTo(1000, 600); ctx.fill(); if (T.snow && col === T.mts[0]) { ctx.fillStyle = '#ffffffaa'; } });
      ctx.save(); ctx.translate(500, 330); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y);
      const vL = c.x - 500 / c.z - 60, vR = c.x + 500 / c.z + 60, vis = (a, b) => b > vL && a < vR;
      /* agua o lava en el fondo de los huecos */
      { const ly = 560; ctx.fillStyle = T.liquid[1]; ctx.fillRect(vL, ly, vR - vL, 900); ctx.fillStyle = T.liquid[0]; ctx.beginPath(); ctx.moveTo(vL, ly + 400); for (let X = vL - (vL % 30); X <= vR; X += 30) ctx.lineTo(X, ly + Math.sin(X * .05 + t * 3) * 6); ctx.lineTo(vR, ly + 400); ctx.fill(); }
      for (const d of gd.deco) { if (!vis(d.x - 80, d.x + 80)) continue; const gy = M.groundY(d.x); if (gy == null) continue; M.drawDeco(ctx, d, gy + 2, T, t); }
      /* suelo con textura + borde de pasto/nieve */
      const dirt = M.dirtPat(ctx, T);
      for (const sg of gd.segs) {
        if (!vis(sg.x0, sg.x1)) continue;
        ctx.fillStyle = dirt; ctx.beginPath(); ctx.moveTo(sg.x0, sg.y0); ctx.lineTo(sg.x1, sg.y1); ctx.lineTo(sg.x1, 1300); ctx.lineTo(sg.x0, 1300); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#00000055'; ctx.lineWidth = 4; ctx.beginPath(); if (sg.lw) { ctx.moveTo(sg.x0, 1300); ctx.lineTo(sg.x0, sg.y0); } if (sg.rw) { ctx.moveTo(sg.x1, sg.y1); ctx.lineTo(sg.x1, 1300); } ctx.stroke();
        ctx.lineCap = 'round'; ctx.strokeStyle = T.top; ctx.lineWidth = 18; ctx.beginPath(); ctx.moveTo(sg.x0 + (sg.lw ? 4 : 0), sg.y0 + 5); ctx.lineTo(sg.x1 - (sg.rw ? 4 : 0), sg.y1 + 5); ctx.stroke();
        ctx.strokeStyle = T.top2; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sg.x0 + 6, sg.y0 - 1); ctx.lineTo(sg.x1 - 6, sg.y1 - 1); ctx.stroke(); ctx.lineCap = 'butt';
        if (!lowq && !T.snow) { ctx.fillStyle = T.top; const len = sg.x1 - sg.x0; for (let X = sg.x0 + 14; X < sg.x1 - 10; X += 26) { const gy = sg.y0 + (sg.y1 - sg.y0) * (X - sg.x0) / len; ctx.beginPath(); ctx.moveTo(X - 5, gy); ctx.lineTo(X - 1, gy - 9 - ((X * 7) % 5)); ctx.lineTo(X + 3, gy); ctx.fill(); } }
      }
      /* plataformas que se mueven */
      for (const q of gd.plats) { const [px, py] = M.platAt(q, t); if (!vis(px - 90, px + 90)) continue; ctx.fillStyle = '#334155'; ctx.fillRect(px - q.w / 2, py, q.w, 18); ctx.fillStyle = '#facc15'; for (let X = 0; X < q.w; X += 20) { ctx.beginPath(); ctx.moveTo(px - q.w / 2 + X, py); ctx.lineTo(px - q.w / 2 + X + 10, py); ctx.lineTo(px - q.w / 2 + X + 4, py + 7); ctx.lineTo(px - q.w / 2 + X - 6, py + 7); ctx.fill(); } ctx.fillStyle = '#94a3b8'; ctx.fillRect(px - q.w / 2, py + 14, q.w, 4); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.strokeRect(px - q.w / 2, py, q.w, 18); ctx.strokeStyle = '#94a3b8aa'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(q.x - q.ax - q.w / 2, q.y + 9); ctx.lineTo(q.x + q.ax + q.w / 2, q.y + 9); ctx.stroke(); ctx.setLineDash([]); }
      /* cajas de madera */
      for (const b of gd.boxes) if (vis(b.x - 40, b.x + 40)) { const x0 = b.x - b.w / 2, y0 = b.y - b.h; ctx.fillStyle = '#b45309'; ctx.fillRect(x0, y0, b.w, b.h); ctx.fillStyle = '#d97706'; ctx.fillRect(x0 + 5, y0 + 5, b.w - 10, b.h - 10); ctx.strokeStyle = '#78350f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x0 + 6, y0 + 6); ctx.lineTo(x0 + b.w - 6, y0 + b.h - 6); ctx.moveTo(x0 + b.w - 6, y0 + 6); ctx.lineTo(x0 + 6, y0 + b.h - 6); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#1a1033'; ctx.strokeRect(x0, y0, b.w, b.h); }
      /* resortes */
      for (const q of gd.springs) if (vis(q.x - 40, q.x + 40)) { const k = q.t > 0 ? .45 : 1; ctx.fillStyle = '#475569'; ctx.fillRect(q.x - 26, q.y - 8, 52, 8); ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5; ctx.beginPath(); for (let j = 0; j <= 6; j++) ctx.lineTo(q.x + (j % 2 ? 14 : -14), q.y - 8 - j * 5 * k); ctx.stroke(); ctx.fillStyle = '#ef4444'; ctx.fillRect(q.x - 28, q.y - 14 - 30 * k, 56, 10); ctx.fillStyle = '#fca5a5'; ctx.fillRect(q.x - 24, q.y - 13 - 30 * k, 48, 3); emo(ctx, '⬆️', q.x, q.y - 70 - Math.abs(Math.sin(t * 4)) * 8, 26); }
      /* pinchos */
      for (const q of gd.spikes) if (vis(q.x0 - 20, q.x1 + 20)) { ctx.fillStyle = '#475569'; ctx.fillRect(q.x0 - 4, q.y - 6, q.x1 - q.x0 + 8, 8); for (let X = q.x0; X < q.x1; X += 14) { ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); ctx.moveTo(X, q.y - 4); ctx.lineTo(X + 7, q.y - 26); ctx.lineTo(X + 14, q.y - 4); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(X + 5, q.y - 8); ctx.lineTo(X + 7, q.y - 22); ctx.lineTo(X + 8, q.y - 8); ctx.fill(); ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X, q.y - 4); ctx.lineTo(X + 7, q.y - 26); ctx.lineTo(X + 14, q.y - 4); ctx.stroke(); } }
      /* barras que giran */
      for (const b of gd.spins) if (vis(b.x - 100, b.x + 100)) { ctx.fillStyle = '#64748b'; ctx.fillRect(b.x - 4, b.y, 8, 90); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); const L2 = b.len; ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(-L2, -9, L2 * 2, 18, 9); ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = '#ef4444'; for (let X = -L2; X < L2; X += 24) ctx.fillRect(X, -9, 12, 18); ctx.restore(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-L2, -9, L2 * 2, 18, 9); ctx.stroke(); ctx.restore(); ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3; ctx.stroke(); }
      /* sierras */
      for (const w of gd.saws) if (vis(w.x - 60, w.x + 60)) { const wy = w.y - Math.abs(Math.sin(t * w.sp + w.ph)) * w.amp; ctx.strokeStyle = '#00000044'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x, w.y - w.amp); ctx.stroke(); ctx.lineCap = 'butt'; ctx.save(); ctx.translate(w.x, wy); ctx.rotate(t * 9); ctx.fillStyle = '#cbd5e1'; ctx.beginPath(); for (let j = 0; j < 24; j++) { const a = j / 24 * Math.PI * 2, rr = j % 2 ? w.r : w.r + 9; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#94a3b8'; ctx.beginPath(); ctx.arc(0, 0, w.r * .55, 0, 7); ctx.fill(); ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill(); ctx.restore(); }
      /* banderas de control y meta */
      gd.checks.slice(1).forEach(cx => { if (!vis(cx - 40, cx + 40)) return; const gy = M.groundY(cx) ?? 360, passed = gd.ids.some(id => gd.ps[id].x > cx); ctx.fillStyle = '#e2e8f0'; ctx.fillRect(cx - 3, gy - 80, 6, 80); ctx.fillStyle = passed ? '#22c55e' : '#facc15'; ctx.beginPath(); ctx.moveTo(cx + 3, gy - 80); ctx.quadraticCurveTo(cx + 22, gy - 74 + Math.sin(t * 6) * 4, cx + 40, gy - 68); ctx.lineTo(cx + 3, gy - 56); ctx.fill(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 2; ctx.stroke(); });
      { const fx = gd.finish, fy = M.groundY(fx) ?? 360; for (const sd of [-60, 60]) { ctx.fillStyle = '#1f2937'; ctx.fillRect(fx + sd - 6, fy - 230, 12, 230); } ctx.save(); ctx.beginPath(); ctx.rect(fx - 66, fy - 250, 132, 44); ctx.clip(); for (let r = 0; r < 4; r++) for (let q = 0; q < 12; q++) { ctx.fillStyle = (r + q) % 2 ? '#111' : '#fff'; ctx.fillRect(fx - 66 + q * 11, fy - 250 + r * 11, 11, 11); } ctx.restore(); ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 4; ctx.strokeRect(fx - 66, fy - 250, 132, 44); ctx.fillStyle = '#facc15'; ctx.font = '900 30px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeText('META', fx, fy - 266); ctx.fillText('META', fx, fy - 266); ctx.globalAlpha = .25; for (let r = 0; r < 10; r++) for (let q = 0; q < 2; q++) { ctx.fillStyle = (r + q) % 2 ? '#111' : '#fff'; ctx.fillRect(fx - 10 + q * 10, fy - 200 + r * 20, 10, 20); } ctx.globalAlpha = 1; }
      for (const f of gd.fx) {
        if (f.k === 'dust') { if (f.t >= 1) continue; ctx.globalAlpha = 1 - f.t; ctx.fillStyle = '#fff'; for (let j = -1; j <= 1; j += 2) { ctx.beginPath(); ctx.arc(f.x + j * f.t * 40, f.y - f.t * 10, Math.max(.1, 6 * (1 - f.t)), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
        else if (f.k === 'bubble') { ctx.globalAlpha = Math.max(0, 1 - f.t); ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 4; ctx.fillStyle = '#bae6fd55'; ctx.beginPath(); ctx.arc(f.x, f.y + 40, 30 + f.t * 30, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1; }
        else if (f.k === 'splash') { if (f.t >= 1) continue; ctx.globalAlpha = 1 - f.t; ctx.fillStyle = T.liquid[0]; for (let j = 0; j < 6; j++) { const a = -Math.PI / 2 + (j - 2.5) * .35; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * f.t * 70, f.y + Math.sin(a) * f.t * 90 + f.t * f.t * 120, 7 * (1 - f.t), 0, 7); ctx.fill(); } ctx.globalAlpha = 1; }
        if (f.txt) { ctx.globalAlpha = Math.max(0, 1 - f.t); ctx.fillStyle = f.c; ctx.font = '900 26px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#1a1033'; ctx.strokeText(f.txt, f.x, f.y - f.t * 40); ctx.fillText(f.txt, f.x, f.y - f.t * 40); ctx.globalAlpha = 1; }
      }
      /* canicas de vidrio */
      for (const id of gd.ids) {
        const s = gd.ps[id], p = pl(id), col = p?.color || '#888';
        const gy = M.groundY(s.x); if (gy != null && gy > s.y) { ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(s.x, gy + 2, 16 * Math.max(.35, 1 - (gy - s.y) / 300), 5, 0, 0, 7); ctx.fill(); }
        if (!lowq && Math.abs(s.vx) > 300) for (let j = 1; j <= 3; j++) { ctx.globalAlpha = .18 / j; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s.x - s.vx * .025 * j, s.y - s.vy * .012 * j, R, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
        if (!s.gr || s.grc !== ctx || s.grcol !== col) { s.grc = ctx; s.grcol = col; s.gr = ctx.createRadialGradient(-7, -8, 2, 0, 0, R + 2); s.gr.addColorStop(0, '#ffffff'); s.gr.addColorStop(.25, col); s.gr.addColorStop(.85, col); s.gr.addColorStop(1, '#00000066'); }
        ctx.save(); ctx.translate(s.x, s.y); ctx.save(); ctx.rotate(s.rot); ctx.fillStyle = s.gr; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffffff66'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R - 6, .3, 2.2); ctx.stroke(); ctx.strokeStyle = '#00000033'; ctx.beginPath(); ctx.arc(0, 0, R - 6, 3.4, 5.3); ctx.stroke(); ctx.restore();
        ctx.lineWidth = 3; ctx.strokeStyle = '#1a1033'; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
        emo(ctx, p?.emoji || '?', 0, 1, 15);
        ctx.fillStyle = '#ffffffcc'; ctx.beginPath(); ctx.ellipse(-6, -9, 6, 3.5, -.6, 0, 7); ctx.fill(); ctx.restore();
        pill2(ctx, s.x, s.y - 36, `${p?.name || '?'}${s.done ? ' 🏁' + s.place : ''}`, col, 14);
      }
      ctx.restore();
      /* barra de progreso con banderitas de control */
      ctx.fillStyle = '#0009'; ctx.beginPath(); ctx.roundRect(140, 562, 720, 26, 13); ctx.fill(); ctx.fillStyle = '#ffffff22'; ctx.beginPath(); ctx.roundRect(150, 571, 700, 8, 4); ctx.fill();
      gd.checks.slice(1).forEach(cx => { const px = 150 + Math.max(0, Math.min(1, cx / gd.finish)) * 700; ctx.fillStyle = '#facc15'; ctx.fillRect(px - 1, 566, 2, 18); });
      for (const id of gd.ids.slice().sort((a, b) => gd.ps[a].x - gd.ps[b].x)) { const px = Math.max(0, Math.min(1, gd.ps[id].x / gd.finish)); ctx.fillStyle = pl(id)?.color || '#888'; ctx.beginPath(); ctx.arc(150 + px * 700, 575, 10, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
      emo(ctx, '🏁', 878, 574, 22);
      ctx.fillStyle = '#ffffffdd'; ctx.font = '900 15px Nunito, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`🌍 ${T.name}`, 16, 586);
    },
    end() {
      if (H.phase !== 'mb-go') return;
      const gd = H.gd, sc = id => gd.ps[id].done ? 100000 - gd.ps[id].done / 10 : gd.ps[id].x / 10;
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => { const s = gd.ps[id]; return { id, val: s.done ? `🏁 ${(s.done / 1000).toFixed(1)} s` : `📏 ${Math.round(Math.max(0, s.x) / gd.finish * 100)}% del camino`, gain: g[id] || 0 }; });
      setPhase('mb-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'mb-ready') return canvasHTML(true, '🔵 ¡A rodar!');
      if (ph === 'mb-go') return canvasHTML(false);
      return `<h1 class="title-pop">🔵 Las canicas más veloces</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
