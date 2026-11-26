Object.assign(GAMES, {
  ovni: {
    name: 'Defensa Ovni 3D', emoji: '🛸', color: '#0d9488', CW: 24, CH: 14,
    desc: '¡En 3D! Los ovnis 🛸 siguen el camino hacia la base. Cada uno tiene su torre con cañón: joystick para APUNTAR y botón para DISPARAR. Los ovnis grandes aguantan más y valen más. Si llegan a la base, la dañan… ¡defiéndanla juntos, pero el que más derribe gana!',
    start() {
      const ids = onlineIds(), CW = this.CW, CH = this.CH;
      ['tile', 'tower-round-bottom-a', 'tower-round-middle-a', 'tower-round-top-a', 'weapon-turret', 'weapon-cannon', 'weapon-ballista', 'weapon-catapult', 'spawn-round', 'tower-square-bottom-a', 'tower-square-middle-a', 'tower-square-top-a', 'tower-square-roof-a', 'detail-tree-large', 'detail-tree', 'detail-rocks', 'detail-rocks-large', 'detail-crystal-large', 'enemy-ufo-a', 'enemy-ufo-b', 'enemy-ufo-c', 'enemy-ufo-d'].forEach(n => TDM(n).catch(() => {}));
      /* camino aleatorio de izquierda a derecha, con curvas */
      const path = []; let r = 3 + rand(CH - 6), c = 0; path.push([c, r]);
      while (c < CW - 1) {
        const run = 2 + rand(3); for (let k = 0; k < run && c < CW - 1; k++) { c++; path.push([c, r]); }
        if (c < CW - 3 && Math.random() < .85) { const nr = Math.max(1, Math.min(CH - 2, r + (Math.random() < .5 ? -1 : 1) * (2 + rand(4)))); while (r !== nr) { r += Math.sign(nr - r); path.push([c, r]); } }
      }
      const onPath = new Set(path.map(([x, y]) => x + ',' + y)), P3 = ([x, y]) => [x - (CW - 1) / 2, y - (CH - 1) / 2];
      /* torres: repartidas a lo largo del camino, a 2 casillas del camino */
      const towers = {}, used = new Set();
      ids.forEach((id, i) => {
        const idx = Math.round((i + .5) / ids.length * (path.length - 1)), [pc, pr] = path[idx], side = i % 2 ? 1 : -1;
        let best = null; for (const d of [2, -2, 3, -3, 1, -1, 4, -4]) { const rr = pr + d * side, cc = pc; if (rr < 0 || rr >= CH || onPath.has(cc + ',' + rr) || used.has(cc + ',' + rr)) continue; const near = [-1, 0, 1].some(a => [-1, 0, 1].some(b => used.has((cc + a) + ',' + (rr + b)))); if (near) continue; best = [cc, rr]; break; }
        if (!best) for (let k = 0; k < 200 && !best; k++) { const cc = rand(CW), rr = rand(CH); if (!onPath.has(cc + ',' + rr) && !used.has(cc + ',' + rr)) best = [cc, rr]; }
        used.add(best.join(',')); const [x, z] = P3(best);
        towers[id] = { x, z, a: Math.atan2(-x * .2, -z), cd: 0, lb: 0, pts: 0, kills: 0, big: 0, wpn: ['weapon-turret', 'weapon-cannon', 'weapon-ballista', 'weapon-catapult'][i % 4] };
      });
      const deco = []; for (let k = 0; k < 26; k++) { const cc = rand(CW), rr = rand(CH), key = cc + ',' + rr; if (onPath.has(key) || used.has(key) || [...used].some(u => { const [a, b] = u.split(',').map(Number); return Math.abs(a - cc) < 2 && Math.abs(b - rr) < 2; })) continue; used.add(key); deco.push({ c: cc, r: rr, m: pickR(['detail-tree-large', 'detail-tree', 'detail-tree-large', 'detail-rocks', 'detail-rocks-large', 'detail-crystal-large']), rot: Math.random() * 6.28 }); }
      H.inp = {}; H.gd = { ids, path, pathW: path.map(P3), onPath, towers, deco, ufos: [], bul: [], fx: [], t: 0, uid: 0, spawn: 1.5, base: 20, baseMax: 20, sid: rid(), build3D: T => GAMES.ovni.build(T) };
      setPhase('ov-ready', 3600, () => { SFX.go(); GAMES.ovni.go(); }, 0, false);
      attachArena(H.gd); rtLoop(null, GAMES.ovni.draw);
    },
    go() { setPhase('ov-go', 75000, () => GAMES.ovni.end()); attachArena(H.gd); rtLoop(dt => GAMES.ovni.step(dt), GAMES.ovni.draw); },
    UT: { a: { m: 'enemy-ufo-a', hp: 1, sp: 1.9, pts: 1, s: 1, dmg: 1 }, b: { m: 'enemy-ufo-b', hp: 2, sp: 1.55, pts: 2, s: 1.15, dmg: 2 }, c: { m: 'enemy-ufo-c', hp: 4, sp: 1.25, pts: 4, s: 1.3, dmg: 3 }, d: { m: 'enemy-ufo-d', hp: 12, sp: .75, pts: 12, s: 2, dmg: 6 } },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'ov-ready' || H.phase === 'ov-go') return joyView(p, '🕹️ Apuntá tu cañón · Botón = DISPARAR', '💥 FUEGO', .3);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'ov-ready' || H.phase === 'ov-go') joyAct(p, m); },
    posAt(s) { const pw = H.gd.pathW, i = Math.max(0, Math.min(pw.length - 1.001, s)), k = Math.floor(i), f = i - k, a = pw[k], b = pw[Math.min(pw.length - 1, k + 1)]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; },
    step(dt) {
      const gd = H.gd, U = this.UT; gd.t += dt; gd.spawn -= dt;
      if (gd.spawn <= 0) {
        gd.spawn = Math.max(.55, 1.7 - gd.t * .018) * (4 / (3 + Math.min(gd.ids.length, 6)));
        const r = Math.random(), boss = gd.t > 20 && !gd.ufos.some(u => u.k === 'd') && Math.random() < .07;
        const k = boss ? 'd' : r < .5 - gd.t * .004 ? 'a' : r < .82 ? 'b' : 'c';
        gd.ufos.push({ id: gd.uid++, k, s: 0, hp: U[k].hp, sp: U[k].sp * (1 + gd.t / 140), hit: 0, ph: Math.random() * 6 });
        if (boss) { SND.play('sf_forceField_000', .5, .7); toastHost('👾 ¡Viene la NAVE NODRIZA!'); }
      }
      for (const u of gd.ufos) {
        u.s += u.sp * dt; u.hit -= dt; const [x, z] = this.posAt(u.s); u.x = x; u.z = z;
        if (u.s >= gd.path.length - 1) { u.gone = true; gd.base = Math.max(0, gd.base - U[u.k].dmg); SFX.bad(); shakeScreen(); gd.fx.push({ k: 'leak', t: 0 }); if (gd.base <= 0 && !gd.ending) { gd.ending = true; toastHost('💥 ¡Destruyeron la base!'); const tok = H.token; setTimeout(() => { if (tok === H.token) this.end(); }, 1500); } }
      }
      for (const id of gd.ids) {
        const tw = gd.towers[id], i = inp(id); tw.cd -= dt;
        if (Math.hypot(i.x, i.y) > .2) { const ta = Math.atan2(i.x, i.y); let d = ta - tw.a; d = Math.atan2(Math.sin(d), Math.cos(d)); tw.a += Math.sign(d) * Math.min(Math.abs(d), 9 * dt); }
        if (i.b !== tw.lb) { tw.lb = i.b; if (tw.cd <= 0 && H.phase === 'ov-go') { tw.cd = .3; const dx = Math.sin(tw.a), dz = Math.cos(tw.a); gd.bul.push({ x: tw.x + dx * .7, z: tw.z + dz * .7, vx: dx * 17, vz: dz * 17, life: .6, own: id }); gd.fx.push({ k: 'muz', id, t: 0 }); SND.play(tw.wpn === 'weapon-cannon' || tw.wpn === 'weapon-catapult' ? 'impactPunch_medium_000' : 'sf_laserSmall_001', .3, 1.1 + Math.random() * .2, 0); } }
      }
      for (const b of gd.bul) {
        b.life -= dt; if (b.life <= 0) { b.dead = true; continue; }
        b.x += b.vx * dt; b.z += b.vz * dt;
        for (const u of gd.ufos) {
          if (u.gone || Math.hypot(u.x - b.x, u.z - b.z) > .55 * U[u.k].s + .2) continue;
          b.dead = true; u.hp--; u.hit = .12; { const tw0 = gd.towers[b.own]; tw0.pts++; tw0.hits = (tw0.hits || 0) + 1; }
          if (u.hp <= 0) { u.gone = true; const tw = gd.towers[b.own]; tw.pts += U[u.k].pts; tw.kills++; if (u.k === 'd') { tw.big++; confetti(60); } gd.fx.push({ k: 'boom', x: u.x, z: u.z, t: 0, s: U[u.k].s, c: pl(b.own)?.color || '#fff', pts: U[u.k].pts }); SND.play(['sf_explosionCrunch_000', 'sf_explosionCrunch_001'], .45, 1.1); }
          else SND.play('impactMetal_light_000', .3, 1.3);
          break;
        }
      }
      gd.ufos = gd.ufos.filter(u => !u.gone); gd.bul = gd.bul.filter(b => !b.dead);
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < (f.k === 'boom' ? .7 : f.k === 'leak' ? .5 : .12));
      gd.hudT = (gd.hudT || 0) - dt;
      if (gd.hudT <= 0) { gd.hudT = .25; hud3D(`<span class="schip" style="--c:${gd.base > gd.baseMax * .4 ? '#22c55e' : '#ef4444'}">🏰 Base ${'█'.repeat(Math.ceil(gd.base / gd.baseMax * 10))}${'░'.repeat(10 - Math.ceil(gd.base / gd.baseMax * 10))}</span>` + chipsHTML(gd.ids.slice().sort((a, b) => gd.towers[b].pts - gd.towers[a].pts).map((id, i) => ({ c: pl(id)?.color || '#888', t: `${i === 0 && gd.towers[id].pts ? '👑 ' : ''}${pl(id)?.emoji || ''} ${esc(pl(id)?.name || '')} · ${gd.towers[id].pts}` })))); }
    },
    label(T, txt, col) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
      g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(4, 8, 248, 48, 24) : g.rect(4, 8, 248, 48); g.fill(); g.lineWidth = 5; g.strokeStyle = '#1a1033'; g.stroke();
      g.fillStyle = '#fff'; g.font = '900 28px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt.slice(0, 16), 128, 33);
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; const s = new T.Sprite(new T.SpriteMaterial({ map: t, depthTest: false })); s.scale.set(2.4, .6, 1); s.renderOrder = 10; return s;
    },
    build(T) {
      const gd = H.gd, CW = this.CW, CH = this.CH, r = arena3D(T, { bg: '#93c5fd', camY: 22.5, camZ: 15, lookZ: .9 });
      r.scene.fog = new T.Fog('#93c5fd', 32, 70);
      const clone = (n, s, x, y, z, ry = 0, parent = r.scene) => TDM(n).then(g => { if (H.gd !== gd) return null; const o = g.scene.clone(true); o.scale.setScalar(s); o.position.set(x, y, z); o.rotation.y = ry; o.traverse(q => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } }); parent.add(o); return o; }).catch(() => null);
      /* suelo: placa base + losetas del kit */
      const slab = new T.Mesh(new T.BoxGeometry(CW + 1.2, 1, CH + 1.2), new T.MeshStandardMaterial({ color: '#6b4f2a', roughness: .9 })); slab.position.y = -.5; slab.receiveShadow = true; r.scene.add(slab);
      const sand = new T.MeshStandardMaterial({ color: '#e7c98b', roughness: .95 }), pathGeo = new T.BoxGeometry(1, .16, 1);
      TDM(gd._tileName || 'tile').then(g => { if (H.gd !== gd) return; for (let c = 0; c < CW; c++) for (let rr = 0; rr < CH; rr++) { const x = c - (CW - 1) / 2, z = rr - (CH - 1) / 2; if (gd.onPath.has(c + ',' + rr)) { const m = new T.Mesh(pathGeo, sand); m.position.set(x, .08, z); m.receiveShadow = true; r.scene.add(m); continue; } const o = g.scene.clone(true); o.position.set(x, 0, z); o.traverse(q => { if (q.isMesh) q.receiveShadow = true; }); r.scene.add(o); } }).catch(() => {});
      /* bordecito del camino */
      gd.pathW.forEach(([x, z], k) => { if (k % 2) return; const d = new T.Mesh(new T.CylinderGeometry(.06, .06, .05, 8), new T.MeshStandardMaterial({ color: '#b45309' })); d.position.set(x, .18, z); r.scene.add(d); });
      const [sx, sz] = gd.pathW[0], [ex, ez] = gd.pathW[gd.pathW.length - 1];
      clone('spawn-round', 2, sx, .16, sz); const portal = new T.Mesh(new T.TorusGeometry(.7, .1, 10, 30), new T.MeshStandardMaterial({ color: '#a855f7', emissive: '#a855f7', emissiveIntensity: 1.6 })); portal.position.set(sx, 1, sz); portal.rotation.y = Math.PI / 2; r.scene.add(portal); r.portal = portal;
      /* la base (castillo) al final del camino */
      r.base = new T.Group(); r.base.position.set(ex, .16, ez); r.scene.add(r.base);
      clone('tower-square-bottom-a', 1.7, 0, 0, 0, 0, r.base).then(() => clone('tower-square-middle-a', 1.7, 0, .85, 0, 0, r.base)).then(() => clone('tower-square-top-a', 1.7, 0, 1.7, 0, 0, r.base)).then(() => clone('tower-square-roof-a', 1.7, 0, 2.55, 0, 0, r.base));
      const flag = new T.Mesh(new T.PlaneGeometry(.7, .45), new T.MeshStandardMaterial({ color: '#facc15', side: T.DoubleSide })); flag.position.set(.35, 4.6, 0); r.base.add(flag); const pole = new T.Mesh(new T.CylinderGeometry(.03, .03, 1.2, 6), new T.MeshStandardMaterial({ color: '#e5e7eb' })); pole.position.set(0, 4.3, 0); r.base.add(pole); r.flag = flag;
      /* mundo alrededor: río (foso) con puente, terreno de bloques, aldea y nubes que pasan */
      { const snow = /snow/.test(gd._tileName || ''), gc = snow ? ['#f1f5f9', '#e2e8f0', '#cbd5e1'] : ['#65a30d', '#4d7c0f', '#84cc16'], W2 = CW / 2 + 1.6, D2 = CH / 2 + 1.6;
        const wt = CARX.tex(T, 128, 128, (g, w, h) => { g.fillStyle = snow ? '#7dd3fc' : '#0ea5e9'; g.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); const x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + 14, y); g.stroke(); } }, [12, 8]);
        const water = new T.Mesh(new T.PlaneGeometry(CW + 6, CH + 6), new T.MeshStandardMaterial({ map: wt, roughness: .15, metalness: .1, transparent: true, opacity: .92 })); water.rotation.x = -Math.PI / 2; water.position.y = -.75; r.scene.add(water); r.water = wt;
        const vg = new T.BoxGeometry(1, 1, 1), N = 420, im = new T.InstancedMesh(vg, new T.MeshStandardMaterial({ roughness: .9 }), N), o3 = new T.Object3D(), cc = new T.Color(); let n = 0;
        for (let x = -24; x <= 24; x++) for (let z = -16; z <= 12; z++) { if (Math.abs(x) < W2 + 1.5 && Math.abs(z) < D2 + 1.5) continue; if (n >= N || Math.random() < .55) continue; const h = .4 + Math.random() * 1.4 + (Math.abs(z) > 10 ? 1 : 0); o3.position.set(x, -1 + h / 2, z); o3.scale.set(1, h, 1); o3.updateMatrix(); im.setMatrixAt(n, o3.matrix); im.setColorAt(n, cc.set(gc[n % 3])); n++; }
        im.count = n; im.receiveShadow = true; r.scene.add(im);
        const bridgeM = new T.MeshStandardMaterial({ color: '#a16207', roughness: .8 }); [[0, D2 - .2, 2.2, 2.6], [W2 - .2, 0, 2.6, 2.2]].forEach(([x, z, w, d]) => { const b = new T.Mesh(new T.BoxGeometry(w, .2, d), bridgeM); b.position.set(x, -.12, z); b.castShadow = true; r.scene.add(b); [-1, 1].forEach(sd => { const rail = new T.Mesh(new T.BoxGeometry(w > d ? w : .1, .35, w > d ? .1 : d), bridgeM); rail.position.set(x + (w > d ? 0 : sd * w / 2), .1, z + (w > d ? sd * d / 2 : 0)); r.scene.add(rail); }); });
        const wallM = new T.MeshStandardMaterial({ color: snow ? '#e7e5e4' : '#fde68a' }), roofM = new T.MeshStandardMaterial({ color: '#b91c1c' });
        for (let k = 0; k < 7; k++) { const hx = -W2 - 3 - (k % 3) * 2.2, hz = -6 + k * 2, g = new T.Group(); const body = new T.Mesh(new T.BoxGeometry(1.4, 1, 1.2), wallM); body.position.y = .5; body.castShadow = true; g.add(body); const roof = new T.Mesh(new T.ConeGeometry(1.1, .8, 4), roofM); roof.position.y = 1.4; roof.rotation.y = Math.PI / 4; g.add(roof); g.position.set(hx, 0, hz); g.rotation.y = Math.random(); r.scene.add(g); }
        const cm = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 1, transparent: true, opacity: .92 }); r.clouds = []; for (let k = 0; k < 6; k++) { const g = new T.Group(); for (let q = 0; q < 4; q++) { const b = new T.Mesh(new T.BoxGeometry(1.6 + Math.random(), .8, 1.2 + Math.random()), cm); b.position.set(q * 1.1, Math.random() * .4, Math.random() * .6); g.add(b); } g.position.set(-28 + k * 10, 3.5 + Math.random() * 2, -15 - Math.random() * 4); r.scene.add(g); r.clouds.push(g); } }
      /* decoración */
      gd.deco.forEach(d => clone(d.m, /tree/.test(d.m) ? 1.6 : 1.4, d.c - (CW - 1) / 2, .2, d.r - (CH - 1) / 2, d.rot));
      /* torres de cada jugador */
      r.tw = {};
      gd.ids.forEach(id => {
        const tw = gd.towers[id], p = pl(id), g = new T.Group(); g.position.set(tw.x, .2, tw.z); r.scene.add(g);
        const S = 1.25; clone('tower-round-bottom-a', S, 0, 0, 0, 0, g).then(() => clone('tower-round-middle-a', S, 0, .6 * S, 0, 0, g)).then(() => clone('tower-round-top-a', S, 0, 1.2 * S, 0, 0, g));
        const ring = new T.Mesh(new T.TorusGeometry(.75, .09, 10, 32), new T.MeshStandardMaterial({ color: p?.color || '#fff', emissive: p?.color || '#fff', emissiveIntensity: .7 })); ring.rotation.x = Math.PI / 2; ring.position.y = .06; g.add(ring);
        const head = new T.Group(); head.position.y = 1.2 * S + .5 * S; g.add(head);
        clone(tw.wpn, 1.9, 0, 0, 0, 0, head);
        const aim = new T.Mesh(new T.BoxGeometry(.06, .02, 9), new T.MeshBasicMaterial({ color: p?.color || '#fff', transparent: true, opacity: .35 })); aim.position.set(0, .3, 4.9); head.add(aim);
        const lb = this.label(T, `${p?.emoji || ''} ${p?.name || ''}`, p?.color || '#888'); lb.position.y = 3.9; g.add(lb);
        r.tw[id] = { g, head };
      });
      r.ufos = {}; r.bul = {}; r.fx = [];
      r.last = performance.now();
      return r;
    },
    draw(ctx) {
      const gd = H.gd, r = gd.r3, U = GAMES.ovni.UT;
      if (r && r.renderer.domElement.isConnected) {
        const { T, scene } = r, now = performance.now(), t = now / 1000;
        if (r.portal) r.portal.rotation.x = t * 2; if (r.water) { r.water.offset.x = (t * .02) % 1; } if (r.clouds) r.clouds.forEach((c, k) => { c.position.x = ((t * (.5 + k * .08) + k * 10) % 60) - 30; });
        if (r.flag) r.flag.rotation.y = Math.sin(t * 3) * .3;
        for (const id of gd.ids) { const o = r.tw[id]; if (!o) continue; o.head.rotation.y = gd.towers[id].a; const mz = gd.fx.find(f => f.k === 'muz' && f.id === id); o.head.scale.setScalar(mz ? 1.12 : 1); }
        const live = new Set();
        for (const u of gd.ufos) {
          live.add(u.id); let o = r.ufos[u.id];
          if (!o) { o = r.ufos[u.id] = new T.Group(); scene.add(o); TDM(U[u.k].m).then(g => { if (!r.ufos[u.id]) return; const m = g.scene.clone(true); m.scale.setScalar(U[u.k].s); m.traverse(q => { if (q.isMesh) { q.castShadow = true; q.material = q.material.clone(); } }); o.add(m); o.userData.m = m; }).catch(() => {}); }
          o.position.set(u.x, 1 + Math.sin(t * 3 + u.ph) * .15, u.z); o.rotation.y = t * 2;
          /* barra de vida (solo si aguanta más de un tiro) */
          const mx = U[u.k].hp; if (mx > 1) { if (!o.userData.hb) { const g = new T.Group(), bg = new T.Mesh(new T.PlaneGeometry(1.2, .16), new T.MeshBasicMaterial({ color: '#111827', depthTest: false, transparent: true, opacity: .85 })), fg = new T.Mesh(new T.PlaneGeometry(1.1, .1), new T.MeshBasicMaterial({ color: '#22c55e', depthTest: false })); bg.renderOrder = 11; fg.renderOrder = 12; fg.position.z = .001; g.add(bg, fg); g.userData.fg = fg; scene.add(g); o.userData.hb = g; }
            const hb = o.userData.hb, f = Math.max(0, u.hp / mx); hb.position.set(u.x, 2 + U[u.k].s * .6, u.z); hb.quaternion.copy(r.cam.quaternion); hb.userData.fg.scale.x = Math.max(.001, f); hb.userData.fg.position.x = -.55 * (1 - f); hb.userData.fg.material.color.set(f > .5 ? '#22c55e' : f > .25 ? '#facc15' : '#ef4444'); }
          (r.lastU = r.lastU || {})[u.id] = { x: u.x, z: u.z, k: u.k };
          if (o.userData.m) o.userData.m.traverse(q => { if (q.isMesh) q.material.emissive && q.material.emissive.set(u.hit > 0 ? '#ff2222' : '#000000'); });
        }
        for (const k in r.ufos) if (!live.has(+k)) { const o = r.ufos[k], L = (r.lastU || {})[k]; if (o.userData.hb) scene.remove(o.userData.hb); scene.remove(o); delete r.ufos[k];
          /* si no llegó a la base: revienta en pedacitos tipo voxel y saltan monedas */
          if (L && r.base && Math.hypot(L.x - r.base.position.x, L.z - r.base.position.z) > 1.6) { const big = U[L.k].s, n = 10 + Math.round(big * 8), cols = ['#a855f7', '#22d3ee', '#e5e7eb', '#f472b6'];
            r.vox = r.vox || []; r.voxG = r.voxG || new T.BoxGeometry(.18, .18, .18); r.coinG = r.coinG || new T.CylinderGeometry(.14, .14, .05, 14); r.coinM = r.coinM || new T.MeshStandardMaterial({ color: '#facc15', metalness: .8, roughness: .25, emissive: '#a16207', emissiveIntensity: .4 });
            for (let q = 0; q < n; q++) { const m = new T.Mesh(r.voxG, new T.MeshStandardMaterial({ color: cols[q % cols.length], emissive: cols[q % cols.length], emissiveIntensity: .3 })); m.position.set(L.x, 1, L.z); m.scale.setScalar(.6 + Math.random() * big); scene.add(m); const a = Math.random() * 6.28, sp = 2 + Math.random() * 3; r.vox.push({ m, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 3 + Math.random() * 4, sx: Math.random() * 8, t: 0 }); }
            for (let q = 0; q < Math.min(6, 1 + Math.round(big * 2)); q++) { const m = new T.Mesh(r.coinG, r.coinM); m.position.set(L.x, 1.2, L.z); m.rotation.x = Math.PI / 2; scene.add(m); const a = Math.random() * 6.28; r.vox.push({ m, vx: Math.cos(a) * 1.2, vz: Math.sin(a) * 1.2, vy: 6 + Math.random() * 2, sx: 10, t: 0, coin: 1 }); } }
          else if (L && r.base) { r.smoke = r.smoke || []; r.dmg = (r.dmg || 0) + 1; } }
        if (r.vox) { const dt2 = Math.min(.05, (performance.now() - (r.lv || performance.now())) / 1000); r.lv = performance.now(); r.vox = r.vox.filter(v => { v.t += dt2; v.vy -= 14 * dt2; v.m.position.x += v.vx * dt2; v.m.position.z += v.vz * dt2; v.m.position.y = Math.max(.25, v.m.position.y + v.vy * dt2); if (v.m.position.y <= .25) { v.vy *= -.35; v.vx *= .7; v.vz *= .7; } v.m.rotation.y += v.sx * dt2; v.m.rotation.z += v.sx * .5 * dt2; if (v.t > (v.coin ? 1.4 : 1.8)) { v.m.scale.multiplyScalar(.85); } if (v.t > (v.coin ? 1.7 : 2.2)) { scene.remove(v.m); if (!v.coin) v.m.material.dispose(); return false; } return true; }); }
        /* humo saliendo de la base cuando la dañan */
        if (r.base && r.dmg) { r.smk = r.smk || []; if (Math.random() < Math.min(.5, r.dmg * .06)) { const sp = new T.Sprite(new T.SpriteMaterial({ color: '#57534e', transparent: true, opacity: .55, depthWrite: false })); sp.position.set(r.base.position.x + (Math.random() - .5) * .8, 3.2, r.base.position.z + (Math.random() - .5) * .8); sp.scale.setScalar(.5); scene.add(sp); r.smk.push({ sp, t: 0 }); }
          r.smk = r.smk.filter(q => { q.t += .016; q.sp.position.y += .03; q.sp.scale.setScalar(.5 + q.t * 1.6); q.sp.material.opacity = Math.max(0, .55 - q.t * .3); if (q.t > 1.8) { scene.remove(q.sp); q.sp.material.dispose(); return false; } return true; }); }
        /* el día se va volviendo atardecer durante la partida */
        if (!r.sky0) { r.sky0 = new T.Color('#93c5fd'); r.sky1 = new T.Color('#fb923c'); r.skyC = new T.Color(); r.sunL = scene.children.find(c => c.isDirectionalLight); r.sunC0 = new T.Color('#ffffff'); r.sunC1 = new T.Color('#fdba74'); }
        { const u = Math.min(1, (gd.t || 0) / 75); r.skyC.copy(r.sky0).lerp(r.sky1, u * .85); scene.background = r.skyC; if (scene.fog) scene.fog.color.copy(r.skyC); if (r.sunL) r.sunL.color.copy(r.sunC0).lerp(r.sunC1, u); }
        r.bulGeo = r.bulGeo || new T.SphereGeometry(.16, 10, 8);
        const lb = new Set(); gd.bul.forEach((b, i) => { b.key = b.key || Math.random(); lb.add(b.key); let m = r.bul[b.key]; if (!m) { m = r.bul[b.key] = new T.Mesh(r.bulGeo, new T.MeshStandardMaterial({ color: pl(b.own)?.color || '#fff', emissive: pl(b.own)?.color || '#fff', emissiveIntensity: 1.8 })); scene.add(m); } m.position.set(b.x, 2.6, b.z); });
        for (const k in r.bul) if (!lb.has(+k)) { scene.remove(r.bul[k]); delete r.bul[k]; }
        for (const f of gd.fx) if (f.k === 'boom' && !f.o) { f.o = new T.Mesh(new T.SphereGeometry(.6 * f.s, 16, 12), new T.MeshBasicMaterial({ color: '#fde68a', transparent: true })); f.o.position.set(f.x, 1, f.z); scene.add(f.o); f.l = GAMES.ovni.label(T, '+' + f.pts, f.c); f.l.position.set(f.x, 2, f.z); scene.add(f.l); r.fx.push(f); }
        r.fx = r.fx.filter(f => { if (f.t >= .7 || !gd.fx.includes(f)) { scene.remove(f.o); scene.remove(f.l); return false; } f.o.scale.setScalar(1 + f.t * 3); f.o.material.opacity = 1 - f.t / .7; f.l.position.y = 2 + f.t * 2; f.l.material.opacity = 1 - f.t / .7; return true; });
        if (r.base) r.base.scale.setScalar(gd.fx.some(f => f.k === 'leak') ? 1.08 : 1);
        r.renderer.render(scene, r.cam);
        return;
      }
      /* sin WebGL: vista desde arriba */
      ctx.fillStyle = '#4d7c0f'; ctx.fillRect(0, 0, 1000, 600);
      const S = 40, ox = 500, oz = 300, X = x => ox + x * S, Z = z => oz + z * S;
      ctx.fillStyle = '#e7c98b'; for (const [x, z] of gd.pathW) ctx.fillRect(X(x) - S / 2, Z(z) - S / 2, S, S);
      for (const id of gd.ids) { const tw = gd.towers[id]; ctx.fillStyle = pl(id)?.color || '#888'; ctx.beginPath(); ctx.arc(X(tw.x), Z(tw.z), 16, 0, 7); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(tw.x), Z(tw.z)); ctx.lineTo(X(tw.x + Math.sin(tw.a)), Z(tw.z + Math.cos(tw.a))); ctx.stroke(); }
      for (const u of gd.ufos) { ctx.fillStyle = u.hit > 0 ? '#fff' : '#a855f7'; ctx.beginPath(); ctx.arc(X(u.x), Z(u.z), 10 * U[u.k].s, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#fde047'; for (const b of gd.bul) { ctx.beginPath(); ctx.arc(X(b.x), Z(b.z), 4, 0, 7); ctx.fill(); }
    },
    end() {
      if (H.phase !== 'ov-go') return;
      const gd = H.gd, saved = gd.base > 0, sc = id => gd.towers[id].pts + (saved ? 5 : 0);
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `🛸 ${gd.towers[id].kills} derribados · ⭐ ${sc(id)}${gd.towers[id].big ? ' · 👾 nave nodriza' : ''}`, gain: g[id] || 0 }));
      gd.saved = saved;
      setPhase('ov-res', 6000, () => finishGame(g), 0, false); confetti(saved ? 120 : 40); SFX.win();
    },
    render(ph) {
      if (ph === 'ov-ready') return canvasHTML(true, '🛸 ¡A sus torres!');
      if (ph === 'ov-go') return canvasHTML(false);
      return `<h1 class="title-pop">${H.gd.saved ? '🏰 ¡Salvaron la base! (+5 a todos)' : '💥 La base cayó…'}</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
