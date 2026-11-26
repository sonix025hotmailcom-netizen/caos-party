Object.assign(GAMES, {
  dungeon: {
    name: 'Calabozo Loco', emoji: '⚔️', color: '#78350f', C: 50,
    desc: 'Cada uno entra al calabozo con un arma ⚔️. Joystick para moverte y botón para ATACAR. Juntá monedas 🪙, abrí cofres 📦 y derrotá fantasmas 👻 (+5). Si te toca un fantasma o caés en una trampa, se te caen monedas. ¡Y podés golpear a los demás para robarles! 60 segundos.',
    start() {
      const ids = onlineIds(), C = this.C, W = 20, Hh = 12;
      ['wall', 'tiles_center', 'tiles_decorative', 'tiles', 'tile', 'tiles_cracked', 'dragon', 'trap', 'floor_trap', 'barrel', 'crate', 'coffin', 'table', 'chest', 'campfire', 'hand'].concat(DGW).forEach(f => IMG('dungeon/' + f + '.png'));
      ['tile_0006', 'tile_0043', 'tile_0044', 'tile_0045'].forEach(f => IMG('pixel/' + f + '.png'));
      /* mapa: borde de muros + columnas y muebles espejados */
      const g = Array.from({ length: W * Hh }, (_, i) => { const x = i % W, y = (i / W) | 0; return x === 0 || y === 0 || x === W - 1 || y === Hh - 1 ? 'wall' : null; });
      const set = (x, y, v) => { g[y * W + x] = v; g[y * W + (W - 1 - x)] = v; };
      for (let k = 0; k < 7; k++) { const x = 2 + rand(7), y = 2 + rand(Hh - 4); if (Math.abs(y - Hh / 2) < 1.5 && x < 4) continue; set(x, y, pickR(['wall', 'wall', 'barrel', 'crate', 'coffin', 'table'])); }
      const traps = []; for (let k = 0; k < 3; k++) { const x = 3 + rand(6), y = 2 + rand(Hh - 4); if (!g[y * W + x]) { traps.push([x, y]); traps.push([W - 1 - x, y]); } }
      const floor = g.map(() => Math.random() < .12 ? 'tiles_cracked' : Math.random() < .08 ? 'tiles_decorative' : 'tiles_center');
      const sp = [[2, 2], [W - 3, Hh - 3], [W - 3, 2], [2, Hh - 3], [W / 2 - 1, 2], [W / 2, Hh - 3], [2, Hh / 2], [W - 3, Hh / 2 - 1]];
      const ps = {}; ids.forEach((id, i) => { const [x, y] = sp[i % 8]; ps[id] = { x: (x + .5) * C, y: (y + .5) * C, fx: 1, fy: 0, coins: 0, kills: 0, hp: 3, inv: 1, stun: 0, cd: 0, swing: 0, lb: 0, wpn: DGW[i % DGW.length], vx: 0, vy: 0 }; });
      H.inp = {}; H.gd = { ids, W, Hh, g, floor, traps, ps, coins: [], chests: [], ghosts: [], fx: [], t: 0, sid: rid(), spawnC: 0, spawnG: 3, trapOn: false, deco: Array.from({ length: 4 }, () => [2 + rand(W - 4), 1 + rand(Hh - 2)]).filter(([x, y]) => !g[y * W + x]) };
      for (let k = 0; k < 8; k++) this.coin();
      setPhase('dg-ready', 3600, () => { SFX.go(); GAMES.dungeon.go(); }, 0, false);
      rtLoop(null, GAMES.dungeon.draw);
    },
    go() { setPhase('dg-go', 60000, () => GAMES.dungeon.end()); rtLoop(dt => GAMES.dungeon.step(dt), GAMES.dungeon.draw); },
    free() { const gd = H.gd; for (let k = 0; k < 50; k++) { const x = 1 + rand(gd.W - 2), y = 1 + rand(gd.Hh - 2); if (!gd.g[y * gd.W + x] && !gd.traps.some(t => t[0] === x && t[1] === y)) return [(x + .5) * this.C, (y + .5) * this.C]; } return [500, 300]; },
    coin(x, y, v = 1) { const gd = H.gd; if (x == null) [x, y] = this.free(); gd.coins.push({ x, y, v, t: 0 }); },
    solid(x, y, r) { const gd = H.gd, C = this.C; for (const [dx, dy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) { const cx = Math.floor((x + dx) / C), cy = Math.floor((y + dy) / C); if (cx < 0 || cy < 0 || cx >= gd.W || cy >= gd.Hh || gd.g[cy * gd.W + cx]) return true; } return false; },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'dg-ready' || H.phase === 'dg-go') return joyView(p, '🕹️ Movete · Botón = ¡ATACAR!', '⚔️ ATACAR', .35);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'dg-ready' || H.phase === 'dg-go') joyAct(p, m); },
    drop(s, n) { const gd = H.gd, k = Math.min(n, s.coins); s.coins -= k; for (let i = 0; i < k; i++) { const a = Math.random() * 6.28, d = 30 + Math.random() * 40, x = s.x + Math.cos(a) * d, y = s.y + Math.sin(a) * d; if (!this.solid(x, y, 8)) gd.coins.push({ x, y, v: 1, t: 0, lock: .6 }); } },
    hurt(id, from, why) {
      const gd = H.gd, s = gd.ps[id]; if (s.inv > 0) return;
      s.inv = 1.2; s.stun = .35; this.drop(s, from ? 1 : 3); if (from && gd.ps[from]) gd.ps[from].coins++;
      gd.fx.push({ k: 'txt', x: s.x, y: s.y - 30, t: 0, txt: why === 'trap' ? '¡Auch! 🔪' : why === 'ghost' ? '👻 ¡Buu!' : '💥', c: '#ef4444' }); SFX.hit();
    },
    step(dt) {
      const gd = H.gd, C = this.C, go = H.phase === 'dg-go'; gd.t += dt; gd.spawnC -= dt; gd.spawnG -= dt;
      gd.trapOn = (gd.t % 4) > 2.8;
      if (go && gd.spawnC <= 0 && gd.coins.length < 14) { gd.spawnC = .9; this.coin(); }
      if (go && gd.chests.length < 2 && Math.random() < dt * .25) { const [x, y] = this.free(); gd.chests.push({ x, y, t: 0 }); }
      if (go && gd.spawnG <= 0 && gd.ghosts.length < 2 + Math.floor(gd.t / 15)) { gd.spawnG = 4; const [x, y] = this.free(); gd.ghosts.push({ x, y, hp: 2, hit: 0, sp: 70 + gd.t, ph: Math.random() * 6, spawn: 1 }); SND.play('sf_slime_000', .4); }
      for (const id of gd.ids) {
        const s = gd.ps[id], i = inp(id); s.inv -= dt; s.stun -= dt; s.cd -= dt; s.swing -= dt;
        if (go && s.stun <= 0) {
          const m = Math.min(1, Math.hypot(i.x, i.y));
          if (m > .15) { s.fx = i.x / (m || 1); s.fy = i.y / (m || 1); const sp = 210 * m, nx = s.x + i.x / Math.max(1, Math.hypot(i.x, i.y)) * sp * dt, ny = s.y + i.y / Math.max(1, Math.hypot(i.x, i.y)) * sp * dt; if (!this.solid(nx, s.y, 15)) s.x = nx; if (!this.solid(s.x, ny, 15)) s.y = ny; }
          if (i.b !== s.lb && s.cd <= 0) {
            s.cd = .35; s.swing = .25; SND.play(['impactPunch_medium_000', 'ui_drop_002'], .3, 1.4, 0);
            const hitIn = (x, y) => { const dx = x - s.x, dy = y - s.y, d = Math.hypot(dx, dy); return d < 70 && (d < 20 || (dx * s.fx + dy * s.fy) / d > .25); };
            for (const gh of gd.ghosts) if (gh.spawn <= 0 && hitIn(gh.x, gh.y)) { gh.hp--; gh.hit = .15; gh.x += s.fx * 30; gh.y += s.fy * 30; if (gh.hp <= 0) { gh.dead = true; s.coins += 5; s.kills++; gd.fx.push({ k: 'txt', x: gh.x, y: gh.y - 20, t: 0, txt: '+5 👻', c: '#facc15' }); gd.fx.push({ k: 'poof', x: gh.x, y: gh.y, t: 0 }); SND.play('ui_glass_002', .5); } }
            for (const o of gd.ids) if (o !== id && hitIn(gd.ps[o].x, gd.ps[o].y)) { const q = gd.ps[o]; if (q.inv > 0) continue; const nx = q.x + s.fx * 40, ny = q.y + s.fy * 40; if (!this.solid(nx, ny, 15)) { q.x = nx; q.y = ny; } this.hurt(o, id, 'hit'); }
            for (const ch of gd.chests) if (!ch.open && hitIn(ch.x, ch.y)) { ch.open = true; for (let k = 0; k < 5; k++) this.coin(ch.x + (Math.random() - .5) * 60, ch.y + (Math.random() - .5) * 60); SND.play('ui_confirmation_001', .5); }
          }
        }
        s.lb = i.b;
        for (const c of gd.coins) if (!c.dead && !(c.lock > 0) && Math.hypot(c.x - s.x, c.y - s.y) < 24) { c.dead = true; s.coins += c.v; SND.play('ui_pluck_001', .3, 1.5, 30); }
        for (const ch of gd.chests) if (!ch.open && Math.hypot(ch.x - s.x, ch.y - s.y) < 28) { ch.open = true; for (let k = 0; k < 5; k++) this.coin(ch.x + (Math.random() - .5) * 60, ch.y + (Math.random() - .5) * 60); SND.play('ui_confirmation_001', .5); }
        if (gd.trapOn && gd.traps.some(([tx, ty]) => Math.floor(s.x / C) === tx && Math.floor(s.y / C) === ty)) this.hurt(id, null, 'trap');
      }
      for (const c of gd.coins) { c.t += dt; if (c.lock > 0) c.lock -= dt; }
      for (const gh of gd.ghosts) {
        gh.spawn -= dt; gh.hit -= dt; gh.ph += dt; if (gh.spawn > 0) continue;
        const tg = gd.ids.map(id => gd.ps[id]).filter(s => s.inv <= 0).sort((a, b) => Math.hypot(a.x - gh.x, a.y - gh.y) - Math.hypot(b.x - gh.x, b.y - gh.y))[0];
        if (tg) { const dx = tg.x - gh.x, dy = tg.y - gh.y, d = Math.hypot(dx, dy) || 1; gh.x += dx / d * gh.sp * dt + Math.sin(gh.ph * 2) * 20 * dt; gh.y += dy / d * gh.sp * dt; if (d < 26) { const id = gd.ids.find(i => gd.ps[i] === tg); this.hurt(id, null, 'ghost'); } }
      }
      gd.coins = gd.coins.filter(c => !c.dead); gd.ghosts = gd.ghosts.filter(g => !g.dead); gd.chests = gd.chests.filter(c => !c.open);
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < 1);
    },
    draw(ctx) {
      const gd = H.gd, C = GAMES.dungeon.C, I = n => IMG('dungeon/' + n + '.png'), ok = imgOk;
      ctx.fillStyle = '#efe4cc'; ctx.fillRect(0, 0, 1000, 600);
      for (let i = 0; i < gd.g.length; i++) {
        const x = (i % gd.W) * C, y = ((i / gd.W) | 0) * C, v = gd.g[i];
        const fl = I(gd.floor[i]); if (ok(fl)) { ctx.globalAlpha = .6; ctx.drawImage(fl, x, y, C, C); ctx.globalAlpha = 1; }
        if (v) { const im = I(v); if (v === 'wall') { ctx.fillStyle = '#d6c7a5'; ctx.fillRect(x, y, C, C); } if (ok(im)) ctx.drawImage(im, x - 2, y - 2, C + 4, C + 4); }
      }
      for (const [x, y] of gd.deco) { const im = I('dragon'); if (ok(im)) { ctx.globalAlpha = .7; ctx.drawImage(im, x * C, y * C, C, C); ctx.globalAlpha = 1; } }
      for (const [x, y] of gd.traps) { const im = I(gd.trapOn ? 'trap' : 'floor_trap'); if (ok(im)) ctx.drawImage(im, x * C, y * C, C, C); if (gd.trapOn) { ctx.fillStyle = '#ef444433'; ctx.fillRect(x * C, y * C, C, C); } }
      const ch = I('chest'); for (const c of gd.chests) { const k = 1 + Math.sin(gd.t * 6) * .06; if (ok(ch)) ctx.drawImage(ch, c.x - 24 * k, c.y - 24 * k, 48 * k, 48 * k); }
      for (const c of gd.coins) { const w = Math.abs(Math.cos(c.t * 4)) * 11 + 2; ctx.fillStyle = '#facc15'; ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(c.x, c.y, w, 12, 0, 0, 7); ctx.fill(); ctx.stroke(); }
      for (const gh of gd.ghosts) {
        ctx.save(); ctx.translate(gh.x, gh.y + Math.sin(gh.ph * 4) * 3); ctx.globalAlpha = gh.spawn > 0 ? .3 : .92;
        ctx.fillStyle = gh.hit > 0 ? '#fecaca' : '#ffffff'; ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, -4, 18, Math.PI, 0); ctx.lineTo(18, 16); for (let k = 0; k < 4; k++) ctx.lineTo(18 - (k + .5) * 9, k % 2 ? 16 : 10); ctx.lineTo(-18, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2b1d12'; ctx.beginPath(); ctx.arc(-6, -6, 3.5, 0, 7); ctx.arc(6, -6, 3.5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 4, 4, 5, 0, 0, 7); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
      }
      const hand = I('hand');
      for (const id of gd.ids) {
        const s = gd.ps[id], p = pl(id), col = p?.color || '#888'; if (s.inv > 0 && Math.floor(s.inv * 10) % 2) ctx.globalAlpha = .45;
        const a = Math.atan2(s.fy, s.fx);
        ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(s.x + 3, s.y + 16, 16, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(s.x, s.y, 19, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(s.x, s.y, 13, 0, 7); ctx.fill();
        emo(ctx, p?.emoji || '?', s.x, s.y + 1, 14);
        const sw = s.swing > 0 ? (1 - s.swing / .25) : 0, wa = a + (s.swing > 0 ? -1.1 + sw * 2.2 : .6), hx = s.x + Math.cos(wa) * 24, hy = s.y + Math.sin(wa) * 24;
        const wi = I(s.wpn); ctx.save(); ctx.translate(hx, hy); ctx.rotate(wa + Math.PI / 2); if (ok(wi)) ctx.drawImage(wi, -18, -40, 36, 48); ctx.restore();
        if (ok(hand)) { const t = tkTint(hand, col); if (t) ctx.drawImage(t, hx - 8, hy - 8, 16, 16); }
        if (s.swing > 0) { ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(s.x, s.y, 52, a - 1.1, a - 1.1 + sw * 2.2); ctx.stroke(); }
        ctx.globalAlpha = 1;
        pill2(ctx, s.x, s.y - 34, `${p?.name || '?'} · 🪙${s.coins}`, col, 13);
      }
      for (const f of gd.fx) {
        if (f.k === 'poof') { ctx.globalAlpha = 1 - f.t; ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { const a = k * 1.05; ctx.beginPath(); ctx.arc(f.x + Math.cos(a) * f.t * 50, f.y + Math.sin(a) * f.t * 50, 6, 0, 7); ctx.stroke(); } ctx.globalAlpha = 1; }
        if (f.txt) { ctx.globalAlpha = 1 - f.t; ctx.fillStyle = f.c; ctx.font = '900 22px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#efe4cc'; ctx.strokeText(f.txt, f.x, f.y - f.t * 40); ctx.fillText(f.txt, f.x, f.y - f.t * 40); ctx.globalAlpha = 1; }
      }
      /* cinta roja pixelada con el líder */
      const L = IMG('pixel/tile_0043.png'), M = IMG('pixel/tile_0044.png'), R = IMG('pixel/tile_0045.png');
      const top = gd.ids.slice().sort((a, b) => gd.ps[b].coins - gd.ps[a].coins)[0], txt = `👑 ${pl(top)?.name || ''} · 🪙${gd.ps[top]?.coins || 0}`;
      ctx.imageSmoothingEnabled = false; ctx.font = '900 20px Nunito, sans-serif'; const tw2 = ctx.measureText(txt).width + 40, bx = 500 - tw2 / 2;
      if (ok(L) && ok(M) && ok(R)) { ctx.drawImage(L, bx - 40, 4, 48, 48); ctx.drawImage(M, bx + 8, 4, tw2 - 16, 48); ctx.drawImage(R, bx + tw2 - 8, 4, 48, 48); }
      ctx.imageSmoothingEnabled = true; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#7f1d1d'; ctx.strokeText(txt, 500, 34); ctx.fillText(txt, 500, 34);
    },
    end() {
      if (H.phase !== 'dg-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.ps[id].coins, true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.ps[b].coins - gd.ps[a].coins).map(id => ({ id, val: `🪙 ${gd.ps[id].coins} · 👻 ${gd.ps[id].kills}`, gain: g[id] || 0 }));
      setPhase('dg-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'dg-ready') return canvasHTML(true, '⚔️ ¡Al calabozo!');
      if (ph === 'dg-go') return canvasHTML(false);
      return `<div class="pixpanel"><h1 class="title-pop">⚔️ Los más ricos del calabozo</h1>${resultsList(H.gd.rows)}</div>`;
    }
  }
});
