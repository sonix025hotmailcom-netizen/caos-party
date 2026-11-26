/* ================== utilidades de arena 3D ================== */
function arena3D(T, o = {}) {
  const renderer = new T.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(1000, 600, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.toneMapping = T.ACESFilmicToneMapping;
  const scene = new T.Scene(); scene.background = new T.Color(o.bg || '#7dd3fc'); scene.fog = new T.Fog(o.bg || '#7dd3fc', 30, 70);
  const cam = new T.PerspectiveCamera(42, 1000 / 600, .1, 200); cam.position.set(0, o.camY || 17, o.camZ || 15); cam.lookAt(0, 0, o.lookZ ?? 1);
  scene.add(new T.HemisphereLight(0xffffff, 0x8a6b4a, 1.4));
  const sun = new T.DirectionalLight(0xfff1d6, 2.2); sun.position.set(-8, 20, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 14, bottom: -14, far: 60 }); sun.shadow.bias = -.0005; scene.add(sun);
  return { T, renderer, scene, cam };
}
function attachArena(gd) {
  const put = () => { const w = $('.gwrap'); if (!w || !gd.r3) return; const c = gd.r3.renderer.domElement; c.classList.add('gc', 'gc3d'); if (c.parentElement !== w) w.prepend(c); const g2 = $('#gc'); if (g2) g2.style.display = 'none'; };
  if (gd.r3) { setTimeout(put, 0); return; }
  if (gd.r3loading) { gd.r3loading.then(() => setTimeout(put, 0)); return; }
  gd.r3loading = C3D.libs().then(({ T }) => { if (H.gd !== gd) return; gd.r3 = gd.build3D(T); setTimeout(put, 0); }).catch(() => {});
}
function hud3D(html) { let h = $('#hud3d'); const w = $('.gwrap'); if (!w) return; if (!h) { w.insertAdjacentHTML('beforeend', '<div class="hud3d" id="hud3d"></div>'); h = $('#hud3d'); } if (h._h !== html) { h._h = html; h.innerHTML = html; } }
const chipsHTML = rows => rows.map(r => `<span class="schip" style="--c:${r.c}">${r.t}</span>`).join('');
function checkerTex(T, a, b, n = 8) { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const s = 256 / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); } const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t; }

const FOOD_GOOD = ['Apple', 'Avocado', 'Banana', 'Burger', 'Cheeseburger', 'ChickenLeg', 'Cupcake', 'Donut1', 'Donut2', 'Fries', 'Hotdog', 'IceCream_Cone', 'Pizza_Slice', 'Pancakes_Stack', 'Steak', 'Carrot', 'Broccoli', 'Orange', 'Tomato', 'Waffle', 'Croissant', 'Popsicle_Strawberry', 'Egg_Fried', 'Corndog', 'ChocolateBar', 'Coconut'];
const FOOD_GOLD = ['Food_SalmonNigiri', 'Food_MaguroNigiri', 'Food_EbiNigiri', 'Food_TamagoNigiri', 'Food_Onigiri', 'Food_Ramen', 'Food_Dango', 'Food_Gyoza', 'Food_SalmonRoll', 'Food_Udon'];
