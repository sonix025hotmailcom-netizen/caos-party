/* ---------- brillo neón reutilizable ---------- */
function addBloom(r, T, strength = .7) {
  getPost().then(([{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
    const comp = new EffectComposer(r.renderer); comp.setSize(1000, 600);
    comp.addPass(new RenderPass(r.scene, r.cam)); comp.addPass(new UnrealBloomPass(new T.Vector2(1000, 600), strength, .4, .82)); comp.addPass(new OutputPass());
    const orig = r.renderer.render.bind(r.renderer); let inside = false;
    r.renderer.render = (s, c) => { if (inside) return orig(s, c); inside = true; try { comp.render(); } finally { inside = false; } };
  }).catch(() => {});
}
