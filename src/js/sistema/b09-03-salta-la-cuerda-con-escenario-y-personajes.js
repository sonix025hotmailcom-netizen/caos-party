/* ---------- 🪢 Salta la Cuerda con escenario y personajes ---------- */
(() => {
  const J = GAMES.jump, oDraw = J.draw, oStart = J.start;
  const files = ['plat/background_color_trees.png', 'plat/background_clouds.png', 'plat/terrain_grass_block_top.png', ...ALIEN_FILES];
  J.start = function () { preload(files); return oStart.call(this); };
  J.draw = function (ctx) {
    if (!files.slice(0, 3).every(f => imgOk(IMG(f)))) return oDraw.call(this, ctx);
    const gd = H.gd, a = gd.ph * Math.PI * 2, ground = 520, t = performance.now() / 1000;
    ctx.fillStyle = '#d8f1ff'; ctx.fillRect(0, 0, 1000, 600);
    tileX(ctx, IMG('plat/background_clouds.png'), -60, 560, 8, t, .9);
    tileX(ctx, IMG('plat/background_color_trees.png'), -40, 560, 0, t);
    ctx.fillStyle = '#e2845a'; ctx.fillRect(0, ground + 40, 1000, 80);
    for (let x = 0; x < 1000; x += 64) ctx.drawImage(IMG('plat/terrain_grass_block_top.png'), x, ground, 64, 64);
    const ry = 290 - Math.cos(a) * 250, low = ry > 420;
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, (ry - 300) / 700)})`; ctx.beginPath(); ctx.ellipse(500, ground + 4, 430, 10, 0, 0, 6.283); ctx.fill();
    const rope = () => { ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(90, 330); ctx.quadraticCurveTo(500, ry * 2 - 330, 910, 330); ctx.stroke(); ctx.strokeStyle = low ? '#ff3d8b' : '#f59e0b'; ctx.lineWidth = 8; ctx.stroke(); };
    if (!low) rope();
    for (const id of gd.ids) {
      const s = gd.ps[id], pp = pl(id), air = gd.t - s.airT;
      const up = s.alive && air >= 0 && air <= .62 ? Math.sin(air / .62 * Math.PI) * 130 : 0;
      ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(s.x, ground + 4, 30 - up / 8, 8, 0, 0, 6.283); ctx.fill();
      const im = alienImg(id, !s.alive ? 'hit' : up > 2 ? 'jump' : 'front');
      ctx.globalAlpha = s.alive ? 1 : .5;
      if (imgOk(im)) ctx.drawImage(im, s.x - 56, ground - 108 - up, 112, 112); else emo(ctx, pp?.emoji || '?', s.x, ground - 40 - up, 56);
      ctx.globalAlpha = 1;
      pill2(ctx, s.x, ground + 44, `${pp?.emoji || ''} ${pp?.name || ''} · ${s.jumps}`, pp?.color || '#888', 15);
    }
    if (low) rope();
    for (const [x, flip] of [[60, false], [940, true]]) { const im = IMG('plat/char_beige_front.png'); ctx.save(); ctx.translate(x, ground); if (flip) ctx.scale(-1, 1); if (imgOk(im)) ctx.drawImage(im, -56, -112, 112, 112); ctx.restore(); }
    pill2(ctx, 120, 34, `Velocidad x${(2.1 / gd.period).toFixed(1)}`, '#7c3aed', 18);
    if (H.phase === 'jp-go') { const tb = ((1.5 - (gd.ph % 1)) % 1) * gd.period; if (tb < .35) pill2(ctx, 500, 90, '¡SALTEN!', '#ff3d8b', 44); }
  };
})();
