/* ================== v14 — PREMIOS: REGALO SORPRESA AL GANADOR + CLOSET DEL ROBOT ================== */
const RAR = { c: { n: 'Común', col: '#94a3b8', w: 50 }, r: { n: 'Raro', col: '#3b82f6', w: 30 }, e: { n: 'Épico', col: '#a855f7', w: 15 }, l: { n: 'Legendario', col: '#f59e0b', w: 5 } };
const SLOTS = { h: 'Cabeza', f: 'Cara', b: 'Espalda', m: 'Mano', p: 'Mascota' };
/* cada objeto se arma con three.js en unidades del robot (mide ~4.85). h=cabeza (sobre la coronilla), f=cara (frente a los ojos), b=espalda */
const ITEMS = {
  party:   { s: 'h', r: 'c', n: 'Gorro de fiesta', e: '🥳', tall: .45 },
  cap:     { s: 'h', r: 'c', n: 'Gorra', e: '🧢', tall: .15 },
  antenna: { s: 'h', r: 'c', n: 'Antena con foco', e: '📡', tall: .35 },
  chef:    { s: 'h', r: 'r', n: 'Gorro de chef', e: '👨‍🍳', tall: .45 },
  cowboy:  { s: 'h', r: 'r', n: 'Sombrero vaquero', e: '🤠', tall: .3 },
  horns:   { s: 'h', r: 'r', n: 'Cuernos de diablillo', e: '😈', tall: .25 },
  tophat:  { s: 'h', r: 'e', n: 'Sombrero de copa', e: '🎩', tall: .5 },
  crown:   { s: 'h', r: 'e', n: 'Corona dorada', e: '👑', tall: .3 },
  halo:    { s: 'h', r: 'e', n: 'Aureola', e: '😇', tall: .35 },
  propeller: { s: 'h', r: 'l', n: 'Gorrito con hélice', e: '🚁', tall: .35 },
  shades:  { s: 'f', r: 'c', n: 'Lentes oscuros', e: '🕶️' },
  mustache:{ s: 'f', r: 'c', n: 'Bigotón', e: '🥸' },
  hearts:  { s: 'f', r: 'r', n: 'Lentes de corazón', e: '😍' },
  mask:    { s: 'f', r: 'r', n: 'Antifaz', e: '🦸' },
  visor:   { s: 'f', r: 'e', n: 'Visor láser', e: '🔴' },
  monocle: { s: 'f', r: 'l', n: 'Monóculo de lujo', e: '🧐' },
  pack:    { s: 'b', r: 'c', n: 'Mochila', e: '🎒' },
  cape:    { s: 'b', r: 'r', n: 'Capa de héroe', e: '🦸‍♂️' },
  bat:     { s: 'b', r: 'e', n: 'Alas de murciélago', e: '🦇' },
  wings:   { s: 'b', r: 'e', n: 'Alas de ángel', e: '🪽' },
  jet:     { s: 'b', r: 'l', n: 'Jetpack', e: '🚀' },
};
const ITEM_IDS = Object.keys(ITEMS);
const cleanEq = q => { const o = { h: null, f: null, b: null, m: null, p: null }; if (q && typeof q === 'object') for (const k in o) if (ITEMS[q[k]] && ITEMS[q[k]].s === k) o[k] = q[k]; return o; };
const eqEmpty = q => !q || !Object.values(q).some(Boolean);

