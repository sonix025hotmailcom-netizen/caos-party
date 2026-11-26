/* ================== v21 — MEJOR 3D (luz ambiental + bloom + oclusión), Defensa Ovni justo, ⚔️ CALABOZO LOCO ================== */
/* ---------- motor gráfico: iluminación por entorno (PBR), brillo suave y sombras de contacto ---------- */
const GFX = (() => {
  const B = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/';
  let envP = null, aoP = null;
  const strong = !/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) && (navigator.hardwareConcurrency || 4) >= 6;
  const env = () => envP || (envP = import(B + 'environments/RoomEnvironment.js').catch(e => { envP = null; throw e; }));
  const ao = () => aoP || (aoP = import(B + 'postprocessing/GTAOPass.js').catch(e => { aoP = null; throw e; }));
  function lights(renderer, scene, T, k = .22) {
    env().then(({ RoomEnvironment }) => {
      try {
        const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
        scene.traverse(o => { if (o.isHemisphereLight) o.intensity *= .8; });
        const fix = () => scene.traverse(o => { if (o.isMesh && o.material) [].concat(o.material).forEach(m => { if ('envMapIntensity' in m && !m.userData.envK) { m.envMapIntensity = k; m.userData.envK = 1; } }); });
        const orig = renderer.render.bind(renderer); let n = 0;
        renderer.render = (s2, c) => { if (s2 === scene && !(n++ % 20)) fix(); return orig(s2, c); };
      } catch (e) {}
    }).catch(() => {});
  }
  function post(r, T, o = {}) {
    if (r._post) return; r._post = true;
    Promise.all([getPost(), strong && o.ao === true ? ao().catch(() => null) : null]).then(([[{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }], AO]) => {
      const comp = new EffectComposer(r.renderer); comp.setSize(1000, 600);
      comp.addPass(new RenderPass(r.scene, r.cam));
      if (AO && AO.GTAOPass) { try { const p = new AO.GTAOPass(r.scene, r.cam, 1000, 600); p.output = AO.GTAOPass.OUTPUT.Default; p.blendIntensity = .9; comp.addPass(p); } catch (e) {} }
      comp.addPass(new UnrealBloomPass(new T.Vector2(1000, 600), o.bloom ?? .16, .4, .9)); comp.addPass(new OutputPass());
      const orig = r.renderer.render.bind(r.renderer); let inside = false;
      r.renderer.render = (s, c) => { if (inside) return orig(s, c); inside = true; try { if (s.userData.envK && !(r._fr = ((r._fr || 0) + 1) % 30)) s.traverse(q => { if (q.isMesh && q.material && q.material.envMapIntensity === 1) q.material.envMapIntensity = s.userData.envK; }); comp.render(); } finally { inside = false; } };
    }).catch(() => {});
  }
  return { lights, post, strong };
})();
(() => {
  /* todas las arenas 3D (Chef, Paintball, Sumo, Defensa Ovni…) reciben la mejora */
  const oa = arena3D;
  arena3D = function (T, o = {}) { const r = oa(T, o); GFX.lights(r.renderer, r.scene, T); if (o.bloom) GFX.post(r, T, { bloom: o.bloom }); return r; };
  const ob = addBloom;
  addBloom = function (r, T, s) { if (r._post) return; return ob(r, T, s); };
})();
