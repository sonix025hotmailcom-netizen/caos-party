/* ================== ESCENARIO 3D CON PERSONAJES (three.js + modelo CC0 de Quaternius) ================== */
const Stage3D = (() => {
  let S = null, loading = null, failed = false;
  const TV = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
  async function init() {
    const T = await import(TV + 'build/three.module.js');
    const { GLTFLoader } = await import(TV + 'examples/jsm/loaders/GLTFLoader.js');
    const SU = await import(TV + 'examples/jsm/utils/SkeletonUtils.js');
    const gltf = await new GLTFLoader().loadAsync('assets/robot.glb');
    const renderer = new T.WebGLRenderer({ antialias: QUAL().aa, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6, QUAL().pr));
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.shadowMap.enabled = QUAL().sh > 0; renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.className = 'stage-canvas';
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 16 / 9, .1, 100);
    scene.add(new T.HemisphereLight(0xc9b8ff, 0x1a1033, 1.3));
    try { if (typeof GFX !== 'undefined') GFX.lights(renderer, scene, T, .25); } catch (e) {}
    const key = new T.DirectionalLight(0xfff1d6, 2.2); key.position.set(3, 9, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(key);
    const spots = ['#ff3d8b', '#ffd23f', '#4cc9ff'].map((c, i) => { const s = new T.SpotLight(c, 60, 30, .35, .6, 1.4); s.position.set(-6 + i * 6, 9, 4); scene.add(s); scene.add(s.target); return s; });
    const floor = new T.Mesh(new T.CylinderGeometry(6.2, 6.6, .5, 72), new T.MeshStandardMaterial({ color: '#3a1a86', roughness: .28, metalness: .35 }));
    floor.position.y = -.25; floor.receiveShadow = true; scene.add(floor);
    const rim = new T.Mesh(new T.TorusGeometry(6.35, .09, 10, 120), new T.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffd23f', emissiveIntensity: 1.4 }));
    rim.rotation.x = Math.PI / 2; rim.position.y = .01; scene.add(rim);
    const bulbG = new T.SphereGeometry(.09, 10, 8), bulbs = [];
    for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, m = new T.Mesh(bulbG, new T.MeshStandardMaterial({ color: '#fff4c2', emissive: '#ffd23f', emissiveIntensity: 2 })); m.position.set(Math.cos(a) * 6.55, -.02, Math.sin(a) * 6.55); scene.add(m); bulbs.push(m); }
    const blocks = new T.Group(); scene.add(blocks);
    S = { T, SU, gltf, renderer, scene, cam, spots, bulbs, blocks, actors: new Map(), mode: 'lobby', clock: new T.Clock(), host: null };
    const loop = () => {
      requestAnimationFrame(loop);
      const el = renderer.domElement; if (!el.isConnected) return;
      const dt = Math.min(.05, S.clock.getDelta()), t = S.clock.elapsedTime;
      const w = el.parentElement.clientWidth, h = el.parentElement.clientHeight;
      if (w && h && (el.width !== Math.round(w * renderer.getPixelRatio()) || el.height !== Math.round(h * renderer.getPixelRatio()))) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      spots.forEach((s, i) => s.target.position.set(Math.sin(t * .7 + i * 2.1) * 4, 0, Math.cos(t * .5 + i) * 2));
      bulbs.forEach((b, i) => b.material.emissiveIntensity = ((i + Math.floor(t * 6)) % 3 === 0) ? 3 : .4);
      const orbit = S.mode === 'lobby' ? Math.sin(t * .15) * 1.6 : Math.sin(t * .25) * .8;
      const nar = cam.aspect < 1.2 ? 1.35 : 1; if (S.mode === 'solo') { cam.position.set(orbit * .5, 2.3, 6.4); cam.lookAt(0, 1.05, 0); } else { cam.position.set(orbit, (S.mode === 'podium' ? 4.2 : 4.3) * nar, (S.mode === 'podium' ? 10.5 : 13) * nar); cam.lookAt(0, S.mode === 'podium' ? 1.6 : 1.2, 0); }
      S.actors.forEach(a => { a.mixer.update(dt); const kk = Math.min(1, dt * 4), P = a.g.position, LV = a.m.userData.fa && a.m.userData.fa._lv;
        /* física caricaturesca: saltitos con gravedad; para cambiar de lugar dan un brinquito (no se deslizan) */
        const dx = a.target.x - P.x, dz = a.target.z - P.z, far = Math.hypot(dx, dz) > .25, onG = P.y <= a.target.y + .01 && !a.vy;
        if (far && onG) { a.vy = 6.5; play(a, 'Jump', true); a.backTo = a.backTo || 'Idle'; }
        if (P.y > a.target.y + .01 || a.vy) { a.vy = (a.vy || 0) - 26 * dt; P.y = Math.max(a.target.y, P.y + a.vy * dt);
          if (P.y <= a.target.y) { a.vy = 0; a.spinA = 0;
            if (a.falling) { const nx = a.falling; a.falling = null; setTimeout(() => play(a, pickR(['Wave', 'Yes', 'ThumbsUp', 'Dance']), true, nx), 260); }
            else if (a.hops > 0) { a.hops--; a.vy = 6; play(a, 'Jump', true); }
            else if (a.backTo) { const b = a.backTo; a.backTo = null; play(a, b); } } }
        else P.y += (a.target.y - P.y) * kk;
        const km = P.y > a.target.y + .01 ? Math.min(1, dt * 5) : kk; P.x += dx * km; P.z += dz * km;
        if (a.vy && a.spin) a.spinA = Math.min(Math.PI * 2, (a.spinA || 0) + dt * Math.PI * 2 / .7);
        if (S.mode === 'lobby') { a.gT = (a.gT ?? 4 + Math.random() * 8) - dt; if (a.turnT > 0 && (a.turnT -= dt) <= 0) a.rot = a.rot0 || 0;
          if (a.danceT > 0) { a.danceT -= dt; a.beat = (a.beat || 0) + dt; if (a.beat > .46) { a.beat = 0; if (LV) LV.sqv += 3.2; } if (a.danceT <= 0) play(a, 'Idle'); }
          if (a.gT <= 0 && onG && !a.falling && !(a.danceT > 0) && performance.now() > (S.gLock || 0)) { a.gT = 12 + Math.random() * 12; S.gLock = performance.now() + 4500;
            const others = [...S.actors.values()].filter(o => o !== a), mv = pickR(['wave', 'wave', 'dance', 'dance', 'spin', 'spin', 'hops', 'boing', 'thumbs', 'yes']);
            if (mv === 'wave') { if (others.length) { const o = pickR(others); a.rot0 = a.rot; a.rot = Math.atan2(o.g.position.x - P.x, o.g.position.z - P.z); a.turnT = 2.2; } play(a, 'Wave', true, 'Idle'); }
            else if (mv === 'dance') { play(a, 'Dance'); a.danceT = 3.7; a.beat = 0; }
            else if (mv === 'spin') { a.spin = true; a.spinA = 0; a.vy = 9; play(a, 'Jump', true); a.backTo = 'Idle'; setTimeout(() => a.spin = false, 1400); }
            else if (mv === 'hops') { a.hops = 2; a.vy = 6; play(a, 'Jump', true); a.backTo = 'Idle'; }
            else if (mv === 'boing') { if (LV) LV.sqv += 9; play(a, 'Yes', true, 'Idle'); }
            else play(a, mv === 'thumbs' ? 'ThumbsUp' : 'Yes', true, 'Idle'); } }
        a.ry = (a.ry ?? a.g.rotation.y) + (a.rot - (a.ry ?? a.g.rotation.y)) * Math.min(1, dt * 5); a.g.rotation.y = a.ry + (a.spinA || 0) * (a.spinA < Math.PI * 2 ? 1 : 0);
        a.badge.position.y = (a.by || 2.35) + Math.sin(t * 2 + a.seed) * .05; });
      renderer.render(scene, cam);
    };
    loop();
    return S;
  }
  function badge(p) {
    const { T } = S, c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d');
    g.fillStyle = '#1a1033'; g.beginPath(); g.roundRect ? g.roundRect(8, 30, 496, 104, 52) : g.rect(8, 30, 496, 104); g.fill();
    g.fillStyle = p.color; g.beginPath(); g.roundRect ? g.roundRect(14, 24, 484, 100, 50) : g.rect(14, 24, 484, 100); g.fill();
    g.font = '64px serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(p.emoji, 34, 78);
    g.font = '900 54px Nunito, sans-serif'; g.fillStyle = '#fff'; g.lineWidth = 10; g.strokeStyle = '#1a1033';
    const name = p.name.length > 11 ? p.name.slice(0, 10) + '…' : p.name; g.strokeText(name, 118, 80); g.fillText(name, 118, 80);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false })); sp.scale.set(1.9, .6, 1); sp.renderOrder = 10; return sp;
  }
  function actor(p) {
    const { T, SU, gltf } = S, ck = typeof charOf === 'function' ? charOf(p) : 'Robot', cg = ck !== 'Robot' && typeof CHAR_DONE !== 'undefined' && CHAR_DONE[ck];
    let m, mixer, acts = {};
    if (cg) { const ca = C3D.make(cg, ck === 'Panda' ? 1.3 : 1.6); m = ca.obj; mixer = ca.mixer; acts = ca.acts; }
    else {
      m = SU.clone(gltf.scene);
      m.traverse(o => { if (o.isMesh) { o.castShadow = true; if (o.material && o.material.name === 'Main') { o.material = o.material.clone(); o.material.color.set(p.color); o.material.roughness = .35; } } });
      m.scale.setScalar(.42); mixer = new T.AnimationMixer(m); gltf.animations.forEach(cl => acts[cl.name] = mixer.clipAction(cl)); try { if (typeof ALIVE !== 'undefined') { const fa = { obj: m, mixer, acts, cur: null, _h: 1.75 }; ALIVE.rig(fa, T); m.userData.fa = fa; } } catch (e) {}
    }
    if (!cg && typeof dressRobot === 'function') dressRobot(m, p.eq, T);
    const g = new T.Group(); g.add(m); const b = badge(p); g.add(b);
    const by = (cg ? (ck === 'Panda' ? 1.6 : 1.95) : 2.35) + (!cg && p.eq && p.eq.h && typeof ITEMS !== 'undefined' && ITEMS[p.eq.h] ? (ITEMS[p.eq.h].tall || .25) : 0);
    const a = { by, g, m, mixer, acts, badge: b, cur: null, target: new T.Vector3(), rot: 0, seed: Math.random() * 6, key: akey(p) };
    S.scene.add(g); return a;
  }
  function akey(p) { return p.color + p.emoji + p.name + (p.eq ? JSON.stringify(p.eq) : '') + (typeof charOf === 'function' ? charOf(p) + (CHAR_DONE[charOf(p)] ? 1 : 0) : ''); }
  function play(a, name, once, then) {
    const next = a.acts[name] || (typeof ANIM_ALIAS !== 'undefined' && a.acts[ANIM_ALIAS[name]]); if (!next || a.cur === next) return;
    next.reset(); next.setLoop(once ? S.T.LoopOnce : S.T.LoopRepeat); next.clampWhenFinished = !!once;
    if (a.cur) next.crossFadeFrom(a.cur, .35, false); next.play(); a.cur = next;
    if (once && then) { const f = e => { if (e.action === next) { a.mixer.removeEventListener('finished', f); play(a, then); } }; a.mixer.addEventListener('finished', f); }
  }
  function sync(players, mode) {
    S.mode = mode; const seen = new Set();
    players.forEach((p, i) => {
      seen.add(p.id); let a = S.actors.get(p.id);
      if (a && a.key !== akey(p)) { S.scene.remove(a.g); S.actors.delete(p.id); a = null; }
      const isNew = !a; if (!a) { a = actor(p); S.actors.set(p.id, a); }
      const n = players.length;
      if (mode === 'solo') { a.target.set(0, 0, 0); a.rot = 0; if (isNew) { a.g.position.set(0, 7, 0); a.falling = 'Dance'; play(a, 'Jump', true); } }
      else if (mode === 'lobby') {
        const ang = n === 1 ? 0 : (i / (n - 1) - .5) * Math.min(1.9, .45 * n);
        a.target.set(Math.sin(ang) * 4.4, 0, -Math.cos(ang) * 4.4 + 3.6); a.rot = -ang * .6;
        if (isNew) { a.g.position.set(a.target.x, 9, a.target.z); a.falling = 'Idle'; a.gT = 8 + Math.random() * 8; play(a, 'Jump', true); }
        else if (!a.cur) play(a, 'Idle');
      } else {
        const slot = [[0, 1.6, 0], [-2.3, 1.05, .3], [2.3, .6, .3]][i] || [((i - 3) % 2 ? 1 : -1) * (4.3 + Math.floor((i - 3) / 2) * 1.3), 0, 1.4];
        a.target.set(slot[0], slot[1], slot[2]); a.rot = 0; a.g.position.copy(a.target);
        play(a, i === 0 ? 'Dance' : i === 1 ? 'ThumbsUp' : i === 2 ? 'Yes' : pickR(['No', 'Sitting']), i === 1 || i === 2, i < 3 ? 'Idle' : undefined);
      }
    });
    S.actors.forEach((a, id) => { if (!seen.has(id)) { S.scene.remove(a.g); S.actors.delete(id); } });
    S.blocks.clear();
    if (mode === 'podium') {
      const { T } = S;
      [[0, 1.6, '#ffd23f'], [-2.3, 1.05, '#d7dde8'], [2.3, .6, '#e39b5a']].forEach(([x, h, c], k) => {
        if (k >= players.length) return;
        const b = new T.Mesh(new T.BoxGeometry(1.9, h, 1.6), new T.MeshStandardMaterial({ color: c, roughness: .3, metalness: .4 })); b.position.set(x, h / 2, k ? .3 : 0); b.castShadow = b.receiveShadow = true; S.blocks.add(b);
      });
    }
  }
  return {
    mount(el, players, mode) {
      if (!el || failed) return;
      const go = () => { if (!el.isConnected) return; el.appendChild(S.renderer.domElement); el.classList.add('ready'); sync(players, mode); if (mode === 'lobby') players.forEach(p => { const a = S.actors.get(p.id); if (a && !a.cur) play(a, 'Idle'); }); };
      if (S) return go();
      if (!loading) loading = init().catch(e => { failed = true; console.log('Escenario 3D no disponible', e && e.message); });
      loading.then(() => { if (S) go(); });
    },
    _s() { return S; },
    emo(id, anim, e) { if (!S) return; const a = S.actors.get(id); if (!a) return; play(a, anim, true, 'Idle'); a.gT = 6; try { EMO.sprite({ obj: a.m }, e); } catch (er) {} },
    cheer(id) { if (!S) return; const a = S.actors.get(id); if (a) play(a, pickR(['Jump', 'Wave', 'Yes']), true, 'Dance'); },
  };
})();
