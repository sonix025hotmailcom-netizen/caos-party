/* ---------- 3D de fondo en la tele (three.js) ---------- */
async function bg3D() {
  if (window.__bg3d) return; window.__bg3d = 1;
  try {
    const T = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js');
    const r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5, QUAL().pr));
    const cvs = r.domElement; cvs.id = 'bg3d'; document.body.prepend(cvs);
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(60, 1, .1, 100); cam.position.z = 14;
    sc.add(new T.AmbientLight(0xffffff, .7)); const dl = new T.DirectionalLight(0xffffff, 1.3); dl.position.set(5, 8, 10); sc.add(dl);
    const pl2 = new T.PointLight(0xff4d8d, 30, 40); pl2.position.set(-8, -4, 6); sc.add(pl2);
    const geos = [new T.IcosahedronGeometry(1, 0), new T.TorusGeometry(.8, .32, 12, 24), new T.OctahedronGeometry(1, 0), new T.TorusKnotGeometry(.6, .22, 64, 10), new T.DodecahedronGeometry(1, 0), new T.ConeGeometry(.8, 1.5, 5), new T.BoxGeometry(1.2, 1.2, 1.2)];
    const objs = [];
    for (let i = 0; i < 24; i++) {
      const m = new T.Mesh(pickR(geos), new T.MeshStandardMaterial({ color: COLORS[i % 8], flatShading: true, roughness: .35, metalness: .15 }));
      m.position.set((Math.random() - .5) * 28, (Math.random() - .5) * 17, (Math.random() - .5) * 10 - 4);
      m.userData = { rx: (Math.random() - .5) * .02, ry: (Math.random() - .5) * .02, f: Math.random() * 6, sp: .3 + Math.random() * .6 };
      const s = .4 + Math.random() * .9; m.scale.set(s, s, s); sc.add(m); objs.push(m);
    }
    const rs = () => { r.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    rs(); addEventListener('resize', rs);
    let last = 0;
    const loop = t => {
      requestAnimationFrame(loop);
      const busy = !!document.querySelector('#gc'); cvs.style.opacity = busy ? 0 : 1;
      if (busy || t - last < 33) return; last = t;
      objs.forEach(o => { o.rotation.x += o.userData.rx; o.rotation.y += o.userData.ry; o.position.y += Math.sin(t / 1000 * o.userData.sp + o.userData.f) * .006; });
      cam.position.x = Math.sin(t / 7000) * 2; cam.position.y = Math.cos(t / 9000); cam.lookAt(0, 0, 0);
      r.render(sc, cam);
    };
    requestAnimationFrame(loop);
  } catch (e) { console.log('3D no disponible'); }
}
