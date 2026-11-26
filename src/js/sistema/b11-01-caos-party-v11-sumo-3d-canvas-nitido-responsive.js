/* ================== CAOS PARTY v11 — SUMO 3D, CANVAS NÍTIDO, RESPONSIVE ================== */

/* ---------- 2D más nítido: los canvas se dibujan a la resolución real de la pantalla ---------- */
const CDPR = () => Math.min(2, Math.max(1, window.devicePixelRatio || 1));
(() => {
  /* calidad automática: si la tablet/tele no da abasto, baja la resolución del canvas (y lo recuerda) para que el juego no se ponga lento */
  const LV = [2, 1.5, 1.15, .85]; let CQ = 0; try { CQ = Math.min(3, +sessionStorage.getItem('caos_cq') || 0); } catch (e) {}
  window.canvasK = () => Math.min(CDPR(), LV[CQ]);
  const oc = canvasHTML;
  canvasHTML = function (ready, text) { const k = canvasK(); return oc(ready, text).replace('width="1000" height="600"', `width="${Math.round(1000 * k)}" height="${Math.round(600 * k)}"`); };
  const ol = rtLoop;
  rtLoop = function (step, draw) {
    let lt = 0, n = 0, acc = 0, warm = 0;
    return ol(step, ctx => {
      const now = performance.now(), cv = ctx.canvas;
      if (lt && cv.offsetParent && !document.hidden) { const d = now - lt; if (d < 250) { if (++warm > 30) { acc += d; n++; } } }
      lt = now;
      if (n >= 75) { const avg = acc / n; acc = 0; n = 0; if (avg > 23 && CQ < 3) { const k0 = canvasK(); do CQ++; while (CQ < 3 && canvasK() === k0); try { sessionStorage.setItem('caos_cq', CQ); } catch (e) {} const k = canvasK(); if (Math.abs(cv.width / 1000 - k) > .01) { cv.width = Math.round(1000 * k); cv.height = Math.round(600 * k); } } }
      const k = cv.width / 1000; ctx.setTransform(k, 0, 0, k, 0, 0); ctx.imageSmoothingQuality = CQ ? 'low' : 'high'; window.__lowq = CQ >= 2; draw(ctx);
    });
  };
})();
