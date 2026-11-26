/* ================== AUTO-SIGUIENTE: en la tabla de puntos, pasa solo al siguiente juego en 6 s ================== */
(() => {
  const SEG = 6; let t0 = 0, enBoard = false;
  setInterval(() => {
    if (typeof H === 'undefined' || !H.code) return;
    if (H.phase !== 'board' || H.testMode) { enBoard = false; return; }
    const btn = document.querySelector('[data-act="next"]'); if (!btn) return;
    if (!enBoard) { enBoard = true; t0 = performance.now(); }
    const left = Math.max(0, Math.ceil(SEG - (performance.now() - t0) / 1000));
    let sp = btn.querySelector('.autoN'); if (!sp) { sp = document.createElement('span'); sp.className = 'autoN'; sp.style.cssText = 'margin-left:.4em;opacity:.85'; btn.appendChild(sp); } const txt = `(${left})`; if (sp.textContent !== txt) sp.textContent = txt;
    if (left <= 0) { enBoard = false; try { onHostClick({ target: btn }); } catch (e) { btn.click(); } }
  }, 250);
})();
