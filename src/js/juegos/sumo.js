/* ================== NUEVOS MINIJUEGOS ================== */
Object.assign(GAMES, {
  /* 🪐 SUMO GALÁCTICO */
  sumo: {
    name: 'Sumo Galáctico', emoji: '🪐', color: '#06b6d4',
    desc: 'Muevan su bola con el joystick del cel y saquen a los demás de la plataforma. El botón es un ¡DASH! 💨 Y ojo… la plataforma se va encogiendo 😱',
    start() {
      const ids = onlineIds(), bs = {};
      spreadStart(ids, 500, 300, 160).forEach(([id, x, y]) => bs[id] = { x, y, vx: 0, vy: 0, alive: true, fall: 0, cd: 0, lb: 0, dash: 0 });
      H.inp = {}; H.gd = { ids, bs, R: 270, t: 0, out: [], sid: rid(), bumpT: 0 };
      setPhase('sumo-ready', 3500, () => { SFX.go(); GAMES.sumo.go(); }, 0, false);
      rtLoop(null, GAMES.sumo.draw);
    },
    go() { setPhase('sumo-go', 50000, () => GAMES.sumo.end()); rtLoop(dt => GAMES.sumo.step(dt), GAMES.sumo.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const b = H.gd.bs[p.id];
      if (H.phase === 'sumo-ready' || H.phase === 'sumo-go') return b.alive ? joyView(p, '🕹️ Tocá a la izquierda y arrastrá · Botón = DASH', '💨 DASH', 1.1) : { screen: 'msg', big: '💀', title: '¡Te caíste al espacio!', text: 'Mirá la tele y burlate de los demás 😂' };
      return watch();
    },
    onAct(p, m) { if (H.phase === 'sumo-ready' || H.phase === 'sumo-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd; gd.t += dt; gd.bumpT -= dt;
      gd.R = Math.max(120, 270 - gd.t * 4.5);
      const alive = gd.ids.filter(id => gd.bs[id].alive);
      for (const id of gd.ids) {
        const b = gd.bs[id];
        if (!b.alive) { b.fall += dt; continue; }
        const i = inp(id);
        b.vx += i.x * 950 * dt; b.vy += i.y * 950 * dt; b.cd -= dt; b.dash -= dt;
        if (i.b > b.lb) {
          b.lb = i.b;
          if (b.cd <= 0) {
            let dx = i.x, dy = i.y, m = Math.hypot(dx, dy);
            if (m < .2) { dx = b.vx; dy = b.vy; m = Math.hypot(dx, dy); }
            if (m > 0) { b.vx += dx / m * 560; b.vy += dy / m * 560; b.cd = 1.0; b.dash = .3; beep(220, .12, 'sawtooth', .03); if (typeof SND !== 'undefined') SND.play('sf_thrusterFire_000', .35, 1.4, 0); }
          }
        }
        const damp = Math.pow(.22, dt); b.vx *= damp; b.vy *= damp;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      for (let a = 0; a < alive.length; a++) for (let c = a + 1; c < alive.length; c++) {
        const b1 = gd.bs[alive[a]], b2 = gd.bs[alive[c]];
        const dx = b2.x - b1.x, dy = b2.y - b1.y, d = Math.hypot(dx, dy), min = 58;
        if (d < min && d > 0) {
          const nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          b1.x -= nx * ov; b1.y -= ny * ov; b2.x += nx * ov; b2.y += ny * ov;
          const rv = (b2.vx - b1.vx) * nx + (b2.vy - b1.vy) * ny;
          if (rv < 0) {
            let j = -(1 + .95) * rv / 2;
            if (b1.dash > 0 || b2.dash > 0) j *= 1.6;
            b1.vx -= j * nx; b1.vy -= j * ny; b2.vx += j * nx; b2.vy += j * ny;
            if (gd.bumpT <= 0 && Math.abs(rv) > 120) { gd.bumpT = .12; beep(140 + rand(80), .08, 'square', .03); if (typeof SFX.hit === 'function') SFX.hit(); }
          }
        }
      }
      for (const id of alive) {
        const b = gd.bs[id];
        if (Math.hypot(b.x - 500, b.y - 300) > gd.R + 6) { b.alive = false; b.fall = 0; gd.out.push(id); SFX.bad(); shakeScreen(); sync(); updateStrip(); }
      }
      const left = gd.ids.filter(id => gd.bs[id].alive).length;
      if (gd.ids.length > 1 && left <= 1 && !gd.ending) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.sumo.end(); }, 1300); }
    },
    isDone(id) { return H.phase === 'sumo-go' && H.gd.bs[id] && !H.gd.bs[id].alive; },
    draw(ctx) {
      const gd = H.gd;
      ctx.fillStyle = '#0b0620'; ctx.fillRect(0, 0, 1000, 600);
      for (const s of STARS) { ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fillRect(s.x, s.y, 2, 2); }
      const R = gd.R, g = ctx.createRadialGradient(500, 300, R * .1, 500, 300, R);
      g.addColorStop(0, '#8b5cf6'); g.addColorStop(1, '#3b0764');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(500, 300, R, 0, 7); ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = R < 190 && gd.t % .6 < .3 ? '#ff4d8d' : '#facc15'; ctx.stroke();
      for (const id of gd.ids) {
        const b = gd.bs[id], p = pl(id);
        if (!b.alive && b.fall > .8) continue;
        const s = b.alive ? 1 : Math.max(0, 1 - b.fall / .8);
        ctx.save(); ctx.translate(b.x, b.y); ctx.scale(s, s); if (!b.alive) ctx.rotate(b.fall * 12);
        if (b.dash > 0) { ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, 0, 29, 0, 7); ctx.fillStyle = p?.color || '#888'; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = '#0006'; ctx.stroke();
        emo(ctx, p?.emoji || '?', 0, 2, 32); ctx.restore();
        if (b.alive) nameTag(ctx, p?.name || '?', b.x, b.y - 44);
      }
      nameTag(ctx, `Quedan: ${gd.ids.filter(id => gd.bs[id].alive).length}`, 90, 30, 22);
    },
    end() {
      if (!H.phase.startsWith('sumo-go')) return;
      const gd = H.gd, sc = id => gd.bs[id].alive ? 999 : gd.out.indexOf(id);
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.bs[id].alive ? '🏆 Sobrevivió' : '💀 Se cayó', gain: g[id] || 0 }));
      setPhase('sumo-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'sumo-ready') return canvasHTML(true, '🕹️ ¡Agarren el joystick!');
      if (ph === 'sumo-go') return canvasHTML(false);
      return `<h1 class="title-pop">🪐 Los reyes del espacio</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
