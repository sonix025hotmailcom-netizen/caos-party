/* ---------- 🪙 Lluvia de Monedas con sprites de Kenney ---------- */
(() => {
  const C = GAMES.coins, oDraw = C.draw, oStart = C.start;
  const files = ['plat/background_color_hills.png', 'plat/background_clouds.png', 'plat/terrain_grass_block_top.png', 'plat/coin_gold.png', 'plat/coin_gold_side.png', 'plat/gem_blue.png', 'plat/gem_red.png', 'plat/gem_green.png', 'plat/gem_yellow.png', 'plat/bomb.png', 'plat/bomb_active.png', ...ALIEN_FILES];
  C.start = function () { preload(files); return oStart.call(this); };
  C.draw = function (ctx) {
    if (!files.slice(0, 5).every(f => imgOk(IMG(f)))) return oDraw.call(this, ctx);
    const gd = H.gd, t = performance.now() / 1000;
    ctx.fillStyle = '#d8f1ff'; ctx.fillRect(0, 0, 1000, 600);
    tileX(ctx, IMG('plat/background_clouds.png'), -40, 600, 10, t, .95);
    tileX(ctx, IMG('plat/background_color_hills.png'), 0, 600, 4, t);
    for (let x = 0; x < 1000; x += 64) ctx.drawImage(IMG('plat/terrain_grass_block_top.png'), x, 548, 64, 64);
    const gems = ['gem_blue', 'gem_red', 'gem_green', 'gem_yellow'];
    for (const it of gd.items) {
      let im, s = 96;
      if (it.type === 'coin') im = IMG(Math.abs(Math.cos(it.rot)) > .45 ? 'plat/coin_gold.png' : 'plat/coin_gold_side.png');
      else if (it.type === 'gem') { im = IMG(`plat/${gems[Math.floor(it.x) % 4]}.png`); s = 104; ctx.save(); ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; }
      else { im = IMG(Math.sin(t * 20 + it.x) > 0 ? 'plat/bomb_active.png' : 'plat/bomb.png'); s = 74; }
      if (imgOk(im)) ctx.drawImage(im, it.x - s / 2, it.y - s / 2, s, s);
      if (it.type === 'gem') ctx.restore();
    }
    const ord = gd.ids.slice().sort((a, b) => gd.ps[a].x - gd.ps[b].x);
    ord.forEach((id, k) => {
      const p = gd.ps[id], pp = pl(id), moving = Math.abs(inp(id).x) > .1 && p.stun <= 0;
      const pose = p.stun > 0 ? 'hit' : moving ? (Math.floor(t * 10) % 2 ? 'walk_a' : 'walk_b') : 'idle', im = alienImg(id, pose);
      ctx.fillStyle = (pp?.color || '#888') + 'aa'; ctx.beginPath(); ctx.ellipse(p.x, 556, 34, 9, 0, 0, 6.283); ctx.fill();
      ctx.save(); ctx.translate(p.x, 556); if (p.face < 0) ctx.scale(-1, 1);
      if (imgOk(im)) ctx.drawImage(im, -56, -112, 112, 112); else emo(ctx, pp?.emoji || '?', 0, -40, 50);
      ctx.restore();
      if (p.stun > 0) for (let s = 0; s < 3; s++) { const a = t * 6 + s * 2.1; emo(ctx, '⭐', p.x + Math.cos(a) * 30, 450 + Math.sin(a) * 8, 18); }
      pill2(ctx, p.x, 428 - (k % 2) * 34, `${pp?.emoji || ''} ${pp?.name || ''}  🪙 ${p.coins}`, pp?.color || '#888');
    });
    const rank = gd.ids.slice().sort((a, b) => gd.ps[b].coins - gd.ps[a].coins);
    hudChips(ctx, rank.map((id, i) => ({ color: pl(id)?.color || '#888', txt: `${i === 0 && gd.ps[id].coins > 0 ? '👑 ' : ''}${pl(id)?.emoji || ''} ${gd.ps[id].coins}` })));
  };
})();
