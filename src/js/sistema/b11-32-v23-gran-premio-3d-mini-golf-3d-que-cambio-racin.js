/* ================== v23 — 🏎️ GRAN PREMIO 3D, ⛳ MINI GOLF 3D, 🛋️ ¿QUÉ CAMBIÓ? (Racing, Minigolf y Furniture Kit) ================== */
/* carga un modelo, lo centra (x/z) con la base en y=0 y lo escala: size = medida horizontal máxima, o scale fija */
function fitModel(T, url, o = {}) {
  return C3D.load(url).then(g => {
    const m = g.scene.clone(true), bb = new T.Box3().setFromObject(m), sz = new T.Vector3(); bb.getSize(sz);
    const k = o.size ? o.size / Math.max(sz.x, sz.z, .001) : o.h ? o.h / Math.max(sz.y, .001) : (o.scale || 1);
    const inner = new T.Group(); m.position.set(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2); inner.add(m); inner.scale.setScalar(k);
    const G = new T.Group(); G.add(inner); G.userData.size = sz.clone().multiplyScalar(k);
    m.traverse(q => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; if (o.clone) q.material = Array.isArray(q.material) ? q.material.map(x => x.clone()) : q.material.clone(); } });
    return G;
  });
}
const Rk = n => 'assets/race/' + n + '.glb', Gk = n => 'assets/golf/' + n + '.glb', Fk = n => 'assets/furn/' + n + '.glb';
const angTo = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
