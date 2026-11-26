/* ================== v36 — AUTOS CHOCONES 3D + FÚTBOL DE AUTOS 3D ================== */
/* al pasar de juego se libera la tarjeta de video del juego 3D anterior (si no, la tele se pone lenta después de muchos juegos) */
(() => { const on = nextRound; nextRound = function () { try { const r = H.gd && H.gd.r3; if (r && r.renderer) { r.renderer.dispose(); if (r.renderer.forceContextLoss) r.renderer.forceContextLoss(); } } catch (e) {} return on.apply(this, arguments); }; })();

const CARX = {
  MODELS: ['raceCarRed', 'raceCarGreen', 'raceCarOrange', 'raceCarWhite'],
  tex(T, w, h, fn, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep) t.repeat.set(...rep); return t; },
  sky(T, cols) { const t = this.tex(T, 4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); t.wrapS = t.wrapT = T.ClampToEdgeWrapping; return t; },
  /* auto del color del jugador, con sombra, fuego de turbo y su nombre */
  car(T, r, id, k, extra) {
    const col = pl(id)?.color || '#ffffff', g = new T.Group(); r.scene.add(g); const body = new T.Group(); g.add(body);
    fitModel(T, Rk(this.MODELS[k % 4]), { size: 2.4, clone: true }).then(o => { o.traverse(q => { if (q.isMesh) { q.castShadow = true; [].concat(q.material).forEach(mm => { if (!/tire|glass|grey|black|dark/i.test(mm.name)) mm.color.set(col); }); } }); body.add(o); }).catch(() => { const m = new T.Mesh(new T.BoxGeometry(1.3, .7, 2.2), new T.MeshStandardMaterial({ color: col })); m.position.y = .45; body.add(m); });
    const sh = new T.Mesh(new T.CircleGeometry(1.25, 24), new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .3, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = .04; g.add(sh); g.userData.sh = sh;
    if (extra && extra.ring) { const rg = new T.Mesh(new T.RingGeometry(1.25, 1.55, 32), new T.MeshBasicMaterial({ color: extra.ring, transparent: true, opacity: .9, depthWrite: false })); rg.rotation.x = -Math.PI / 2; rg.position.y = .05; g.add(rg); }
    const fl = new T.Mesh(new T.ConeGeometry(.28, 1.1, 10), new T.MeshBasicMaterial({ color: '#fb923c', transparent: true, opacity: .95 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, .4, -1.55); fl.visible = false; g.add(fl); g.userData.fl = fl;
    const fl2 = new T.Mesh(new T.ConeGeometry(.16, .7, 8), new T.MeshBasicMaterial({ color: '#fde047' })); fl2.rotation.x = -Math.PI / 2; fl2.position.set(0, .4, -1.4); fl.add(fl2); fl2.position.set(0, .15, 0);
    const lb = GAMES.ovni.label(T, `${pl(id)?.emoji || ''} ${pl(id)?.name || ''}`, (extra && extra.lab) || col); lb.position.y = 2.3; lb.scale.set(3.1, .78, 1); g.add(lb); g.userData.lb = lb;
    return g;
  },
  /* manejo relativo a la PANTALLA: el joystick apunta hacia dónde querés ir y el auto gira solo hacia ahí */
  drive(s, i, dt, P) {
    const mag = Math.min(1, Math.hypot(i.x, i.y));
    if (mag > .2) { const want = Math.atan2(i.x, i.y), d = angTo(s.a, want); s.a += Math.sign(d) * Math.min(Math.abs(d), P.turn * dt); const al = Math.max(.25, Math.cos(d)); s.vx += Math.sin(s.a) * P.acc * mag * al * dt; s.vz += Math.cos(s.a) * P.acc * mag * al * dt; }
    const fx = Math.sin(s.a), fz = Math.cos(s.a), px = fz, pz = -fx; let fw = s.vx * fx + s.vz * fz, lat = s.vx * px + s.vz * pz;
    lat *= Math.exp(-(s.hit > 0 ? (P.sgrip || 1.2) : P.grip) * dt); fw *= Math.exp(-(s.hit > 0 ? (P.hdrag || .55) : mag > .2 ? .55 : 2.4) * dt);
    s.vx = fx * fw + px * lat; s.vz = fz * fw + pz * lat;
    const sp = Math.hypot(s.vx, s.vz), max = s.turbo > 0 ? P.turbo : P.max; if (s.hit <= 0 && sp > max) { const k = Math.max(max / sp, Math.exp(-4 * dt)); s.vx *= k; s.vz *= k; }
    s.x += s.vx * dt; s.z += s.vz * dt;
  },
  dash(s, i, P) { if (i.b !== s.lb) { const pressed = i.b > s.lb || i.b === 1; s.lb = i.b; if (pressed && s.cd <= 0) { s.cd = P.cd; s.turbo = .55; s.vx += Math.sin(s.a) * P.kick; s.vz += Math.cos(s.a) * P.kick; SND.play('sf_thrusterFire_000', .55, 1.1, 0); return true; } } return false; },
  /* choques entre autos: rebote + el que embiste empuja más */
  collide(list, R, e, onHit) {
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const A = list[a], B = list[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); if (d >= 2 * R || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, ov = (2 * R - d) / 2; A.x -= nx * ov; A.z -= nz * ov; B.x += nx * ov; B.z += nz * ov;
      const va = A.vx * nx + A.vz * nz, vb = B.vx * nx + B.vz * nz, rel = va - vb; if (rel <= 0) continue;
      const j = (1 + e) * rel / 2; A.vx -= j * nx; A.vz -= j * nz; B.vx += j * nx; B.vz += j * nz;
      const atkA = va > -vb, att = atkA ? A : B, def = atkA ? B : A, sg = atkA ? 1 : -1, bonus = rel * (att.turbo > 0 ? (CARX.pushT ?? .9) : (CARX.push ?? .35));
      def.vx += nx * sg * bonus; def.vz += nz * sg * bonus; { const sp = Math.hypot(def.vx, def.vz); if (sp > 17) { def.vx *= 17 / sp; def.vz *= 17 / sp; } } def.hit = .55; att.hit = .25; def.by = att.id; def.byT = 3;
      if (onHit) onHit((A.x + B.x) / 2, (A.z + B.z) / 2, rel, att, def);
    }
  },
  overlay(r, html, fsDiv) {
    const cv = r.renderer.domElement, wrap = cv.parentElement; if (!wrap) return;
    let ov = wrap.querySelector('.cxov'); if (!ov) { ov = document.createElement('div'); ov.className = 'cxov'; wrap.appendChild(ov); }
    const L = cv.offsetLeft + 'px', Tp = cv.offsetTop + 'px', Wd = cv.offsetWidth + 'px', Hd = cv.offsetHeight + 'px';
    if (ov.style.left !== L || ov.style.top !== Tp || ov.style.width !== Wd || ov.style.height !== Hd) Object.assign(ov.style, { left: L, top: Tp, width: Wd, height: Hd, fontSize: Math.max(10, Math.min(19, cv.offsetWidth / 1000 * 18)) + 'px' });
    if (ov._h !== html) { ov._h = html; ov.innerHTML = html; }
  },
  /* chispas reutilizables */
  sparks(T, r, n) { r.sp = []; for (let k = 0; k < n; k++) { const m = new T.Mesh(new T.SphereGeometry(.09, 6, 4), new T.MeshBasicMaterial({ color: k % 3 ? '#fde047' : '#ffffff' })); m.visible = false; r.scene.add(m); r.sp.push({ m, t: 9, vx: 0, vy: 0, vz: 0 }); } r.spi = 0; },
  burst(r, x, y, z, n, pw, col) { if (!r.sp) return; for (let k = 0; k < n; k++) { const s = r.sp[r.spi++ % r.sp.length], a = Math.random() * 6.28, sp = pw * (.4 + Math.random() * .8); s.t = 0; s.m.visible = true; s.m.position.set(x, y, z); s.vx = Math.cos(a) * sp; s.vz = Math.sin(a) * sp; s.vy = pw * (.5 + Math.random()); if (col) s.m.material.color.set(col); } },
  tickSparks(r, dt) { if (!r.sp) return; for (const s of r.sp) { if (s.t > 1) continue; s.t += dt; s.vy -= 18 * dt; s.m.position.x += s.vx * dt; s.m.position.y = Math.max(.05, s.m.position.y + s.vy * dt); s.m.position.z += s.vz * dt; s.m.scale.setScalar(Math.max(.01, 1 - s.t)); if (s.t > 1) s.m.visible = false; } },
  bot(p, s, tx, tz, dashOk) { const want = Math.atan2(tx - s.x, tz - s.z), M = p._cx || (p._cx = { b: 0 }); if (dashOk && s.cd <= 0 && Math.abs(angTo(s.a, want)) < .22 && Math.random() < .12) M.b++; return joyAct(p, { a: 'joy', x: Math.sin(want), y: Math.cos(want), b: M.b }); }
};
