/* ================== v37 — SERPIENTES DE LUZ con neón de verdad ================== */
(() => {
  const S = GAMES.snake;
  const glowDot = (() => { const cache = {}; return col => { if (cache[col]) return cache[col]; const c = document.createElement('canvas'); c.width = c.height = 40; const g = c.getContext('2d'), gr = g.createRadialGradient(20, 20, 0, 20, 20, 20); gr.addColorStop(0, col + 'aa'); gr.addColorStop(.45, col + '44'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.fillRect(0, 0, 40, 40); return cache[col] = c; }; })();
  const bgCanvas = () => { const c = document.createElement('canvas'); c.width = 1000; c.height = 600; const g = c.getContext('2d');
    const gr = g.createRadialGradient(500, 300, 50, 500, 300, 620); gr.addColorStop(0, '#0b1240'); gr.addColorStop(1, '#02030c'); g.fillStyle = gr; g.fillRect(0, 0, 1000, 600);
    for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .5})`; g.fillRect(Math.random() * 1000, Math.random() * 600, 1.5, 1.5); }
    g.strokeStyle = '#38bdf81a'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= 1000; x += 10) { g.moveTo(x + .5, 0); g.lineTo(x + .5, 600); } for (let y = 0; y <= 600; y += 10) { g.moveTo(0, y + .5); g.lineTo(1000, y + .5); } g.stroke();
    g.strokeStyle = '#38bdf840'; g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= 1000; x += 50) { g.moveTo(x, 0); g.lineTo(x, 600); } for (let y = 0; y <= 600; y += 50) { g.moveTo(0, y); g.lineTo(1000, y); } g.stroke();
    const vg = g.createRadialGradient(500, 300, 260, 500, 300, 640); vg.addColorStop(0, '#00000000'); vg.addColorStop(1, '#000000aa'); g.fillStyle = vg; g.fillRect(0, 0, 1000, 600); return c; };
  S.mark = function (id) {
    const gd = H.gd, p = gd.ps[id], col = pl(id)?.color || '#888888'; gd.grid[p.y * this.GW + p.x] = p.k + 1;
    if (!gd.tg) { gd.tg = document.createElement('canvas'); gd.tg.width = 1000; gd.tg.height = 600; }
    const c = gd.tc.getContext('2d'), g = gd.tg.getContext('2d'), x = p.x * 10, y = p.y * 10;
    g.drawImage(glowDot(col.length === 7 ? col : '#888888'), x - 15, y - 15);
    c.fillStyle = col; c.fillRect(x, y, 10, 10); c.fillStyle = '#ffffffb0'; c.fillRect(p.dx > 0 ? x - 7 : x + 3, p.dy > 0 ? y - 7 : y + 3, p.dx ? 14 : 4, p.dy ? 14 : 4);
  };
  S.draw = function (ctx) {
    const gd = H.gd, t = performance.now() / 1000;
    if (!gd.bgc) gd.bgc = bgCanvas(); ctx.drawImage(gd.bgc, 0, 0);
    if (gd.tg) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(gd.tg, 0, 0); ctx.globalCompositeOperation = 'source-over'; }
    ctx.drawImage(gd.tc, 0, 0);
    for (const id of gd.ids) {
      const p = gd.ps[id], pp = pl(id), col = pp?.color || '#ffffff', x = p.x * 10 + 5, y = p.y * 10 + 5;
      if (p.alive) {
        const pu = 1 + Math.sin(t * 10 + p.k) * .15; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(glowDot(col.length === 7 ? col : '#888888'), x - 34 * pu, y - 34 * pu, 68 * pu, 68 * pu); ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#ffffffcc'; ctx.beginPath(); ctx.arc(x + p.dx * 10, y + p.dy * 10, 2.5, 0, 7); ctx.fill();
        pill2(ctx, x, y - 26, `${pp?.emoji || ''} ${pp?.name || ''}`, col, 13);
      } else emo(ctx, '💥', x, y, 30);
    }
    const pul = .35 + Math.sin(t * 3) * .15; ctx.lineWidth = 5; ctx.strokeStyle = `rgba(56,189,248,${pul + .3})`; ctx.strokeRect(2.5, 2.5, 995, 595);
    const alive = gd.ids.filter(id => gd.ps[id].alive).length; pill2(ctx, 500, 22, `⚡ Quedan ${alive}`, '#0ea5e9', 16);
  };
})();
