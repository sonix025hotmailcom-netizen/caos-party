/* --- laberinto: a veces toca el tema "calabozo dibujado a mano" --- */
(() => {
  const DG = n => IMG('dungeon/' + n + '.png');
  const os = GAMES.maze.start;
  GAMES.maze.start = function () {
    const r = os.apply(this, arguments), gd = H.gd;
    if (gd && gd.g && Math.random() < .45) {
      ['tile', 'tiles', 'tiles_cracked', 'chest', 'barrels', 'campfire', 'plants', 'crate_small', 'puddle', 'stairs_down'].forEach(DG);
      gd.pal = { bg: '#efe4cc', wall: '#2b1d12', dungeon: true };
      const bits = v => (v & 1) + (v >> 1 & 1) + (v >> 2 & 1) + (v >> 3 & 1);
      const starts = new Set(gd.ids.map(id => gd.ps[id] ? gd.ps[id].py * gd.W + gd.ps[id].px : -1));
      gd.floor = gd.g.map(() => Math.random() < .12 ? 'tiles_cracked' : Math.random() < .5 ? 'tiles' : 'tile');
      gd.deco = gd.g.map((v, c) => c !== gd.goal && !starts.has(c) && bits(v) === 3 && Math.random() < .55 ? pickR(['barrels', 'campfire', 'plants', 'crate_small', 'puddle']) : null);
    }
    return r;
  };
  const od = GAMES.maze.draw;
  GAMES.maze.draw = function (ctx) {
    const gd = H.gd; if (!gd.pal || !gd.pal.dungeon) return od.call(this, ctx);
    const { W, CS, OX, OY } = gd;
    ctx.fillStyle = '#d6c7a5'; ctx.fillRect(0, 0, 1000, 600);
    ctx.fillStyle = gd.pal.bg; ctx.fillRect(OX - 6, OY - 6, W * CS + 12, gd.Hh * CS + 12);
    for (let c = 0; c < gd.g.length; c++) {
      const x = OX + (c % W) * CS, y = OY + ((c / W) | 0) * CS, im = DG(gd.floor[c]);
      if (imgOk(im)) { ctx.globalAlpha = .55; ctx.drawImage(im, x, y, CS, CS); ctx.globalAlpha = 1; }
      const d = gd.deco[c]; if (d) { const di = DG(d); if (imgOk(di)) ctx.drawImage(di, x + CS * .1, y + CS * .1, CS * .8, CS * .8); }
    }
    const gx = gd.goal % W, gy = (gd.goal / W) | 0, ch = DG('chest');
    ctx.fillStyle = '#facc1566'; ctx.fillRect(OX + gx * CS, OY + gy * CS, CS, CS);
    if (imgOk(ch)) { const p = 1 + Math.sin(performance.now() / 250) * .06; ctx.drawImage(ch, OX + gx * CS + CS * (1 - .9 * p) / 2, OY + gy * CS + CS * (1 - .9 * p) / 2, CS * .9 * p, CS * .9 * p); } else emo(ctx, '🏆', OX + gx * CS + CS / 2, OY + gy * CS + CS / 2 + 2, CS * .7);
    /* paredes con trazo "dibujado a mano": dos pasadas levemente desplazadas */
    for (const [dx, dy, a, lw] of [[1.5, 1, .35, 1.25], [0, 0, 1, 1]]) {
      ctx.globalAlpha = a; ctx.strokeStyle = gd.pal.wall; ctx.lineWidth = Math.max(4, CS / 6) * lw; ctx.lineCap = 'round'; ctx.beginPath();
      for (let c = 0; c < gd.g.length; c++) {
        const x = OX + (c % W) * CS + dx, y = OY + ((c / W) | 0) * CS + dy, v = gd.g[c], j = ((c * 7) % 5 - 2) * .6;
        if (v & 1) { ctx.moveTo(x, y + j); ctx.lineTo(x + CS, y - j); }
        if (v & 8) { ctx.moveTo(x + j, y); ctx.lineTo(x - j, y + CS); }
        if ((c % W) === W - 1 && (v & 2)) { ctx.moveTo(x + CS, y); ctx.lineTo(x + CS, y + CS); }
        if (((c / W) | 0) === gd.Hh - 1 && (v & 4)) { ctx.moveTo(x, y + CS); ctx.lineTo(x + CS, y + CS); }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (const id of gd.ids) {
      const p = gd.ps[id], pp = pl(id), o = [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1], [0, -1], [0, 1], [-1, 0]][p.k % 8];
      const r = CS * .34, x = OX + p.px * CS + CS / 2 + o[0] * CS * .18, y = OY + p.py * CS + CS / 2 + o[1] * CS * .18;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = pp?.color || '#888'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2b1d12'; ctx.stroke();
      emo(ctx, pp?.emoji || '?', x, y + 1, r * 1.15);
    }
  };
})();
