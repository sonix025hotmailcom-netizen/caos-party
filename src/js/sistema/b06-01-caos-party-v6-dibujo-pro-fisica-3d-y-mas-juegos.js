/* ================== CAOS PARTY v6 — DIBUJO PRO, FÍSICA, 3D Y MÁS JUEGOS ================== */
const _scripts = {};
function loadScript(src) {
  return _scripts[src] || (_scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = () => res(); s.onerror = () => { delete _scripts[src]; rej(new Error('load ' + src)); };
    document.head.appendChild(s);
  }));
}
const LIBS = { matter: 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js', gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js' };
let _three = null;
function getTHREE() { return _three || (_three = import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').catch(e => { _three = null; throw e; })); }
function preloadHostLibs() { loadScript(LIBS.matter).catch(() => {}); if (!window.gsap) loadScript(LIBS.gsap).catch(() => {}); getTHREE().catch(() => {}); }
