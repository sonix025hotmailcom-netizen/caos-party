/* ---------- 🌟 brillo neón (bloom) en Lluvia de Meteoros 3D ---------- */
let _post = null;
function getPost() {
  const B = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/';
  return _post || (_post = Promise.all(['EffectComposer.js', 'RenderPass.js', 'UnrealBloomPass.js', 'OutputPass.js'].map(f => import(B + f))).catch(e => { _post = null; throw e; }));
}
(() => {
  const ob = GAMES.meteor.build3D;
  GAMES.meteor.build3D = function (T) {
    const r = ob.call(this, T);
    getPost().then(([{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
      const comp = new EffectComposer(r.renderer); comp.setSize(1000, 600);
      comp.addPass(new RenderPass(r.scene, r.cam));
      comp.addPass(new UnrealBloomPass(new T.Vector2(1000, 600), .85, .55, .55));
      comp.addPass(new OutputPass());
      const orig = r.renderer.render.bind(r.renderer); let inside = false;
      r.renderer.render = (s, c) => { if (inside) return orig(s, c); inside = true; try { comp.render(); } finally { inside = false; } };
    }).catch(() => {});
    return r;
  };
})();
