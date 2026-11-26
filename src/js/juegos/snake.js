Object.assign(GAMES, {
  /* 🐍 SERPIENTES DE LUZ */
  snake: {
    name: 'Serpientes de Luz', emoji: '🐍', color: '#10b981', GW: 100, GH: 60,
    desc: 'Cada uno maneja una serpiente de luz que deja un rastro ✨. Si chocás contra una pared o contra un rastro, perdés. ¡El último vivo gana!',
    start() {
      const ids = onlineIds(), GW = this.GW, GH = this.GH, ps = {};
      const spots = [[10, 10, 1, 0], [89, 49, 0, -1], [89, 10, -1, 0], [10, 49, 0, -1], [50, 6, 0, 1], [50, 53, 0, -1], [6, 30, 1, 0], [93, 30, -1, 0]];
      ids.forEach((id, i) => { const [x, y, dx, dy] = spots[i % 8]; ps[id] = { x, y, dx, dy, alive: true, k: i }; });
      const tc = document.createElement('canvas'); tc.width = 1000; tc.height = 600;
      H.inp = {}; H.gd = { ids, ps, grid: new Uint8Array(GW * GH), out: [], acc: 0, tc, sid: rid(), t: 0 };
      ids.forEach(id => this.mark(id));
      setPhase('sn-ready', 3500, () => { SFX.go(); GAMES.snake.go(); }, 0, false);
      rtLoop(null, GAMES.snake.draw);
    },
    mark(id) { const gd = H.gd, p = gd.ps[id]; gd.grid[p.y * this.GW + p.x] = p.k + 1; const c = gd.tc.getContext('2d'); c.fillStyle = pl(id)?.color || '#888'; c.fillRect(p.x * 10, p.y * 10, 10, 10); },
    go() { setPhase('sn-go', 75000, () => GAMES.snake.end()); rtLoop(dt => GAMES.snake.step(dt), GAMES.snake.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps[p.id];
      if (H.phase === 'sn-ready' || H.phase === 'sn-go') return s.alive ? joyView(p, '🕹️ Girá tu serpiente · ¡No choqués!', '') : { screen: 'msg', big: '💥', title: '¡Chocaste!', text: 'Mirá quién sobrevive 👀' };
      return watch();
    },
    isDone(id) { return H.phase === 'sn-go' && !H.gd.ps[id].alive; },
    onAct(p, m) { if (H.phase === 'sn-ready' || H.phase === 'sn-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, GW = this.GW, GH = this.GH; gd.acc += dt; gd.t += dt;
      const spd = Math.max(.045, .08 - gd.t * .0004);
      while (gd.acc >= spd) {
        gd.acc -= spd;
        const alive = gd.ids.filter(id => gd.ps[id].alive), next = {};
        for (const id of alive) {
          const p = gd.ps[id], i = inp(id);
          if (Math.max(Math.abs(i.x), Math.abs(i.y)) > .4) {
            let dx = 0, dy = 0; if (Math.abs(i.x) > Math.abs(i.y)) dx = Math.sign(i.x); else dy = Math.sign(i.y);
            if (!(dx === -p.dx && dy === -p.dy)) { p.dx = dx; p.dy = dy; }
          }
          next[id] = [p.x + p.dx, p.y + p.dy];
        }
        const dead = [];
        for (const id of alive) {
          const [x, y] = next[id];
          if (x < 0 || y < 0 || x >= GW || y >= GH || gd.grid[y * GW + x]) dead.push(id);
          else if (alive.some(o => o !== id && next[o][0] === x && next[o][1] === y)) dead.push(id);
        }
        for (const id of alive) { if (dead.includes(id)) continue; const p = gd.ps[id]; [p.x, p.y] = next[id]; this.mark(id); }
        if (dead.length) {
          dead.forEach(id => { gd.ps[id].alive = false; gd.out.push(id); });
          SFX.bad(); shakeScreen(); sync(); updateStrip();
          const left = gd.ids.filter(id => gd.ps[id].alive).length;
          if ((gd.ids.length > 1 && left <= 1) || left === 0) { const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.snake.end(); }, 1200); gd.acc = -99; return; }
        }
      }
    },
    draw(ctx) {
      const gd = H.gd;
      ctx.fillStyle = '#050816'; ctx.fillRect(0, 0, 1000, 600);
      ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x <= 1000; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, 600); } for (let y = 0; y <= 600; y += 50) { ctx.moveTo(0, y); ctx.lineTo(1000, y); } ctx.stroke();
      ctx.drawImage(gd.tc, 0, 0);
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id), x = p.x * 10 + 5, y = p.y * 10 + 5;
        if (p.alive) { ctx.shadowColor = pp?.color || '#fff'; ctx.shadowBlur = 18; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); ctx.shadowBlur = 0; emo(ctx, pp?.emoji || '?', x, y - 22, 26); }
        else emo(ctx, '💥', x, y, 30);
      }
      ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff44'; ctx.strokeRect(3, 3, 994, 594);
    },
    end() {
      if (H.phase !== 'sn-go') return;
      const gd = H.gd, sc = id => gd.ps[id].alive ? 999 : gd.out.indexOf(id);
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.ps[id].alive ? '🐍 Sobrevivió' : '💥 Chocó', gain: g[id] || 0 }));
      setPhase('sn-res', 5500, () => finishGame(g), 0, false); confetti(80); SFX.win();
    },
    render(ph) {
      if (ph === 'sn-ready') return canvasHTML(true, '🐍 ¡No choquen!');
      if (ph === 'sn-go') return canvasHTML(false);
      return `<h1 class="title-pop">🐍 Los sobrevivientes</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
