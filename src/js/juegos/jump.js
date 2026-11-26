Object.assign(GAMES, {
  /* 🪢 SALTA LA CUERDA */
  jump: {
    name: 'Salta la Cuerda', emoji: '🪢', color: '#f97316',
    desc: 'Una cuerda gigante gira y cada vez va más rápido 😵. Toquen ¡SALTÁ! en el cel justo cuando la cuerda pase por los pies. ¡El último en pie gana!',
    start() {
      const ids = onlineIds(), ps = {}, n = ids.length;
      ids.forEach((id, i) => ps[id] = { x: n === 1 ? 500 : 200 + i * (600 / (n - 1)), airT: -9, alive: true, jumps: 0 });
      H.gd = { ids, ps, ph: .35, t: 0, period: 1.8, out: [], sid: rid() };
      setPhase('jp-ready', 3500, () => { SFX.go(); GAMES.jump.go(); }, 0, false);
      rtLoop(null, GAMES.jump.draw);
    },
    go() { setPhase('jp-go', 70000, () => GAMES.jump.end()); rtLoop(dt => GAMES.jump.step(dt), GAMES.jump.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const s = H.gd.ps[p.id];
      if (H.phase === 'jp-ready' || H.phase === 'jp-go') return s.alive ? { screen: 'jump', key: 'jp' + H.gd.sid } : { screen: 'msg', big: '🤕', title: '¡Te enredaste!', text: `Aguantaste ${s.jumps} saltos` };
      return watch();
    },
    isDone(id) { return H.phase === 'jp-go' && !H.gd.ps[id].alive; },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'jp-go' || m.a !== 'jump' || !inGame(p)) return;
      const s = gd.ps[p.id]; if (!s.alive || gd.t - s.airT < .6) return;
      s.airT = gd.t; beep(500, .06, 'triangle', .05);
    },
    step(dt) {
      const gd = H.gd; gd.t += dt;
      gd.period = Math.max(.62, 1.8 - gd.t * .028);
      const prev = gd.ph; gd.ph += dt / gd.period;
      if (Math.floor(prev) < Math.floor(gd.ph)) {
        const hit = [];
        for (const id of gd.ids) { const s = gd.ps[id]; if (!s.alive) continue; const a = gd.t - s.airT; if (a >= 0 && a <= .55) s.jumps++; else hit.push(id); }
        beep(240, .07, 'sine', .05);
        if (hit.length) { hit.forEach(id => { gd.ps[id].alive = false; gd.out.push(id); }); SFX.bad(); shakeScreen(); sync(); updateStrip(); }
        const left = gd.ids.filter(id => gd.ps[id].alive).length;
        if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.jump.end(); }, 1200); }
      }
    },
    draw(ctx) {
      const gd = H.gd, a = gd.ph * Math.PI * 2, ground = 520;
      const g = ctx.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#a5f3fc');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 600);
      ctx.fillStyle = '#16a34a'; ctx.fillRect(0, ground, 1000, 80);
      const ry = 290 - Math.cos(a) * 250, front = Math.sin(a) < 0;
      const rope = () => { ctx.strokeStyle = '#7c2d12'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(70, 300); ctx.quadraticCurveTo(500, ry * 2 - 300, 930, 300); ctx.stroke(); };
      if (!front) rope();
      for (const id of gd.ids) {
        const s = gd.ps[id], pp = pl(id), air = gd.t - s.airT;
        const up = s.alive && air >= 0 && air <= .55 ? Math.sin(air / .55 * Math.PI) * 110 : 0;
        ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(s.x, ground + 6, 30 - up / 8, 8, 0, 0, 7); ctx.fill();
        ctx.globalAlpha = s.alive ? 1 : .35; emo(ctx, s.alive ? (pp?.emoji || '?') : '🤕', s.x, ground - 34 - up, 60); ctx.globalAlpha = 1;
        nameTag(ctx, `${pp?.name || ''} · ${s.jumps}`, s.x, ground + 40, 15);
      }
      if (front) rope();
      emo(ctx, '🧍', 50, 330, 70); emo(ctx, '🧍', 950, 330, 70);
      nameTag(ctx, `Velocidad x${(1.8 / gd.period).toFixed(1)}`, 110, 30, 20);
    },
    end() {
      if (H.phase !== 'jp-go') return;
      const gd = H.gd, sc = id => (gd.ps[id].alive ? 1000 : gd.out.indexOf(id) * 10) + gd.ps[id].jumps / 1000;
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: `🪢 ${gd.ps[id].jumps} saltos`, gain: g[id] || 0 }));
      setPhase('jp-res', 5500, () => finishGame(g), 0, false); confetti(70); SFX.win();
    },
    render(ph) {
      if (ph === 'jp-ready') return canvasHTML(true, '🪢 ¡Salten cuando la cuerda pase por abajo!');
      if (ph === 'jp-go') return canvasHTML(false);
      return `<h1 class="title-pop">🪢 Los mejores saltadores</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
