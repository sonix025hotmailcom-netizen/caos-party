Object.assign(GAMES, {
  /* 🖌️ PINTA EL PISO */
  paint: {
    name: 'Pinta el Piso', emoji: '🖌️', color: '#ec4899',
    desc: 'Corran por el piso con el joystick y píntenlo de su color. Botón = 💥 BOMBA de pintura. ¡Gana quien pinte más!',
    start() {
      const ids = onlineIds(), ps = {};
      spreadStart(ids, 500, 300, 220).forEach(([id, x, y]) => ps[id] = { x, y, cd: 0, lb: 0, n: 0 });
      H.inp = {}; H.gd = { ids, ps, cols: 25, rows: 15, grid: new Array(375).fill(null), t: 0, blasts: [], sid: rid() };
      setPhase('paint-ready', 3500, () => { SFX.go(); GAMES.paint.go(); }, 0, false);
      rtLoop(null, GAMES.paint.draw);
    },
    go() { setPhase('paint-go', 35000, () => GAMES.paint.end()); rtLoop(dt => GAMES.paint.step(dt), GAMES.paint.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'paint-ready' || H.phase === 'paint-go') return joyView(p, '🕹️ Arrastrá para correr · Botón = BOMBA', '💥 BOMBA', 4);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'paint-ready' || H.phase === 'paint-go') joyAct(p, m); },
    paintCell(id, cx, cy) {
      const gd = H.gd; if (cx < 0 || cy < 0 || cx >= gd.cols || cy >= gd.rows) return;
      const k = cy * gd.cols + cx, old = gd.grid[k];
      if (old === id) return;
      if (old && gd.ps[old]) gd.ps[old].n--;
      gd.grid[k] = id; gd.ps[id].n++;
    },
    step(dt) {
      const gd = H.gd; gd.t += dt;
      for (const id of gd.ids) {
        const p = gd.ps[id], i = inp(id);
        p.x = Math.max(20, Math.min(980, p.x + i.x * 330 * dt)); p.y = Math.max(20, Math.min(580, p.y + i.y * 330 * dt));
        p.cd -= dt;
        this.paintCell(id, Math.floor(p.x / 40), Math.floor(p.y / 40));
        if (i.b > p.lb) {
          p.lb = i.b;
          if (p.cd <= 0) {
            p.cd = 3.9; const cx = Math.floor(p.x / 40), cy = Math.floor(p.y / 40);
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) this.paintCell(id, cx + dx, cy + dy);
            gd.blasts.push({ x: p.x, y: p.y, t: 0, c: pl(id)?.color }); beep(160, .25, 'sawtooth', .07); beep(90, .3, 'square', .05, .05);
          }
        }
      }
      gd.blasts.forEach(b => b.t += dt); gd.blasts = gd.blasts.filter(b => b.t < .5);
    },
    draw(ctx) {
      const gd = H.gd;
      ctx.fillStyle = '#1a1033'; ctx.fillRect(0, 0, 1000, 600);
      for (let k = 0; k < gd.grid.length; k++) {
        const x = (k % gd.cols) * 40, y = Math.floor(k / gd.cols) * 40, o = gd.grid[k];
        ctx.fillStyle = o ? (pl(o)?.color || '#888') : ((x / 40 + y / 40) % 2 ? '#241544' : '#2c1a52');
        ctx.fillRect(x + 1, y + 1, 38, 38);
      }
      for (const b of gd.blasts) { ctx.globalAlpha = 1 - b.t * 2; ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(b.x, b.y, 30 + b.t * 220, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id);
        ctx.beginPath(); ctx.arc(p.x, p.y, 24, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = pp?.color || '#888'; ctx.stroke();
        emo(ctx, pp?.emoji || '?', p.x, p.y + 2, 30); nameTag(ctx, pp?.name || '?', p.x, p.y - 36, 15);
      }
      const tot = gd.cols * gd.rows; let x = 0;
      for (const id of gd.ids) { const w = gd.ps[id].n / tot * 1000; ctx.fillStyle = pl(id)?.color || '#888'; ctx.fillRect(x, 0, w, 8); x += w; }
    },
    end() {
      if (H.phase !== 'paint-go') return;
      const gd = H.gd, tot = gd.cols * gd.rows, g = rankGains(gd.ids, id => gd.ps[id].n, true, id => gd.ps[id].n > 0);
      gd.rows2 = gd.ids.slice().sort((a, b) => gd.ps[b].n - gd.ps[a].n).map(id => ({ id, val: Math.round(gd.ps[id].n / tot * 100) + '% del piso', gain: g[id] || 0 }));
      setPhase('paint-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'paint-ready') return canvasHTML(true, '🖌️ ¡A pintar todo!');
      if (ph === 'paint-go') return canvasHTML(false);
      return `<h1 class="title-pop">🖌️ Los Picassos del piso</h1>${resultsList(H.gd.rows2)}`;
    }
  }
});
