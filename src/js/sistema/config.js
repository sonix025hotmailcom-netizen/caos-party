/* ================== CONFIGURACIÓN (se guarda en este aparato): calidad gráfica y más ================== */
const CFG = (() => { let c = {}; try { c = JSON.parse(localStorage.getItem('caos_cfg') || '{}'); } catch (e) {} return Object.assign({ q: 'alto' }, c); })();
function cfgSave() { try { localStorage.setItem('caos_cfg', JSON.stringify(CFG)); } catch (e) {} }
/* pr = resolución del 3D · sh = sombras · aa = bordes suaves · fx = efectos de brillo · cq = nivel de los juegos 2D */
const QUALS = { alto: { pr: 2, sh: 2048, aa: true, fx: true, cq: 0 }, medio: { pr: 1, sh: 1024, aa: true, fx: false, cq: 2 }, liviano: { pr: .7, sh: 0, aa: false, fx: false, cq: 3 } };
const QUAL = () => QUALS[CFG.q] || QUALS.alto;
window.__lowq = CFG.q === 'liviano';
