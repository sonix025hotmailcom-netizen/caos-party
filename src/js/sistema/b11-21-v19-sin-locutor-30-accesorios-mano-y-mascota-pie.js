/* ================== v19 — SIN LOCUTOR, +30 ACCESORIOS (mano y mascota), ✊✋✌️ PIEDRA PAPEL O TIJERA ================== */
SND.voice = () => {};   // el locutor se quitó: arruinaba la experiencia

Object.assign(ITEMS, {
  beanie:   { s: 'h', r: 'c', n: 'Gorro de lana', e: '🧶', tall: .35 },
  bunny:    { s: 'h', r: 'c', n: 'Orejas de conejo', e: '🐰', tall: .7 },
  bow:      { s: 'h', r: 'c', n: 'Moño gigante', e: '🎀', tall: .3 },
  headset:  { s: 'h', r: 'r', n: 'Audífonos gamer', e: '🎧', tall: .2 },
  pirate:   { s: 'h', r: 'r', n: 'Sombrero pirata', e: '🏴‍☠️', tall: .45 },
  santa:    { s: 'h', r: 'r', n: 'Gorro navideño', e: '🎅', tall: .55 },
  grad:     { s: 'h', r: 'r', n: 'Birrete', e: '🎓', tall: .3 },
  witch:    { s: 'h', r: 'e', n: 'Sombrero de bruja', e: '🧙', tall: .9 },
  viking:   { s: 'h', r: 'e', n: 'Casco vikingo', e: '🪓', tall: .45 },
  flowers:  { s: 'h', r: 'e', n: 'Corona de flores', e: '🌸', tall: .2 },
  mohawk:   { s: 'h', r: 'l', n: 'Cresta punk de fuego', e: '🔥', tall: .55 },
  nose:     { s: 'f', r: 'c', n: 'Nariz de payaso', e: '🤡' },
  patch:    { s: 'f', r: 'c', n: 'Parche pirata', e: '🏴‍☠️' },
  glasses3d:{ s: 'f', r: 'r', n: 'Lentes 3D', e: '🕶️' },
  beard:    { s: 'f', r: 'r', n: 'Barba de mago', e: '🧔' },
  stars:    { s: 'f', r: 'e', n: 'Lentes de estrella', e: '🤩' },
  shell:    { s: 'b', r: 'c', n: 'Caparazón de tortuga', e: '🐢' },
  balloon:  { s: 'b', r: 'c', n: 'Globo', e: '🎈' },
  sword_b:  { s: 'b', r: 'r', n: 'Espada a la espalda', e: '⚔️' },
  guitar:   { s: 'b', r: 'r', n: 'Guitarra', e: '🎸' },
  fairy:    { s: 'b', r: 'e', n: 'Alas de hada', e: '🧚' },
  dragon:   { s: 'b', r: 'l', n: 'Alas de dragón', e: '🐉' },
  wand:     { s: 'm', r: 'c', n: 'Varita mágica', e: '🪄' },
  lolly:    { s: 'm', r: 'c', n: 'Paleta', e: '🍭' },
  icecream: { s: 'm', r: 'c', n: 'Helado', e: '🍦' },
  mic:      { s: 'm', r: 'r', n: 'Micrófono', e: '🎤' },
  flag:     { s: 'm', r: 'r', n: 'Banderita', e: '🚩' },
  saber:    { s: 'm', r: 'e', n: 'Sable de luz', e: '🗡️' },
  trophy:   { s: 'm', r: 'l', n: 'Trofeo de oro', e: '🏆' },
  ghost:    { s: 'p', r: 'c', n: 'Fantasmita', e: '👻' },
  chick:    { s: 'p', r: 'c', n: 'Pollito volador', e: '🐥' },
  drone:    { s: 'p', r: 'r', n: 'Mini dron', e: '🛸' },
  ufoA:     { s: 'p', r: 'r', n: 'Ovni verde', e: '🛸', glb: 'enemy-ufo-a' },
  ufoB:     { s: 'p', r: 'e', n: 'Ovni morado', e: '🛸', glb: 'enemy-ufo-b' },
  ufoC:     { s: 'p', r: 'e', n: 'Ovni rojo', e: '🛸', glb: 'enemy-ufo-c' },
  ufoD:     { s: 'p', r: 'l', n: 'Nave nodriza', e: '🛸', glb: 'enemy-ufo-d' },
  crystal:  { s: 'p', r: 'l', n: 'Cristal flotante', e: '💎', glb: 'detail-crystal' },
});
ITEM_IDS.length = 0; Object.keys(ITEMS).forEach(k => ITEM_IDS.push(k));

