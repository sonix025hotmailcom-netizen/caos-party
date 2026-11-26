Object.assign(GAMES, {
  /* 🍣 CHEF LOCO 3D */
  chef: {
    name: 'Chef Loco 3D', emoji: '🍣', color: '#f43f5e', W: 11, D: 6.5,
    desc: '¡En 3D! Cae comida del cielo 🍔🍕. Párate sobre el círculo VERDE para agarrarla (joystick o WASD). El dorado 🍣 vale x3. Esquivá los círculos ROJOS 💣 y las ratas 🐀.',
    start() {
      const ids = onlineIds(), ps = {};
      preloadChars(ids.map(id => charOf(pl(id)))); C3D.load('assets/props/food.glb').catch(() => {}); C3D.load('assets/props/world.glb').catch(() => {}); C3D.load('assets/chars/Rat.glb').catch(() => {});
      ids.forEach((id, i) => ps[id] = { x: (i - (ids.length - 1) / 2) * 2.2, z: 3, sc: 0, stun: 0, face: 0 });
      H.inp = {}; H.gd = { ids, ps, items: [], rats: [], t: 0, spawn: .5, ratT: 7, iid: 0, sid: rid(), build3D: T => GAMES.chef.build(T) };
      setPhase('cf-ready', 3500, () => { SFX.go(); GAMES.chef.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.chef.draw);
    },
    go() { setPhase('cf-go', 40000, () => GAMES.chef.end()); attachArena(H.gd); rtLoop(dt => GAMES.chef.step(dt), GAMES.chef.draw); },
    build(T) {
      const W = this.W, D = this.D, r = arena3D(T, { bg: '#fde68a', camY: 21, camZ: 8, lookZ: .4 }), gd = H.gd;
      r.scene.fog = new T.Fog('#fde68a', 28, 60);
      const floor = new T.Mesh(new T.BoxGeometry(W * 2 + 1, 1, D * 2 + 1), [0, 0, new T.MeshStandardMaterial({ map: (() => { const t = checkerTex(T, '#fff7ed', '#f87171', 10); t.repeat.set(2.2, 1.3); return t; })(), roughness: .6 }), 0, 0, 0].map(m => m || new T.MeshStandardMaterial({ color: '#b45309' })));
      floor.position.y = -.5; floor.receiveShadow = true; r.scene.add(floor);
      const counter = new T.Mesh(new T.BoxGeometry(W * 2 + 3, 1.6, 1.2), new T.MeshStandardMaterial({ color: '#92400e', roughness: .5 })); counter.position.set(0, .3, -D - 1.2); counter.receiveShadow = true; r.scene.add(counter);
      const top = new T.Mesh(new T.BoxGeometry(W * 2 + 3.2, .2, 1.4), new T.MeshStandardMaterial({ color: '#e5e7eb', roughness: .3, metalness: .2 })); top.position.set(0, 1.15, -D - 1.2); r.scene.add(top);
      r.foodOnCounter = new T.Group(); r.scene.add(r.foodOnCounter);
      ['Food_Ramen', 'Pancakes_Stack', 'Food_Udon', 'Burger', 'Food_Dango', 'Pizza_Slice', 'Food_Onigiri'].forEach((n, i) => C3D.prop('food', n, 1.1).then(o => { if (!o) return; o.position.set(-W + 1 + i * (W * 2 - 2) / 6, 1.25, -D - 1.2); r.foodOnCounter.add(o); }).catch(() => {}));
      r.chars = {}; r.rats = {}; r.items = {};
      for (const id of gd.ids) C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.9), tintFor(g, id)); a.play('Idle'); r.scene.add(a.obj); r.chars[id] = a; }).catch(() => {});
      const sg = new T.RingGeometry(.55, .8, 32); r.shadowMat = new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .35, side: T.DoubleSide }); r.shadowGeo = sg;
      r.last = performance.now();
      return r;
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'cf-ready' || H.phase === 'cf-go') return joyView(p, '🕹️ Corré y agarrá la comida', '');
      return watch();
    },
    onAct(p, m) { if (H.phase === 'cf-ready' || H.phase === 'cf-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, W = this.W, D = this.D; gd.t += dt; gd.spawn -= dt; gd.ratT -= dt;
      if (gd.spawn <= 0) {
        gd.spawn = Math.max(.22, .75 - gd.t * .012) * (5 / (3 + Math.min(gd.ids.length, 8)));
        const r = Math.random(), type = r < .12 ? 'gold' : r < .32 ? 'bomb' : 'food';
        gd.items.push({ id: gd.iid++, x: (Math.random() * 2 - 1) * (W - .6), z: (Math.random() * 2 - 1) * (D - .6), y: 9 + Math.random() * 3, vy: 0, type, n: type === 'gold' ? pickR(FOOD_GOLD) : type === 'food' ? pickR(FOOD_GOOD) : 'Bomb', rot: Math.random() * 6 });
      }
      if (gd.ratT <= 0) { gd.ratT = Math.max(3.5, 8 - gd.t * .1); const fromL = Math.random() < .5; gd.rats.push({ id: gd.iid++, x: fromL ? -W - 1 : W + 1, z: (Math.random() * 2 - 1) * (D - 1), vx: (fromL ? 1 : -1) * (4.5 + Math.random() * 2) }); }
      for (const id of gd.ids) {
        const p = gd.ps[id]; if (p.stun > 0) { p.stun -= dt; continue; }
        const i = inp(id); p.x = Math.max(-W + .5, Math.min(W - .5, p.x + i.x * 8 * dt)); p.z = Math.max(-D + .5, Math.min(D - .5, p.z + i.y * 8 * dt));
        if (Math.hypot(i.x, i.y) > .15) p.face = Math.atan2(i.x, i.y);
      }
      for (const it of gd.items) {
        it.vy -= 13 * dt; it.y += it.vy * dt; it.rot += dt * 3;
        if (it.done) continue;
        if (it.y < 2.6 && it.y > -.2) {
          for (const id of gd.ids) {
            const p = gd.ps[id]; if (p.stun > 0) continue;
            if (Math.hypot(p.x - it.x, p.z - it.z) < 1.5) {
              it.done = true;
              if (it.type === 'bomb') { p.stun = 1.6; const lost = Math.min(2, p.sc); p.sc -= lost; SFX.bad(); shakeScreen(); this.fx(id, 'boom'); }
              else { p.sc += it.type === 'gold' ? 3 : 1; if (it.type === 'gold') { beep(1300, .15, 'triangle', .08); beep(1700, .2, 'triangle', .08, .08); } else SFX.pop(); this.fx(id, it.type); }
              break;
            }
          }
        }
        if (it.y <= 0 && !it.done) { it.done = true; it.splat = true; if (it.type === 'bomb') beep(90, .2, 'sawtooth', .04); }
      }
      gd.items = gd.items.filter(it => !it.done || it.splat === undefined ? !it.done : false);
      for (const rt of gd.rats) {
        rt.x += rt.vx * dt;
        for (const id of gd.ids) { const p = gd.ps[id]; if (p.stun <= 0 && Math.hypot(p.x - rt.x, p.z - rt.z) < 1.1) { p.stun = 1.2; if (p.sc > 0) p.sc--; SFX.bad(); this.fx(id, 'rat'); } }
      }
      gd.rats = gd.rats.filter(r => Math.abs(r.x) < W + 3);
      gd.hudT = (gd.hudT || 0) - dt;
      if (gd.hudT <= 0) { gd.hudT = .2; hud3D(chipsHTML(gd.ids.slice().sort((a, b) => gd.ps[b].sc - gd.ps[a].sc).map((id, i) => ({ c: pl(id)?.color || '#888', t: `${i === 0 && gd.ps[id].sc ? '👑 ' : ''}${pl(id)?.emoji || ''} ${esc(pl(id)?.name || '')} · 🍽️ ${gd.ps[id].sc}` })))); }
    },
    fx(id, kind) { const gd = H.gd; (gd.pops = gd.pops || []).push({ id, kind, t: 0 }); },
    draw(ctx) {
      const gd = H.gd, r = gd.r3;
      if (r && r.renderer.domElement.isConnected) {
        const { T, scene } = r, now = performance.now(), dt = Math.min(.05, (now - r.last) / 1000); r.last = now;
        for (const id of gd.ids) {
          const a = r.chars[id]; if (!a) continue; const p = gd.ps[id], i = inp(id), mv = Math.hypot(i.x, i.y) > .15 && p.stun <= 0;
          a.obj.position.set(p.x, p.stun > 0 ? Math.abs(Math.sin(now / 90)) * .25 : 0, p.z); a.obj.rotation.y = p.face;
          if (p.stun > 0) a.play('HitReact'); else a.play(mv ? 'Run' : 'Idle');
          a.mixer.update(dt);
        }
        const live = new Set();
        for (const it of gd.items) {
          live.add(it.id); let o = r.items[it.id];
          if (!o) {
            o = r.items[it.id] = { g: new T.Group(), sh: new T.Mesh(r.shadowGeo, r.shadowMat.clone()) }; o.sh.rotation.x = -Math.PI / 2; scene.add(o.g); scene.add(o.sh);
            if (it.type === 'gold') { const ring = new T.Mesh(new T.TorusGeometry(.75, .07, 8, 30), new T.MeshBasicMaterial({ color: '#facc15' })); ring.rotation.x = Math.PI / 2; o.g.add(ring); }
            C3D.prop(it.type === 'bomb' ? 'world' : 'food', it.n, it.type === 'gold' ? 1.6 : it.type === 'bomb' ? 1.3 : 1.35).then(m => { if (m && r.items[it.id]) r.items[it.id].g.add(m); }).catch(() => {});
          }
          o.g.position.set(it.x, Math.max(0, it.y), it.z); o.g.rotation.y = it.rot;
          const k = Math.max(0, Math.min(1, 1 - it.y / 11)); o.sh.position.set(it.x, .03, it.z); o.sh.scale.setScalar(1.4 - k * .5); o.sh.material.opacity = .45 + k * .5;
          o.sh.material.color.set(it.type === 'bomb' ? '#ef4444' : it.type === 'gold' ? '#f59e0b' : '#16a34a');
        }
        for (const k in r.items) if (!live.has(+k)) { scene.remove(r.items[k].g); scene.remove(r.items[k].sh); delete r.items[k]; }
        const lr = new Set();
        for (const rt of gd.rats) {
          lr.add(rt.id);
          if (!r.rats[rt.id]) { r.rats[rt.id] = { pending: true }; C3D.load('assets/chars/Rat.glb').then(g => { if (!r.rats[rt.id]) return; const a = C3D.make(g, .9); a.play('Run'); scene.add(a.obj); r.rats[rt.id] = a; }).catch(() => {}); }
          const a = r.rats[rt.id]; if (a.obj) { a.obj.position.set(rt.x, 0, rt.z); a.obj.rotation.y = rt.vx > 0 ? Math.PI / 2 : -Math.PI / 2; a.mixer.update(dt); }
        }
        for (const k in r.rats) if (!lr.has(+k)) { if (r.rats[k].obj) scene.remove(r.rats[k].obj); delete r.rats[k]; }
        r.cam.lookAt(0, 0, .4);
        r.renderer.render(scene, r.cam);
        return;
      }
      /* sin 3D: vista de arriba */
      const S = 40, cx = 500, cy = 300;
      ctx.fillStyle = '#fde68a'; ctx.fillRect(0, 0, 1000, 600);
      ctx.fillStyle = '#fff7ed'; ctx.fillRect(cx - this.W * S, cy - this.D * S, this.W * 2 * S, this.D * 2 * S);
      for (const it of gd.items) { emo(ctx, it.type === 'bomb' ? '💣' : it.type === 'gold' ? '🍣' : '🍔', cx + it.x * S, cy + it.z * S - it.y * 8, 30); }
      for (const rt of gd.rats) emo(ctx, '🐀', cx + rt.x * S, cy + rt.z * S, 34);
      for (const id of gd.ids) { const p = gd.ps[id]; ctx.beginPath(); ctx.arc(cx + p.x * S, cy + p.z * S, 18, 0, 6.283); ctx.fillStyle = pl(id)?.color || '#888'; ctx.fill(); emo(ctx, pl(id)?.emoji || '?', cx + p.x * S, cy + p.z * S, 22); }
    },
    end() {
      if (H.phase !== 'cf-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.ps[id].sc, true, id => gd.ps[id].sc > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.ps[b].sc - gd.ps[a].sc).map(id => ({ id, val: '🍽️ ' + gd.ps[id].sc, gain: g[id] || 0 }));
      setPhase('cf-res', 5500, () => finishGame(g), 0, false); confetti(100); SFX.win();
    },
    render(ph) {
      if (ph === 'cf-ready') return canvasHTML(true, '🍣 ¡Prepárense para la lluvia de comida!');
      if (ph === 'cf-go') return canvasHTML(false);
      return `<h1 class="title-pop">🍣 Los chefs más glotones</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
