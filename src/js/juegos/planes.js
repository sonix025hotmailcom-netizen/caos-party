Object.assign(GAMES, {
  /* ✈️ AVIONES DE PAPEL */
  planes: {
    name: 'Aviones de Papel', emoji: '✈️', color: '#0ea5e9',
    desc: 'Cada uno vuela un avioncito 🛩️. Con el joystick (o WASD) girás y con DISPARAR (ESPACIO) atacás. Tenés 3 vidas ❤️. ¡El último en el aire gana!',
    start() {
      const ids = onlineIds(), ps = {}, planes = shuffle(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
      spreadStart(ids, 500, 300, 220).forEach(([id, x, y], i) => ps[id] = { x, y, ang: Math.atan2(300 - y, 500 - x), lives: 3, hits: 0, inv: 1.5, cd: 0, lb: 0, alive: true, spr: planes[i % 8], trail: 0 });
      preload([...'abcdefgh'].map(c => `planes/unit_plane_${c}.png`).concat(['planes/projectile_round_colored.png', 'planes/explosion_fire_0.png', 'planes/explosion_fire_1.png', 'planes/explosion_fire_2.png', 'planes/explosion_fire_3.png', 'planes/terrain_grass_island_a.png', 'planes/terrain_grass_island_b.png', 'planes/tree_palms.png', 'planes/trees.png', 'planes/building_house.png', 'plat/heart.png']));
      const isl = Array.from({ length: 6 }, (_, i) => ({ x: 80 + rand(840), y: 60 + rand(480), s: 90 + rand(80), k: i % 2, deco: pickR(['tree_palms', 'trees', 'building_house']) }));
      H.inp = {}; H.gd = { ids, ps, bullets: [], booms: [], out: [], isl, sid: rid(), t: 0 };
      setPhase('pl-ready', 3500, () => { SFX.go(); GAMES.planes.go(); }, 0, false);
      rtLoop(null, GAMES.planes.draw);
    },
    go() { setPhase('pl-go', 70000, () => GAMES.planes.end()); rtLoop(dt => GAMES.planes.step(dt), GAMES.planes.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps[p.id];
      if (H.phase === 'pl-ready' || H.phase === 'pl-go') return s.alive ? joyView(p, '🕹️ Girá tu avión · DISPARAR para atacar', '🎯 DISPARAR', .35) : { screen: 'msg', big: '💥', title: '¡Te derribaron!', text: `Hiciste ${s.hits} impacto${s.hits === 1 ? '' : 's'}. Mirá la batalla 👀` };
      return watch();
    },
    isDone(id) { return H.phase === 'pl-go' && !H.gd.ps[id].alive; },
    onAct(p, m) { if (H.phase === 'pl-ready' || H.phase === 'pl-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd; gd.t += dt;
      const alive = gd.ids.filter(id => gd.ps[id].alive);
      for (const id of alive) {
        const p = gd.ps[id], i = inp(id), m = Math.hypot(i.x, i.y);
        if (m > .25) { const tgt = Math.atan2(i.y, i.x); let d = tgt - p.ang; d = Math.atan2(Math.sin(d), Math.cos(d)); p.ang += Math.max(-4.2 * dt, Math.min(4.2 * dt, d)); }
        const sp = 150 + 150 * Math.min(1, m);
        p.x = (p.x + Math.cos(p.ang) * sp * dt + 1000) % 1000; p.y = (p.y + Math.sin(p.ang) * sp * dt + 600) % 600;
        p.inv -= dt; p.cd -= dt; p.trail -= dt;
        if (p.trail <= 0) { p.trail = .06; FX.burst(p.x - Math.cos(p.ang) * 26, p.y - Math.sin(p.ang) * 26, ['#ffffffaa', '#e2e8f0aa'], 1, { speed: 20, g: 0, life: .7, size: 5, shape: 'c' }); }
        if (i.b > p.lb) { p.lb = i.b; if (p.cd <= 0) { p.cd = .32; gd.bullets.push({ x: p.x + Math.cos(p.ang) * 30, y: p.y + Math.sin(p.ang) * 30, vx: Math.cos(p.ang) * 620, vy: Math.sin(p.ang) * 620, t: 1.1, own: id }); beep(900, .05, 'square', .04); } }
      }
      for (const b of gd.bullets) {
        b.t -= dt; b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < 0 || b.x > 1000 || b.y < 0 || b.y > 600) b.t = 0;
        for (const id of alive) {
          const p = gd.ps[id]; if (id === b.own || p.inv > 0 || b.t <= 0) continue;
          if (Math.hypot(p.x - b.x, p.y - b.y) < 28) {
            b.t = 0; p.lives--; p.inv = 1.3; gd.ps[b.own].hits++;
            gd.booms.push({ x: p.x, y: p.y, t: 0 }); FX.burst(p.x, p.y, ['#f97316', '#facc15', '#fff'], 22, { speed: 300, g: 0 }); beep(120, .25, 'sawtooth', .07);
            if (p.lives <= 0) { p.alive = false; gd.out.push(id); FX.ring(p.x, p.y, '#f97316', 120); SFX.bad(); shakeScreen(); sync(); updateStrip(); }
          }
        }
      }
      gd.bullets = gd.bullets.filter(b => b.t > 0); gd.booms.forEach(b => b.t += dt); gd.booms = gd.booms.filter(b => b.t < .5);
      const left = gd.ids.filter(id => gd.ps[id].alive).length;
      if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.planes.end(); }, 1300); }
    },
    draw(ctx) {
      const gd = H.gd, t = performance.now() / 1000;
      const sea = ctx.createLinearGradient(0, 0, 0, 600); sea.addColorStop(0, '#38bdf8'); sea.addColorStop(1, '#0369a1'); ctx.fillStyle = sea; ctx.fillRect(0, 0, 1000, 600);
      ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 3;
      for (let y = 30; y < 600; y += 60) { ctx.beginPath(); for (let x = 0; x <= 1000; x += 20) ctx.lineTo(x, y + Math.sin(x * .03 + t * 2 + y) * 5); ctx.stroke(); }
      for (const s of gd.isl) {
        const im = IMG(`planes/terrain_grass_island_${s.k ? 'b' : 'a'}.png`);
        if (imgOk(im)) ctx.drawImage(im, s.x - s.s / 2, s.y - s.s / 2, s.s, s.s); else { ctx.fillStyle = '#86efac'; ctx.beginPath(); ctx.arc(s.x, s.y, s.s / 3, 0, 6.283); ctx.fill(); }
        const d = IMG(`planes/${s.deco}.png`); if (imgOk(d)) ctx.drawImage(d, s.x - 22, s.y - 26, 44, 44);
      }
      for (const b of gd.bullets) { const im = IMG('planes/projectile_round_colored.png'); ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2); if (imgOk(im)) ctx.drawImage(im, -12, -12, 24, 24); else { ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, 6.283); ctx.fill(); } ctx.restore(); }
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id); if (!p.alive) continue;
        ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(p.x + 14, p.y + 22, 26, 12, p.ang, 0, 6.283); ctx.fill();
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang + Math.PI / 2);
        if (p.inv > 0 && Math.sin(t * 40) > 0) ctx.globalAlpha = .35;
        ctx.fillStyle = pp?.color || '#888'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 6.283); ctx.globalAlpha *= .55; ctx.fill(); ctx.globalAlpha = p.inv > 0 && Math.sin(t * 40) > 0 ? .35 : 1;
        const im = IMG(`planes/unit_plane_${p.spr}.png`); if (imgOk(im)) ctx.drawImage(im, -34, -34, 68, 68); else emo(ctx, '✈️', 0, 0, 44);
        ctx.restore();
        pill2(ctx, p.x, p.y - 46, `${pp?.emoji || ''} ${'❤️'.repeat(Math.max(0, p.lives))}`, pp?.color || '#888', 14);
      }
      for (const b of gd.booms) { const im = IMG(`planes/explosion_fire_${Math.min(3, Math.floor(b.t / .5 * 4))}.png`); if (imgOk(im)) ctx.drawImage(im, b.x - 40, b.y - 40, 80, 80); }
      hudChips(ctx, gd.ids.slice().sort((a, b) => (gd.ps[b].alive - gd.ps[a].alive) || gd.ps[b].lives - gd.ps[a].lives || gd.ps[b].hits - gd.ps[a].hits).map(id => ({ color: gd.ps[id].alive ? (pl(id)?.color || '#888') : '#64748b', txt: `${pl(id)?.emoji || ''} 🎯${gd.ps[id].hits}` })));
    },
    end() {
      if (H.phase !== 'pl-go') return;
      const gd = H.gd, sc = id => (gd.ps[id].alive ? 1000 + gd.ps[id].lives * 100 : gd.out.indexOf(id) * 100) + gd.ps[id].hits, g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `${gd.ps[id].alive ? '✈️ En el aire' : '💥 Derribado'} · 🎯${gd.ps[id].hits}`, gain: g[id] || 0 }));
      setPhase('pl-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'pl-ready') return canvasHTML(true, '✈️ ¡Despeguen!');
      if (ph === 'pl-go') return canvasHTML(false);
      return `<h1 class="title-pop">✈️ Ases del aire</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