(() => {
  const ob = buildItem;
  buildItem = function (T, id) {
    const G = new T.Group(), now = () => performance.now() / 1000;
    const mat = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .45, metalness: .1 }, o));
    const glow = (c, k = 1.6) => mat(c, { emissive: c, emissiveIntensity: k });
    const gold = () => mat('#ffcc33', { metalness: .85, roughness: .25, emissive: '#7a4b00', emissiveIntensity: .35 });
    const add = (geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.rotation.set(rx, ry, rz); me.castShadow = true; G.add(me); return me; };
    const S = (r, w = 16, h = 12) => new T.SphereGeometry(r, w, h), C = (a, b, h, n = 18) => new T.CylinderGeometry(a, b, h, n), K = (r, h, n = 18) => new T.ConeGeometry(r, h, n), TO = (r, t, a = Math.PI * 2) => new T.TorusGeometry(r, t, 10, 32, a), B = (x, y, z) => new T.BoxGeometry(x, y, z);
    const star = (r, d) => { const sh = new T.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r * .45 : r; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return new T.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 1 }); };
    const bob = (o, amp = .12, sp = 2.4, base = o.position.y) => { o.onBeforeRender = () => { o.position.y = base + Math.sin(now() * sp) * amp; }; };
    switch (id) {
      /* ---------- cabeza ---------- */
      case 'beanie': { add(S(1.02, 28, 14, 0), mat('#ef4444', { roughness: .9 }), 0, -.32, 0).scale.set(1, .75, 1); add(TO(1.0, .16), mat('#fca5a5', { roughness: .9 }), 0, -.3, 0, Math.PI / 2); add(S(.28), mat('#ffffff', { roughness: 1 }), 0, .5, 0); G.children[0].geometry = new T.SphereGeometry(1.02, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2); return G; }
      case 'bunny': { [-1, 1].forEach(sd => { const e = add(S(.24), mat('#ffffff', { roughness: .8 }), sd * .42, .75, 0, 0, 0, sd * -.18); e.scale.set(1, 3.4, .55); const i = add(S(.15), mat('#f9a8d4'), sd * .42, .75, .1, 0, 0, sd * -.18); i.scale.set(1, 3, .3); }); add(TO(.95, .07, Math.PI), mat('#f472b6'), 0, -.05, 0, 0, Math.PI / 2, 0); return G; }
      case 'bow': { const pk = mat('#ec4899', { roughness: .35 }); [-1, 1].forEach(sd => { const l = add(S(.36), pk, sd * .42, .25, 0, 0, 0, sd * .5); l.scale.set(1.3, .8, .45); }); add(S(.17), mat('#be185d'), 0, .25, 0).scale.set(1, 1, .7); G.position.x = .45; G.rotation.z = -.35; return G; }
      case 'headset': { add(TO(1.12, .08, Math.PI), mat('#111827', { metalness: .4 }), 0, -.55, 0, 0, 0, 0); [-1, 1].forEach(sd => { add(C(.38, .38, .3, 22), mat('#111827'), sd * 1.18, -.65, 0, 0, 0, Math.PI / 2); add(C(.3, .3, .05, 22), glow(sd > 0 ? '#22d3ee' : '#a855f7', 2.2), sd * 1.34, -.65, 0, 0, 0, Math.PI / 2); }); const mic = add(C(.03, .03, .8, 8), mat('#111827'), -.95, -1.05, .45, .9, 0, 0); add(S(.09), mat('#334155'), -.95, -1.32, .8); return G; }
      case 'pirate': { const blk2 = mat('#111827', { roughness: .6 }); add(C(.8, .95, .5, 24), blk2, 0, .05, 0); const fr = add(new T.CylinderGeometry(1.25, 1.25, .14, 32, 1, false, -Math.PI / 2, Math.PI), blk2, 0, .2, .05, Math.PI / 2, 0, 0); fr.scale.set(1, 1, .62); const bk = add(new T.CylinderGeometry(1.1, 1.1, .14, 32, 1, false, Math.PI / 2, Math.PI), blk2, 0, .3, -.1, Math.PI / 2, 0, 0); const gr2 = add(TO(1.25, .05, Math.PI), gold(), 0, .2, .13, 0, 0, 0); gr2.scale.y = .62; add(S(.2, 14, 10), mat('#f8fafc'), 0, .5, .16).scale.set(1, .9, .3); [-1, 1].forEach(sd => add(S(.05), mat('#111827'), sd * .07, .53, .22)); [-1, 1].forEach(sd => add(B(.45, .07, .05), mat('#f8fafc'), 0, .3, .17, 0, 0, sd * .7)); return G; }
      case 'pirate_old': { const blk = mat('#111827', { roughness: .6 }); const h = add(S(1, 3, 3), blk, 0, .1, 0); h.geometry = new T.CylinderGeometry(.75, .95, .55, 24); const br = add(C(1.35, 1.35, .08, 32), blk, 0, -.15, 0); br.scale.set(1, 1, .55); [-1, 1].forEach(sd => add(B(.9, .55, .06), blk, sd * .55, .15, .32, -.2, sd * -.45, 0)); add(new T.SphereGeometry(.15, 10, 8), mat('#f8fafc'), 0, .2, .5).scale.set(1, 1, .4); add(TO(.96, .045), gold(), 0, -.11, 0, Math.PI / 2); return G; }
      case 'santa': { const c = add(K(.85, 1.6, 24), mat('#dc2626', { roughness: .8 }), 0, .55, 0); c.rotation.z = -.35; c.position.x = .2; add(TO(.92, .2), mat('#ffffff', { roughness: 1 }), 0, -.15, 0, Math.PI / 2); add(S(.25), mat('#ffffff', { roughness: 1 }), .85, 1.15, 0); return G; }
      case 'grad': { add(C(.85, .9, .45, 24), mat('#111827'), 0, .0, 0); add(B(2, .08, 2), mat('#111827'), 0, .27, 0, 0, Math.PI / 4, 0); add(S(.08), gold(), 0, .34, 0); const t = add(C(.03, .03, .7, 6), gold(), .7, -.05, .7); add(S(.1, 8, 6), gold(), .7, -.42, .7); return G; }
      case 'witch': { const pu = mat('#4c1d95', { roughness: .7 }); add(C(1.5, 1.5, .07, 36), pu, 0, -.1, 0); const c = add(K(.82, 2, 24), pu, 0, .9, 0); c.rotation.z = .25; c.position.x = -.15; add(C(.84, .86, .25, 24), mat('#f59e0b'), 0, .05, 0); add(B(.3, .25, .06), gold(), 0, .05, .84); return G; }
      case 'viking': { add(S(1.05, 28, 14), mat('#94a3b8', { metalness: .8, roughness: .3 }), 0, -.35, 0); G.children[0].geometry = new T.SphereGeometry(1.05, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2); add(TO(1.04, .09), mat('#78350f'), 0, -.33, 0, Math.PI / 2); add(B(.12, .7, .12), mat('#78350f'), 0, .1, .85, .3, 0, 0);
        [-1, 1].forEach(sd => { const hn = add(K(.2, .95, 14), mat('#fef3c7', { roughness: .5 }), sd * 1.05, .2, 0, 0, 0, sd * -.9); hn.geometry.translate(0, .47, 0); hn.position.y = -.1; }); return G; }
      case 'flowers': { add(TO(.92, .07), mat('#16a34a'), 0, -.15, 0, Math.PI / 2); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, col = ['#f472b6', '#facc15', '#a78bfa', '#fb7185', '#ffffff'][i % 5]; const x = Math.sin(a) * .92, z = Math.cos(a) * .92; for (let k = 0; k < 5; k++) { const b = k / 5 * Math.PI * 2; add(S(.11, 8, 6), mat(col), x + Math.cos(b) * .12 * Math.cos(a), -.08 + Math.sin(b) * .12, z - Math.cos(b) * .12 * Math.sin(a)); } add(S(.07, 8, 6), mat('#f59e0b'), x * 1.02, -.08, z * 1.02); } return G; }
      case 'mohawk': { for (let i = 0; i < 7; i++) { const z = .75 - i * .25, h = .45 + Math.sin(i / 6 * Math.PI) * .5; const sp = add(K(.16, h, 8), glow(i % 2 ? '#f97316' : '#facc15', 1.3), 0, h / 2 - .2, z, -.15 * (i - 3), 0, 0); const ph = i; sp.onBeforeRender = () => { sp.scale.y = 1 + Math.sin(now() * 12 + ph) * .12; }; } return G; }
      /* ---------- cara ---------- */
      case 'nose': { const n = add(S(.22), mat('#ef4444', { roughness: .2 }), 0, -.32, .2); n.onBeforeRender = () => { const k = 1 + Math.max(0, Math.sin(now() * 5)) * .08; n.scale.setScalar(k); }; return G; }
      case 'patch': { add(S(.3, 20, 12), mat('#111827', { roughness: .5 }), -.42, 0, 0).scale.set(1, .9, .25); add(TO(.85, .025, Math.PI * 1.1), mat('#111827'), -.1, .05, -.25, 0, 0, .35); return G; }
      case 'glasses3d': { add(B(1.6, .55, .07), mat('#f8fafc'), 0, 0, 0); add(B(.55, .38, .02), mat('#ef4444', { transparent: true, opacity: .8, emissive: '#ef4444', emissiveIntensity: .5 }), -.42, 0, .045); add(B(.55, .38, .02), mat('#06b6d4', { transparent: true, opacity: .8, emissive: '#06b6d4', emissiveIntensity: .5 }), .42, 0, .045); return G; }
      case 'beard': { const w = mat('#e5e7eb', { roughness: 1 }); const b = add(K(.45, 1.1, 18), w, 0, -.95, .02, Math.PI, 0, 0); b.scale.z = .45; [-1, 1].forEach(sd => { const m2 = add(S(.2), w, sd * .22, -.38, .05); m2.scale.set(1.3, .5, .5); }); return G; }
      case 'stars': { [-1, 1].forEach(sd => { const st = add(star(.36, .06), mat('#facc15', { emissive: '#f59e0b', emissiveIntensity: .7, roughness: .3 }), sd * .42, 0, 0); st.onBeforeRender = () => { st.rotation.z = Math.sin(now() * 3 + sd) * .2; }; }); add(B(.2, .05, .05), mat('#b45309'), 0, .08, .03); return G; }
      /* ---------- espalda ---------- */
      case 'shell': { add(S(.95, 20, 12), mat('#15803d', { roughness: .6, flatShading: true }), 0, -.1, -.3).scale.set(1.05, 1.15, .55); for (let i = 0; i < 5; i++) add(C(.24, .24, .05, 6), mat('#a3e635', { flatShading: true }), [0, -.35, .35, -.3, .3][i], [-.1, .35, .35, -.5, -.5][i], -.8, Math.PI / 2, 0, 0); return G; }
      case 'balloon': { const col = pickR(['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899']); const g2 = new T.Group(); g2.position.set(.5, 2.4, -.4); G.add(g2); const bl = new T.Mesh(S(.55, 20, 14), mat(col, { roughness: .2 })); bl.scale.set(1, 1.18, 1); g2.add(bl); const kn = new T.Mesh(K(.09, .14, 8), mat(col)); kn.position.y = -.68; kn.rotation.x = Math.PI; g2.add(kn); const str = add(C(.012, .012, 2.1, 4), mat('#f8fafc'), .25, 1.05, -.2, 0, 0, -.22); bl.onBeforeRender = () => { g2.position.y = 2.4 + Math.sin(now() * 1.6) * .1; g2.rotation.z = Math.sin(now() * 1.1) * .12; }; return G; }
      case 'sword_b': { const g2 = new T.Group(); g2.rotation.z = .7; g2.position.z = -.55; G.add(g2); const bl = new T.Mesh(B(.22, 2.2, .05), mat('#e2e8f0', { metalness: .9, roughness: .15 })); bl.position.y = .3; g2.add(bl); const tip = new T.Mesh(K(.15, .3, 4), mat('#e2e8f0', { metalness: .9, roughness: .15 })); tip.position.y = 1.55; tip.rotation.y = Math.PI / 4; g2.add(tip); const gd2 = new T.Mesh(B(.75, .12, .14), gold()); gd2.position.y = -.82; g2.add(gd2); const hd = new T.Mesh(C(.07, .07, .5, 8), mat('#78350f')); hd.position.y = -1.13; g2.add(hd); const pm = new T.Mesh(S(.1), gold()); pm.position.y = -1.4; g2.add(pm); return G; }
      case 'guitar': { const g2 = new T.Group(); g2.rotation.z = -.55; g2.position.set(0, -.1, -.62); G.add(g2); const wood = mat('#ea580c', { roughness: .4 }); [[0, -.35, .6], [0, .2, .45]].forEach(([x, y, r]) => { const b = new T.Mesh(C(r, r, .22, 24), wood); b.rotation.x = Math.PI / 2; b.position.set(x, y, 0); g2.add(b); }); const hole = new T.Mesh(C(.17, .17, .23, 18), mat('#1c1917')); hole.rotation.x = Math.PI / 2; hole.position.y = -.05; g2.add(hole); const nk = new T.Mesh(B(.16, 1.3, .1), mat('#78350f')); nk.position.y = 1.15; g2.add(nk); const hd = new T.Mesh(B(.26, .32, .1), mat('#1c1917')); hd.position.y = 1.92; g2.add(hd); return G; }
      case 'fairy': case 'dragon': {
        const fa = id === 'fairy';
        [-1, 1].forEach(sd => { const piv = new T.Group(); piv.position.set(sd * .25, .3, -.5); G.add(piv);
          const sh = new T.Shape(); if (fa) { sh.moveTo(0, 0); sh.bezierCurveTo(.4, 1.3, 1.4, 1.4, 1.2, .5); sh.bezierCurveTo(1.1, .1, .5, .05, 0, 0); sh.bezierCurveTo(.6, -.1, 1, -.6, .7, -.9); sh.bezierCurveTo(.4, -1, .1, -.5, 0, 0); }
          else { sh.moveTo(0, 0); sh.lineTo(.5, .9); sh.lineTo(1.9, 1.1); sh.lineTo(1.6, .55); sh.lineTo(1.75, .1); sh.lineTo(1.3, .15); sh.lineTo(1.25, -.35); sh.lineTo(.8, -.15); sh.lineTo(.55, -.55); sh.lineTo(0, -.2); }
          const w = new T.Mesh(new T.ShapeGeometry(sh), fa ? mat('#a5f3fc', { transparent: true, opacity: .6, emissive: '#67e8f9', emissiveIntensity: .7, side: T.DoubleSide }) : mat('#b91c1c', { roughness: .5, side: T.DoubleSide, emissive: '#7f1d1d', emissiveIntensity: .3 })); w.scale.set(sd * (fa ? 1 : 1.15), fa ? 1 : 1.15, 1); piv.add(w);
          w.onBeforeRender = () => { piv.rotation.y = sd * (.45 + Math.sin(now() * (fa ? 9 : 4) + sd) * (fa ? .35 : .25)); };
        }); return G; }
      /* ---------- mano ---------- */
      case 'wand': { add(C(.05, .06, 1.3, 8), mat('#1c1917'), 0, .35, 0); const st = add(star(.24, .06), glow('#facc15', 1.4), 0, 1.1, -.03); st.onBeforeRender = () => { st.rotation.y = now() * 3; }; return G; }
      case 'lolly': { add(C(.04, .04, 1.2, 8), mat('#f8fafc'), 0, .3, 0); const c = add(C(.42, .42, .12, 28), mat('#ec4899'), 0, 1.1, 0, Math.PI / 2); add(TO(.28, .06), mat('#fde047'), 0, 1.1, .07); add(TO(.14, .05), mat('#38bdf8'), 0, 1.1, .08); return G; }
      case 'icecream': { add(K(.24, .75, 16), mat('#d97706', { roughness: .8 }), 0, .3, 0, Math.PI, 0, 0); add(S(.28), mat('#fbcfe8'), 0, .78, 0); add(S(.24), mat('#fef3c7'), 0, 1.12, 0); add(S(.07), mat('#dc2626'), 0, 1.38, 0); return G; }
      case 'mic': { add(C(.09, .06, .8, 12), mat('#111827', { metalness: .6 }), 0, .3, 0); add(S(.2), mat('#cbd5e1', { metalness: .9, roughness: .2 }), 0, .82, 0); add(TO(.11, .03), glow('#22d3ee', 1.2), 0, .6, 0, Math.PI / 2); return G; }
      case 'flag': { add(C(.04, .04, 1.9, 8), mat('#cbd5e1', { metalness: .7 }), 0, .7, 0); const geo = new T.PlaneGeometry(.9, .6, 8, 1), pos = geo.attributes.position, base = pos.array.slice(); geo.translate(.45, 0, 0); const base2 = geo.attributes.position.array.slice(); const f = add(geo, mat('#ef4444', { side: T.DoubleSide }), 0, 1.35, 0); f.onBeforeRender = () => { const t = now(); for (let i = 0; i < pos.count; i++) { const x = base2[i * 3]; pos.array[i * 3 + 2] = Math.sin(t * 6 + x * 5) * .1 * x; } pos.needsUpdate = true; }; add(S(.07), gold(), 0, 1.68, 0); return G; }
      case 'saber': { add(C(.08, .08, .45, 12), mat('#94a3b8', { metalness: .9 }), 0, .05, 0); const col = pickR(['#22d3ee', '#ef4444', '#22c55e', '#a855f7']); const bl = add(C(.06, .06, 1.7, 10), glow(col, 3), 0, 1.12, 0); add(C(.1, .1, 1.72, 10), mat(col, { transparent: true, opacity: .25, emissive: col, emissiveIntensity: 2 }), 0, 1.12, 0); bl.onBeforeRender = () => { bl.material.emissiveIntensity = 2.6 + Math.random() * .8; }; return G; }
      case 'trophy': { add(C(.32, .38, .14, 18), mat('#78350f'), 0, 0, 0); add(C(.06, .1, .35, 10), gold(), 0, .25, 0); add(C(.38, .14, .55, 20, 1, true), gold(), 0, .7, 0).material.side = T.DoubleSide; [-1, 1].forEach(sd => add(TO(.15, .04, Math.PI), gold(), sd * .38, .72, 0, 0, 0, sd * Math.PI / 2)); const st = add(star(.14, .04), glow('#fde047', .8), 0, 1.15, -.02); st.onBeforeRender = () => { st.rotation.y = now() * 2.5; }; G.scale.setScalar(1.15); return G; }
      /* ---------- mascotas (procedurales) ---------- */
      case 'ghost': { const g2 = new T.Group(); G.add(g2); const body = new T.Mesh(S(.5, 20, 14), mat('#f8fafc', { transparent: true, opacity: .9, emissive: '#e0f2fe', emissiveIntensity: .4 })); body.scale.set(1, 1.2, 1); g2.add(body); [-1, 1].forEach(sd => { const e = new T.Mesh(S(.08), mat('#111827')); e.position.set(sd * .17, .12, .44); g2.add(e); }); const m2 = new T.Mesh(S(.07), mat('#111827')); m2.position.set(0, -.08, .46); m2.scale.y = 1.4; g2.add(m2); body.onBeforeRender = () => { g2.position.y = Math.sin(now() * 2.2) * .18; g2.rotation.z = Math.sin(now() * 1.7) * .15; }; return G; }
      case 'chick': { const g2 = new T.Group(); G.add(g2); const y = mat('#fde047'); const body = new T.Mesh(S(.45), y); g2.add(body); [-1, 1].forEach(sd => { const e = new T.Mesh(S(.06), mat('#111827')); e.position.set(sd * .16, .12, .4); g2.add(e); const w = new T.Mesh(S(.2), y); w.scale.set(.4, 1, .8); w.position.set(sd * .45, 0, 0); g2.add(w); w.userData.sd = sd; }); const bk = new T.Mesh(K(.1, .22, 8), mat('#f97316')); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0, .5); g2.add(bk); body.onBeforeRender = () => { const t = now(); g2.position.y = Math.abs(Math.sin(t * 3)) * .25; g2.children.forEach(c => { if (c.userData.sd) c.rotation.z = c.userData.sd * (.4 + Math.sin(t * 22) * .5); }); }; return G; }
      case 'drone': { const g2 = new T.Group(); G.add(g2); g2.add(new T.Mesh(B(.6, .18, .6), mat('#334155', { metalness: .6, roughness: .3 }))); const eye = new T.Mesh(S(.1), glow('#22d3ee', 2)); eye.position.set(0, -.05, .32); g2.add(eye); const props = []; [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => { const arm = new T.Mesh(B(.06, .05, .5), mat('#94a3b8')); arm.position.set(x * .3, .05, z * .3); arm.rotation.y = Math.atan2(x, z); g2.add(arm); const p2 = new T.Mesh(B(.45, .02, .06), mat('#e2e8f0')); p2.position.set(x * .45, .14, z * .45); g2.add(p2); props.push(p2); }); eye.onBeforeRender = () => { const t = now(); props.forEach(p2 => p2.rotation.y = t * 30); g2.position.y = Math.sin(t * 2) * .12; g2.rotation.y = Math.sin(t * .8) * .5; }; return G; }
    }
    return ob(T, id);
  };
})();

