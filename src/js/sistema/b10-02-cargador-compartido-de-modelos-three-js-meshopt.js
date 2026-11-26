/* ---------- cargador compartido de modelos (three.js + meshopt) ---------- */
const C3D = (() => {
  let base = null; const cache = {}, TV = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
  async function libs() {
    if (base) return base;
    const T = await import(TV + 'build/three.module.js');
    const { GLTFLoader } = await import(TV + 'examples/jsm/loaders/GLTFLoader.js');
    const { MeshoptDecoder } = await import(TV + 'examples/jsm/libs/meshopt_decoder.module.js');
    const SU = await import(TV + 'examples/jsm/utils/SkeletonUtils.js');
    const L = new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder);
    return base = { T, L, SU };
  }
  function load(url) {
    return cache[url] || (cache[url] = libs().then(({ L, T }) => L.loadAsync(url)).then(g => {
      const T = base.T, b = new T.Box3().setFromObject(g.scene); g.userData.h = /robot\.glb/.test(url) ? 4.85 : (b.max.y - b.min.y || 1); g.userData.url = url;
      const m = url.match(/chars\/(\w+)\.glb/); if (m) CHAR_DONE[m[1]] = g;
      return g;
    }).catch(e => { delete cache[url]; throw e; }));
  }
  function make(g, height, tint) {
    const { T, SU } = base, obj = SU.clone(g.scene);
    obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; if (tint && o.material && /Main|Character_Main|Hazmat_Main|Enemy_Red/.test(o.material.name)) { o.material = o.material.clone(); o.material.color.set(tint); } } });
    obj.scale.setScalar(height / g.userData.h);
    const mixer = new T.AnimationMixer(obj), acts = {};
    g.animations.forEach(cl => acts[cl.name] = mixer.clipAction(cl));
    const a = { obj, mixer, acts, cur: null };
    a.play = (name, once, then) => {
      const nx = acts[name] || acts[ANIM_ALIAS[name]] || acts[ANIM_ALIAS[ANIM_ALIAS[name]]]; if (!nx || a.cur === nx) return;
      nx.reset(); nx.setLoop(once ? T.LoopOnce : T.LoopRepeat); nx.clampWhenFinished = !!once;
      if (a.cur) nx.crossFadeFrom(a.cur, .2, false); nx.play(); a.cur = nx;
      if (once && then) { const f = e => { if (e.action === nx) { mixer.removeEventListener('finished', f); a.cur = null; a.play(then); } }; mixer.addEventListener('finished', f); }
    };
    return a;
  }
  const scenesCache = {};
  async function prop(file, name, size) {
    const g = await load('assets/props/' + file + '.glb'), { T } = base;
    const sc = g.scenes.find(s => s.name === name); if (!sc) return null;
    const o = sc.clone(true); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const b = new T.Box3().setFromObject(o), s = b.getSize(new T.Vector3()), k = size / Math.max(s.x, s.y, s.z);
    const w = new T.Group(); o.scale.setScalar(k); o.position.set(-(b.min.x + s.x / 2) * k, -b.min.y * k, -(b.min.z + s.z / 2) * k); w.add(o); return w;
  }
  return { libs, load, make, prop, get T() { return base && base.T; } };
})();
function preloadChars(list) { list.forEach(k => C3D.load(charURL(k)).catch(() => {})); }
const tintFor = (g, id) => (window._dressId = id, /robot\.glb/.test(g.userData.url || '') ? pl(id)?.color : null);
const hFor = (g, base) => /robot\.glb/.test(g.userData.url || '') ? base * 1.05 : /Panda/.test(g.userData.url || '') ? base * .82 : base;
