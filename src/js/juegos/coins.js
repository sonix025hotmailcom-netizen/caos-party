Object.assign(GAMES, {
  /* 🪙 LLUVIA DE MONEDAS */
  coins: {
    name: 'Lluvia de Monedas', emoji: '🪙', color: '#eab308',
    desc: 'Muévanse con el joystick y agarren todas las monedas 🪙 y gemas 💎 que caen. ¡Cuidado con las bombas 💣 que te aturden y te roban monedas!',
    start() {
      const ids = onlineIds(), ps = {};
      ids.forEach((id, i) => ps[id] = { x: 100 + (800 / Math.max(1, ids.length - 1 || 1)) * i, stun: 0, coins: 0, face: 1 });
      if (ids.length === 1) ps[ids[0]].x = 500;
      H.inp = {}; H.gd = { ids, ps, items: [], fx: [], spawn: 0, t: 0, sid: rid() };
      setPhase('coin-ready', 3500, () => { SFX.go(); GAMES.coins.go(); }, 0, false);
      rtLoop(null, GAMES.coins.draw);
    },
    go() { setPhase('coin-go', 30000, () => GAMES.coins.end()); rtLoop(dt => GAMES.coins.step(dt), GAMES.coins.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'coin-ready' || H.phase === 'coin-go') return joyView(p, '🕹️ Mové a la izquierda y derecha', '');
      return watch();
    },
    onAct(p, m) { if (H.phase === 'coin-ready' || H.phase === 'coin-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd; gd.t += dt; gd.spawn -= dt;
      if (gd.spawn <= 0) {
        gd.spawn = Math.max(.12, .32 - gd.t * .006) * (6 / (4 + Math.min(gd.ids.length, 8)));
        const r = Math.random(), type = r < .06 ? 'gem' : r < .3 ? 'bomb' : 'coin';
        gd.items.push({ x: 40 + rand(920), y: -30, vy: 200 + rand(170) + gd.t * 6, type, rot: Math.random() * 6 });
      }
      for (const id of gd.ids) {
        const p = gd.ps[id];
        if (p.stun > 0) { p.stun -= dt; continue; }
        const i = inp(id); p.x = Math.max(30, Math.min(970, p.x + i.x * 560 * dt)); if (Math.abs(i.x) > .1) p.face = Math.sign(i.x);
      }
      for (const it of gd.items) {
        it.y += it.vy * dt; it.rot += dt * 4;
        if (it.dead || it.y < 440 || it.y > 580) continue;
        for (const id of gd.ids) {
          const p = gd.ps[id];
          if (Math.abs(p.x - it.x) < 46) {
            it.dead = true;
            if (it.type === 'coin') { p.coins += 1; SFX.pop(); gd.fx.push({ x: it.x, y: 470, t: 0, txt: '+1', c: '#facc15' }); }
            else if (it.type === 'gem') { p.coins += 5; beep(1300, .15, 'triangle', .08); beep(1700, .2, 'triangle', .08, .08); gd.fx.push({ x: it.x, y: 470, t: 0, txt: '+5 💎', c: '#22d3ee' }); }
            else { const lost = Math.min(3, p.coins); p.coins -= lost; p.stun = 1.6; SFX.bad(); shakeScreen(); gd.fx.push({ x: it.x, y: 470, t: 0, txt: lost ? '-' + lost : '💥', c: '#ef4444' }); }
            break;
          }
        }
      }
      gd.items = gd.items.filter(it => !it.dead && it.y < 640);
      gd.fx.forEach(f => f.t += dt); gd.fx = gd.fx.filter(f => f.t < 1);
    },
    draw(ctx) {
      const gd = H.gd, g = ctx.createLinearGradient(0, 0, 0, 600);
      g.addColorStop(0, '#1e1b4b'); g.addColorStop(1, '#6d28d9');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 600);
      for (const s of STARS) { ctx.fillStyle = `rgba(255,255,255,${s.a * .5})`; ctx.fillRect(s.x, s.y * .8, 2, 2); }
      ctx.fillStyle = '#22c55e'; ctx.fillRect(0, 560, 1000, 40); ctx.fillStyle = '#15803d'; ctx.fillRect(0, 560, 1000, 8);
      for (const it of gd.items) { ctx.save(); ctx.translate(it.x, it.y); if (it.type !== 'bomb') ctx.scale(Math.abs(Math.cos(it.rot)) * .6 + .4, 1); emo(ctx, it.type === 'coin' ? '🪙' : it.type === 'gem' ? '💎' : '💣', 0, 0, 42); ctx.restore(); }
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id);
        ctx.fillStyle = (pp?.color || '#888') + '66'; ctx.beginPath(); ctx.ellipse(p.x, 556, 34, 9, 0, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(p.x, 522); if (p.stun > 0) ctx.rotate(Math.sin(gd.t * 30) * .3);
        emo(ctx, pp?.emoji || '?', 0, 0, 56); ctx.restore();
        if (p.stun > 0) emo(ctx, '💫', p.x, 476, 30);
        nameTag(ctx, `${pp?.name || '?'} · ${p.coins}`, p.x, 590, 15);
      }
      for (const f of gd.fx) { ctx.globalAlpha = 1 - f.t; ctx.fillStyle = f.c; ctx.font = '900 30px Nunito'; ctx.textAlign = 'center'; ctx.fillText(f.txt, f.x, f.y - f.t * 70); ctx.globalAlpha = 1; }
    },
    end() {
      if (H.phase !== 'coin-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.ps[id].coins, true, id => gd.ps[id].coins > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.ps[b].coins - gd.ps[a].coins).map(id => ({ id, val: '🪙 ' + gd.ps[id].coins, gain: g[id] || 0 }));
      setPhase('coin-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      if (ph === 'coin-ready') return canvasHTML(true, '🪙 ¡Prepárense para la lluvia!');
      if (ph === 'coin-go') return canvasHTML(false);
      return `<h1 class="title-pop">🪙 Los más millonarios</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
