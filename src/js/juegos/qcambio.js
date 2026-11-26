Object.assign(GAMES, {
  /* =================================================================== */
  qcambio: {
    name: '¿Qué Cambió?', emoji: '🛋️', color: '#0ea5e9', N: 5,
    desc: 'Mirá bien el cuarto 🛋️… se apagan las luces 💡 y ¡algo cambia! ¿Desapareció algo? ¿Se movió? ¿Cambió de color? Elegí la respuesta correcta en tu cel lo más rápido posible.',
    /* [modelo, nombre, tamaño, asimétrico (se nota si lo giran)] — solo cosas grandes y fáciles de ver */
    ITEMS: [['loungeSofa', 'el sillón', 1.7, 1], ['lampRoundFloor', 'la lámpara', .6, 0], ['pottedPlant', 'la planta', .9, 0], ['bear', 'el osito', .85, 1], ['tableCoffee', 'la mesita', 1.05, 0], ['televisionModern', 'la tele', 1.1, 1], ['bookcaseOpen', 'el librero', 1.05, 1], ['chair', 'la silla', .85, 1], ['kitchenStove', 'la cocina', .8, 1], ['cardboardBoxClosed', 'la caja', .85, 0], ['loungeChair', 'el sofá', 1.05, 1], ['sideTable', 'la mesita de noche', .9, 0], ['rugRound', 'la alfombra', 1.35, 0], ['benchCushion', 'la banca', 1.15, 1], ['bedSingle', 'la cama', 1.35, 1], ['washer', 'la lavadora', .75, 1], ['toilet', 'el inodoro', .7, 1], ['kitchenFridgeSmall', 'la refri', .75, 1], ['speaker', 'el parlante', .6, 1], ['desk', 'el escritorio', 1.1, 1]],
    COLS: ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899'],
    start() {
      const ids = onlineIds(), GX = 5, GZ = 4, cells = shuffle(Array.from({ length: GX * GZ }, (_, i) => i)), items = shuffle(this.ITEMS.map((x, i) => i));
      const pal = shuffle(['#f87171', '#60a5fa', '#4ade80', '#c084fc', '#fbbf24', '#f472b6', '#2dd4bf', '#fb923c', '#a3e635', '#e2e8f0']); /* cada cosa con su color, así se distinguen */
      const room = []; for (let k = 0; k < 8; k++) room.push({ it: items[k], cell: cells[k], rot: [0, Math.PI / 2, Math.PI, -Math.PI / 2][rand(4)], col: pal[k], on: true });
      items.slice(8).forEach((i, k) => room.push({ it: i, cell: -1, rot: 0, col: pal[(8 + k) % pal.length], on: false }));
      this.ITEMS.forEach(([m]) => C3D.load(Fk(m)).catch(() => {}));
      H.gd = { ids, GX, GZ, room, r: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])), build3D: T => GAMES.qcambio.build(T), sid: rid() };
      attachArena(H.gd); this.look();
    },
    look() { const gd = H.gd; gd.r++; gd.ans = {}; gd.change = null; setPhase('qc-look', 5500, () => GAMES.qcambio.dark(), 0, false); attachArena(gd); rtLoop(null, GAMES.qcambio.draw); SND.play('ui_open_002', .5); },
    dark() {
      const gd = H.gd; gd.before = null;
      { const r = gd.r3; if (r && r.renderer.domElement.isConnected) try { r.ring.visible = r.ring2.visible = false; this.sync3D(); r.renderer.render(r.scene, r.cam); gd.before = r.renderer.domElement.toDataURL('image/jpeg', .82); } catch (e) {} }
      const snap = new Map(gd.room.map(x => [x, { ...x }]));
      const on = gd.room.filter(o => o.on), off = gd.room.filter(o => !o.on), used = new Set(on.map(o => o.cell)), free = Array.from({ length: gd.GX * gd.GZ }, (_, i) => i).filter(i => !used.has(i));
      const kinds = ['gone', 'moved', 'turned', 'color']; if (off.length && free.length) kinds.push('new', 'new'); if (on.length <= 5) kinds.splice(0, 1);
      const asym = on.filter(o => this.ITEMS[o.it][3]); if (!asym.length) kinds.splice(kinds.indexOf('turned'), 1);
      const far = (o) => free.filter(c => { const [a, b] = this.cellPos(c), [x, z] = this.cellPos(o.cell); return Math.hypot(a - x, b - z) > 2.4; });
      const k = pickR(kinds); let o;
      if (k === 'new') { o = pickR(off); o.on = true; o.cell = pickR(free); o.rot = rand(4) * Math.PI / 2; }
      else if (k === 'turned') { o = pickR(asym); o.rot += pickR([Math.PI / 2, Math.PI, -Math.PI / 2]); }
      else { o = pickR(on); if (k === 'gone') o.on = false; else if (k === 'moved') { const f = far(o); o.cell = pickR(f.length ? f : free); } else o.col = pickR(this.COLS.filter(c => c !== o.col)); }
      const txt = (kk, oo) => ({ gone: `Desapareció ${this.ITEMS[oo.it][1]}`, new: `Apareció ${this.ITEMS[oo.it][1]}`, moved: `Se movió ${this.ITEMS[oo.it][1]}`, turned: `Giraron ${this.ITEMS[oo.it][1]}`, color: `Cambió el color de ${this.ITEMS[oo.it][1]}` })[kk];
      const right = txt(k, o), opts = [right];
      for (let t = 0; t < 40 && opts.length < 4; t++) { const oo = pickR(gd.room.filter(x => x !== o && (x.on || Math.random() < .3))), kk = pickR(['gone', 'moved', 'turned', 'color', 'new']); const s = txt(kk, oo); if (!opts.includes(s) && !(kk === 'new' && oo.on) && !(kk !== 'new' && !oo.on) && !(kk === 'turned' && !this.ITEMS[oo.it][3])) opts.push(s); }
      gd.change = { k, o, right, prev: snap.get(o) }; gd.opts = shuffle(opts); gd.okIdx = gd.opts.indexOf(right);
      gd.dirty = true; setPhase('qc-dark', 1400, () => { gd.t0 = Date.now(); setPhase('qc-go', 10000, () => GAMES.qcambio.reveal()); attachArena(gd); rtLoop(null, GAMES.qcambio.draw); }, 0, false); attachArena(gd); rtLoop(null, GAMES.qcambio.draw);
      SND.play('ui_switch_002', .6);
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'qc-go' || m.a !== 'qc' || !inGame(p) || gd.ans[p.id] != null) return;
      gd.ans[p.id] = { i: m.i | 0, t: Date.now() - gd.t0 }; SFX.pop(); updateStrip(); sync();
      checkAll(id => gd.ans[id] != null, () => GAMES.qcambio.reveal());
    },
    isDone(id) { return H.phase === 'qc-go' && H.gd.ans?.[id] != null; },
    reveal() {
      const gd = H.gd; if (H.phase !== 'qc-go') return; gd.delta = {};
      for (const id of gd.ids) { const a = gd.ans[id]; let d = 0; if (a && a.i === gd.okIdx) { d = 80 + Math.round(Math.max(0, 1 - a.t / 12000) * 80); gd.ok[id]++; } gd.delta[id] = d; gd.pts[id] += d; }
      SND.play(gd.ids.some(id => gd.delta[id] > 0) ? 'ui_confirmation_001' : 'ui_error_006', .5);
      setPhase('qc-rev', 3500, () => { if (gd.r >= this.N) this.end(); else this.look(); }, 0, false); attachArena(gd); rtLoop(null, GAMES.qcambio.draw);
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `👀 ${gd.ok[id]} de ${this.N} · ⭐ ${gd.pts[id]}`, gain: g[id] || 0 }));
      setPhase('qc-res', 5500, () => finishGame(g), 0, false); confetti(80); SFX.win();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'qc-look') return { screen: 'msg', big: '👀', title: '¡Memorizá el cuarto!', text: 'Mirá bien la tele…' };
      if (H.phase === 'qc-dark') return { screen: 'msg', big: '🌑', title: '¡Se fue la luz!', text: 'Algo está cambiando…' };
      if (H.phase === 'qc-go') return { screen: 'qcambio', key: `qc${gd.r}-${gd.ans[p.id] ? 1 : 0}`, r: gd.r, N: this.N, opts: gd.opts, picked: gd.ans[p.id] ? gd.ans[p.id].i : -1, deadline: H.deadline };
      if (H.phase === 'qc-rev') { const d = gd.delta[p.id] || 0; return { screen: 'msg', big: d ? '✅' : '❌', title: d ? `¡Bien! +${d}` : 'No era esa', text: `Era: ${gd.change.right}` }; }
      return watch();
    },
    cellPos(c) { const gd = H.gd, x = c % gd.GX, z = Math.floor(c / gd.GX); return [(x - (gd.GX - 1) / 2) * 1.45, (z - (gd.GZ - 1) / 2) * 1.35 + .4]; },
    build(T) {
      const gd = H.gd, r = arena3D(T, { bg: '#1e1b4b', camY: 9.5, camZ: 8.5, lookZ: .2 }), add = o => { r.scene.add(o); return o; };
      const W = gd.GX * 1.45 + 1, D = gd.GZ * 1.35 + 1.2, BZ = .4 - D / 2;
      const tex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; if (rep) t.repeat.set(...rep); return t; };
      /* piso de tablas de madera */
      const wood = tex(512, 512, (g, w, h) => { const cols = ['#c8925a', '#bd8650', '#d39c63', '#b97f4a']; for (let k = 0; k < 8; k++) { let y = 0; const off = (k * 137) % 200; while (y < h + 200) { const len = 140 + Math.random() * 160; g.fillStyle = cols[(k + Math.floor(y / 97)) % 4]; g.fillRect(k * 64, y - off, 64, len); for (let q = 0; q < 14; q++) { g.fillStyle = '#00000012'; g.fillRect(k * 64 + Math.random() * 64, y - off + Math.random() * len, 1 + Math.random() * 2, 10 + Math.random() * 30); } g.fillStyle = '#5b3a1e66'; g.fillRect(k * 64, y - off, 64, 2); y += len; } g.fillStyle = '#5b3a1e55'; g.fillRect(k * 64, 0, 2, h); } }, [1.6, 1.2]);
      const floor = add(new T.Mesh(new T.BoxGeometry(W, .2, D), new T.MeshStandardMaterial({ map: wood, roughness: .55 }))); floor.position.set(0, -.1, .4); floor.receiveShadow = true;
      /* papel tapiz con rayitas, zócalo blanco y moldura */
      const paper = tex(256, 256, (g, w, h) => { g.fillStyle = '#e0e7ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#c7d2fe'; for (let k = 0; k < 8; k++) g.fillRect(k * 32 + 12, 0, 8, h); g.fillStyle = '#a5b4fc55'; for (let y = 16; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.beginPath(); g.arc(x + 4, y, 3, 0, 7); g.fill(); } }, [5, 1.4]);
      const wall = new T.MeshStandardMaterial({ map: paper, roughness: .95 }), base = new T.MeshStandardMaterial({ color: '#f8fafc', roughness: .5 }), wtop = new T.MeshStandardMaterial({ color: '#4338ca', roughness: .6 });
      const back = add(new T.Mesh(new T.BoxGeometry(W, 2.7, .15), wall)); back.position.set(0, 1.25, BZ); back.receiveShadow = true;
      const left = add(new T.Mesh(new T.BoxGeometry(.15, 2.7, D), wall)); left.position.set(-W / 2, 1.25, .4); left.receiveShadow = true;
      const right = add(new T.Mesh(new T.BoxGeometry(.15, 2.7, D), wall)); right.position.set(W / 2, 1.25, .4); right.receiveShadow = true;
      [[0, BZ + .1, W, .12], [-W / 2 + .1, .4, .12, D], [W / 2 - .1, .4, .12, D]].forEach(([x, z, w, d]) => { const b = add(new T.Mesh(new T.BoxGeometry(w, .22, d), base)); b.position.set(x, .11, z); const t = add(new T.Mesh(new T.BoxGeometry(w + .05, .12, d + .05), wtop)); t.position.set(x, 2.62, z); });
      /* ventana con cielo y cortinas, cuadro, reloj y lámpara de pared (decoración fija, nunca cambia) */
      const sky = add(new T.Mesh(new T.PlaneGeometry(1.3, 1.1), new T.MeshBasicMaterial({ map: tex(128, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#38bdf8'); gr.addColorStop(1, '#bae6fd'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; [[30, 40], [80, 60]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 12, 0, 7); g.arc(x + 14, y - 4, 14, 0, 7); g.arc(x + 28, y, 11, 0, 7); g.fill(); }); }) }))); sky.position.set(1.5, 1.35, BZ + .08);
      const frameM = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .4 }); [[0, .55, 1.5, .1], [0, -.55, 1.5, .1], [-.7, 0, .1, 1.2], [.7, 0, .1, 1.2], [0, 0, .05, 1.1], [0, 0, 1.4, .05]].forEach(([x, y, w, h]) => { const f = add(new T.Mesh(new T.BoxGeometry(w, h, .08), frameM)); f.position.set(1.5 + x, 1.35 + y, BZ + .1); });
      const sill = add(new T.Mesh(new T.BoxGeometry(1.7, .08, .25), frameM)); sill.position.set(1.5, .76, BZ + .16);
      const cur = new T.MeshStandardMaterial({ color: '#f472b6', roughness: .9 }); [-1, 1].forEach(sd => { const c = add(new T.Mesh(new T.BoxGeometry(.32, 1.7, .08), cur)); c.position.set(1.5 + sd * .95, 1.5, BZ + .14); c.castShadow = true; }); const rod = add(new T.Mesh(new T.CylinderGeometry(.03, .03, 2.4, 8), frameM)); rod.rotation.z = Math.PI / 2; rod.position.set(1.5, 2.38, BZ + .16);
      const art = tex(200, 150, (g, w, h) => { g.fillStyle = '#fef3c7'; g.fillRect(0, 0, w, h); const cs = ['#f97316', '#0ea5e9', '#22c55e', '#e11d48', '#a855f7']; for (let k = 0; k < 7; k++) { g.fillStyle = cs[k % 5]; g.globalAlpha = .85; if (k % 2) { g.beginPath(); g.arc(30 + Math.random() * 140, 25 + Math.random() * 100, 12 + Math.random() * 25, 0, 7); g.fill(); } else g.fillRect(Math.random() * 150, Math.random() * 110, 25 + Math.random() * 50, 20 + Math.random() * 40); } });
      const pic = add(new T.Mesh(new T.BoxGeometry(1.25, .95, .06), [frameM, frameM, frameM, frameM, new T.MeshStandardMaterial({ map: art }), frameM])); pic.position.set(-1.7, 1.55, BZ + .1); const pf = add(new T.Mesh(new T.BoxGeometry(1.4, 1.1, .04), new T.MeshStandardMaterial({ color: '#78350f' }))); pf.position.set(-1.7, 1.55, BZ + .085);
      const clk = add(new T.Mesh(new T.CylinderGeometry(.32, .32, .06, 32), [new T.MeshStandardMaterial({ color: '#1e293b' }), new T.MeshStandardMaterial({ map: tex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#1e293b'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.fillRect(64 + Math.sin(a) * 50 - 3, 64 - Math.cos(a) * 50 - 3, 6, 6); } }) }), frameM])); clk.rotation.x = Math.PI / 2; clk.position.set(-W / 2 + .1, 1.85, -.4); clk.rotation.z = Math.PI / 2;
      const hands = new T.Group(); hands.position.set(-W / 2 + .15, 1.85, -.4); hands.rotation.y = Math.PI / 2; add(hands); const hm = new T.MeshBasicMaterial({ color: '#e11d48' }); const h1 = new T.Mesh(new T.BoxGeometry(.04, .22, .02), hm); h1.position.y = .1; const hg1 = new T.Group(); hg1.add(h1); hands.add(hg1); const h2 = new T.Mesh(new T.BoxGeometry(.03, .16, .02), new T.MeshBasicMaterial({ color: '#1e293b' })); h2.position.y = .07; const hg2 = new T.Group(); hg2.add(h2); hands.add(hg2); r.hands = [hg1, hg2];
      fitModel(T, Fk('lampWall'), { h: .45 }).then(o => { o.position.set(-W / 2 + .1, 1.7, 1.4); o.rotation.y = Math.PI / 2; add(o); }).catch(() => {});
      /* luces: sol que entra por la ventana + lámpara cálida */
      r.scene.children.forEach(c => { if (c.isHemisphereLight) { c.color.set('#fff7ed'); c.groundColor.set('#a16207'); c.intensity = 1.1; } if (c.isDirectionalLight) { c.position.set(3, 9, -9); c.intensity = 1.6; c.shadow.radius = 4; } });
      const lamp = add(new T.PointLight('#ffe7b0', 7, 14, 1.4)); lamp.position.set(0, 2.5, .8); r.lamp = lamp;
      r.items = []; r.mk = {};
      gd.room.forEach((o, k) => fitModel(T, Fk(this.ITEMS[o.it][0]), { size: this.ITEMS[o.it][2], clone: true }).then(m => { r.mk[k] = m; m.visible = false; add(m); gd.dirty = true; }).catch(() => {}));
      const ringG = (c) => { const g = new T.Group(); const t = new T.Mesh(new T.TorusGeometry(.78, .06, 10, 48), new T.MeshBasicMaterial({ color: c })); t.rotation.x = Math.PI / 2; g.add(t); const d = new T.Mesh(new T.CircleGeometry(.78, 40), new T.MeshBasicMaterial({ color: c, transparent: true, opacity: .25, depthWrite: false })); d.rotation.x = -Math.PI / 2; d.position.y = .01; g.add(d); const ar = new T.Mesh(new T.ConeGeometry(.2, .45, 12), new T.MeshBasicMaterial({ color: c })); ar.rotation.x = Math.PI; ar.position.y = 2.3; g.add(ar); g.userData.ar = ar; g.userData.set = col => { t.material.color.set(col); d.material.color.set(col); ar.material.color.set(col); }; g.visible = false; return add(g); };
      r.ring = ringG('#facc15'); r.ring2 = ringG('#38bdf8');
      r.cam.position.x = 2.5; r.cam.lookAt(0, .5, .4);
      gd.dirty = true; return r;
    },
    sync3D() {
      const gd = H.gd, r = gd.r3; if (!r) return;
      gd.room.forEach((o, k) => { const m = r.mk[k]; if (!m) return; m.visible = o.on; if (!o.on) return; const [x, z] = this.cellPos(o.cell); m.position.set(x, 0, z); m.rotation.y = o.rot; m.traverse(q => { if (q.isMesh) [].concat(q.material).forEach(mm => { if (!mm.userData.c0) mm.userData.c0 = mm.color.getHex(); mm.color.setHex(mm.userData.c0); if (o.col && !/glass|metalDark|screen|black/i.test(mm.name)) mm.color.lerp(new r.T.Color(o.col), .72); }); }); });
    },
    draw(ctx) {
      const gd = H.gd, r = gd.r3, Q = GAMES.qcambio;
      if (r && r.renderer.domElement.isConnected) {
        if (gd.dirty && H.phase !== 'qc-dark') { gd.dirty = false; Q.sync3D(); }
        r.lamp.intensity = H.phase === 'qc-dark' ? 0 : 6;
        { const dk = H.phase === 'qc-dark'; if (dk) r.cam.layers.disable(0); else r.cam.layers.enable(0); if (dk && !r.bg0) { r.bg0 = r.scene.background || 1; r.scene.background = new r.T.Color('#000'); } else if (!dk && r.bg0) { r.scene.background = r.bg0 === 1 ? null : r.bg0; r.bg0 = null; } }
        r.renderer.toneMappingExposure = H.phase === 'qc-dark' ? .02 : 1;
        const show = H.phase === 'qc-rev' && gd.change, tt = performance.now() / 1000; r.ring.visible = !!show; r.ring2.visible = false;
        if (r.hands) { r.hands[0].rotation.z = -tt * .8; r.hands[1].rotation.z = -tt * .07; }
        gd.room.forEach((o, k) => { const m = r.mk[k]; if (m) m.scale.setScalar(1); });
        if (show) { const ch = gd.change, o = ch.o, [x, z] = o.cell >= 0 ? Q.cellPos(o.cell) : [0, 0], pu = 1 + Math.sin(tt * 7) * .08;
          r.ring.userData.set(ch.k === 'gone' ? '#ef4444' : ch.k === 'new' ? '#22c55e' : '#facc15'); r.ring.position.set(x, .04, z); r.ring.scale.setScalar(pu); r.ring.userData.ar.position.y = 2.2 + Math.sin(tt * 5) * .15;
          if (ch.k === 'moved' && ch.prev) { const [px, pz] = Q.cellPos(ch.prev.cell); r.ring2.visible = true; r.ring2.userData.set('#38bdf8'); r.ring2.position.set(px, .04, pz); r.ring2.scale.setScalar(pu); r.ring2.userData.ar.visible = false; }
          const k = gd.room.indexOf(o), m = r.mk[k]; if (m && o.on) m.scale.setScalar(1 + Math.max(0, Math.sin(tt * 7)) * .07); }
        r.renderer.render(r.scene, r.cam);
        { const cv = r.renderer.domElement, wrap = cv.parentElement; let ov = wrap && wrap.querySelector('.qcov'); if (wrap && !ov) { ov = document.createElement('div'); ov.className = 'qcov'; wrap.appendChild(ov); }
          if (ov) { Object.assign(ov.style, { left: cv.offsetLeft + 'px', top: cv.offsetTop + 'px', width: cv.offsetWidth + 'px', height: cv.offsetHeight + 'px' }); let side = 'r'; if (show) { const o = gd.change.o, c = o.cell >= 0 ? Q.cellPos(o.cell) : [0, 0], v = new r.T.Vector3(c[0], .5, c[1]).project(r.cam); side = v.x > 0 ? 'l' : 'r'; }
            const want = show && gd.before ? `r${gd.r}${side}` : ''; if (ov.dataset.k !== want) { ov.dataset.k = want; ov.innerHTML = want ? `<div class="qcbefore ${side}"><img src="${gd.before}"><b>ANTES</b></div><div class="qcnow">AHORA</div>` : ''; } } }
        hud3D(H.phase === 'qc-look' ? `<span class="schip" style="--c:#0ea5e9">👀 Memorizá el cuarto · ${gd.r}/${Q.N}</span>` : H.phase === 'qc-dark' ? `<span class="schip" style="--c:#111">🌑 ¡Se fue la luz!</span>` : H.phase === 'qc-go' ? `<span class="schip" style="--c:#f59e0b">🤔 ¿Qué cambió? Respondé en tu cel</span>` : H.phase === 'qc-rev' ? `<span class="schip" style="--c:#22c55e">✅ ${esc(gd.change.right)}</span>` : '');
        return;
      }
      ctx.fillStyle = H.phase === 'qc-dark' ? '#000' : '#e8c9a0'; ctx.fillRect(0, 0, 1000, 600);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'qc-res') return `<h1 class="title-pop">🛋️ Los más observadores</h1>${resultsList(gd.rows)}`;
      return canvasHTML(false) + (ph === 'qc-go' ? `<div class="qcopts">${gd.opts.map((o, i) => `<div class="qco"><b>${'ABCD'[i]}</b> ${esc(o)}</div>`).join('')}</div>` : '');
    }
  }
});
