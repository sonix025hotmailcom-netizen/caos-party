/* ---------- 🪐 SUMO GALÁCTICO EN 3D ---------- */
(() => {
  const S = GAMES.sumo, oStart = S.start, oGo = S.go, oDraw = S.draw, U = 30;
  S.desc = '¡En 3D! Empujá a los demás fuera de la plataforma espacial con tu personaje 🪐. El botón es un ¡DASH! 💨 y la plataforma se va encogiendo 😱';
  S.start = function () { preloadChars(onlineIds().map(id => charOf(pl(id)))); oStart.call(this); H.gd.build3D = T => S.build(T); attachArena(H.gd); };
  S.go = function () { oGo.call(this); attachArena(H.gd); };
  S.build = function (T) {
    const gd = H.gd, r = arena3D(T, { bg: '#0b0620', camY: 15, camZ: 12.5, lookZ: .6 });
    r.scene.fog = null; r.cam.fov = 46; r.cam.updateProjectionMatrix();
    new T.TextureLoader().load('assets/sky_nebula.jpg', tex => { tex.mapping = T.EquirectangularReflectionMapping; tex.colorSpace = T.SRGBColorSpace; r.scene.background = tex; });
    const R0 = 270 / U;
    const plat = new T.Group(); r.scene.add(plat);
    const top = new T.Mesh(new T.CylinderGeometry(R0, R0 * .92, .7, 96), new T.MeshStandardMaterial({ color: '#6d28d9', roughness: .25, metalness: .45 }));
    top.position.y = -.35; top.receiveShadow = true; plat.add(top);
    const under = new T.Mesh(new T.ConeGeometry(R0 * .92, 3.2, 48), new T.MeshStandardMaterial({ color: '#3b0764', roughness: .8, flatShading: true }));
    under.rotation.x = Math.PI; under.position.y = -2.3; plat.add(under);
    const ringM = new T.MeshStandardMaterial({ color: '#facc15', emissive: '#facc15', emissiveIntensity: 1.6 });
    const ring = new T.Mesh(new T.TorusGeometry(R0, .12, 12, 128), ringM); ring.rotation.x = Math.PI / 2; ring.position.y = .02; plat.add(ring);
    const tiles = new T.Mesh(new T.RingGeometry(R0 * .35, R0 * .37, 64), new T.MeshBasicMaterial({ color: '#c4b5fd', transparent: true, opacity: .35 })); tiles.rotation.x = -Math.PI / 2; tiles.position.y = .01; plat.add(tiles);
    const rocks = [];
    for (let i = 0; i < 14; i++) { const m = new T.Mesh(new T.IcosahedronGeometry(.3 + Math.random() * .6, 0), new T.MeshStandardMaterial({ color: '#7c3aed', flatShading: true })); const a = Math.random() * 6.28, d = 12 + Math.random() * 8; m.position.set(Math.cos(a) * d, -2 + Math.random() * 4, Math.sin(a) * d - 3); m.userData.s = Math.random() * .02 + .005; r.scene.add(m); rocks.push(m); }
    r.plat = plat; r.ringM = ringM; r.rocks = rocks; r.R0 = R0; r.chars = {}; r.fx = [];
    for (const id of gd.ids) C3D.load(charURL(charOf(pl(id)))).then(g => {
      if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 2.1), tintFor(g, id)); a.play('Idle');
      const disc = new T.Mesh(new T.CircleGeometry(.75, 32), new T.MeshBasicMaterial({ color: pl(id)?.color || '#fff', transparent: true, opacity: .55 })); disc.rotation.x = -Math.PI / 2; disc.position.y = .03;
      const holder = new T.Group(); holder.add(disc); holder.add(a.obj); r.scene.add(holder); a.holder = holder; r.chars[id] = a;
    }).catch(() => {});
    addBloom(r, T, .3);
    r.last = performance.now();
    return r;
  };
  S.draw = function (ctx) {
    const gd = H.gd, r = gd.r3;
    if (!(r && r.renderer.domElement.isConnected)) return oDraw.call(this, ctx);
    const T = C3D.T, now = performance.now(), dt = Math.min(.05, (now - r.last) / 1000); r.last = now;
    const k = gd.R / 270; r.plat.scale.set(k, 1, k);
    r.ringM.color.set(gd.R < 190 && (now / 300 | 0) % 2 ? '#ff3d8b' : '#facc15'); r.ringM.emissive.copy(r.ringM.color);
    r.rocks.forEach(m => { m.rotation.x += m.userData.s; m.rotation.y += m.userData.s * 1.3; });
    for (const id of gd.ids) {
      const a = r.chars[id]; if (!a) continue; const b = gd.bs[id];
      const x = (b.x - 500) / U, z = (b.y - 300) / U;
      let y = 0; if (!b.alive) { y = -b.fall * b.fall * 9; a.holder.rotation.z = b.fall * 4; }
      a.holder.position.set(x, y, z); a.holder.visible = b.alive || b.fall < 1.4;
      const sp = Math.hypot(b.vx, b.vy);
      if (sp > 25) a.obj.rotation.y = Math.atan2(b.vx, b.vy);
      if (!b.alive) a.play('Death', true);
      else if (b.dash > 0) { a.play('Punch'); if (!a.dashFx) { a.dashFx = true; const m = new T.Mesh(new T.RingGeometry(.6, .9, 32), new T.MeshBasicMaterial({ color: pl(id)?.color || '#fff', transparent: true, side: T.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.set(x, .1, z); r.scene.add(m); r.fx.push({ m, t: 0 }); } }
      else { a.dashFx = false; a.play(sp > 40 ? 'Run' : 'Idle'); }
      a.mixer.update(dt);
    }
    r.fx.forEach(f => { f.t += dt; f.m.scale.setScalar(1 + f.t * 5); f.m.material.opacity = 1 - f.t / .5; });
    r.fx = r.fx.filter(f => { if (f.t >= .5) { r.scene.remove(f.m); return false; } return true; });
    r.cam.position.x = Math.sin(now / 6000) * 1.5; r.cam.lookAt(0, 0, .6);
    r.renderer.render(r.scene, r.cam);
    const left = gd.ids.filter(id => gd.bs[id].alive).length;
    hud3D(`<span class="schip" style="--c:#7c3aed">🪐 Quedan ${left}</span>` + chipsHTML(gd.ids.map(id => ({ c: gd.bs[id].alive ? (pl(id)?.color || '#888') : '#64748b', t: `${pl(id)?.emoji || ''} ${esc(pl(id)?.name || '')}${gd.bs[id].alive ? '' : ' 💀'}` }))));
  };
})();
