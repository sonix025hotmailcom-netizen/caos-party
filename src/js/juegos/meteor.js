Object.assign(GAMES, {
  /* ☄️ LLUVIA DE METEOROS 3D (three.js) */
  meteor: {
    name: 'Lluvia de Meteoros 3D', emoji: '☄️', color: '#f97316', R: 10,
    desc: '¡En 3D! Caen meteoros sobre la plataforma 🌋. Miren las sombras rojas y muévanse con el joystick para esquivarlos. El último vivo gana.',
    start() {
      const ids = onlineIds(), ps = {};
      spreadStart(ids, 0, 0, 4).forEach(([id, x, z]) => ps[id] = { x, z, alive: true });
      H.inp = {}; H.gd = { ids, ps, ms: [], fx: [], out: [], t: 0, spawn: 1.5, sid: rid(), mid: 0 };
      setPhase('mt-ready', 3500, () => { SFX.go(); GAMES.meteor.go(); }, 0, false);
      this.attach3D(); rtLoop(null, GAMES.meteor.draw);
    },
    go() { setPhase('mt-go', 60000, () => GAMES.meteor.end()); this.attach3D(); rtLoop(dt => GAMES.meteor.step(dt), GAMES.meteor.draw); },
    attach3D() {
      const gd = H.gd;
      const put = () => { const w = $('.gwrap'); if (!w || !gd.r3) return; const c = gd.r3.renderer.domElement; c.classList.add('gc', 'gc3d'); w.prepend(c); const g2 = $('#gc'); if (g2) g2.style.display = 'none'; };
      if (gd.r3) { setTimeout(put, 0); return; }
      getTHREE().then(T => { if (H.gd !== gd) return; gd.r3 = this.build3D(T); put(); }).catch(() => {});
    },
    build3D(T) {
      const renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(1000, 600, false);
      renderer.shadowMap.enabled = true;
      const scene = new T.Scene(); scene.background = new T.Color('#0b0620'); scene.fog = new T.Fog('#0b0620', 25, 60);
      const cam = new T.PerspectiveCamera(50, 1000 / 600, .1, 200); cam.position.set(0, 17, 15); cam.lookAt(0, 0, 1);
      scene.add(new T.HemisphereLight(0xc4b5fd, 0x1e1b4b, 1.1));
      const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(8, 20, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 }); scene.add(sun);
      const plat = new T.Mesh(new T.CylinderGeometry(this.R, this.R * .9, 1.2, 64), new T.MeshStandardMaterial({ color: '#7c3aed', roughness: .5, metalness: .2 }));
      plat.position.y = -.6; plat.receiveShadow = true; scene.add(plat);
      const rim = new T.Mesh(new T.TorusGeometry(this.R, .15, 12, 96), new T.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: .8 }));
      rim.rotation.x = Math.PI / 2; scene.add(rim);
      const sg = new T.BufferGeometry(), pos = []; for (let i = 0; i < 600; i++) pos.push((Math.random() - .5) * 120, Math.random() * 50 - 5, (Math.random() - .5) * 120 - 30);
      sg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: .15 })));
      const sprite = (txt) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.font = '96px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 70); const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true })); s.scale.set(1.3, 1.3, 1); return s; };
      const pm = {};
      for (const id of H.gd.ids) {
        const p = pl(id), grp = new T.Group();
        const body = new T.Mesh(new T.SphereGeometry(.55, 24, 16), new T.MeshStandardMaterial({ color: p?.color || '#888', roughness: .35 }));
        body.position.y = .55; body.castShadow = true; grp.add(body);
        const sp = sprite(p?.emoji || '?'); sp.position.y = 1.7; grp.add(sp);
        scene.add(grp); pm[id] = grp;
      }
      return { T, renderer, scene, cam, pm, mm: {}, fxm: {} };
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps[p.id];
      if (H.phase === 'mt-ready' || H.phase === 'mt-go') return s.alive ? joyView(p, '🕹️ ¡Esquivá las sombras rojas!', '') : { screen: 'msg', big: '☄️', title: '¡Te cayó un meteoro!', text: 'Mirá quién sobrevive 👀' };
      return watch();
    },
    isDone(id) { return H.phase === 'mt-go' && !H.gd.ps[id].alive; },
    onAct(p, m) { if (H.phase === 'mt-ready' || H.phase === 'mt-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, R = this.R; gd.t += dt; gd.spawn -= dt;
      const alive = gd.ids.filter(id => gd.ps[id].alive);
      if (gd.spawn <= 0) {
        gd.spawn = Math.max(.28, 1.05 - gd.t * .016) * (alive.length > 3 ? .8 : 1);
        let x, z; if (alive.length && Math.random() < .6) { const t = gd.ps[pickR(alive)]; x = t.x + (Math.random() - .5) * 4; z = t.z + (Math.random() - .5) * 4; } else { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * R; x = Math.cos(a) * r; z = Math.sin(a) * r; }
        const T0 = Math.max(.9, 1.6 - gd.t * .01); gd.ms.push({ id: gd.mid++, x, z, t: T0, T: T0, r: 1.7 + Math.random() * .6 });
      }
      for (const id of alive) { const p = gd.ps[id], i = inp(id); p.x += i.x * 7 * dt; p.z += i.y * 7 * dt; const d = Math.hypot(p.x, p.z); if (d > R - .5) { p.x *= (R - .5) / d; p.z *= (R - .5) / d; } }
      for (const m of gd.ms) {
        m.t -= dt;
        if (m.t <= 0 && !m.hit) {
          m.hit = true; gd.fx.push({ id: m.id, x: m.x, z: m.z, t: 0, r: m.r }); beep(90, .3, 'sawtooth', .06);
          for (const id of alive) { const p = gd.ps[id]; if (p.alive && Math.hypot(p.x - m.x, p.z - m.z) < m.r) { p.alive = false; gd.out.push(id); SFX.bad(); shakeScreen(); sync(); updateStrip(); } }
        }
      }
      gd.ms = gd.ms.filter(m => !m.hit); gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < .6);
      const left = gd.ids.filter(id => gd.ps[id].alive).length;
      if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.meteor.end(); }, 1300); }
    },
    draw(ctx) {
      const gd = H.gd, r3 = gd.r3;
      if (r3 && r3.renderer.domElement.isConnected) {
        const { T, scene, pm, mm, fxm } = r3;
        for (const id of gd.ids) { const p = gd.ps[id], g = pm[id]; if (!g) continue; g.visible = p.alive; g.position.set(p.x, 0, p.z); }
        const live = new Set();
        for (const m of gd.ms) {
          live.add(m.id);
          if (!mm[m.id]) {
            const rock = new T.Mesh(new T.IcosahedronGeometry(.8, 0), new T.MeshStandardMaterial({ color: '#f97316', emissive: '#ef4444', emissiveIntensity: .9, flatShading: true }));
            const ring = new T.Mesh(new T.RingGeometry(m.r * .1, m.r, 40), new T.MeshBasicMaterial({ color: '#ef4444', transparent: true, opacity: .5, side: T.DoubleSide }));
            ring.rotation.x = -Math.PI / 2; ring.position.set(m.x, .02, m.z); rock.castShadow = true;
            scene.add(rock); scene.add(ring); mm[m.id] = { rock, ring };
          }
          const k = 1 - m.t / m.T, o = mm[m.id];
          o.rock.position.set(m.x + (1 - k) * 6, 22 * (1 - k) + .4, m.z - (1 - k) * 6); o.rock.rotation.x += .1; o.rock.rotation.y += .07;
          o.ring.scale.setScalar(.25 + k * .75); o.ring.material.opacity = .25 + k * .55;
        }
        for (const id in mm) if (!live.has(+id)) { scene.remove(mm[id].rock); scene.remove(mm[id].ring); delete mm[id]; }
        const lf = new Set();
        for (const f of gd.fx) {
          lf.add(f.id);
          if (!fxm[f.id]) { const s = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshBasicMaterial({ color: '#fde047', transparent: true })); s.position.set(f.x, .3, f.z); scene.add(s); fxm[f.id] = s; }
          fxm[f.id].scale.setScalar(.3 + f.t / .6 * f.r * 1.3); fxm[f.id].material.opacity = 1 - f.t / .6;
        }
        for (const id in fxm) if (!lf.has(+id)) { scene.remove(fxm[id]); delete fxm[id]; }
        r3.cam.position.x = Math.sin(Date.now() / 4000) * 2;
        r3.cam.lookAt(0, 0, 1);
        r3.renderer.render(scene, r3.cam);
        return;
      }
      const S = 26, cx = 500, cy = 300;
      ctx.fillStyle = '#0b0620'; ctx.fillRect(0, 0, 1000, 600);
      ctx.beginPath(); ctx.arc(cx, cy, GAMES.meteor.R * S, 0, 7); ctx.fillStyle = '#7c3aed'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#facc15'; ctx.stroke();
      for (const m of gd.ms) { const k = 1 - m.t / m.T; ctx.beginPath(); ctx.arc(cx + m.x * S, cy + m.z * S, m.r * S * (.25 + k * .75), 0, 7); ctx.fillStyle = `rgba(239,68,68,${.2 + k * .5})`; ctx.fill(); }
      for (const f of gd.fx) { ctx.beginPath(); ctx.arc(cx + f.x * S, cy + f.z * S, f.r * S * (.5 + f.t), 0, 7); ctx.fillStyle = `rgba(253,224,71,${1 - f.t / .6})`; ctx.fill(); }
      for (const id of gd.ids) { const p = gd.ps[id], pp = pl(id); if (!p.alive) continue; ctx.beginPath(); ctx.arc(cx + p.x * S, cy + p.z * S, 15, 0, 7); ctx.fillStyle = pp?.color || '#888'; ctx.fill(); emo(ctx, pp?.emoji || '?', cx + p.x * S, cy + p.z * S - 24, 24); }
    },
    end() {
      if (H.phase !== 'mt-go') return;
      const gd = H.gd, sc = id => gd.ps[id].alive ? 999 : gd.out.indexOf(id), g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.ps[id].alive ? '😎 Sobrevivió' : '☄️ Aplastado', gain: g[id] || 0 }));
      setPhase('mt-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'mt-ready') return canvasHTML(true, '☄️ ¡Esquiven las sombras!');
      if (ph === 'mt-go') return canvasHTML(false);
      return `<h1 class="title-pop">☄️ Los sobrevivientes</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