/* mascotas: flotan junto al robot (no van pegadas a un hueso) */
function dressPet(m, id, T) {
  const it = ITEMS[id]; if (!it) return;
  const ms = m.getWorldScale(new T.Vector3()).x, hold = new T.Group(); hold.name = 'acc_p';
  hold.position.set(1.85, 4.3, -.3); m.add(hold);
  const spin = new T.Group(); hold.add(spin);
  if (it.glb) {
    C3D.load('assets/td/' + it.glb + '.glb').then(g => { const o = g.scene.clone(true), b = new T.Box3().setFromObject(o), sz = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) || 1; o.scale.setScalar((id === 'crystal' ? 1 : 1.6) / sz); o.position.y = -(b.min.y + b.max.y) / 2 * o.scale.x; o.traverse(q => { if (q.isMesh) { q.castShadow = true; q.frustumCulled = false; } }); spin.add(o); }).catch(() => {});
    const ph = Math.random() * 6; const dummy = new T.Mesh(new T.SphereGeometry(.01), new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hold.add(dummy);
    dummy.onBeforeRender = () => { const t = performance.now() / 1000; hold.position.y = 4.3 + Math.sin(t * 2 + ph) * .2; spin.rotation.y = t * (id === 'crystal' ? 1.5 : .9); };
  } else spin.add(buildItem(T, id));
  hold.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
}

/* =================================================================== */
/* ✊✋✌️ PIEDRA, PAPEL O TIJERA — todos contra todos                      */
/* =================================================================== */
const PPT = [['closed', '✊', 'Piedra'], ['open', '✋', 'Papel'], ['peace', '✌️', 'Tijera']];
