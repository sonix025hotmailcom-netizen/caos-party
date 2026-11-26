/* ---------- 🌀 LABERINTO: siempre distinto (3 algoritmos, tamaños, salida y colores al azar) ---------- */
Object.assign(GAMES.maze, {
  desc: 'Cada laberinto es NUEVO: cambia el tamaño, la forma, la salida y los colores 🎲. Muévanse con el joystick y lleguen primero al 🏆. ¡Hay atajos escondidos!',
  start() {
    const [W, Hh] = pickR([[20, 12], [16, 10], [24, 14], [18, 11], [22, 13], [14, 9]]);
    const CS = Math.floor(Math.min(960 / W, 570 / Hh)), OX = Math.floor((1000 - W * CS) / 2), OY = Math.floor((600 - Hh * CS) / 2);
    const g = new Array(W * Hh).fill(15), D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < Hh;
    const algo = pickR(['dfs', 'prim', 'tree']), s0 = rand(W * Hh);
    if (algo === 'prim') {
      const inM = new Array(W * Hh).fill(false), fr = [];
      const addF = c => { const x = c % W, y = (c / W) | 0; for (const [dx, dy, b, ob] of D) if (inb(x + dx, y + dy) && !inM[(y + dy) * W + x + dx]) fr.push([c, (y + dy) * W + x + dx, b, ob]); };
      inM[s0] = true; addF(s0);
      while (fr.length) { const [c, n, b, ob] = fr.splice(rand(fr.length), 1)[0]; if (inM[n]) continue; g[c] &= ~b; g[n] &= ~ob; inM[n] = true; addF(n); }
    } else {
      const seen = new Array(W * Hh).fill(false), st = [s0], mix = algo === 'tree' ? .45 : 0; seen[s0] = true;
      while (st.length) {
        const k = Math.random() < mix ? rand(st.length) : st.length - 1, c = st[k], x = c % W, y = (c / W) | 0;
        const o = D.filter(([dx, dy]) => inb(x + dx, y + dy) && !seen[(y + dy) * W + x + dx]);
        if (!o.length) { st.splice(k, 1); continue; }
        const [dx, dy, b, ob] = pickR(o), n = (y + dy) * W + x + dx; g[c] &= ~b; g[n] &= ~ob; seen[n] = true; st.push(n);
      }
    }
    const loops = W * Hh * (.02 + Math.random() * .08);
    for (let k = 0; k < loops; k++) { if (Math.random() < .5) { const x = rand(W - 1), y = rand(Hh), c = y * W + x; g[c] &= ~2; g[c + 1] &= ~8; } else { const x = rand(W), y = rand(Hh - 1), c = y * W + x; g[c] &= ~4; g[c + W] &= ~1; } }
    const bfs = src => { const d = new Array(W * Hh).fill(1e9), q = [src]; d[src] = 0; for (let qi = 0; qi < q.length; qi++) { const c = q[qi], x = c % W, y = (c / W) | 0; for (const [dx, dy, b] of D) { if (g[c] & b) continue; const n = (y + dy) * W + x + dx; if (d[n] > d[c] + 1) { d[n] = d[c] + 1; q.push(n); } } } return d; };
    const start = pickR([0, W - 1, (Hh - 1) * W, W * Hh - 1]), ds = bfs(start);
    let goal = 0; ds.forEach((d, i) => { if (d > ds[goal]) goal = i; });
    const dist = bfs(goal);
    const pal = pickR([{ bg: '#0f0a24', wall: '#a78bfa' }, { bg: '#03140f', wall: '#34d399' }, { bg: '#1a0b0b', wall: '#fb923c' }, { bg: '#081226', wall: '#38bdf8' }, { bg: '#1b0f24', wall: '#f472b6' }, { bg: '#151515', wall: '#facc15' }]);
    const ids = onlineIds(), ps = {};
    ids.forEach((id, i) => ps[id] = { c: start, px: start % W, py: (start / W) | 0, cool: 0, k: i });
    H.inp = {}; H.gd = { ids, g, dist, goal, ps, fin: [], sid: rid(), t: 0, W, Hh, CS, OX, OY, pal, algo };
    setPhase('mz-ready', 3500, () => { SFX.go(); GAMES.maze.go(); }, 0, false);
    rtLoop(null, GAMES.maze.draw);
  },
  step(dt) {
    const gd = H.gd, W = gd.W; gd.t += dt;
    for (const id of gd.ids) {
      const p = gd.ps[id], tx = p.c % W, ty = (p.c / W) | 0;
      p.px += (tx - p.px) * Math.min(1, dt * 18); p.py += (ty - p.py) * Math.min(1, dt * 18);
      if (gd.fin.includes(id)) continue;
      p.cool -= dt; if (p.cool > 0) continue;
      const i = inp(id); if (Math.max(Math.abs(i.x), Math.abs(i.y)) < .4) continue;
      const tryDir = (dx, dy) => { const b = dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1; if (gd.g[p.c] & b) return false; p.c += dy * W + dx; return true; };
      const hx = Math.abs(i.x) >= Math.abs(i.y);
      const moved = hx ? (tryDir(Math.sign(i.x), 0) || (Math.abs(i.y) > .3 && tryDir(0, Math.sign(i.y)))) : (tryDir(0, Math.sign(i.y)) || (Math.abs(i.x) > .3 && tryDir(Math.sign(i.x), 0)));
      if (!moved) continue;
      p.cool = .1;
      if (p.c === gd.goal) {
        gd.fin.push(id); SFX.win(); if (gd.fin.length === 1) confetti(70); sync(); updateStrip();
        if (onlineIn(gd.ids).every(x => gd.fin.includes(x))) { const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.maze.end(); }, 1200); }
      }
    }
  },
  draw(ctx) {
    const gd = H.gd, { W, CS, OX, OY, pal } = gd;
    ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, 1000, 600);
    const gx = gd.goal % W, gy = (gd.goal / W) | 0;
    ctx.fillStyle = '#facc1544'; ctx.fillRect(OX + gx * CS, OY + gy * CS, CS, CS);
    emo(ctx, '🏆', OX + gx * CS + CS / 2, OY + gy * CS + CS / 2 + 2, CS * .7);
    ctx.strokeStyle = pal.wall; ctx.lineWidth = Math.max(3, CS / 8); ctx.lineCap = 'round'; ctx.beginPath();
    for (let c = 0; c < gd.g.length; c++) {
      const x = OX + (c % W) * CS, y = OY + ((c / W) | 0) * CS, v = gd.g[c];
      if (v & 1) { ctx.moveTo(x, y); ctx.lineTo(x + CS, y); }
      if (v & 8) { ctx.moveTo(x, y); ctx.lineTo(x, y + CS); }
      if ((c % W) === W - 1 && (v & 2)) { ctx.moveTo(x + CS, y); ctx.lineTo(x + CS, y + CS); }
      if (((c / W) | 0) === gd.Hh - 1 && (v & 4)) { ctx.moveTo(x, y + CS); ctx.lineTo(x + CS, y + CS); }
    }
    ctx.stroke();
    for (const id of gd.ids) {
      const p = gd.ps[id], pp = pl(id), o = [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1], [0, -1], [0, 1], [-1, 0]][p.k % 8];
      const r = CS * .34, x = OX + p.px * CS + CS / 2 + o[0] * CS * .18, y = OY + p.py * CS + CS / 2 + o[1] * CS * .18;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = pp?.color || '#888'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
      emo(ctx, pp?.emoji || '?', x, y + 1, r * 1.15);
    }
  },
});
