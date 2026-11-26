/* ================== v38b — TOQUE TURBO 3D: robots inflando globos gigantes ================== */
const TAP3 = {
  SP: 3.1,
  sx(i, n) { return (i - (n - 1) / 2) * TAP3.SP; },
  build(T) {
    const gd = H.gd, n = gd.ids.length, W = (n - 1) * TAP3.SP, SW = Math.max(13, W + 6.5), r = arena3D(T, { bg: '#bae6fd' }), add = o => (r.scene.add(o), o);
    r.scene.background = CARX.sky(T, ['#0284c7', '#38bdf8', '#bae6fd', '#fef9c3']); r.scene.fog = new T.Fog('#dbeafe', 34, 95);
    r.cam.fov = 38; r.cam.far = 240; r.cam.updateProjectionMatrix(); r.dist = Math.max(14.5, (W / 2 + 2.6) / .574); r.v = new T.Vector3();
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(7, 20, 16); Object.assign(sun.shadow.camera, { left: -SW / 2 - 2, right: SW / 2 + 2, top: 13, bottom: -8, near: .5, far: 70 }); sun.shadow.camera.updateProjectionMatrix(); }
    const M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .7 }, o));
    /* césped */
    const grass = CARX.tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#4ade80'; g.fillRect(0, 0, w, h); for (let k = 0; k < 1400; k++) { g.fillStyle = ['#22c55e', '#86efac', '#16a34a'][k % 3]; g.fillRect(Math.random() * w, Math.random() * h, 2, 4 + Math.random() * 4); } }, [40, 40]);
    const gm = add(new T.Mesh(new T.PlaneGeometry(240, 240), new T.MeshStandardMaterial({ map: grass, roughness: 1 }))); gm.rotation.x = -Math.PI / 2; gm.receiveShadow = true;
    /* escenario de madera con faldón de rayas */
    const wood = CARX.tex(T, 512, 256, (g, w, h) => { for (let y = 0; y < h; y += 32) { g.fillStyle = ['#c2884f', '#b07440', '#c99561', '#a86b39'][(y / 32) % 4]; g.fillRect(0, y, w, 32); g.fillStyle = '#5b341c55'; g.fillRect(0, y + 30, w, 2); for (let x = (y * 5) % 170; x < w; x += 170) g.fillRect(x, y, 3, 32); } }, [SW / 5, 2]);
    const st = add(new T.Mesh(new T.BoxGeometry(SW, .7, 7.5), M('#ffffff', { map: wood }))); st.position.set(0, .35, -.6); st.receiveShadow = true;
    const skirt = CARX.tex(T, 256, 64, (g, w, h) => { for (let x = 0; x < w; x += 32) { g.fillStyle = (x / 32) % 2 ? '#fff7ed' : '#ef4444'; g.fillRect(x, 0, 32, h); } g.fillStyle = '#facc15'; g.fillRect(0, 0, w, 8); }, [SW / 1.6, 1]);
    const sk = add(new T.Mesh(new T.PlaneGeometry(SW, .7), new T.MeshStandardMaterial({ map: skirt }))); sk.position.set(0, .35, 3.16);
    r.bulbs = [M('#fde047', { emissive: '#fde047', emissiveIntensity: 1.2 }), M('#fb7185', { emissive: '#fb7185', emissiveIntensity: .2 })];
    const blg = new T.SphereGeometry(.09, 10, 8), nb = Math.round(SW / .8); for (let k = 0; k <= nb; k++) { const b = add(new T.Mesh(blg, r.bulbs[k % 2])); b.position.set(-SW / 2 + .2 + k * (SW - .4) / nb, .74, 3.18); }
    /* telón violeta y cartel */
    const cur = CARX.tex(T, 512, 256, (g, w, h) => { for (let x = 0; x < w; x += 64) { const gr = g.createLinearGradient(x, 0, x + 64, 0); gr.addColorStop(0, '#6d28d9'); gr.addColorStop(.5, '#a855f7'); gr.addColorStop(1, '#5b21b6'); g.fillStyle = gr; g.fillRect(x, 0, 64, h); } }, [SW / 4, 1]);
    const back = add(new T.Mesh(new T.PlaneGeometry(SW, 12), M('#ffffff', { map: cur, roughness: .9 }))); back.position.set(0, 6, -4.3); back.receiveShadow = true;
    const ban = CARX.tex(T, 1024, 200, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ff4d6d'); gr.addColorStop(.5, '#f97316'); gr.addColorStop(1, '#facc15'); g.fillStyle = gr; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 44); g.fill(); g.lineWidth = 10; g.strokeStyle = '#fff'; g.stroke(); g.font = '900 118px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 18; g.strokeStyle = '#7c2d12'; g.strokeText('TOQUE TURBO', w / 2, h / 2 + 6); g.fillStyle = '#fff'; g.fillText('TOQUE TURBO', w / 2, h / 2 + 6); });
    const bw = Math.min(SW - 1, 10.5), bn = add(new T.Mesh(new T.PlaneGeometry(bw, bw * 200 / 1024), new T.MeshBasicMaterial({ map: ban, transparent: true }))); bn.position.set(0, 7.75, -4.2);
    /* banderines */
    const tri = new T.CircleGeometry(.36, 3); tri.rotateZ(-Math.PI / 2); const FC = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#ec4899', '#f97316'].map(c => new T.MeshStandardMaterial({ color: c, side: T.DoubleSide, roughness: .8 }));
    [[6.9, -3.2], [5.6, -1.4]].forEach(([hy, z], row) => { const nf = Math.round(SW / .9); for (let k = 0; k <= nf; k++) { const u = k / nf, x = -SW / 2 + u * SW, f = add(new T.Mesh(tri, FC[(k + row * 3) % FC.length])); f.position.set(x, hy - Math.sin(u * Math.PI) * 1.1, z); f.rotation.y = (Math.random() - .5) * .3; } });
    /* arbolitos a los costados */
    const leaf = M('#16a34a', { roughness: .9 }), trunk = M('#92400e'); for (let k = 0; k < 12; k++) { const s = k % 2 ? 1 : -1, x = s * (SW / 2 + 2 + Math.random() * 9), z = -9 + Math.random() * 12, h = 2.4 + Math.random() * 2.2, tr = add(new T.Group()); const c1 = new T.Mesh(new T.ConeGeometry(h * .42, h, 8), leaf); c1.position.y = h / 2 + .7; c1.castShadow = true; const t1 = new T.Mesh(new T.CylinderGeometry(.16, .22, .8, 8), trunk); t1.position.y = .4; tr.add(c1, t1); tr.position.set(x, 0, z); }
    /* estaciones: bomba + manguera + globo + robot */
    r.st = {}; CARX.sparks(T, r, 100);
    const hoseM = M('#334155', { roughness: .5 }), metal = M('#cbd5e1', { metalness: .7, roughness: .3 }), dark = M('#1e293b');
    gd.ids.forEach((id, i) => {
      const p = pl(id), col = p?.color || '#888888', x = TAP3.sx(i, n), S = { i, x, R: .3, lt: 0, pump: 0, tLast: -9 };
      const pump = add(new T.Group()); pump.position.set(x + .62, .7, .75);
      const base = new T.Mesh(new T.BoxGeometry(.62, .1, .38), dark); base.position.y = .05; pump.add(base);
      const body = new T.Mesh(new T.CylinderGeometry(.16, .18, 1, 16), M(col, { roughness: .35, metalness: .2 })); body.position.y = .6; body.castShadow = true; pump.add(body);
      const cap = new T.Mesh(new T.CylinderGeometry(.19, .19, .08, 16), metal); cap.position.y = 1.12; pump.add(cap);
      const hd = new T.Group(); hd.position.y = 1.15; pump.add(hd); S.hd = hd;
      const rod = new T.Mesh(new T.CylinderGeometry(.035, .035, .55, 8), metal); rod.position.y = .27; hd.add(rod);
      const grip = new T.Mesh(new T.CylinderGeometry(.06, .06, .6, 10), dark); grip.rotation.z = Math.PI / 2; grip.position.y = .56; hd.add(grip);
      const kx = x + .05, ky = 2.75, kz = -.2; S.k = [kx, ky, kz];
      const curve = new T.CatmullRomCurve3([new T.Vector3(x + .8, 1.05, .75), new T.Vector3(x + 1.3, .95, .25), new T.Vector3(x + .95, 1.9, -.25), new T.Vector3(kx, ky - .14, kz)]);
      S.hose = add(new T.Mesh(new T.TubeGeometry(curve, 26, .04, 6), hoseM));
      const bm = new T.MeshPhysicalMaterial({ color: col, roughness: .3, clearcoat: 1, clearcoatRoughness: .12, emissive: col, emissiveIntensity: .1 });
      const bal = add(new T.Group()), sph = new T.Mesh(new T.SphereGeometry(1, 32, 24), bm); sph.castShadow = true; bal.add(sph);
      const knot = new T.Mesh(new T.ConeGeometry(.11, .2, 10), bm); knot.rotation.x = Math.PI; bal.add(knot);
      const shine = new T.Mesh(new T.SphereGeometry(.15, 10, 8), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .6 })); bal.add(shine);
      Object.assign(S, { sph, knot, shine, bal });
      const lb = GAMES.ovni.label(T, `${p?.emoji || ''} ${p?.name || ''}`, col); lb.position.set(x, 1.05, 2.6); lb.scale.set(2.7, .68, 1); add(lb);
      r.st[id] = S;
      C3D.load(charURL(charOf(p))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.75), tintFor(g, id)), hold = new T.Group(); hold.add(a.obj); add(hold); hold.position.set(x - .32, .7, .95); a.obj.rotation.y = .55; a.play('Idle'); S.a = a; S.hold = hold; }).catch(() => {});
    });
    return r;
  },
  draw(ctx) {
    const gd = H.gd, r = gd.r3, n = gd.ids.length, mx = Math.max(0, ...gd.ids.map(id => gd.taps[id] || 0)), ref = Math.max(55, mx);
    if (r && r.renderer.domElement.isConnected) {
      const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const t = gd.t;
      const bl = Math.floor(now / 330) % 2; r.bulbs[0].emissiveIntensity = bl ? 1.3 : .12; r.bulbs[1].emissiveIntensity = bl ? .12 : 1.3;
      const show = H.phase === 'tap-show', ts = show ? (now - (gd.showW || now)) / 1000 : -1, order = gd.ids.slice().sort((a, b) => (gd.taps[a] || 0) - (gd.taps[b] || 0)), win = gd.win || [];
      let msg = '', lift = 0; CARX.overlay(r, '<div class="tpw"></div><div class="tpm"></div>'); const ov = r.renderer.domElement.parentElement?.querySelector('.cxov'), tw = ov?.querySelector('.tpw'), tm = ov?.querySelector('.tpm');
      for (const id of gd.ids) {
        const S = r.st[id]; if (!S) continue; const tp = gd.taps[id] || 0;
        if (tp > S.lt) { S.lt = tp; S.pump = 1; S.tLast = t; }
        S.pump = Math.max(0, S.pump - dt * 5);
        const tgt = .3 + 1.15 * Math.min(1, tp / ref); S.R += (tgt - S.R) * Math.min(1, dt * 7);
        const isW = show && win.includes(id), isL = show && !isW;
        if (isL && !S.popped && ts >= .35 + order.indexOf(id) * .28) { S.popped = true; S.bal.visible = false; const P = S.bal.position; CARX.burst(r, P.x, P.y, P.z, 24, 5.5, pl(id)?.color); SND.play('sf_explosionCrunch_001', .3, 1.9); if (S.a) S.a.play('No'); }
        let rise = 0; if (isW && ts > 1.1) { const u = ts - 1.1; rise = u * u * 1.2 + u * .8; if (!S.flew) { S.flew = true; S.hose.visible = false; confetti(110); SND.play('ui_confirmation_002', .5); if (S.a) S.a.play('Wave'); } }
        const R = S.R * (1 + S.pump * .06);
        S.sph.scale.set(R, R * 1.16, R); S.knot.position.y = -R * 1.16 - .06; S.shine.position.set(-R * .4, R * .58, R * .7);
        S.bal.position.set(S.k[0] + (rise ? Math.sin(t * 1.6 + S.i) * .3 : 0), S.k[1] + R * 1.16 + .08 + rise, S.k[2]); S.bal.rotation.z = Math.sin(t * 2.1 + S.i) * .06;
        S.hd.position.y = 1.15 - S.pump * .4; lift = Math.max(lift, rise);
        if (S.hold) {
          if (rise) { S.hold.position.set(S.bal.position.x - .08, S.bal.position.y - R * 1.16 - 2.05, S.k[2] + .15); S.a.obj.rotation.y = 0; }
          else if (!show) S.a.play(t - S.tLast < .45 ? 'Punch' : 'Idle');
          S.a.mixer.update(dt);
        }
        if (tw) {
          if (!S.el || !S.el.isConnected) { S.el = document.createElement('div'); S.el.className = 'tpn'; S.el.style.setProperty('--c', pl(id)?.color || '#888'); tw.appendChild(S.el); S.lab = null; }
          const lead = tp === mx && mx > 0, lab = (lead ? '👑 ' : '') + tp; if (S.lab !== lab) { S.lab = lab; S.el.textContent = lab; S.el.classList.toggle('lead', lead); }
          r.v.set(S.bal.position.x, S.bal.position.y + R * 1.16 + .3, S.k[2]).project(r.cam); S.el.style.left = ((r.v.x + 1) * 50).toFixed(2) + '%'; S.el.style.top = ((1 - r.v.y) * 50).toFixed(2) + '%'; S.el.style.display = S.bal.visible ? '' : 'none';
        }
      }
      CARX.tickSparks(r, dt);
      const D = r.dist, ly = Math.min(lift * .55, 5);
      r.cam.position.set(Math.sin(t * .25) * .6, 4.6 + D * .13 + ly * .5, D + 1); r.cam.lookAt(0, 3.4 + ly, 0);
      r.renderer.render(r.scene, r.cam);
      if (show && ts > 1.1 && win.length) msg = `<div class="cxbig" style="top:16%">🎈 ¡${win.map(id => esc(pl(id)?.name || '')).join(' y ')} ${win.length > 1 ? 'vuelan' : 'vuela'}!</div>`;
      else if (show && !win.length) msg = '<div class="cxbig" style="top:16%">💨 Nadie infló nada…</div>';
      if (tm && tm._h !== msg) { tm._h = msg; tm.innerHTML = msg; }
      return;
    }
    ctx.fillStyle = '#bae6fd'; ctx.fillRect(0, 0, 1000, 600); ctx.textAlign = 'center';
    gd.ids.forEach((id, i) => { const x = 500 + TAP3.sx(i, n) * 36, R = 18 + 80 * Math.min(1, (gd.taps[id] || 0) / ref); ctx.fillStyle = pl(id)?.color || '#888'; ctx.beginPath(); ctx.ellipse(x, 430 - R * 1.16, R, R * 1.16, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#0f172a'; ctx.font = '900 28px system-ui'; ctx.fillText(gd.taps[id] || 0, x, 475); emo(ctx, pl(id)?.emoji || '?', x, 530, 34); });
  }
};
(() => {
  const G = GAMES.tap, oRender = G.render, oEnd = G.end, live = () => { attachArena(H.gd); rtLoop(dt => { H.gd.t += dt; }, TAP3.draw); };
  G.desc = '¡Toquen el botón del cel como si no hubiera mañana para inflar su globo gigante! 🎈 Tienen 10 segundos. El globo más grande sale volando 🏆';
  G.start = function () {
    const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id))));
    H.gd = { ids, taps: Object.fromEntries(ids.map(i => [i, 0])), t: 0, sid: rid(), build3D: T => TAP3.build(T) };
    setPhase('tap-ready', 3000, () => { SFX.go(); setPhase('tap-go', 10000, () => GAMES.tap.end(), 700); live(); }, 0, false);
    live();
  };
  G.end = function () {
    const gd = H.gd; if (H.phase !== 'tap-go') return;
    const mx = Math.max(0, ...gd.ids.map(id => gd.taps[id] || 0)); gd.win = mx > 0 ? gd.ids.filter(id => gd.taps[id] === mx) : []; gd.showW = performance.now();
    setPhase('tap-show', 3600, () => oEnd.call(GAMES.tap), 0, false); live();
  };
  G.render = function (ph) {
    if (ph === 'tap-ready') return canvasHTML(true, '🎈 ¡Prepará el dedo para inflar tu globo!');
    if (ph === 'tap-go' || ph === 'tap-show') return canvasHTML(false);
    return oRender.call(this, ph);
  };
})();