function buildItem(T, id) {
  const G = new T.Group(), now = () => performance.now() / 1000;
  const mat = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .45, metalness: .1, flatShading: !!o.flat }, o.m || {}));
  const gold = () => mat('#ffcc33', { m: { metalness: .85, roughness: .25, emissive: '#7a4b00', emissiveIntensity: .35 } });
  const add = (geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = true; G.add(me); return me; };
  const shape = (pts, depth, bev = .04) => { const sh = new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => p.length > 2 ? sh.bezierCurveTo(...p) : sh.lineTo(p[0], p[1])); return new T.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelSize: bev, bevelThickness: bev, bevelSegments: 2 }); };
  const heart = s => shape([[0, -.9 * s], [-.1 * s, -.8 * s, -1 * s, -.2 * s, -1 * s, .25 * s], [-1 * s, .75 * s, -.25 * s, .95 * s, 0, .45 * s], [.25 * s, .95 * s, 1 * s, .75 * s, 1 * s, .25 * s], [1 * s, -.2 * s, .1 * s, -.8 * s, 0, -.9 * s]], .08, .03);
  switch (id) {
    case 'party': {
      const c = add(new T.ConeGeometry(.55, 1.3, 24), mat('#ff3d8b'), 0, .65, 0);
      const tex = document.createElement('canvas'); tex.width = 64; tex.height = 64; const g = tex.getContext('2d');
      for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffd23f' : '#ff3d8b'; g.fillRect(0, i * 8, 64, 8); }
      const t = new T.CanvasTexture(tex); t.colorSpace = T.SRGBColorSpace; c.material.map = t; c.material.color.set('#fff');
      add(new T.SphereGeometry(.18, 14, 10), mat('#4cc9ff'), 0, 1.35, 0);
      G.rotation.z = -.15; break;
    }
    case 'cap': {
      add(new T.SphereGeometry(1.05, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat('#2563eb'), 0, -.3, 0).scale.set(1, .62, 1);
      const vz = add(new T.CylinderGeometry(.95, .95, .16, 28, 1, false, -Math.PI / 2, Math.PI), mat('#facc15'), 0, -.36, .85); vz.rotation.x = .3;
      add(new T.TorusGeometry(1.04, .05, 8, 40), mat('#facc15'), 0, -.29, 0, Math.PI / 2);
      add(new T.SphereGeometry(.12, 10, 8), mat('#facc15'), 0, .36, 0); break;
    }
    case 'antenna': {
      add(new T.CylinderGeometry(.05, .07, .9, 10), mat('#cbd5e1', { m: { metalness: .8, roughness: .3 } }), 0, .45, 0);
      add(new T.CylinderGeometry(.22, .3, .12, 18), mat('#475569'), 0, .04, 0);
      const b = add(new T.SphereGeometry(.2, 18, 12), mat('#ff3d3d', { m: { emissive: '#ff2020', emissiveIntensity: 1.6 } }), 0, .98, 0);
      b.onBeforeRender = () => { b.material.emissiveIntensity = .6 + (Math.sin(now() * 6) * .5 + .5) * 1.8; }; break;
    }
    case 'chef': {
      add(new T.CylinderGeometry(.62, .58, .55, 24), mat('#ffffff', { m: { roughness: .8 } }), 0, .2, 0);
      [[0, .75, 0, .5], [.38, .65, .1, .34], [-.38, .65, .1, .34], [.15, .7, -.35, .34], [-.2, .68, .35, .32]].forEach(([x, y, z, r]) => add(new T.SphereGeometry(r, 16, 12), mat('#ffffff', { m: { roughness: .85 } }), x, y, z));
      break;
    }
    case 'cowboy': {
      const brim = add(new T.CylinderGeometry(1.45, 1.45, .06, 32), mat('#8b5a2b'), 0, 0, 0);
      brim.scale.set(1, 1, .85);
      add(new T.CylinderGeometry(.62, .75, .62, 24), mat('#8b5a2b'), 0, .33, 0);
      add(new T.CylinderGeometry(.76, .76, .12, 24), mat('#3b2412'), 0, .1, 0);
      add(new T.TorusGeometry(1.4, .07, 8, 40), mat('#7a4a22'), 0, .05, 0, Math.PI / 2).scale.set(1, .85, 1); break;
    }
    case 'horns': {
      [-1, 1].forEach(sd => { const h = add(new T.ConeGeometry(.17, .65, 14), mat('#dc2626', { m: { roughness: .3 } }), sd * .5, .25, .1, 0, 0, -sd * .45); });
      break;
    }
    case 'tophat': {
      add(new T.CylinderGeometry(1.05, 1.05, .07, 32), mat('#111827', { m: { roughness: .35 } }), 0, 0, 0);
      add(new T.CylinderGeometry(.62, .66, 1, 28), mat('#111827', { m: { roughness: .35 } }), 0, .52, 0);
      add(new T.CylinderGeometry(.67, .67, .2, 28), mat('#e11d48'), 0, .14, 0); G.rotation.z = .1; break;
    }
    case 'crown': {
      add(new T.CylinderGeometry(.7, .66, .35, 8, 1, true), gold(), 0, .17, 0).material.side = T.DoubleSide;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add(new T.ConeGeometry(.13, .32, 6), gold(), Math.sin(a) * .66, .5, Math.cos(a) * .66); add(new T.OctahedronGeometry(.08), mat(i % 2 ? '#ef4444' : '#22d3ee', { m: { emissive: i % 2 ? '#ef4444' : '#22d3ee', emissiveIntensity: .6, metalness: .3 } }), Math.sin(a) * .69, .17, Math.cos(a) * .69); }
      break;
    }
    case 'halo': {
      const h = add(new T.TorusGeometry(.7, .09, 12, 40), mat('#fff3b0', { m: { emissive: '#ffd23f', emissiveIntensity: 1.8 } }), 0, .32, 0, Math.PI / 2);
      h.onBeforeRender = () => { h.position.y = .32 + Math.sin(now() * 2.2) * .07; }; break;
    }
    case 'propeller': {
      add(new T.SphereGeometry(.85, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat('#facc15'), 0, -.1, 0);
      [0, 1, 2, 3].forEach(i => add(new T.SphereGeometry(.86, 24, 12, i * Math.PI / 2, Math.PI / 4, 0, Math.PI / 2), mat(['#ef4444', '#22c55e', '#3b82f6', '#a855f7'][i]), 0, -.095, 0));
      add(new T.CylinderGeometry(.05, .05, .35, 8), mat('#94a3b8', { m: { metalness: .8 } }), 0, .9, 0);
      const pr = new T.Group(); pr.position.y = 1.1; G.add(pr);
      [0, 1, 2].forEach(k => { const bl = new T.Mesh(new T.BoxGeometry(1.1, .07, .3), mat(['#ef4444', '#3b82f6', '#22c55e'][k])); bl.geometry.translate(.55, 0, 0); bl.rotation.y = k * Math.PI * 2 / 3; bl.rotation.x = .35; pr.add(bl); });
      const hub = new T.Mesh(new T.SphereGeometry(.1, 10, 8), mat('#ffffff')); pr.add(hub);
      hub.onBeforeRender = () => { pr.rotation.y = now() * 14; }; break;
    }
    case 'shades': {
      [-1, 1].forEach(sd => add(new T.BoxGeometry(.62, .36, .08), mat('#0b0b14', { m: { metalness: .6, roughness: .15 } }), sd * .4, 0, 0));
      add(new T.BoxGeometry(.25, .07, .06), mat('#0b0b14'), 0, .1, 0);
      [-1, 1].forEach(sd => add(new T.BoxGeometry(.06, .06, .7), mat('#0b0b14'), sd * .72, .1, -.33)); break;
    }
    case 'mustache': {
      const hair = mat('#3b2412', { m: { roughness: .9 } });
      [-1, 1].forEach(sd => { const b = add(new T.SphereGeometry(.22, 16, 10), hair, sd * .2, -.42, .05); b.scale.set(1.25, .42, .5); b.rotation.z = sd * -.28;
        const tip = add(new T.SphereGeometry(.1, 12, 8), hair, sd * .45, -.32, .04); tip.scale.set(1, .8, .6); });
      break;
    }
    case 'hearts': {
      [-1, 1].forEach(sd => { const h = add(heart(.3), mat('#ff3d8b', { m: { emissive: '#ff3d8b', emissiveIntensity: .45, roughness: .2 } }), sd * .42, 0, 0); h.onBeforeRender = () => { const k = 1 + Math.max(0, Math.sin(now() * 7)) * .12; h.scale.setScalar(k); }; });
      add(new T.BoxGeometry(.2, .06, .06), mat('#be185d'), 0, .08, .03); break;
    }
    case 'mask': {
      const m = add(shape([[-.95, .05], [-.85, .3, -.5, .35, 0, .22], [.5, .35, .85, .3, .95, .05], [.85, -.3, .45, -.32, .15, -.15], [0, -.05], [-.15, -.15], [-.45, -.32, -.85, -.3, -.95, .05]], .06, .03), mat('#111827', { m: { roughness: .3 } }), 0, 0, 0); G.scale.setScalar(.78);
      [-1, 1].forEach(sd => add(new T.CircleGeometry(.16, 18), mat('#ffffff', { m: { emissive: '#ffffff', emissiveIntensity: .8 } }), sd * .45, .03, .11)); break;
    }
    case 'visor': {
      add(new T.BoxGeometry(1.6, .26, .1), mat('#ff2244', { m: { emissive: '#ff2244', emissiveIntensity: 2.2, transparent: true, opacity: .85 } }), 0, 0, 0);
      [-1, 1].forEach(sd => add(new T.CylinderGeometry(.12, .12, .14, 14), mat('#94a3b8', { m: { metalness: .8, roughness: .3 } }), sd * .85, 0, -.02, 0, 0, Math.PI / 2));
      const sc = G.children[0]; sc.onBeforeRender = () => { sc.material.emissiveIntensity = 1.6 + Math.sin(now() * 9) * .6; }; break;
    }
    case 'monocle': {
      add(new T.TorusGeometry(.27, .045, 10, 28), gold(), .42, .02, 0);
      add(new T.CircleGeometry(.25, 24), mat('#bde0ff', { m: { transparent: true, opacity: .35, metalness: .9, roughness: .05 } }), .42, .02, -.01);
      for (let i = 0; i < 6; i++) add(new T.TorusGeometry(.04, .015, 6, 10), gold(), .62 + i * .02, -.28 - i * .1, -.02 - i * .02, 0, Math.PI / 2 * (i % 2));
      break;
    }
    case 'pack': {
      add(new T.BoxGeometry(1.25, 1.35, .6), mat('#22c55e', { m: { roughness: .7 } }), 0, 0, -.25);
      add(new T.BoxGeometry(.9, .55, .28), mat('#16a34a', { m: { roughness: .7 } }), 0, -.25, -.65);
      add(new T.SphereGeometry(.63, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#22c55e', { m: { roughness: .7 } }), 0, .66, -.25).scale.set(1, .5, .5);
      [-1, 1].forEach(sd => add(new T.BoxGeometry(.14, 1.2, .12), mat('#14532d'), sd * .45, .05, .1)); break;
    }
    case 'cape': {
      const geo = new T.PlaneGeometry(1.9, 2.4, 6, 10), pos = geo.attributes.position, base = pos.array.slice();
      const m = add(geo, mat('#e11d48', { m: { side: T.DoubleSide, roughness: .6 } }), 0, -1.05, -.35);
      add(new T.TorusGeometry(.18, .06, 8, 16), gold(), 0, .1, .05);
      m.onBeforeRender = () => { const t = now(); for (let i = 0; i < pos.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], d = (1.2 - y) / 2.4; pos.array[i * 3 + 2] = -d * d * 1.1 - Math.sin(t * 3 + x * 2 + y * 2) * .12 * d; pos.array[i * 3] = x * (1 + d * .25); } pos.needsUpdate = true; geo.computeVertexNormals(); };
      break;
    }
    case 'wings': case 'bat': {
      const angel = id === 'wings';
      [-1, 1].forEach(sd => {
        const piv = new T.Group(); piv.position.set(sd * .3, .25, -.35); G.add(piv);
        if (angel) for (let i = 0; i < 4; i++) { const f = new T.Mesh(new T.SphereGeometry(.5 - i * .05, 14, 10), mat('#ffffff', { m: { roughness: .6, emissive: '#fff7d6', emissiveIntensity: .25 } })); f.scale.set(1.5 - i * .15, .32, .15); f.position.set(sd * (.65 + i * .18), .25 - i * .28, -.1); f.rotation.z = sd * (.5 - i * .15); f.castShadow = true; piv.add(f); }
        else { const w = new T.Mesh(shape([[0, 0], [.9, .7], [1.7, .55], [1.5, .05], [1.3, -.4], [.95, -.15], [.7, -.55], [.45, -.2], [0, -.3]], .03, .02), mat('#7c3aed', { m: { roughness: .45, emissive: '#5b21b6', emissiveIntensity: .5, side: T.DoubleSide } })); w.scale.x = sd; w.castShadow = true; piv.add(w); }
        const ph = sd * 1.3; piv.children[0].onBeforeRender = () => { piv.rotation.y = sd * (.35 + Math.sin(now() * (angel ? 3 : 6) + ph) * .28); };
      }); break;
    }
    case 'jet': {
      const metal = mat('#cbd5e1', { m: { metalness: .85, roughness: .25 } });
      [-1, 1].forEach(sd => {
        add(new T.CylinderGeometry(.3, .3, 1.15, 18), metal, sd * .36, 0, -.4);
        add(new T.ConeGeometry(.3, .35, 18), mat('#ef4444'), sd * .36, .75, -.4);
        add(new T.CylinderGeometry(.22, .3, .2, 18), mat('#334155'), sd * .36, -.66, -.4);
        const fl = add(new T.ConeGeometry(.2, .75, 14), mat('#ffb703', { m: { emissive: '#ff6a00', emissiveIntensity: 2.6, transparent: true, opacity: .9 } }), sd * .36, -1.15, -.4, Math.PI);
        fl.onBeforeRender = () => { const k = .75 + Math.random() * .45; fl.scale.set(1, k, 1); fl.position.y = -.95 - k * .3; };
      });
      add(new T.BoxGeometry(.5, .7, .25), mat('#475569'), 0, 0, -.25); break;
    }
  }
  return G;
}

/* posiciones (en unidades del robot) de cada ranura respecto al hueso donde se pega */
const SLOT_ANCHOR = { h: ['Head', [0, 1.4, -.02], 1.1], f: ['Head', [0, .72, 1.36], 1.75], b: ['Abdomen', [0, .65, -.62], 1], m: ['Palm2.R', [0, -.05, .1], 1.5] };
function dressRobot(m, eq, T0) {
  eq = cleanEq(eq); if (eqEmpty(eq) || !m) return;
  const T = T0 || C3D.T; if (!T) return;
  m.updateMatrixWorld(true);
  const mq = m.getWorldQuaternion(new T.Quaternion()), ms = m.getWorldScale(new T.Vector3()).x;
  for (const k of ['h', 'f', 'b', 'm', 'p']) {
    if (!eq[k]) continue;
    if (k === 'p') { dressPet(m, eq.p, T); continue; }
    const [bn, off, sc] = SLOT_ANCHOR[k];
    let bone = null; const bn2 = bn.replace(/[.\s]/g, ''); m.traverse(o => { if (!bone && o.isBone && (o.name === bn || o.name === bn2)) bone = o; }); if (!bone) continue;
    const bq = bone.getWorldQuaternion(new T.Quaternion()), bs = bone.getWorldScale(new T.Vector3()).x;
    const hold = new T.Group(); hold.name = 'acc_' + k;
    hold.quaternion.copy(bq.clone().invert().multiply(mq)); hold.scale.setScalar(ms / bs);
    const it = buildItem(T, eq[k]); it.position.fromArray(off); it.scale.multiplyScalar(sc); hold.add(it);
    if (k === 'm') {   /* lo de la mano siempre queda derecho, aunque el brazo se mueva */
      const dq = new T.Quaternion(), dm = new T.Quaternion(), probe = new T.Mesh(new T.SphereGeometry(.001), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
      probe.onBeforeRender = () => { bone.getWorldQuaternion(dq); m.getWorldQuaternion(dm); hold.quaternion.copy(dq.invert().multiply(dm)); };
      hold.add(probe);
    }
    hold.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
    bone.add(hold);
  }
}

/* los juegos 3D crean robots con C3D.make(g, alto, tintFor(g,id)): tintFor deja anotado de quién es */
(() => {
  const om = C3D.make;
  C3D.make = function (g, height, tint) {
    const id = window._dressId; window._dressId = null;
    const a = om.call(C3D, g, height, tint);
    try { if (id && /robot\.glb/.test(g.userData.url || '') && typeof pl === 'function') { const p = pl(id); if (p && p.eq) dressRobot(a.obj, p.eq); } } catch (e) {}
    return a;
  };
})();
