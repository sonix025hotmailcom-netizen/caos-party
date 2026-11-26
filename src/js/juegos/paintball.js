Object.assign(GAMES, {
  /* 🎯 PAINTBALL 3D */
  paintball: {
    name: 'Paintball 3D', emoji: '🎯', color: '#7c3aed', W: 11.5, D: 6.8,
    desc: '¡En 3D! Todos contra todos con pistolas de pintura 🔫🎨. Muévanse (joystick o WASD) y disparen hacia donde miran (botón o ESPACIO). Escóndanse detrás de las cajas. 3 vidas ❤️',
    start() {
      const ids = onlineIds(), ps = {}, W = this.W, D = this.D;
      C3D.load('assets/chars/Character_Soldier.glb').catch(() => {}); C3D.load('assets/props/world.glb').catch(() => {});
      spreadStart(ids, 0, 0, 1).forEach(([id], i) => { const a = i / ids.length * Math.PI * 2; ps[id] = { x: Math.cos(a) * (W - 2), z: Math.sin(a) * (D - 1.5), face: a + Math.PI, lives: 3, hits: 0, inv: 1.5, cd: 0, lb: 0, alive: true }; });
      const obs = [], kinds = ['ToonCrate', 'ExplodingBarrel', 'Debris_Tires', 'SackTrench_Small', 'CardboardBoxes_1', 'Container_Small', 'Barrier_Single', 'TrafficCone'];
      for (let k = 0, tries = 0; k < 9 && tries < 200; tries++) {
        const x = (Math.random() * 2 - 1) * (W - 2.5), z = (Math.random() * 2 - 1) * (D - 1.8), r = .95;
        if (obs.some(o => Math.hypot(o.x - x, o.z - z) < 3)) continue;
        if (ids.some(id => Math.hypot(ps[id].x - x, ps[id].z - z) < 2.5)) continue;
        obs.push({ x, z, r, n: pickR(kinds), rot: Math.random() * 6 }); k++;
      }
      H.inp = {}; H.gd = { ids, ps, obs, balls: [], out: [], t: 0, sid: rid(), bid: 0, splats: [], build3D: T => GAMES.paintball.build(T) };
      setPhase('pb-ready', 3500, () => { SFX.go(); GAMES.paintball.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.paintball.draw);
    },
    go() { setPhase('pb-go', 75000, () => GAMES.paintball.end()); attachArena(H.gd); rtLoop(dt => GAMES.paintball.step(dt), GAMES.paintball.draw); },
    build(T) {
      const W = this.W, D = this.D, gd = H.gd, r = arena3D(T, { bg: '#a5b4fc', camY: 18, camZ: 14, lookZ: 1 });
      const pc = document.createElement('canvas'); pc.width = 1024; pc.height = 608; const pg = pc.getContext('2d');
      pg.fillStyle = '#8fbf6a'; pg.fillRect(0, 0, 1024, 608);
      for (let i = 0; i < 700; i++) { pg.fillStyle = Math.random() < .5 ? '#7fae5c' : '#9ccc75'; pg.fillRect(Math.random() * 1024, Math.random() * 608, 4 + Math.random() * 10, 3 + Math.random() * 5); }
      pg.strokeStyle = '#ffffffaa'; pg.lineWidth = 8; pg.strokeRect(10, 10, 1004, 588); pg.beginPath(); pg.arc(512, 304, 90, 0, 6.283); pg.stroke();
      const tex = new T.CanvasTexture(pc); tex.colorSpace = T.SRGBColorSpace;
      const floor = new T.Mesh(new T.PlaneGeometry(W * 2, D * 2), new T.MeshStandardMaterial({ map: tex, roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; r.scene.add(floor);
      const wallM = new T.MeshStandardMaterial({ color: '#475569', roughness: .7 });
      [[0, -D - .3, W * 2 + 1.2, .6], [0, D + .3, W * 2 + 1.2, .6], [-W - .3, 0, .6, D * 2], [W + .3, 0, .6, D * 2]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, .8, d), wallM); m.position.set(x, .4, z); m.castShadow = m.receiveShadow = true; r.scene.add(m); });
      r.paint = { pc, pg, tex, W, D };
      for (const o of gd.obs) C3D.prop('world', o.n, 1.8).then(m => { if (!m) return; m.position.set(o.x, 0, o.z); m.rotation.y = o.rot; r.scene.add(m); }).catch(() => {});
      r.chars = {}; r.balls = {};
      C3D.load('assets/chars/Character_Soldier.glb').then(g => {
        if (H.gd !== gd) return;
        for (const id of gd.ids) { const a = C3D.make(g, 1.95, pl(id)?.color); a.play('Idle'); r.scene.add(a.obj); r.chars[id] = a; }
      }).catch(() => {});
      r.ballGeo = new T.SphereGeometry(.17, 12, 8);
      r.last = performance.now();
      return r;
    },
    splat(x, z, color, size = 1) {
      const gd = H.gd, r = gd.r3; gd.splats.push({ x, z, color });
      if (!r || !r.paint) return;
      const { pg, tex, W, D } = r.paint, px = (x + W) / (W * 2) * 1024, py = (z + D) / (D * 2) * 608;
      pg.fillStyle = color; pg.globalAlpha = .85;
      pg.beginPath(); pg.arc(px, py, 14 * size, 0, 6.283); pg.fill();
      for (let k = 0; k < 8; k++) { const a = Math.random() * 6.283, d = (12 + Math.random() * 22) * size; pg.beginPath(); pg.arc(px + Math.cos(a) * d, py + Math.sin(a) * d, (2 + Math.random() * 6) * size, 0, 6.283); pg.fill(); }
      pg.globalAlpha = 1; tex.needsUpdate = true;
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps[p.id];
      if (H.phase === 'pb-ready' || H.phase === 'pb-go') return s.alive ? joyView(p, '🕹️ Movete · DISPARAR tira pintura hacia donde mirás', '🎨 DISPARAR', .3) : { screen: 'msg', big: '🎨', title: '¡Te pintaron!', text: `Pintaste a otros ${s.hits} ${s.hits === 1 ? 'vez' : 'veces'}. Mirá la batalla 👀` };
      return watch();
    },
    isDone(id) { return H.phase === 'pb-go' && !H.gd.ps[id].alive; },
    onAct(p, m) { if (H.phase === 'pb-ready' || H.phase === 'pb-go') joyAct(p, m); },
    collide(x, z, rad) { const gd = H.gd; for (const o of gd.obs) { const dx = x - o.x, dz = z - o.z, d = Math.hypot(dx, dz), m = o.r + rad; if (d < m && d > 0) { x = o.x + dx / d * m; z = o.z + dz / d * m; } } return [Math.max(-this.W + rad, Math.min(this.W - rad, x)), Math.max(-this.D + rad, Math.min(this.D - rad, z))]; },
    step(dt) {
      const gd = H.gd; gd.t += dt;
      const alive = gd.ids.filter(id => gd.ps[id].alive);
      for (const id of alive) {
        const p = gd.ps[id], i = inp(id), m = Math.hypot(i.x, i.y);
        if (m > .15) { p.face = Math.atan2(i.x, i.y); [p.x, p.z] = this.collide(p.x + i.x * 6.2 * dt, p.z + i.y * 6.2 * dt, .5); }
        for (const o of alive) if (o !== id) { const q = gd.ps[o], dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz); if (d < 1 && d > 0) { p.x += dx / d * (1 - d) / 2; p.z += dz / d * (1 - d) / 2; } }
        p.inv -= dt; p.cd -= dt; p.moving = m > .15;
        if (i.b > p.lb) { p.lb = i.b; if (p.cd <= 0) { p.cd = .3; p.shotT = .25; const sx = Math.sin(p.face), sz = Math.cos(p.face); gd.balls.push({ id: gd.bid++, x: p.x + sx * .8, z: p.z + sz * .8, vx: sx * 17, vz: sz * 17, t: 1.1, own: id }); beep(700, .05, 'square', .04); } }
        p.shotT = (p.shotT || 0) - dt;
      }
      for (const b of gd.balls) {
        b.t -= dt; b.x += b.vx * dt; b.z += b.vz * dt;
        if (Math.abs(b.x) > this.W || Math.abs(b.z) > this.D) { b.t = 0; this.splat(Math.max(-this.W, Math.min(this.W, b.x)), Math.max(-this.D, Math.min(this.D, b.z)), pl(b.own)?.color || '#fff', .6); continue; }
        if (gd.obs.some(o => Math.hypot(o.x - b.x, o.z - b.z) < o.r)) { b.t = 0; this.splat(b.x, b.z, pl(b.own)?.color || '#fff', .7); beep(300, .04, 'sine', .03); continue; }
        for (const id of alive) {
          const p = gd.ps[id]; if (id === b.own || b.t <= 0 || !p.alive) continue;
          if (Math.hypot(p.x - b.x, p.z - b.z) < .62) {
            b.t = 0; this.splat(p.x, p.z, pl(b.own)?.color || '#fff', 1.3);
            if (p.inv > 0) continue;
            p.lives--; p.inv = 1.2; p.hitT = .4; gd.ps[b.own].hits++; beep(160, .2, 'sawtooth', .07);
            if (p.lives <= 0) { p.alive = false; gd.out.push(id); SFX.bad(); shakeScreen(); this.splat(p.x, p.z, pl(b.own)?.color || '#fff', 2.4); sync(); updateStrip(); }
          }
        }
        if (b.t <= 0 && b.t > -1) b.t = -2;
      }
      gd.balls = gd.balls.filter(b => b.t > 0);
      gd.hudT = (gd.hudT || 0) - dt;
      if (gd.hudT <= 0) { gd.hudT = .25; hud3D(chipsHTML(gd.ids.slice().sort((a, b) => (gd.ps[b].alive - gd.ps[a].alive) || gd.ps[b].lives - gd.ps[a].lives || gd.ps[b].hits - gd.ps[a].hits).map(id => ({ c: gd.ps[id].alive ? (pl(id)?.color || '#888') : '#64748b', t: `${pl(id)?.emoji || ''} ${esc(pl(id)?.name || '')} ${gd.ps[id].alive ? '❤️'.repeat(gd.ps[id].lives) : '💀'} 🎯${gd.ps[id].hits}` })))); }
      const left = gd.ids.filter(id => gd.ps[id].alive).length;
      if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.paintball.end(); }, 1600); }
    },
    draw(ctx) {
      const gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const { T, scene } = r, now = performance.now(), dt = Math.min(.05, (now - r.last) / 1000); r.last = now;
        for (const id of gd.ids) {
          const a = r.chars[id]; if (!a) continue; const p = gd.ps[id];
          a.obj.position.set(p.x, 0, p.z); a.obj.rotation.y = p.face;
          if (!p.alive) { if (!a.dead) { a.dead = true; a.play('Death', true); } }
          else if ((p.hitT = (p.hitT || 0) - dt) > 0) a.play('HitReact');
          else a.play(p.moving ? (p.shotT > 0 ? 'Run_Shoot' : 'Run_Gun') : (p.shotT > 0 ? 'Idle_Shoot' : 'Idle'));
          a.obj.visible = !(p.alive && p.inv > 0 && Math.sin(now / 45) > .3);
          a.mixer.update(dt);
        }
        const live = new Set();
        for (const b of gd.balls) {
          live.add(b.id);
          if (!r.balls[b.id]) { const m = new T.Mesh(r.ballGeo, new T.MeshStandardMaterial({ color: pl(b.own)?.color || '#fff', emissive: pl(b.own)?.color || '#fff', emissiveIntensity: .5, roughness: .2 })); m.castShadow = true; scene.add(m); r.balls[b.id] = m; }
          r.balls[b.id].position.set(b.x, 1.05, b.z);
        }
        for (const k in r.balls) if (!live.has(+k)) { scene.remove(r.balls[k]); delete r.balls[k]; }
        r.cam.position.x = Math.sin(now / 6000) * 1; r.cam.lookAt(0, 0, 1);
        r.renderer.render(scene, r.cam); return;
      }
      const S = 40, cx = 500, cy = 300;
      ctx.fillStyle = '#8fbf6a'; ctx.fillRect(0, 0, 1000, 600);
      for (const s of gd.splats) { ctx.fillStyle = s.color; ctx.globalAlpha = .7; ctx.beginPath(); ctx.arc(cx + s.x * S, cy + s.z * S, 12, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
      for (const o of gd.obs) { ctx.fillStyle = '#92400e'; ctx.fillRect(cx + o.x * S - 30, cy + o.z * S - 30, 60, 60); }
      for (const b of gd.balls) { ctx.fillStyle = pl(b.own)?.color || '#fff'; ctx.beginPath(); ctx.arc(cx + b.x * S, cy + b.z * S, 7, 0, 6.283); ctx.fill(); }
      for (const id of gd.ids) { const p = gd.ps[id]; if (!p.alive) continue; ctx.beginPath(); ctx.arc(cx + p.x * S, cy + p.z * S, 20, 0, 6.283); ctx.fillStyle = pl(id)?.color || '#888'; ctx.fill(); emo(ctx, pl(id)?.emoji || '?', cx + p.x * S, cy + p.z * S, 22); }
    },
    end() {
      if (H.phase !== 'pb-go') return;
      const gd = H.gd, sc = id => (gd.ps[id].alive ? 1000 + gd.ps[id].lives * 100 : gd.out.indexOf(id) * 100) + gd.ps[id].hits, g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `${gd.ps[id].alive ? '😎 En pie' : '🎨 Pintado'} · 🎯${gd.ps[id].hits}`, gain: g[id] || 0 }));
      setPhase('pb-res', 6000, () => finishGame(g), 0, false); confetti(100); SFX.win();
    },
    render(ph) {
      if (ph === 'pb-ready') return canvasHTML(true, '🎯 ¡A sus posiciones!');
      if (ph === 'pb-go') return canvasHTML(false);
      return `<h1 class="title-pop">🎯 Los mejores tiradores</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
