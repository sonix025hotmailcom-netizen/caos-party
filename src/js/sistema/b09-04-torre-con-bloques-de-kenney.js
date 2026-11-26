/* ---------- 🧱 Torre con bloques de Kenney ---------- */
(() => {
  const T = GAMES.tower, oDraw = T.draw, oStart = T.start;
  const BL = { '#ff4d6d': 'block_red', '#ec4899': 'block_red', '#3b82f6': 'block_blue', '#a855f7': 'block_blue', '#22c55e': 'block_green', '#14b8a6': 'block_green', '#f59e0b': 'block_yellow', '#f97316': 'block_yellow' };
  const files = ['plat/background_color_mushrooms.png', 'plat/background_clouds.png', 'plat/terrain_grass_block_top.png', 'plat/terrain_grass_block_center.png', 'plat/block_red.png', 'plat/block_blue.png', 'plat/block_green.png', 'plat/block_yellow.png', 'plat/block_planks.png'];
  T.start = function () { preload(files); return oStart.call(this); };
  const texBlock = (ctx, cx, cy, ang, w, h, img, emoji) => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
    ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.save(); ctx.clip();
    const S = Math.min(48, h); for (let x = -w / 2; x < w / 2; x += S) for (let y = -h / 2; y < h / 2; y += S) ctx.drawImage(img, x, y, S, S);
    ctx.restore(); ctx.lineWidth = 3; ctx.strokeStyle = '#1a1033'; ctx.strokeRect(-w / 2, -h / 2, w, h);
    if (emoji) emo(ctx, emoji, 0, 1, Math.min(22, h * .6));
    ctx.restore();
  };
  T.draw = function (ctx) {
    if (!files.every(f => imgOk(IMG(f)))) return oDraw.call(this, ctx);
    const gd = H.gd, t = performance.now() / 1000;
    ctx.fillStyle = '#d8f1ff'; ctx.fillRect(0, 0, 1000, 600);
    tileX(ctx, IMG('plat/background_clouds.png'), -60 + gd.cam * .2, 560, 6, t, .9);
    tileX(ctx, IMG('plat/background_color_mushrooms.png'), -20 + gd.cam * .4, 600, 0, t);
    ctx.save(); ctx.translate(0, gd.cam);
    for (let x = 350; x < 650; x += 50) { ctx.drawImage(IMG('plat/terrain_grass_block_top.png'), x, 545, 50, 50); for (let y = 595; y < 1000; y += 50) ctx.drawImage(IMG('plat/terrain_grass_block_center.png'), x, y, 50, 50); }
    for (const b of gd.blocks) {
      const v = b.vertices, w = Math.hypot(v[1].x - v[0].x, v[1].y - v[0].y), h = Math.hypot(v[2].x - v[1].x, v[2].y - v[1].y), pp = pl(b.owner);
      texBlock(ctx, b.position.x, b.position.y, b.angle, w, h, IMG(`plat/${BL[pp?.color] || 'block_planks'}.png`), pp?.emoji);
    }
    if (gd.state === 'aim' && H.phase === 'tw-go') {
      const x = T.craneX(), y = T.top() - 150, n = gd.next, pp = pl(T.cur());
      ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y - 420); ctx.lineTo(x, y - n.h / 2); ctx.stroke();
      ctx.setLineDash([10, 10]); ctx.strokeStyle = '#1a103366'; ctx.beginPath(); ctx.moveTo(x, y + n.h / 2); ctx.lineTo(x, T.top()); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = .9; texBlock(ctx, x, y, 0, n.w, n.h, IMG(`plat/${BL[pp?.color] || 'block_planks'}.png`), pp?.emoji); ctx.globalAlpha = 1;
    }
    ctx.restore();
    pill2(ctx, 110, 34, `Bloques: ${gd.drops}/${gd.max}`, '#7c3aed', 18);
    if (H.phase === 'tw-go' && gd.state === 'aim') pill2(ctx, 500, 34, `Turno: ${pl(T.cur())?.emoji || ''} ${pl(T.cur())?.name || ''}`, pl(T.cur())?.color || '#888', 22);
    if (gd.culprit) pill2(ctx, 500, 300, `💥 ¡${pl(gd.culprit)?.name || ''} tumbó la torre!`, '#ff3d8b', 38);
  };
})();
