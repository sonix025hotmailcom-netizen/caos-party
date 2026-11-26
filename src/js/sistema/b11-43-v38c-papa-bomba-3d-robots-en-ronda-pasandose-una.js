/* ================== v38c — PAPA BOMBA 3D: robots en ronda pasándose una bomba ================== */
const POT3 = {
  ring(n) { return Math.max(3.4, n * .78); },
  spot(i, n) { const a = i / n * Math.PI * 2, R = POT3.ring(n); return [Math.sin(a) * R, Math.cos(a) * R, a]; },
  build(T) {
    const gd = H.gd, n = gd.ids.length, RR = POT3.ring(n), r = arena3D(T, { bg: '#fdba74' }), add = o => (r.scene.add(o), o), M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .75 }, o));
    r.scene.background = CARX.sky(T, ['#1e1b4b', '#7c3aed', '#f472b6', '#fdba74']); r.scene.fog = new T.Fog('#f9a8d4', 30, 85);
    r.cam.fov = 42; r.cam.far = 220; r.cam.updateProjectionMatrix(); r.v = new T.Vector3(); r.RR = RR;
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-9, 16, 7); sun.color.set('#ffedd5'); Object.assign(sun.shadow.camera, { left: -RR - 5, right: RR + 5, top: RR + 5, bottom: -RR - 5, near: .5, far: 60 }); sun.shadow.camera.updateProjectionMatrix(); }
    /* arena del desierto */
    const sand = CARX.tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#e9b872'; g.fillRect(0, 0, w, h); for (let k = 0; k < 2200; k++) { g.fillStyle = ['#d9a35b', '#f5cf93', '#c98f4a'][k % 3]; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }, [36, 36]);
    const gm = add(new T.Mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ map: sand, roughness: 1 }))); gm.rotation.x = -Math.PI / 2; gm.receiveShadow = true;
    /* plataforma con borde de peligro */
    const plate = CARX.tex(T, 512, 512, (g, w, h) => { g.fillStyle = '#64748b'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 64) for (let y = 0; y < h; y += 64) { g.fillStyle = (x + y) % 128 ? '#5b6577' : '#6b7587'; g.fillRect(x + 2, y + 2, 60, 60); g.fillStyle = '#94a3b8'; [[8, 8], [52, 8], [8, 52], [52, 52]].forEach(([a, b]) => g.fillRect(x + a, y + b, 4, 4)); } g.strokeStyle = '#facc15'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h / 2, w * .2, 0, 7); g.stroke(); g.fillStyle = '#111827'; g.beginPath(); g.arc(w / 2, h / 2 + 8, 40, 0, 7); g.fill(); g.fillStyle = '#9ca3af'; g.fillRect(w / 2 - 12, h / 2 - 42, 24, 14); g.strokeStyle = '#d6b98c'; g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h / 2 - 42); g.quadraticCurveTo(w / 2 + 6, h / 2 - 64, w / 2 + 26, h / 2 - 66); g.stroke(); g.fillStyle = '#fde047'; g.beginPath(); g.arc(w / 2 + 30, h / 2 - 68, 9, 0, 7); g.fill(); g.fillStyle = '#ffffff55'; g.beginPath(); g.arc(w / 2 - 14, h / 2 - 6, 10, 0, 7); g.fill(); });
    const pl0 = add(new T.Mesh(new T.CylinderGeometry(RR + 1.6, RR + 1.8, .4, 48), [M('#475569', { metalness: .4, roughness: .5 }), M('#ffffff', { map: plate, roughness: .5, metalness: .3 }), M('#334155')])); pl0.position.y = .2; pl0.receiveShadow = true;
    const haz = CARX.tex(T, 512, 32, (g, w, h) => { for (let x = -h; x < w + h; x += 32) { g.fillStyle = (x / 32) % 2 ? '#111827' : '#facc15'; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 16, 0); g.lineTo(x + 16 - h, h); g.lineTo(x - h, h); g.fill(); } }, [6, 1]);
    const rim = add(new T.Mesh(new T.CylinderGeometry(RR + 1.85, RR + 1.85, .24, 64, 1, true), new T.MeshStandardMaterial({ map: haz, side: T.DoubleSide }))); rim.position.y = .34;
    /* cajas de TNT, barriles y carteles alrededor */
    const tnt = CARX.tex(T, 128, 128, (g, w, h) => { g.fillStyle = '#b91c1c'; g.fillRect(0, 0, w, h); g.fillStyle = '#7f1d1d'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.fillStyle = '#fef3c7'; g.fillRect(10, 42, w - 20, 44); g.fillStyle = '#111827'; g.font = '900 40px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('TNT', w / 2, h / 2 + 2); });
    const crate = M('#ffffff', { map: tnt }), barrel = M('#dc2626', { roughness: .4, metalness: .4 }), band = M('#1f2937');
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.28 + .2, d = RR + 4 + (k % 3) * 1.6, x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (k % 2) { const b = add(new T.Mesh(new T.BoxGeometry(1, 1, 1), crate)); b.position.set(x, .5, z); b.rotation.y = Math.random() * 3; b.castShadow = true; if (k % 4 === 1) { const b2 = add(new T.Mesh(new T.BoxGeometry(.8, .8, .8), crate)); b2.position.set(x + .1, 1.4, z); b2.rotation.y = Math.random() * 3; b2.castShadow = true; } }
      else { const g = add(new T.Group()); const c = new T.Mesh(new T.CylinderGeometry(.42, .42, 1.15, 18), barrel); c.position.y = .58; c.castShadow = true; g.add(c); [.25, .9].forEach(y => { const t = new T.Mesh(new T.TorusGeometry(.43, .04, 6, 20), band); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); }); g.position.set(x, 0, z); } }
    /* cactus y rocas a lo lejos */
    const cac = M('#15803d'), rock = M('#a16207', { roughness: 1 }); for (let k = 0; k < 14; k++) { const a = Math.random() * 6.28, d = 22 + Math.random() * 20, x = Math.sin(a) * d, z = Math.cos(a) * d;
      if (k % 2) { const g = add(new T.Group()), h = 2 + Math.random() * 2; const c = new T.Mesh(new T.CapsuleGeometry(.35, h, 4, 10), cac); c.position.y = h / 2 + .3; g.add(c); const arm = new T.Mesh(new T.CapsuleGeometry(.22, .8, 4, 8), cac); arm.position.set(.55, h * .6, 0); g.add(arm); g.position.set(x, 0, z); } else { const rk = add(new T.Mesh(new T.DodecahedronGeometry(1 + Math.random() * 1.6), rock)); rk.position.set(x, .4, z); rk.scale.y = .6; } }
    /* la bomba */
    const bomb = add(new T.Group()); r.bomb = bomb; r.bm = M('#111827', { roughness: .3, metalness: .35, emissive: '#dc2626', emissiveIntensity: 0 });
    const body = new T.Mesh(new T.SphereGeometry(.42, 28, 20), r.bm); body.castShadow = true; bomb.add(body);
    const cap = new T.Mesh(new T.CylinderGeometry(.14, .17, .16, 14), M('#9ca3af', { metalness: .7, roughness: .3 })); cap.position.y = .44; bomb.add(cap);
    const fuse = new T.Mesh(new T.CylinderGeometry(.03, .03, .34, 6), M('#d6b98c')); fuse.position.set(.08, .62, 0); fuse.rotation.z = -.45; bomb.add(fuse);
    const shine = new T.Mesh(new T.SphereGeometry(.1, 10, 8), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7 })); shine.position.set(-.18, .22, .3); bomb.add(shine);
    const gc = document.createElement('canvas'); gc.width = gc.height = 64; const gg = gc.getContext('2d'), gr = gg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.25, '#fde047'); gr.addColorStop(.6, '#f9731688'); gr.addColorStop(1, '#f9731600'); gg.fillStyle = gr; gg.fillRect(0, 0, 64, 64);
    const gt = new T.CanvasTexture(gc); r.spark = new T.Sprite(new T.SpriteMaterial({ map: gt, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); r.spark.position.set(.2, .8, 0); r.spark.scale.setScalar(.5); bomb.add(r.spark);
    r.plight = new T.PointLight('#fb923c', 6, 6, 1.6); r.plight.position.set(.2, .85, 0); bomb.add(r.plight);
    /* explosión reutilizable */
    r.fl1 = add(new T.Mesh(new T.SphereGeometry(1, 24, 16), new T.MeshBasicMaterial({ color: '#fde047', transparent: true, opacity: 0, depthWrite: false }))); r.fl2 = add(new T.Mesh(new T.SphereGeometry(1, 24, 16), new T.MeshBasicMaterial({ color: '#f97316', transparent: true, opacity: 0, depthWrite: false })));
    r.blight = add(new T.PointLight('#fb923c', 0, 30, 1.2));
    r.smoke = []; const smM = new T.MeshStandardMaterial({ color: '#57534e', transparent: true, opacity: 0, roughness: 1, depthWrite: false }); for (let k = 0; k < 12; k++) { const s = add(new T.Mesh(new T.SphereGeometry(.6, 10, 8), smM.clone())); s.visible = false; r.smoke.push(s); }
    r.scorch = new T.MeshBasicMaterial({ color: '#1c1917', transparent: true, opacity: .55, depthWrite: false });
    CARX.sparks(T, r, 120);
    /* robots */
    r.rb = {};
    gd.ids.forEach((id, i) => { const [x, z, a] = POT3.spot(i, n), p = pl(id), S = { x, z, ang: a, i }; r.rb[id] = S;
      const lb = GAMES.ovni.label(T, `${p?.emoji || ''} ${p?.name || ''}`, p?.color || '#fff'); lb.position.set(x, 2.55, z); lb.scale.set(2.5, .63, 1); add(lb); S.lb = lb;
      C3D.load(charURL(charOf(p))).then(g => { if (H.gd !== gd) return; const ac = C3D.make(g, hFor(g, 1.75), tintFor(g, id)), hold = new T.Group(); hold.add(ac.obj); add(hold); hold.position.set(x, .4, z); hold.rotation.y = a + Math.PI; ac.play('Idle'); S.a = ac; S.hold = hold; }).catch(() => {});
    });
    r.bp = new T.Vector3(0, 4, 0); r.from = new T.Vector3(); r.to = new T.Vector3(); r.fly = 0; r.hold = null; r.nOut = 0; r.ang = 0; r.T = T;
    return r;
  },
  hand(r, id, out) { const S = r.rb[id]; if (!S) return out.set(0, 1.6, 0); const k = 1 - .62 / Math.hypot(S.x, S.z); return out.set(S.x * k, 1.55, S.z * k); },
  draw(ctx) {
    const gd = H.gd, r = gd.r3, n = gd.ids.length;
    if (r && r.renderer.domElement.isConnected) {
      const now = performance.now(), dt = Math.min(.05, (now - (r.last || now)) / 1000); r.last = now; const t = now / 1000, ph = H.phase, T = r.T;
      /* explosión nueva */
      if (gd.out.length > r.nOut) { r.nOut = gd.out.length; const id = gd.last, S = r.rb[id], P = r.bomb.position;
        r.boom = { t: now, x: P.x, y: P.y, z: P.z }; r.bomb.visible = false; r.hold = null;
        CARX.burst(r, P.x, P.y, P.z, 60, 10, '#f97316'); CARX.burst(r, P.x, P.y, P.z, 40, 7, '#fde047');
        r.smoke.forEach((s, k) => { s.visible = true; s.position.set(P.x + (Math.random() - .5), P.y + Math.random() * .5, P.z + (Math.random() - .5)); s.userData = { vx: (Math.random() - .5) * 2.5, vy: 1.2 + Math.random() * 2.2, vz: (Math.random() - .5) * 2.5, d: k * .04 }; s.scale.setScalar(.4); s.material.opacity = .85; });
        if (S) { S.dead = { vy: 11, vo: 4.5, sp: (Math.random() < .5 ? -1 : 1) * 9, landed: false }; S.lb.material.opacity = .3; const sc = potAdd(r, new T.Mesh(new T.CircleGeometry(1.1, 24), r.scorch)); sc.rotation.x = -Math.PI / 2; sc.position.set(S.x, .41, S.z); if (S.a) S.a.play('Jump'); }
        SND.play('sf_explosionCrunch_000', .7, .8);
      }
      if (r.boom) { const u = (now - r.boom.t) / 1000; [r.fl1, r.fl2].forEach((f, k) => { const v = Math.max(0, u - k * .08); f.position.set(r.boom.x, r.boom.y, r.boom.z); f.scale.setScalar(.3 + Math.min(1, v / .45) * (k ? 4.2 : 3.2)); f.material.opacity = Math.max(0, 1 - v / .55); }); r.blight.position.set(r.boom.x, r.boom.y + 1, r.boom.z); r.blight.intensity = Math.max(0, 60 * (1 - u / .6));
        r.smoke.forEach(s => { if (!s.visible) return; const d = s.userData; s.position.x += d.vx * dt; s.position.y += d.vy * dt; s.position.z += d.vz * dt; d.vy *= .985; s.scale.multiplyScalar(1 + dt * .9); s.material.opacity = Math.max(0, s.material.opacity - dt * .38); if (s.material.opacity <= 0) s.visible = false; });
        if (u > 3) r.boom = null; }
      /* bomba: aparece, vuela entre robots o se queda en las manos del que la tiene */
      if (ph === 'pot-go') {
        if (!r.bomb.visible) { r.bomb.visible = true; r.bp.set(0, 6, 0); r.hold = null; }
        if (r.hold !== gd.holder) { r.from.copy(r.bp); POT3.hand(r, gd.holder, r.to); r.fly = now; r.hold = gd.holder; SND.play('ui_pluck_002', .3, .8); }
        const u = Math.min(1, (now - r.fly) / 480);
        if (u < 1) { r.bp.lerpVectors(r.from, r.to, u); r.bp.y += Math.sin(u * Math.PI) * 2.4; r.bomb.rotation.z += dt * 12; }
        else { POT3.hand(r, gd.holder, r.bp); r.bp.y += Math.sin(t * 9) * .05; r.bomb.rotation.z *= .85; }
        r.bomb.position.copy(r.bp);
        const fr = Math.min(1, (Date.now() - gd.t0) / Math.max(1, gd.fuse)), pulse = (Math.sin(t * (6 + fr * 22)) + 1) / 2; r.bm.emissiveIntensity = pulse * (.15 + fr * .9); r.bomb.scale.setScalar(1.35 + pulse * fr * .16);
        r.spark.scale.setScalar(.35 + Math.random() * .35); r.plight.intensity = 4 + Math.random() * 5;
      }
      /* robots */
      for (const id of gd.ids) { const S = r.rb[id]; if (!S || !S.a) continue;
        if (S.dead) { const D = S.dead; if (!D.landed) { D.vy -= 22 * dt; S.hold.position.y += D.vy * dt; const k = D.vo * dt / Math.hypot(S.x, S.z); S.hold.position.x += S.x * k; S.hold.position.z += S.z * k; S.hold.rotation.x += D.sp * dt; if (S.hold.position.y <= 0 && D.vy < 0) { D.landed = true; S.hold.position.y = 0; S.hold.rotation.x = 0; S.a.play('Death', true); } } }
        else if (ph === 'pot-go') S.a.play(id === gd.holder ? 'Jump' : 'Idle');
        else if (ph === 'pot-boom') S.a.play(gd.alive.length <= 1 ? 'Dance' : 'Yes');
        S.a.mixer.update(dt); }
      CARX.tickSparks(r, dt);
      /* cámara orbitando despacio, con temblor en la explosión */
      r.ang += dt * .09; const D = r.RR * 1.9 + 7.5, sh = r.boom ? Math.max(0, .5 - (now - r.boom.t) / 1000) * .9 : 0;
      r.cam.position.set(Math.sin(r.ang) * D + (Math.random() - .5) * sh, r.RR * 1.05 + 6.2 + (Math.random() - .5) * sh, Math.cos(r.ang) * D); r.cam.lookAt(0, .9, 0);
      r.renderer.render(r.scene, r.cam);
      const pills = gd.ids.map(id => { const p = pl(id), o = gd.out.includes(id); return `<span class="cxpill${o ? ' off' : ''}" style="--c:${p?.color || '#888'}">${o ? '💀' : p?.emoji || ''} ${esc(p?.name || '')}${id === gd.holder && ph === 'pot-go' ? ' 💣' : ''}</span>`; }).join('');
      const msg = ph === 'pot-go' ? `<div class="potmsg">💣 La tiene <b style="color:${pl(gd.holder)?.color || '#fff'}">${esc(pl(gd.holder)?.name || '')}</b> · ¡resolvé la cuenta en tu cel para pasarla!</div>` : ph === 'pot-boom' ? `<div class="potflash"></div><div class="cxbig" style="top:42%">💥 ¡BOOM! ${esc(pl(gd.last)?.name || '')} explotó</div>` : '';
      CARX.overlay(r, `<div class="cxtop">${pills}</div>${msg}`);
      return;
    }
    ctx.fillStyle = '#fdba74'; ctx.fillRect(0, 0, 1000, 600); ctx.textAlign = 'center';
    gd.ids.forEach((id, i) => { const [x, z] = POT3.spot(i, n), px = 500 + x * 45, py = 300 + z * 38; emo(ctx, gd.out.includes(id) ? '💀' : pl(id)?.emoji || '?', px, py, 44); if (id === gd.holder && H.phase === 'pot-go') emo(ctx, '💣', px + 30, py - 30, 40); });
  }
};
function potAdd(r, o) { r.scene.add(o); return o; }
(() => {
  const G = GAMES.potato, oRender = G.render, oRound = G.round, oBoom = G.boom, live = () => { attachArena(H.gd); rtLoop(dt => { H.gd.t += dt; }, POT3.draw); };
  G.start = function () { const ids = onlineIds(); preloadChars(ids.map(id => charOf(pl(id)))); H.gd = { ids, alive: ids.slice(), out: [], qid: 0, t: 0, build3D: T => POT3.build(T) }; H.gd.holder = H.gd.alive[rand(H.gd.alive.length)]; this.newQ(); this.round(); };
  G.round = function () { oRound.apply(this, arguments); live(); };
  G.boom = function () { oBoom.apply(this, arguments); live(); };
  G.render = function (ph) { if (ph === 'pot-go' || ph === 'pot-boom') return canvasHTML(false); return oRender.call(this, ph); };
})();
