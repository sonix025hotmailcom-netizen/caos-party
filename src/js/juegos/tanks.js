Object.assign(GAMES, {
  tanks: {
    name: 'Guerra de Tanques', emoji: '💥', color: '#65a30d',
    desc: 'Cada uno maneja un tanque 🪖. El joystick lo mueve (y apunta hacia donde va) y el botón DISPARA. Las balas rebotan una vez y los barriles rojos ¡EXPLOTAN! 60 segundos: gana el que más destruya.',
    start() {
      const ids = onlineIds(), n = ids.length;
      ['tankBody_sand_outline', 'tankSand_barrel2_outline', 'tileGrass1', 'tileGrass2', 'tileSand1', 'tileSand2', 'treeGreen_large', 'treeBrown_large', 'treeGreen_small', 'barrelRed_top', 'barrelGreen_top', 'crateWood', 'crateMetal', 'sandbagBrown', 'sandbagBeige', 'bulletSand2_outline', 'explosion1', 'explosion2', 'explosion3', 'explosion4', 'explosion5', 'explosionSmoke1', 'explosionSmoke2', 'explosionSmoke3', 'shotOrange', 'tracksSmall', 'oilSpill_large'].forEach(f => IMG('tanks/' + f + '.png'));
      const spawns = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; spawns.push([500 + Math.cos(a) * 400, 300 + Math.sin(a) * 215]); }
      const sp = shuffle(spawns.slice());
      const ps = {}; ids.forEach((id, i) => { const [x, y] = sp[i % 8]; ps[id] = { x, y, a: Math.atan2(300 - y, 500 - x), hp: TK.HP, alive: true, resp: 0, inv: 1.5, cd: 0, lb: 0, kills: 0, deaths: 0, hits: 0, flash: 0, odo: 0, lk: -9, streak: 0 }; });
      /* mapa espejado (justo para todos) y distinto cada vez */
      const obs = [], near = (x, y, r) => spawns.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < r) || obs.some(o => Math.hypot(o.x - x, o.y - y) < 85);
      const kinds = ['crateWood', 'crateMetal', 'sandbagBrown', 'sandbagBeige', 'barrel', 'barrel', 'tree', 'tree'];
      let tries = 0;
      while (obs.length < 12 && tries++ < 400) {
        const x = 150 + Math.random() * 310, y = 70 + Math.random() * 460; if (near(x, y, 95) || near(1000 - x, y, 95)) continue;
        const k = pickR(kinds), rot = k.startsWith('sandbag') ? (Math.random() < .5 ? 0 : Math.PI / 2) : 0;
        const mk = X => k === 'barrel' ? { k, x: X, y, r: 19, alive: true } : k === 'tree' ? { k, x: X, y, r: 13, img: pickR(['treeGreen_large', 'treeBrown_large', 'treeGreen_small']) } : (() => { const w = k.startsWith('crate') ? 46 : rot ? 36 : 54, h = k.startsWith('crate') ? 46 : rot ? 54 : 36; return { k, x: X, y, w, h, rot }; })();
        obs.push(mk(x), mk(1000 - x));
      }
      if (Math.random() < .6) obs.push({ k: 'crateMetal', x: 500, y: 300, w: 46, h: 46, rot: 0 });
      H.inp = {}; H.gd = { ids, ps, obs, spawns, bul: [], fx: [], tracks: [], t: 0, sid: rid(), sand: Math.random() < .5, oil: [[200 + rand(600), 80 + rand(440)], [200 + rand(600), 80 + rand(440)]] };
      setPhase('tk-ready', 3600, () => { SFX.go(); GAMES.tanks.go(); }, 0, false);
      rtLoop(null, GAMES.tanks.draw);
    },
    go() { setPhase('tk-go', TK.T, () => GAMES.tanks.end()); rtLoop(dt => GAMES.tanks.step(dt), GAMES.tanks.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'tk-ready' || H.phase === 'tk-go') { const s = H.gd.ps[p.id]; return s && !s.alive && H.phase === 'tk-go' ? { screen: 'msg', big: '💥', title: '¡Te volaron!', text: 'Volvés en un toque… preparate para la venganza 😤' } : joyView(p, '🕹️ Mové y apuntá · Botón = DISPARAR', '💥 FUEGO', TK.CD); }
      return watch();
    },
    onAct(p, m) { if (H.phase === 'tk-ready' || H.phase === 'tk-go') joyAct(p, m); },
    isDone(id) { const s = H.gd.ps && H.gd.ps[id]; return H.phase === 'tk-go' && s && !s.alive; },
    solid(x, y, r) {
      const gd = H.gd;
      if (x < r + 8 || x > 992 - r || y < r + 8 || y > 592 - r) return true;
      for (const o of gd.obs) {
        if (o.k === 'tree') { if (Math.hypot(o.x - x, o.y - y) < o.r + r) return o; continue; }
        if (o.k === 'barrel') { if (o.alive && Math.hypot(o.x - x, o.y - y) < o.r + r) return o; continue; }
        if (Math.abs(o.x - x) < o.w / 2 + r && Math.abs(o.y - y) < o.h / 2 + r) return o;
      }
      return null;
    },
    boom(x, y, big, by) {
      const gd = H.gd; gd.fx.push({ k: 'ex', x, y, t: 0, s: big ? 1.6 : 1 }); SFX.boom(); shakeScreen();
      if (!big) return;
      for (const id of gd.ids) { const s = gd.ps[id]; if (s.alive && s.inv <= 0 && Math.hypot(s.x - x, s.y - y) < 95) this.damage(id, by, 1); }
      for (const o of gd.obs) if (o.k === 'barrel' && o.alive && Math.hypot(o.x - x, o.y - y) < 80) { o.alive = false; setTimeout(() => { if (H.gd === gd) this.boom(o.x, o.y, true, by); }, 140); }
    },
    damage(id, by, d) {
      const gd = H.gd, s = gd.ps[id]; if (!s.alive || s.inv > 0) return;
      s.hp -= d; s.flash = .15; SFX.hit();
      if (by && by !== id && gd.ps[by]) gd.ps[by].hits++;
      gd.fx.push({ k: 'txt', x: s.x, y: s.y - 30, t: 0, txt: '-' + d, c: '#ef4444' });
      if (s.hp <= 0) {
        s.alive = false; s.deaths++; s.resp = 2.6; s.streak = 0; this.boom(s.x, s.y, false);
        gd.fx.push({ k: 'smoke', x: s.x, y: s.y, t: 0 });
        if (by && by !== id && gd.ps[by]) {
          const k = gd.ps[by]; k.kills++;
          gd.fx.push({ k: 'txt', x: k.x, y: k.y - 40, t: 0, txt: '+1 💥', c: '#facc15' });
          if (gd.t - k.lk < 5) { k.streak++; SND.voice(k.streak >= 2 ? 'multi_kill' : 'combo'); } else k.streak = 0;
          k.lk = gd.t;
          gd.feed = { txt: `${pl(by)?.emoji || ''} ${pl(by)?.name || '?'} 💥 ${pl(id)?.name || '?'}`, t: 3 };
        }
        sync();
      }
    },
    step(dt) {
      const gd = H.gd; gd.t += dt; if (gd.feed) gd.feed.t -= dt;
      for (const id of gd.ids) {
        const s = gd.ps[id], i = inp(id);
        s.cd -= dt; s.inv -= dt; s.flash -= dt;
        if (!s.alive) {
          s.resp -= dt;
          if (s.resp <= 0) {
            const far = gd.spawns.slice().sort((a, b) => Math.min(...gd.ids.filter(o => o !== id && gd.ps[o].alive).map(o => Math.hypot(gd.ps[o].x - b[0], gd.ps[o].y - b[1])), 9e9) - Math.min(...gd.ids.filter(o => o !== id && gd.ps[o].alive).map(o => Math.hypot(gd.ps[o].x - a[0], gd.ps[o].y - a[1])), 9e9))[0];
            Object.assign(s, { x: far[0], y: far[1], hp: TK.HP, alive: true, inv: 1.6, a: Math.atan2(300 - far[1], 500 - far[0]) }); sync();
          }
          s.lb = i.b; continue;
        }
        const m = Math.min(1, Math.hypot(i.x, i.y));
        if (m > .18) {
          const ta = Math.atan2(i.y, i.x); let d = ta - s.a; d = Math.atan2(Math.sin(d), Math.cos(d));
          s.a += Math.sign(d) * Math.min(Math.abs(d), 9 * dt);
          const sp = TK.SPD * m * (Math.abs(d) > 1.2 ? .35 : 1), nx = s.x + Math.cos(s.a) * sp * dt, ny = s.y + Math.sin(s.a) * sp * dt;
          if (!this.solid(nx, s.y, TK.R)) s.x = nx; if (!this.solid(s.x, ny, TK.R)) s.y = ny;
          s.odo += sp * dt; if (s.odo > 16) { s.odo = 0; gd.tracks.push({ x: s.x, y: s.y, a: s.a, t: 0 }); if (gd.tracks.length > 260) gd.tracks.shift(); }
        }
        for (const o of gd.ids) { if (o === id) continue; const q = gd.ps[o]; if (!q.alive) continue; const dx = s.x - q.x, dy = s.y - q.y, dd = Math.hypot(dx, dy); if (dd < TK.R * 2 && dd > 0) { const push = (TK.R * 2 - dd) / 2; const nx = s.x + dx / dd * push, ny = s.y + dy / dd * push; if (!this.solid(nx, ny, TK.R)) { s.x = nx; s.y = ny; } } }
        if (i.b !== s.lb) {
          s.lb = i.b;
          if (s.cd <= 0 && H.phase === 'tk-go') {
            s.cd = TK.CD; s.inv = Math.min(s.inv, 0);
            const bx = s.x + Math.cos(s.a) * 32, by = s.y + Math.sin(s.a) * 32;
            gd.bul.push({ x: bx, y: by, vx: Math.cos(s.a) * TK.BSPD, vy: Math.sin(s.a) * TK.BSPD, own: id, bnc: 1, life: 1.9, bounced: false });
            gd.fx.push({ k: 'shot', x: bx, y: by, a: s.a, t: 0 });
            SND.play(['sf_laserSmall_000', 'sf_laserSmall_001', 'sf_laserSmall_002'], .32, .55 + Math.random() * .1, 0);
          }
        }
      }
      for (const b of gd.bul) {
        b.life -= dt; if (b.life <= 0) { b.dead = true; continue; }
        const steps = 3;
        for (let k = 0; k < steps && !b.dead; k++) {
          const nx = b.x + b.vx * dt / steps, ny = b.y + b.vy * dt / steps;
          const hitX = this.solid(nx, b.y, 4), hitY = this.solid(b.x, ny, 4), hit = hitX || hitY;
          if (hit) {
            if (hit.k === 'barrel') { hit.alive = false; b.dead = true; this.boom(hit.x, hit.y, true, b.own); break; }
            if (hit.k === 'tree') { b.dead = true; gd.fx.push({ k: 'puff', x: b.x, y: b.y, t: 0 }); SND.play('impactWood_medium_000', .4); break; }
            if (b.bnc <= 0) { b.dead = true; gd.fx.push({ k: 'puff', x: b.x, y: b.y, t: 0 }); SND.play('impactMetal_light_000', .35); break; }
            b.bnc--; b.bounced = true; if (hitX) b.vx *= -1; if (hitY) b.vy *= -1; SND.play('impactPlate_light_000', .3); continue;
          }
          b.x = nx; b.y = ny;
          for (const id of gd.ids) {
            const s = gd.ps[id]; if (!s.alive || (id === b.own && !b.bounced)) continue;
            if (Math.hypot(s.x - b.x, s.y - b.y) < TK.R + 4) { b.dead = true; gd.fx.push({ k: 'puff', x: b.x, y: b.y, t: 0 }); if (s.inv <= 0) this.damage(id, b.own, 1); break; }
          }
        }
      }
      gd.bul = gd.bul.filter(b => !b.dead);
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < (f.k === 'smoke' ? 2.2 : f.k === 'txt' ? 1 : f.k === 'ex' ? .55 : .25));
      gd.tracks.forEach(t => t.t += dt); gd.tracks = gd.tracks.filter(t => t.t < 5);
    },
    bg() {
      const gd = H.gd; if (gd.bgc) return gd.bgc;
      const t1 = IMG('tanks/tileGrass1.png'), t2 = IMG('tanks/tileGrass2.png'), s1 = IMG('tanks/tileSand1.png'), s2 = IMG('tanks/tileSand2.png');
      if (![t1, t2, s1, s2].every(i => i.complete && i.naturalWidth)) return null;
      const c = document.createElement('canvas'); c.width = 1000; c.height = 600; const g = c.getContext('2d'), ph = Math.random() * 6;
      for (let y = 0; y < 10; y++) for (let x = 0; x < 16; x++) {
        const sand = gd.sand ? Math.sin(x * .6 + ph) + Math.cos(y * .8 + ph * 1.3) > .9 : Math.sin(x * .45 + ph) * Math.cos(y * .5) > .6;
        g.drawImage(sand ? (Math.random() < .5 ? s1 : s2) : (Math.random() < .7 ? t1 : t2), x * 64, y * 64, 64, 64);
      }
      const oil = IMG('tanks/oilSpill_large.png'); if (oil.complete) gd.oil.forEach(([x, y]) => { g.globalAlpha = .55; g.drawImage(oil, x - 40, y - 40, 80, 80); g.globalAlpha = 1; });
      g.strokeStyle = '#3f2a14'; g.lineWidth = 16; g.strokeRect(0, 0, 1000, 600);
      return gd.bgc = c;
    },
    draw(ctx) {
      const gd = H.gd, I = n => IMG('tanks/' + n + '.png'), ok = i => i.complete && i.naturalWidth;
      const bg = GAMES.tanks.bg(); if (bg) ctx.drawImage(bg, 0, 0); else { ctx.fillStyle = '#5a8f3a'; ctx.fillRect(0, 0, 1000, 600); }
      const tr = I('tracksSmall'); if (ok(tr)) for (const t of gd.tracks) { ctx.save(); ctx.globalAlpha = .28 * (1 - t.t / 5); ctx.translate(t.x, t.y); ctx.rotate(t.a + Math.PI / 2); ctx.drawImage(tr, -16, -10, 32, 20); ctx.restore(); }
      for (const f of gd.fx) if (f.k === 'smoke') { const im = I('explosionSmoke' + (1 + Math.min(2, Math.floor(f.t / .75)))); if (ok(im)) { ctx.globalAlpha = Math.max(0, .7 - f.t / 3.2); const s = 50 + f.t * 20; ctx.drawImage(im, f.x - s / 2, f.y - s / 2 - f.t * 18, s, s); ctx.globalAlpha = 1; } }
      for (const o of gd.obs) {
        if (o.k === 'tree') continue;
        if (o.k === 'barrel') { if (!o.alive) continue; const im = I('barrelRed_top'); ctx.fillStyle = '#0004'; ctx.beginPath(); ctx.arc(o.x + 3, o.y + 4, o.r, 0, 7); ctx.fill(); if (ok(im)) ctx.drawImage(im, o.x - 22, o.y - 22, 44, 44); continue; }
        const im = I(o.k); ctx.save(); ctx.translate(o.x, o.y); ctx.fillStyle = '#0004'; ctx.fillRect(-o.w / 2 + 4, -o.h / 2 + 5, o.w, o.h);
        if (ok(im)) { if (o.rot) { ctx.rotate(o.rot); ctx.drawImage(im, -o.h / 2 - 2, -o.w / 2 - 2, o.h + 4, o.w + 4); } else ctx.drawImage(im, -o.w / 2 - 2, -o.h / 2 - 2, o.w + 4, o.h + 4); }
        else { ctx.fillStyle = '#8b5a2b'; ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h); }
        ctx.restore();
      }
      const body = I('tankBody_sand_outline'), barrel = I('tankSand_barrel2_outline');
      for (const id of gd.ids) {
        const s = gd.ps[id], p = pl(id); if (!s.alive) continue;
        if (s.inv > 0 && Math.floor(s.inv * 10) % 2) ctx.globalAlpha = .45;
        ctx.save(); ctx.translate(s.x, s.y);
        ctx.fillStyle = '#0005'; ctx.beginPath(); ctx.ellipse(4, 6, 25, 23, 0, 0, 7); ctx.fill();
        ctx.save(); ctx.rotate(s.a + Math.PI / 2);
        const tb = tkTint(body, p?.color || '#888'), tbr = tkTint(barrel, p?.color || '#888');
        if (tb) ctx.drawImage(tb, -22, -21, 44, 42); else { ctx.fillStyle = p?.color || '#888'; ctx.fillRect(-19, -19, 38, 38); }
        if (s.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffffff88'; ctx.fillRect(-20, -20, 40, 40); ctx.globalCompositeOperation = 'source-over'; }
        if (tbr) ctx.drawImage(tbr, -7, -33, 14, 35); else { ctx.fillStyle = '#333'; ctx.fillRect(-4, -32, 8, 30); }
        ctx.restore();
        emo(ctx, p?.emoji || '?', 0, 1, 18);
        ctx.restore(); ctx.globalAlpha = 1;
        for (let k = 0; k < TK.HP; k++) { ctx.fillStyle = k < s.hp ? '#22c55e' : '#0007'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(s.x - 22 + k * 15, s.y - 40, 13, 7, 3) : ctx.rect(s.x - 22 + k * 15, s.y - 40, 13, 7); ctx.fill(); ctx.stroke(); }
        pill2(ctx, s.x, s.y + 38, `${p?.name || '?'} · ${s.kills}`, p?.color || '#888', 13);
      }
      const bi = I('bulletSand2_outline');
      for (const b of gd.bul) { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2); if (ok(bi)) ctx.drawImage(bi, -6, -8, 12, 16); else { ctx.fillStyle = '#fde047'; ctx.fillRect(-3, -6, 6, 12); } ctx.restore(); }
      for (const f of gd.fx) {
        if (f.k === 'shot') { const im = I('shotOrange'); if (ok(im)) { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a + Math.PI / 2); ctx.globalAlpha = 1 - f.t / .25; ctx.drawImage(im, -10, -26, 20, 34); ctx.restore(); ctx.globalAlpha = 1; } }
        else if (f.k === 'ex') { const fr = Math.min(5, 1 + Math.floor(f.t / .11)), im = I('explosion' + fr), s = 90 * f.s; if (ok(im)) ctx.drawImage(im, f.x - s / 2, f.y - s / 2, s, s); }
        else if (f.k === 'puff') { ctx.globalAlpha = 1 - f.t / .25; ctx.fillStyle = '#fff6'; ctx.beginPath(); ctx.arc(f.x, f.y, 6 + f.t * 50, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
        else if (f.k === 'txt') { ctx.globalAlpha = 1 - f.t; ctx.fillStyle = f.c; ctx.font = '900 24px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#1a1033'; ctx.strokeText(f.txt, f.x, f.y - f.t * 40); ctx.fillText(f.txt, f.x, f.y - f.t * 40); ctx.globalAlpha = 1; }
      }
      for (const o of gd.obs) if (o.k === 'tree') { const im = I(o.img), s = o.img === 'treeGreen_small' ? 58 : 84; ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.arc(o.x + 6, o.y + 8, s * .42, 0, 7); ctx.fill(); if (ok(im)) ctx.drawImage(im, o.x - s / 2, o.y - s / 2, s, s); }
      const top = gd.ids.slice().sort((a, b) => gd.ps[b].kills - gd.ps[a].kills || gd.ps[a].deaths - gd.ps[b].deaths).slice(0, 4);
      hudChips(ctx, top.map(id => ({ color: pl(id)?.color || '#888', txt: `${pl(id)?.emoji || ''} ${gd.ps[id].kills}` })));
      if (gd.feed && gd.feed.t > 0) { ctx.globalAlpha = Math.min(1, gd.feed.t); pill2(ctx, 500, 575, gd.feed.txt, '#ef4444', 18); ctx.globalAlpha = 1; }
    },
    end() {
      if (H.phase !== 'tk-go') return;
      const gd = H.gd, sc = id => { const s = gd.ps[id]; return s.kills * 100 + s.hits * 15 - s.deaths * 40; };
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `💥 ${gd.ps[id].kills} · 🎯 ${gd.ps[id].hits} · 💀 ${gd.ps[id].deaths}`, gain: g[id] || 0 }));
      setPhase('tk-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'tk-ready') return canvasHTML(true, '🪖 ¡A sus tanques!');
      if (ph === 'tk-go') return canvasHTML(false);
      return `<h1 class="title-pop">💥 Los generales del campo</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
