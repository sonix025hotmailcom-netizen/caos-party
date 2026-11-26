/* ================== SEGURIDAD: el host ignora mensajes raros o en exceso (anti-spam / anti-trampas) ================== */
(() => {
  const oh = onHostMsg, RATE = 60, BURST = 120;
  onHostMsg = function (conn, m) {
    if (!conn || !m || typeof m !== 'object' || Array.isArray(m) || typeof m.t !== 'string' || m.t.length > 16) return;
    if (m.t !== 'part' && m.t !== 'join') {
      const now = performance.now(), b = conn._rl || (conn._rl = { tk: BURST, t: now });
      b.tk = Math.min(BURST, b.tk + (now - b.t) / 1000 * RATE); b.t = now;
      if (b.tk < 1) { if (!conn._rlAviso) { conn._rlAviso = 1; console.warn('CAOS: se ignoran mensajes de más de', conn._pid); } return; }
      b.tk -= 1;
    }
    return oh.apply(this, arguments);
  };
})();
