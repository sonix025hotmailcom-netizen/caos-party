Object.assign(GAMES, {
  /* 🌀 LABERINTO LOCO */
  maze: {
    name: 'Laberinto Loco', emoji: '🌀', color: '#14b8a6',
    desc: 'Todos arrancan en la esquina del laberinto. Muévanse con el joystick y lleguen primero al 🏆. ¡Hay atajos escondidos!',
    W: 20, Hh: 12, CS: 48, OX: 20, OY: 12,
    start() {
      const W = this.W, Hh = this.Hh, g = new Array(W * Hh).fill(15), seen = new Array(W * Hh).fill(false), st = [0];
      const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
      seen[0] = true;
      while (st.length) {
        const c = st[st.length - 1], x = c % W, y = (c / W) | 0;
        const o = D.filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < W && ny < Hh && !seen[ny * W + nx]; });
        if (!o.length) { st.pop(); continue; }
        const [dx, dy, b, ob] = o[rand(o.length)], n = (y + dy) * W + x + dx;
        g[c] &= ~b; g[n] &= ~ob; seen[n] = true; st.push(n);
      }
      for (let k = 0; k < W * Hh * .07; k++) { const x = rand(W - 1), y = rand(Hh), c = y * W + x; g[c] &= ~2; g[c + 1] &= ~8; }
      const goal = W * Hh - 1, dist = new Array(W * Hh).fill(1e9), q = [goal]; dist[goal] = 0;
      while (q.length) { const c = q.shift(), x = c % W, y = (c / W) | 0; for (const [dx, dy, b] of D) { if (g[c] & b) continue; const n = (y + dy) * W + x + dx; if (dist[n] > dist[c] + 1) { dist[n] = dist[c] + 1; q.push(n); } } }
      const ids = onlineIds(), ps = {};
      ids.forEach((id, i) => ps[id] = { c: 0, px: 0, py: 0, cool: 0, k: i });
      H.inp = {}; H.gd = { ids, g, dist, goal, ps, fin: [], sid: rid(), t: 0 };
      setPhase('mz-ready', 3500, () => { SFX.go(); GAMES.maze.go(); }, 0, false);
      rtLoop(null, GAMES.maze.draw);
    },
    go() { setPhase('mz-go', 75000, () => GAMES.maze.end()); rtLoop(dt => GAMES.maze.step(dt), GAMES.maze.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const f = H.gd.fin.indexOf(p.id);
      if (f >= 0) return { screen: 'msg', big: medal(f), title: '¡SALISTE DEL LABERINTO!', text: 'Mirá la tele 📺' };
      if (H.phase === 'mz-ready' || H.phase === 'mz-go') return joyView(p, '🕹️ Mové tu ficha por el laberinto', '');
      return watch();
    },
    isDone(id) { return H.gd.fin && H.gd.fin.includes(id); },
    onAct(p, m) { if (H.phase === 'mz-ready' || H.phase === 'mz-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, W = this.W; gd.t += dt;
      for (const id of gd.ids) {
        const p = gd.ps[id];
        const tx = p.c % W, ty = (p.c / W) | 0;
        p.px += (tx - p.px) * Math.min(1, dt * 18); p.py += (ty - p.py) * Math.min(1, dt * 18);
        if (gd.fin.includes(id)) continue;
        p.cool -= dt; if (p.cool > 0) continue;
        const i = inp(id); let dx = 0, dy = 0;
        if (Math.max(Math.abs(i.x), Math.abs(i.y)) < .45) continue;
        if (Math.abs(i.x) > Math.abs(i.y)) dx = Math.sign(i.x); else dy = Math.sign(i.y);
        const bit = dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1;
        if (gd.g[p.c] & bit) { const alt = Math.abs(i.x) > Math.abs(i.y) ? (Math.abs(i.y) > .35 ? [0, Math.sign(i.y)] : null) : (Math.abs(i.x) > .35 ? [Math.sign(i.x), 0] : null); if (!alt) continue; [dx, dy] = alt; const b2 = dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1; if (gd.g[p.c] & b2) continue; }
        p.c += dy * W + dx; p.cool = .11;
        if (p.c === gd.goal) {
          gd.fin.push(id); SFX.win(); if (gd.fin.length === 1) confetti(70); sync(); updateStrip();
          if (onlineIn(gd.ids).every(x => gd.fin.includes(x))) { const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.maze.end(); }, 1200); }
        }
      }
    },
    draw(ctx) {
      const gd = H.gd, M = GAMES.maze, W = M.W, CS = M.CS, OX = M.OX, OY = M.OY;
      ctx.fillStyle = '#0f0a24'; ctx.fillRect(0, 0, 1000, 600);
      ctx.fillStyle = '#facc1533'; const gx = gd.goal % W, gy = (gd.goal / W) | 0; ctx.fillRect(OX + gx * CS, OY + gy * CS, CS, CS);
      emo(ctx, '🏆', OX + gx * CS + CS / 2, OY + gy * CS + CS / 2 + 2, 34);
      ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath();
      for (let c = 0; c < gd.g.length; c++) {
        const x = OX + (c % W) * CS, y = OY + ((c / W) | 0) * CS, v = gd.g[c];
        if (v & 1) { ctx.moveTo(x, y); ctx.lineTo(x + CS, y); }
        if (v & 8) { ctx.moveTo(x, y); ctx.lineTo(x, y + CS); }
        if ((c % W) === W - 1 && (v & 2)) { ctx.moveTo(x + CS, y); ctx.lineTo(x + CS, y + CS); }
        if (((c / W) | 0) === M.Hh - 1 && (v & 4)) { ctx.moveTo(x, y + CS); ctx.lineTo(x + CS, y + CS); }
      }
      ctx.stroke();
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id), o = [[0, 0], [-9, -9], [9, 9], [-9, 9], [9, -9], [0, -11], [0, 11], [-11, 0]][p.k % 8];
        const x = OX + p.px * CS + CS / 2 + o[0], y = OY + p.py * CS + CS / 2 + o[1];
        ctx.beginPath(); ctx.arc(x, y, 17, 0, 7); ctx.fillStyle = pp?.color || '#888'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
        emo(ctx, pp?.emoji || '?', x, y + 1, 20);
      }
    },
    end() {
      if (H.phase !== 'mz-go') return;
      const gd = H.gd, sc = id => gd.fin.includes(id) ? 10000 - gd.fin.indexOf(id) : -gd.dist[gd.ps[id].c];
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.fin.includes(id) ? '🏆 Salió' : `a ${gd.dist[gd.ps[id].c]} pasos`, gain: g[id] || 0 }));
      setPhase('mz-res', 5500, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      if (ph === 'mz-ready') return canvasHTML(true, '🌀 ¡Encuentren la salida!');
      if (ph === 'mz-go') return canvasHTML(false);
      return `<h1 class="title-pop">🌀 Los exploradores</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
