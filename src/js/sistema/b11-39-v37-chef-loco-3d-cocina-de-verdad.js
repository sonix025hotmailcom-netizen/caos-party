/* ================== v37 — CHEF LOCO 3D: cocina de verdad ================== */
(() => {
  const C = GAMES.chef;
  C.build = function (T) {
    const W = this.W, D = this.D, gd = H.gd, r = arena3D(T, { bg: '#fef3c7', camY: 15.5, camZ: 12.5, lookZ: .4 }), add = o => { r.scene.add(o); return o; };
    r.scene.fog = new T.Fog('#fef3c7', 34, 70); r.cam.fov = 44; r.cam.updateProjectionMatrix();
    const sun = r.scene.children.find(c => c.isDirectionalLight); if (sun) { sun.position.set(-6, 22, 12); sun.intensity = 1.9; Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12 }); sun.shadow.camera.updateProjectionMatrix(); }
    const hemi = r.scene.children.find(c => c.isHemisphereLight); if (hemi) { hemi.color.set('#fff7ed'); hemi.groundColor.set('#b45309'); hemi.intensity = 1.25; }
    /* piso: baldosas de cocina en rombos dentro de la zona de juego, madera afuera */
    const tile = CARX.tex(T, 512, 512, (g, w, h) => { const n = 4, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#fff7ed' : '#99f6e4'; g.fillRect(i * s, j * s, s, s); } for (let k = 0; k < 5000; k++) { g.fillStyle = Math.random() < .5 ? '#0000000a' : '#ffffff14'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = '#cbd5e1'; g.lineWidth = 5; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); } g.fillStyle = '#ffffff55'; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) g.fillRect(i * s + 8, j * s + 8, s * .35, 6); }, [W / 2, D / 2]);
    const floor = add(new T.Mesh(new T.BoxGeometry(W * 2 + .4, .4, D * 2 + .4), new T.MeshStandardMaterial({ map: tile, roughness: .35, metalness: .05 }))); floor.position.y = -.2; floor.receiveShadow = true;
    const edge = add(new T.Mesh(new T.BoxGeometry(W * 2 + 1, .36, D * 2 + 1), new T.MeshStandardMaterial({ color: '#0f766e', roughness: .5 }))); edge.position.y = -.23;
    const wood = CARX.tex(T, 256, 256, (g, w, h) => { for (let k = 0; k < 8; k++) { g.fillStyle = ['#b07a4a', '#a26c3f', '#bb855a', '#9d6538'][k % 4]; g.fillRect(0, k * 32, w, 32); g.fillStyle = '#00000022'; g.fillRect(0, k * 32, w, 2); for (let q = 0; q < 12; q++) { g.fillStyle = '#00000012'; g.fillRect(Math.random() * w, k * 32 + Math.random() * 30, 20 + Math.random() * 40, 1); } } }, [10, 8]);
    const out = add(new T.Mesh(new T.PlaneGeometry(90, 70), new T.MeshStandardMaterial({ map: wood, roughness: .8 }))); out.rotation.x = -Math.PI / 2; out.position.y = -.42; out.receiveShadow = true;
    /* pared de atrás con azulejos y mesada larga */
    const sub = CARX.tex(T, 256, 256, (g, w, h) => { g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) { const ox = (y % 2) * 32; g.fillStyle = '#f8fafc'; g.fillRect(x * 64 + ox + 2, y * 32 + 2, 60, 28); g.fillStyle = '#ffffff99'; g.fillRect(x * 64 + ox + 6, y * 32 + 5, 26, 4); } }, [8, 2]);
    const bw = add(new T.Mesh(new T.BoxGeometry(W * 2 + 8, 5, .3), [0, 0, 0, 0, new T.MeshStandardMaterial({ map: sub, roughness: .3 }), 0].map(m => m || new T.MeshStandardMaterial({ color: '#cbd5e1' })))); bw.position.set(0, 2.1, -D - 2.15); bw.receiveShadow = true;
    const paint = add(new T.Mesh(new T.BoxGeometry(W * 2 + 8, 2.2, .32), new T.MeshStandardMaterial({ color: '#fb7185', roughness: .8 }))); paint.position.set(0, 5.6, -D - 2.15);
    const front = CARX.tex(T, 512, 128, (g, w, h) => { g.fillStyle = '#0f766e'; g.fillRect(0, 0, w, h); for (let k = 0; k < 8; k++) { g.fillStyle = '#115e59'; g.fillRect(k * 64 + 5, 10, 54, h - 20); g.fillStyle = '#14b8a6'; g.fillRect(k * 64 + 7, 12, 50, 4); g.fillStyle = '#e2e8f0'; g.fillRect(k * 64 + 27, 22, 10, 4); } }, [3, 1]);
    const counter = add(new T.Mesh(new T.BoxGeometry(W * 2 + 3, 1.6, 1.2), [0, 0, 0, 0, new T.MeshStandardMaterial({ map: front, roughness: .6 }), 0].map(m => m || new T.MeshStandardMaterial({ color: '#115e59' })))); counter.position.set(0, .3, -D - 1.2); counter.castShadow = true; counter.receiveShadow = true;
    const marble = CARX.tex(T, 512, 64, (g, w, h) => { g.fillStyle = '#f1f5f9'; g.fillRect(0, 0, w, h); g.strokeStyle = '#94a3b855'; g.lineWidth = 1.5; for (let k = 0; k < 16; k++) { g.beginPath(); let x = Math.random() * w, y = 0; g.moveTo(x, y); while (y < h) { x += (Math.random() - .5) * 30; y += 8; g.lineTo(x, y); } g.stroke(); } });
    const top = add(new T.Mesh(new T.BoxGeometry(W * 2 + 3.2, .2, 1.4), new T.MeshStandardMaterial({ map: marble, roughness: .15, metalness: .1 }))); top.position.set(0, 1.15, -D - 1.2); top.castShadow = true;
    r.foodOnCounter = new T.Group(); add(r.foodOnCounter);
    ['Food_Ramen', 'Pancakes_Stack', 'Food_Udon', 'Burger', 'Food_Dango', 'Pizza_Slice', 'Food_Onigiri'].forEach((n, i) => C3D.prop('food', n, 1.1).then(o => { if (!o) return; o.position.set(-W + 1 + i * (W * 2 - 2) / 6, 1.25, -D - 1.2); r.foodOnCounter.add(o); }).catch(() => {}));
    const putF = (n, o, x, y, z, rot) => fitModel(T, Fk(n), o).then(m => { m.position.set(x, y, z); m.rotation.y = rot || 0; add(m); }).catch(() => {});
    putF('kitchenFridgeLarge', { h: 3.4 }, -W - 2.6, 0, -D - 1.1); putF('kitchenFridgeLarge', { h: 3.4 }, W + 2.6, 0, -D - 1.1);
    for (let k = 0; k < 6; k++) putF(k === 2 || k === 3 ? 'hoodModern' : 'kitchenCabinetUpperDouble', { size: 2.6 }, -W + 1.6 + k * (W * 2 - 3.2) / 5, k === 2 || k === 3 ? 3.4 : 3.6, -D - 1.85);
    putF('kitchenMicrowave', { size: .9 }, -W + 1 + 2.5 * (W * 2 - 2) / 6, 1.25, -D - 1.35); putF('toaster', { size: .6 }, -W + 1 + 4.5 * (W * 2 - 2) / 6, 1.25, -D - 1.3); putF('kitchenCoffeeMachine', { size: .6 }, -W + 1 + .5 * (W * 2 - 2) / 6, 1.25, -D - 1.3); putF('kitchenBlender', { h: .8 }, -W + 1 + 5.5 * (W * 2 - 2) / 6, 1.25, -D - 1.3);
    /* costados: islas con banquitos, plantas y basureros (decoración, fuera de la zona de juego) */
    for (const sd of [-1, 1]) { putF('kitchenBar', { size: 2.4 }, sd * (W + 2.4), 0, 0, sd * Math.PI / 2); putF('stoolBar', { h: 1.3 }, sd * (W + 1.3), 0, -1.6); putF('stoolBar', { h: 1.3 }, sd * (W + 1.3), 0, 1.6); putF('pottedPlant', { h: 1.8 }, sd * (W + 2.6), 0, D + .6); putF('trashcan', { h: 1 }, sd * (W + 1.4), 0, D - .4); }
    putF('rugRounded', { size: 5 }, 0, -.38, D + 2.8);
    r.chars = {}; r.rats = {}; r.items = {};
    for (const id of gd.ids) C3D.load(charURL(charOf(pl(id)))).then(g => { if (H.gd !== gd) return; const a = C3D.make(g, hFor(g, 1.9), tintFor(g, id)); a.play('Idle'); r.scene.add(a.obj); r.chars[id] = a; }).catch(() => {});
    const sg = new T.RingGeometry(.55, .8, 32); r.shadowMat = new T.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .35, side: T.DoubleSide }); r.shadowGeo = sg;
    r.last = performance.now();
    return r;
  };
})();
