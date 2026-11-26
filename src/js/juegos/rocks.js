Object.assign(GAMES, {
  /* =================================================================== */
  /* ☄️ ASTEROIDES                                                        */
  /* =================================================================== */
  rocks: {
    name: 'Asteroides', emoji: '☄️', color: '#4338ca',
    desc: 'Pilotá tu nave 🚀 con el joystick y DISPARÁ a los meteoros: los grandes se parten en pedazos. Los ovnis 👾 valen mucho. Si te choca un meteoro perdés puntos. ¡Y cuidado con los disparos de los demás! 60 segundos.',
    start() {
      const ids = onlineIds();
      ['ship_A', 'ship_B', 'ship_C', 'ship_D', 'ship_E', 'ship_F', 'ship_G', 'ship_H', 'ship_I', 'ship_J', 'ship_K', 'ship_L', 'meteor_detailedLarge', 'meteor_detailedSmall', 'meteor_squareDetailedLarge', 'meteor_squareDetailedSmall', 'enemy_A', 'enemy_B', 'enemy_C', 'enemy_D', 'enemy_E', 'effect_yellow', 'effect_purple', 'star_large', 'star_medium', 'star_small', 'station_A', 'station_B', 'satellite_A'].forEach(f => IMG('space/' + f + '.png'));
      const ships = shuffle('ABCDEFGHIJKL'.split('')), ps = {};
      ids.forEach((id, i) => { const a = i / ids.length * Math.PI * 2; ps[id] = { x: 500 + Math.cos(a) * 140, y: 300 + Math.sin(a) * 100, a: a, vx: 0, vy: 0, alive: true, resp: 0, inv: 2, cd: 0, lb: 0, pts: 0, rocks: 0, ufo: 0, hits: 0, crash: 0, ship: ships[i % 12] }; });
      const stars = Array.from({ length: 90 }, () => ({ x: Math.random() * 1000, y: Math.random() * 600, z: .2 + Math.random() * .8 }));
      H.inp = {}; H.gd = { ids, ps, rocks: [], ufos: [], bul: [], fx: [], stars, t: 0, sid: rid(), spawn: 0, ufoT: 8 + Math.random() * 6, deco: pickR(['station_A', 'station_B', 'satellite_A']) };
      for (let k = 0; k < 4 + Math.min(4, ids.length); k++) this.rock(true);
      setPhase('as-ready', 3600, () => { SFX.go(); GAMES.rocks.go(); }, 0, false);
      rtLoop(null, GAMES.rocks.draw);
    },
    rock(edge, x, y, big = true) {
      const gd = H.gd, sq = Math.random() < .4;
      if (edge) { const s = rand(4); x = s === 0 ? -40 : s === 1 ? 1040 : Math.random() * 1000; y = s === 2 ? -40 : s === 3 ? 640 : Math.random() * 600; }
      const a = Math.random() * 6.28, sp = (big ? 45 : 85) + Math.random() * 50 + gd.t * .6;
      gd.rocks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: big ? 40 : 21, big, rot: Math.random() * 6, vr: (Math.random() - .5) * 2, img: (sq ? 'meteor_squareDetailed' : 'meteor_detailed') + (big ? 'Large' : 'Small'), hp: big ? 2 : 1, hit: 0 });
    },
    go() { setPhase('as-go', 60000, () => GAMES.rocks.end()); rtLoop(dt => GAMES.rocks.step(dt), GAMES.rocks.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'as-ready' || H.phase === 'as-go') { const s = H.gd.ps[p.id]; return s && !s.alive && H.phase === 'as-go' ? { screen: 'msg', big: '☄️', title: '¡Te chocó un meteoro!', text: 'Tu nave vuelve en un toque 🚀' } : joyView(p, '🕹️ Pilotá tu nave · Botón = DISPARAR', '🔫 DISPARAR', .25); }
      return watch();
    },
    onAct(p, m) { if (H.phase === 'as-ready' || H.phase === 'as-go') joyAct(p, m); },
    isDone(id) { const s = H.gd.ps && H.gd.ps[id]; return H.phase === 'as-go' && s && !s.alive; },
    pop(x, y, txt, c) { H.gd.fx.push({ k: 'txt', x, y, t: 0, txt, c }); },
    step(dt) {
      const gd = H.gd, W = (o, m = 40) => { if (o.x < -m) o.x += 1000 + 2 * m; if (o.x > 1000 + m) o.x -= 1000 + 2 * m; if (o.y < -m) o.y += 600 + 2 * m; if (o.y > 600 + m) o.y -= 600 + 2 * m; };
      gd.t += dt; gd.spawn -= dt; gd.ufoT -= dt;
      /* cantidad de meteoros pareja: crece un poco con la gente y el tiempo, pero con tope para que la pantalla no se llene */
      const n = gd.ids.length, load = gd.rocks.reduce((a, r) => a + (r.big ? 1 : .45), 0), cap = Math.min(5 + n * .9, 12) + Math.min(3, gd.t / 20);
      if (gd.spawn <= 0 && load < cap) { gd.spawn = 1.3; this.rock(true); }
      if (gd.ufoT <= 0) { gd.ufoT = 9 + Math.random() * 7; const L = Math.random() < .5; gd.ufos.push({ x: L ? -40 : 1040, y: 80 + Math.random() * 440, vx: (L ? 1 : -1) * (110 + Math.random() * 60), ph: Math.random() * 6, img: pickR(['enemy_A', 'enemy_B', 'enemy_C', 'enemy_D', 'enemy_E']), hp: 3, hit: 0 }); SND.play('sf_forceField_000', .35); }
      for (const id of gd.ids) {
        const s = gd.ps[id], i = inp(id); s.cd -= dt; s.inv -= dt;
        if (!s.alive) { s.resp -= dt; if (s.resp <= 0) { let best = null, bd = -1; for (let k = 0; k < 14; k++) { const x = 150 + Math.random() * 700, y = 120 + Math.random() * 360, d = Math.min(999, ...gd.rocks.map(r => Math.hypot(r.x - x, r.y - y) - r.r)); if (d > bd) { bd = d; best = [x, y]; } } Object.assign(s, { x: best[0], y: best[1], vx: 0, vy: 0, alive: true, inv: 2.5 }); sync(); } /* reaparece lejos de los meteoros */ s.lb = i.b; continue; }
        const m = Math.min(1, Math.hypot(i.x, i.y));
        if (m > .15) { const ta = Math.atan2(i.y, i.x); let d = ta - s.a; d = Math.atan2(Math.sin(d), Math.cos(d)); s.a += Math.sign(d) * Math.min(Math.abs(d), 10 * dt); s.vx += Math.cos(s.a) * 620 * m * dt; s.vy += Math.sin(s.a) * 620 * m * dt; s.thr = m; } else s.thr = 0;
        const sp = Math.hypot(s.vx, s.vy), mx = 300; if (sp > mx) { s.vx *= mx / sp; s.vy *= mx / sp; }
        const damp = Math.pow(.35, dt); s.vx *= damp; s.vy *= damp; s.x += s.vx * dt; s.y += s.vy * dt; W(s, 20);
        if (i.b !== s.lb) { s.lb = i.b; if (s.cd <= 0 && H.phase === 'as-go') { s.cd = .25; const bx = s.x + Math.cos(s.a) * 26, by = s.y + Math.sin(s.a) * 26; gd.bul.push({ x: bx, y: by, vx: Math.cos(s.a) * 700 + s.vx * .3, vy: Math.sin(s.a) * 700 + s.vy * .3, own: id, life: .85 }); SND.play(['sf_laserSmall_000', 'sf_laserSmall_001', 'sf_laserRetro_000'], .25, 1 + Math.random() * .2, 0); } }
      }
      for (const r of gd.rocks) { r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt; r.hit -= dt; W(r, 50); }
      for (const u of gd.ufos) { u.x += u.vx * dt; u.ph += dt * 3; u.y += Math.sin(u.ph) * 60 * dt; u.hit -= dt; if (u.x < -80 || u.x > 1080) u.gone = true; }
      for (const b of gd.bul) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; W(b, 5); if (b.life <= 0) { b.dead = true; continue; }
        for (const r of gd.rocks) { if (r.dead || Math.hypot(r.x - b.x, r.y - b.y) > r.r + 4) continue; b.dead = true; r.hp--; r.hit = .1; const s = gd.ps[b.own];
          if (r.hp <= 0) { r.dead = true; const pts = r.big ? 3 : 2; s.pts += pts; s.rocks++; this.pop(r.x, r.y, '+' + pts, '#facc15'); gd.fx.push({ k: 'boom', x: r.x, y: r.y, t: 0, s: r.big ? 1.2 : .7 }); SND.play(r.big ? 'sf_explosionCrunch_000' : 'sf_explosionCrunch_001', r.big ? .5 : .35, 1.2);
            if (r.big) for (let k = 0; k < 2 + (Math.random() < .35 ? 1 : 0); k++) this.rock(false, r.x, r.y, false); }
          else SND.play('impactMetal_light_000', .3, 1.4);
          break; }
        if (b.dead) continue;
        for (const u of gd.ufos) { if (u.gone || Math.hypot(u.x - b.x, u.y - b.y) > 30) continue; b.dead = true; u.hp--; u.hit = .1; if (u.hp <= 0) { u.gone = true; const s = gd.ps[b.own]; s.pts += 10; s.ufo++; this.pop(u.x, u.y, '+10 👾', '#22d3ee'); gd.fx.push({ k: 'boom', x: u.x, y: u.y, t: 0, s: 1.5 }); SFX.boom(); SND.voice('combo'); } break; }
        if (b.dead) continue;
        for (const id of gd.ids) { const s = gd.ps[id]; if (id === b.own || !s.alive || s.inv > 0 || Math.hypot(s.x - b.x, s.y - b.y) > 22) continue; b.dead = true; s.vx += b.vx * .35; s.vy += b.vy * .35; s.pts = Math.max(0, s.pts - 1); gd.ps[b.own].pts += 1; gd.ps[b.own].hits++; s.inv = 1.2; this.pop(s.x, s.y - 20, '-1', '#ef4444'); SFX.hit(); break; }
      }
      for (const id of gd.ids) {
        const s = gd.ps[id]; if (!s.alive || s.inv > 0) continue;
        for (const r of gd.rocks) if (!r.dead && Math.hypot(r.x - s.x, r.y - s.y) < r.r + 14) { s.alive = false; s.resp = 1.7; s.crash++; s.pts = Math.max(0, s.pts - 3); this.pop(s.x, s.y, '-3 💥', '#ef4444'); gd.fx.push({ k: 'boom', x: s.x, y: s.y, t: 0, s: 1.3 }); SFX.boom(); shakeScreen(); sync(); break; }
      }
      gd.rocks = gd.rocks.filter(r => !r.dead); gd.ufos = gd.ufos.filter(u => !u.gone); gd.bul = gd.bul.filter(b => !b.dead);
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < (f.k === 'txt' ? 1 : .6));
    },
    draw(ctx) {
      const gd = H.gd, I = n => IMG('space/' + n + '.png'), ok = i => i.complete && i.naturalWidth;
      const g = ctx.createRadialGradient(500, 300, 50, 500, 300, 650); g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#05030f'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 600);
      for (const s of gd.stars) { const x = (s.x - gd.t * 14 * s.z + 1000) % 1000; ctx.fillStyle = `rgba(255,255,255,${.25 + s.z * .6})`; ctx.fillRect(x, s.y, s.z * 2.4, s.z * 2.4); }
      const deco = I(gd.deco); if (ok(deco)) { ctx.save(); ctx.globalAlpha = .22; ctx.translate(820, 120); ctx.rotate(gd.t * .05); ctx.drawImage(tintImg(deco, '#a78bfa') || deco, -90, -90, 180, 180); ctx.restore(); }
      for (const r of gd.rocks) { const im = I(r.img); ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot); const t = ok(im) && tintImg(im, r.hit > 0 ? '#ffffff' : '#a8a29e'); if (t) ctx.drawImage(t, -r.r * 1.25, -r.r * 1.25, r.r * 2.5, r.r * 2.5); else { ctx.fillStyle = '#78716c'; ctx.beginPath(); ctx.arc(0, 0, r.r, 0, 7); ctx.fill(); } ctx.restore(); }
      for (const u of gd.ufos) { const im = I(u.img), t = ok(im) && tintImg(im, u.hit > 0 ? '#ffffff' : '#4ade80'); ctx.save(); ctx.translate(u.x, u.y); ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 18; if (t) ctx.drawImage(t, -30, -30, 60, 60); ctx.restore(); }
      for (const b of gd.bul) { const c = pl(b.own)?.color || '#fff'; ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.shadowColor = c; ctx.shadowBlur = 10; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * .025, b.y - b.vy * .025); ctx.stroke(); ctx.shadowBlur = 0; }
      for (const id of gd.ids) {
        const s = gd.ps[id], p = pl(id); if (!s.alive) continue;
        if (s.inv > 0 && Math.floor(s.inv * 10) % 2) ctx.globalAlpha = .4;
        ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.a + Math.PI / 2);
        if (s.thr > 0) { const fl = I('effect_yellow'); if (ok(fl)) { ctx.globalAlpha *= .9; ctx.drawImage(fl, -9, 14, 18, 22 + s.thr * 14 + Math.random() * 6); } }
        const im = I('ship_' + s.ship), t = ok(im) && tintImg(im, p?.color || '#fff');
        ctx.shadowColor = p?.color || '#fff'; ctx.shadowBlur = 14;
        if (t) ctx.drawImage(t, -24, -24, 48, 48); else { ctx.fillStyle = p?.color; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(14, 16); ctx.lineTo(-14, 16); ctx.fill(); }
        ctx.restore(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        pill2(ctx, s.x, s.y + 36, `${p?.emoji || ''} ${s.pts}`, p?.color || '#888', 13);
      }
      for (const f of gd.fx) {
        if (f.k === 'boom') { const k = f.t / .6; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#fde68a'; ctx.beginPath(); ctx.arc(f.x, f.y, (14 + k * 60) * f.s, 0, 7); ctx.fill(); ctx.strokeStyle = '#fb923c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(f.x, f.y, (24 + k * 80) * f.s, 0, 7); ctx.stroke(); for (let j = 0; j < 8; j++) { const a = j * .785 + f.x; ctx.fillStyle = '#e7e5e4'; ctx.fillRect(f.x + Math.cos(a) * k * 90 * f.s, f.y + Math.sin(a) * k * 90 * f.s, 5, 5); } ctx.globalAlpha = 1; }
        else if (f.k === 'txt') { ctx.globalAlpha = 1 - f.t; ctx.fillStyle = f.c; ctx.font = '900 24px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#1a1033'; ctx.strokeText(f.txt, f.x, f.y - f.t * 40); ctx.fillText(f.txt, f.x, f.y - f.t * 40); ctx.globalAlpha = 1; }
      }
      const top = gd.ids.slice().sort((a, b) => gd.ps[b].pts - gd.ps[a].pts).slice(0, 4);
      hudChips(ctx, top.map(id => ({ color: pl(id)?.color || '#888', txt: `${pl(id)?.emoji || ''} ${gd.ps[id].pts}` })));
    },
    end() {
      if (H.phase !== 'as-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.ps[id].pts, true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.ps[b].pts - gd.ps[a].pts).map(id => ({ id, val: `⭐ ${gd.ps[id].pts} · ☄️ ${gd.ps[id].rocks} · 👾 ${gd.ps[id].ufo}`, gain: g[id] || 0 }));
      setPhase('as-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'as-ready') return canvasHTML(true, '🚀 ¡A sus naves!');
      if (ph === 'as-go') return canvasHTML(false);
      return `<h1 class="title-pop">☄️ Los pilotos estrella</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
