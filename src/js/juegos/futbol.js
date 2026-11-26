Object.assign(GAMES, {
  /* ⚽ FÚTBOL LOCO (Matter.js) */
  futbol: {
    name: 'Fútbol Loco', emoji: '⚽', color: '#16a34a',
    desc: 'Equipo AZUL vs equipo ROJO ⚽. Muévanse con el joystick y usen PATEAR cerca de la bola para disparar. ¡Física de verdad! 60 segundos.',
    start() { libWait(this, 'matter', () => GAMES.futbol.realStart()); },
    realStart() {
      const { Engine, Bodies, Composite } = Matter;
      const ids = shuffle(onlineIds()), engine = Engine.create({ gravity: { x: 0, y: 0 } });
      const st = { isStatic: true, restitution: .9, friction: 0 };
      Composite.add(engine.world, [
        Bodies.rectangle(500, -25, 1200, 50, st), Bodies.rectangle(500, 625, 1200, 50, st),
        Bodies.rectangle(-25, 102, 50, 205, st), Bodies.rectangle(-25, 498, 50, 205, st), Bodies.rectangle(1025, 102, 50, 205, st), Bodies.rectangle(1025, 498, 50, 205, st),
        Bodies.rectangle(-35, 205, 70, 10, st), Bodies.rectangle(-35, 395, 70, 10, st), Bodies.rectangle(1035, 205, 70, 10, st), Bodies.rectangle(1035, 395, 70, 10, st),
        Bodies.rectangle(-75, 300, 10, 200, st), Bodies.rectangle(1075, 300, 10, 200, st)]);
      const team = {}, bodies = {};
      ids.forEach((id, i) => { team[id] = i % 2; bodies[id] = Bodies.circle(0, 0, 24, { frictionAir: .1, restitution: .4, density: .004, friction: 0 }); Composite.add(engine.world, bodies[id]); });
      const ball = Bodies.circle(500, 300, 15, { frictionAir: .012, restitution: .92, density: .0012, friction: 0 });
      Composite.add(engine.world, ball);
      H.inp = {}; H.gd = { ids, engine, team, bodies, ball, score: [0, 0], goals: {}, last: {}, cd: {}, lb: {}, acc: 0, pause: 0, sid: rid(), msg: '' };
      this.kickoff();
      setPhase('fb-ready', 3500, () => { SFX.go(); GAMES.futbol.go(); }, 0, false);
      rtLoop(null, GAMES.futbol.draw);
    },
    kickoff() {
      const gd = H.gd, { Body } = Matter;
      const A = gd.ids.filter(id => gd.team[id] === 0), B = gd.ids.filter(id => gd.team[id] === 1);
      const place = (arr, x) => arr.forEach((id, i) => { Body.setPosition(gd.bodies[id], { x, y: 300 + (i - (arr.length - 1) / 2) * 110 }); Body.setVelocity(gd.bodies[id], { x: 0, y: 0 }); });
      place(A, 260); place(B, 740);
      Body.setPosition(gd.ball, { x: 500, y: 300 }); Body.setVelocity(gd.ball, { x: 0, y: 0 }); Body.setAngularVelocity(gd.ball, 0);
    },
    go() { setPhase('fb-go', 60000, () => GAMES.futbol.end()); rtLoop(dt => GAMES.futbol.step(dt), GAMES.futbol.draw); },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const t = H.gd.team?.[p.id];
      if (H.phase === 'fb-ready' || H.phase === 'fb-go') return joyView(p, t === 0 ? '🔵 Sos AZUL → atacás a la DERECHA' : '🔴 Sos ROJO ← atacás a la IZQUIERDA', '🦶 PATEAR', .7);
      return watch();
    },
    onAct(p, m) { if (H.phase === 'fb-ready' || H.phase === 'fb-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, { Engine, Body } = Matter;
      if (gd.pause > 0) { gd.pause -= dt; if (gd.pause <= 0) { this.kickoff(); gd.msg = ''; } return; }
      for (const id of gd.ids) {
        const b = gd.bodies[id], i = inp(id);
        Body.setVelocity(b, { x: b.velocity.x + (i.x * 7.5 - b.velocity.x) * .22, y: b.velocity.y + (i.y * 7.5 - b.velocity.y) * .22 });
        gd.cd[id] = (gd.cd[id] || 0) - dt;
        if (i.b > (gd.lb[id] ?? i.b)) {
          if (gd.cd[id] <= 0) {
            gd.cd[id] = .6;
            const dx = gd.ball.position.x - b.position.x, dy = gd.ball.position.y - b.position.y, d = Math.hypot(dx, dy);
            if (d < 70) { Body.setVelocity(gd.ball, { x: dx / d * 17 + b.velocity.x * .4, y: dy / d * 17 + b.velocity.y * .4 }); gd.last[id] = 1; gd.lastTouch = id; beep(180, .1, 'square', .08); }
          }
        }
        gd.lb[id] = i.b;
        const dx = gd.ball.position.x - b.position.x, dy = gd.ball.position.y - b.position.y; if (Math.hypot(dx, dy) < 42) gd.lastTouch = id;
      }
      gd.acc += dt; while (gd.acc >= 1 / 60) { Engine.update(gd.engine, 1000 / 60); gd.acc -= 1 / 60; }
      const bx = gd.ball.position.x;
      if (bx < -12 || bx > 1012) {
        const side = bx > 1012 ? 0 : 1; gd.score[side]++;
        const sc = gd.lastTouch && gd.team[gd.lastTouch] === side ? gd.lastTouch : null; if (sc) gd.goals[sc] = (gd.goals[sc] || 0) + 1;
        gd.msg = `¡GOOOL ${side ? 'ROJO' : 'AZUL'}!${sc ? ' ⚽ ' + (pl(sc)?.name || '') : ''}`; gd.pause = 2; SFX.win(); confetti(80); shakeScreen();
      }
    },
    draw(ctx) {
      const gd = H.gd;
      for (let k = 0; k < 10; k++) { ctx.fillStyle = k % 2 ? '#15803d' : '#16a34a'; ctx.fillRect(k * 100, 0, 100, 600); }
      ctx.strokeStyle = '#ffffffcc'; ctx.lineWidth = 5; ctx.strokeRect(4, 4, 992, 592);
      ctx.beginPath(); ctx.moveTo(500, 4); ctx.lineTo(500, 596); ctx.stroke(); ctx.beginPath(); ctx.arc(500, 300, 80, 0, 7); ctx.stroke();
      ctx.strokeRect(4, 160, 120, 280); ctx.strokeRect(876, 160, 120, 280);
      ctx.fillStyle = '#3b82f655'; ctx.fillRect(0, 210, 14, 180); ctx.fillStyle = '#ef444455'; ctx.fillRect(986, 210, 14, 180);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 205, 10, 8); ctx.fillRect(0, 387, 10, 8); ctx.fillRect(990, 205, 10, 8); ctx.fillRect(990, 387, 10, 8);
      for (const id of gd.ids) {
        const b = gd.bodies[id], pp = pl(id), x = b.position.x, y = b.position.y;
        ctx.fillStyle = '#0004'; ctx.beginPath(); ctx.ellipse(x + 4, y + 8, 24, 12, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.fillStyle = gd.team[id] ? '#ef4444' : '#3b82f6'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fff'; ctx.stroke();
        emo(ctx, pp?.emoji || '?', x, y + 2, 26); nameTag(ctx, pp?.name || '', x, y - 36, 14);
      }
      const bl = gd.ball; ctx.save(); ctx.translate(bl.position.x, bl.position.y); ctx.rotate(bl.angle); emo(ctx, '⚽', 0, 1, 32); ctx.restore();
      ctx.fillStyle = '#000a'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(400, 10, 200, 44, 14) : ctx.rect(400, 10, 200, 44); ctx.fill();
      ctx.font = '900 30px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#60a5fa'; ctx.fillText(gd.score[0], 455, 33); ctx.fillStyle = '#fff'; ctx.fillText('-', 500, 33); ctx.fillStyle = '#f87171'; ctx.fillText(gd.score[1], 545, 33);
      if (gd.msg) nameTag(ctx, gd.msg, 500, 300, 56);
    },
    end() {
      if (H.phase !== 'fb-go') return;
      const gd = H.gd, w = gd.score[0] > gd.score[1] ? 0 : gd.score[1] > gd.score[0] ? 1 : -1, g = {};
      gd.ids.forEach(id => { g[id] = (w === -1 ? 250 : gd.team[id] === w ? 500 : 100) + (gd.goals[id] || 0) * 100; });
      gd.rows = gd.ids.slice().sort((a, b) => g[b] - g[a]).map(id => ({ id, val: `${gd.team[id] ? '🔴' : '🔵'} ${gd.goals[id] ? '⚽×' + gd.goals[id] : ''}`, gain: g[id] }));
      setPhase('fb-res', 6000, () => finishGame(g), 0, false); SFX.win(); confetti(120);
    },
    render(ph) {
      if (ph === 'lib-wait') return libWaitHTML;
      if (ph === 'fb-ready') return canvasHTML(true, '⚽ ¡A la cancha!');
      if (ph === 'fb-go') return canvasHTML(false);
      const s = H.gd.score;
      return `<h1 class="title-pop">${s[0] === s[1] ? '🤝 ¡Empate!' : s[0] > s[1] ? '🔵 ¡Gana el AZUL!' : '🔴 ¡Gana el ROJO!'} <span style="color:var(--yellow)">${s[0]} - ${s[1]}</span></h1>${resultsList(H.gd.rows)}`;
    }
  }
});
