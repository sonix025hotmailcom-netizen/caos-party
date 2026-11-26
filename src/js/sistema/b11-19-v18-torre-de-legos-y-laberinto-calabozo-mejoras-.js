/* ================== v18 — 🧱 TORRE DE LEGOS y 🏰 LABERINTO CALABOZO (mejoras gráficas) ================== */
/* --- la torre ahora se arma con legos del color de cada jugador --- */
(() => {
  const BR = n => IMG('bricks/' + n + '.png');
  const pickBrick = (w, h) => { const studs = [1, 2, 4, 6].reduce((a, b) => Math.abs(b * 34 - w) < Math.abs(a * 34 - w) ? b : a), r = h / w; return `brick_${r > .7 ? 'high' : r > .28 ? 'medium' : 'low'}_${studs}`; };
  const lego = (ctx, w, h, col) => {
    const n = pickBrick(w, h), im = BR(n), t = imgOk(im) && tkTint(im, col);
    if (t) { const s = 16 * h / (im.naturalHeight - 16 || 1); ctx.drawImage(t, -w / 2, -h / 2 - s, w, h + s); return; }
    ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.lineWidth = 3; ctx.strokeStyle = '#0006'; ctx.strokeRect(-w / 2, -h / 2, w, h);
  };
  const od = GAMES.tower.realStart;
  GAMES.tower.realStart = function () { ['low', 'medium', 'high'].forEach(a => [1, 2, 4, 6].forEach(k => BR(`brick_${a}_${k}`))); return od.call(this); };
  GAMES.tower.name = 'Torre de Legos';
  GAMES.tower.desc = 'Por turnos, cada uno suelta un LEGO desde la grúa 🏗️. El primero es la BASE: después todos tienen que caer ENCIMA de la torre. Si tu lego toca el piso o hace caer algo, perdés 😱. ¡Se juega hasta que la torre se caiga, y la grúa cada vez va más rápido!';
  GAMES.tower.draw = function (ctx) {
    const gd = H.gd, T = GAMES.tower;
    const sky = ctx.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, '#0ea5e9'); sky.addColorStop(1, '#fde68a'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 600);
    ctx.fillStyle = '#ffffff99'; for (let k = 0; k < 5; k++) { const cx = (k * 230 + gd.t * 8) % 1200 - 100, cy = 60 + (k % 3) * 50 + gd.cam * .3; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 7); ctx.arc(cx + 26, cy - 10, 30, 0, 7); ctx.arc(cx + 56, cy, 22, 0, 7); ctx.fill(); }
    ctx.save(); ctx.translate(0, gd.cam);
    /* base: una placa de lego verde */
    const base = BR('brick_low_6'), bt = imgOk(base) && tkTint(base, '#22c55e');
    ctx.fillStyle = '#15803d'; ctx.fillRect(350, 560, 300, 400);
    if (bt) ctx.drawImage(bt, 350, 545 - 14, 300, 30 + 14); else { ctx.fillStyle = '#22c55e'; ctx.fillRect(350, 545, 300, 30); }
    for (const b of gd.blocks) {
      const pp = pl(b.owner), w = Math.hypot(b.vertices[1].x - b.vertices[0].x, b.vertices[1].y - b.vertices[0].y), h = Math.hypot(b.vertices[2].x - b.vertices[1].x, b.vertices[2].y - b.vertices[1].y);
      ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle); lego(ctx, w, h, pp?.color || '#888'); emo(ctx, pp?.emoji || '', 0, 3, Math.min(22, h * .7)); if (b.isBase) { ctx.font = '900 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 3; ctx.strokeText('BASE', 0, h / 2 - 4); ctx.fillText('BASE', 0, h / 2 - 4); } ctx.restore();
    }
    if (gd.state === 'aim' && H.phase === 'tw-go') {
      const x = T.craneX(), y = T.top() - 150, n = gd.next, pp = pl(T.cur());
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 400); ctx.lineTo(x, y - n.h / 2 - 14); ctx.stroke();
      ctx.fillStyle = '#facc15'; ctx.fillRect(x - 18, y - n.h / 2 - 22, 36, 10);
      ctx.setLineDash([8, 8]); ctx.strokeStyle = '#0005'; ctx.beginPath(); ctx.moveTo(x, y + n.h / 2); ctx.lineTo(x, T.top()); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(x, y); ctx.globalAlpha = .92; lego(ctx, n.w, n.h, pp?.color || '#888'); ctx.globalAlpha = 1; emo(ctx, pp?.emoji || '', 0, 3, Math.min(22, n.h * .7)); ctx.restore();
    }
    ctx.restore();
    nameTag(ctx, `🧱 ${gd.drops} legos · 📏 ${Math.max(0, Math.round((545 - T.top()) / 40 * 10) / 10)} m`, 150, 30, 20);
    if (H.phase === 'tw-go' && gd.state === 'aim') nameTag(ctx, `Turno: ${pl(T.cur())?.emoji || ''} ${pl(T.cur())?.name || ''}`, 500, 30, 26);
    if (H.phase === 'tw-go' && gd.state === 'aim' && !gd.blocks.length) nameTag(ctx, '⬇️ El primer lego es la BASE', 500, 72, 20);
    if (gd.culprit) nameTag(ctx, gd.why === 'piso' ? `💥 ¡${pl(gd.culprit)?.name || ''} tocó el piso!` : `💥 ¡${pl(gd.culprit)?.name || ''} tumbó la torre!`, 500, 300, 46);
  };
})();
