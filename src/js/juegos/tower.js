Object.assign(GAMES, {
  /* 🧱 TORRE TEMBLOROSA (Matter.js) */
  tower: {
    name: 'Torre Temblorosa', emoji: '🧱', color: '#ea580c',
    desc: 'Por turnos, cada uno suelta un bloque desde la grúa que se mueve 🏗️. ¡Hay física de verdad! El que haga caer la torre pierde 😱',
    start() { libWait(this, 'matter', () => GAMES.tower.realStart()); },
    realStart() {
      const { Engine, Bodies, Composite } = Matter;
      const ids = shuffle(onlineIds()), engine = Engine.create({ positionIterations: 12, velocityIterations: 10 });
      engine.gravity.y = 1;
      /* regla: solo el PRIMER bloque puede tocar el piso; si otro lo toca, la torre se cayó */
      Matter.Events.on(engine, 'collisionStart', ev => { const gd = H.gd; if (!gd || gd.engine !== engine || gd.state === 'over') return; for (const pr of ev.pairs) { const a = pr.bodyA, b = pr.bodyB, o = a.label === 'ground' ? b : b.label === 'ground' ? a : null; if (o && !o.isBase && !gd.floorHit) gd.floorHit = o; } });
      const ground = Bodies.rectangle(500, 560, 300, 30, { isStatic: true, friction: 1, label: 'ground' });
      Composite.add(engine.world, ground);
      H.gd = { ids, engine, ground, blocks: [], turn: 0, drops: 0, max: Infinity, t: 0, acc: 0, state: 'aim', settle: 0, ok: {}, culprit: null, cam: 0, sid: rid() };
      this.newBlock();
      setPhase('tw-ready', 3000, () => { SFX.go(); GAMES.tower.go(); }, 0, false);
      rtLoop(null, GAMES.tower.draw);
    },
    newBlock() {
      const gd = H.gd, r = Math.random();
      gd.next = gd.drops > 6 && r < .18 ? { w: 44 + rand(12), h: 76 } : r < .15 ? { w: 70, h: 70 } : r < .3 ? { w: 200, h: 28 } : { w: Math.max(60, 90 + rand(90) - gd.drops * 2), h: 30 + rand(30) }; /* con el tiempo salen piezas más raras */
      gd.aimT0 = gd.t; gd.state = 'aim'; gd.turnEnd = Date.now() + 7000;
    },
    cur() { const gd = H.gd; return gd.ids[gd.turn % gd.ids.length]; },
    go() { setPhase('tw-go', 600000, () => GAMES.tower.end()); rtLoop(dt => GAMES.tower.step(dt), GAMES.tower.draw); },
    top() { const gd = H.gd; let t = 545; for (const b of gd.blocks) if (b.position.y < 700) t = Math.min(t, b.bounds.min.y); return t; },
    craneX() { const gd = H.gd, sp = Math.min(3.2, 1.2 + gd.drops * .09); return 500 + Math.sin((gd.t - gd.aimT0) * sp + gd.drops) * 300; },
    drop() {
      const gd = H.gd, { Bodies, Composite } = Matter; if (gd.state !== 'aim') return;
      const who_ = this.cur(), y = this.top() - 150, x = this.craneX();
      const b = Bodies.rectangle(x, y, gd.next.w, gd.next.h, { friction: .85, frictionStatic: 1.15, frictionAir: .012, restitution: 0, density: .0016, slop: .02 });
      b.owner = who_; b.isBase = gd.blocks.length === 0; Composite.add(gd.engine.world, b); gd.blocks.push(b);
      gd.state = 'fall'; gd.fallT = 0; gd.settle = 0; gd.dropper = who_; beep(400, .1, 'triangle', .07); sync();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'tw-go' && gd.state === 'aim' && this.cur() === p.id) return { screen: 'drop', key: 'tw' + gd.drops, deadline: gd.turnEnd - Date.now() + Date.now() };
      if (H.phase === 'tw-go') return { screen: 'msg', big: '🏗️', title: this.cur() === p.id ? '¡Ya soltaste!' : `Turno de ${pl(this.cur())?.emoji} ${pl(this.cur())?.name}`, text: '🤞 Que no se caiga…' };
      return watch();
    },
    isDone(id) { return H.phase === 'tw-go' && H.gd.state === 'aim' && this.cur() === id; },
    onAct(p, m) { if (H.phase === 'tw-go' && m.a === 'drop' && this.cur() === p.id) this.drop(); },
    step(dt) {
      const gd = H.gd, { Engine } = Matter; gd.t += dt;
      gd.acc += dt; let n = 0; while (gd.acc >= 1 / 120 && n++ < 12) { Engine.update(gd.engine, 1000 / 120); gd.acc -= 1 / 120; } if (n >= 12) gd.acc = 0;
      /* la torre se cae si un bloque se va de la base o si alguno (que no sea la base) toca el piso; en cualquier momento */
      if (gd.state !== 'over' && gd.blocks.length) { const fallen = gd.blocks.some(b => b.position.y > 640 || Math.abs(b.position.x - 500) > 520); if (fallen || gd.floorHit) { gd.state = 'over'; gd.culprit = gd.dropper; gd.why = gd.floorHit && !fallen ? 'piso' : 'cayo'; SFX.bad(); shakeScreen(); const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.tower.end(); }, 2200); updateStrip(); sync(); return; } }
      const targetCam = Math.max(0, 300 - this.top()); gd.cam += (targetCam - gd.cam) * Math.min(1, dt * 3);
      if (gd.state === 'aim' && Date.now() > gd.turnEnd) this.drop();
      if (gd.state === 'fall') {
        gd.fallT += dt;
        const still = gd.blocks.every(b => b.speed < .12 && Math.abs(b.angularSpeed) < .01);
        gd.settle = still ? gd.settle + dt : 0;
        if (gd.settle > .7 || gd.fallT > 4.5) {
          gd.ok[gd.dropper] = (gd.ok[gd.dropper] || 0) + 1; gd.drops++; gd.turn++; SFX.pop();
          if (gd.drops >= gd.max) { gd.state = 'over'; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.tower.end(); }, 1000); return; }
          this.newBlock(); sync(); updateStrip();
        }
      }
    },
    draw(ctx) {
      const gd = H.gd, T = GAMES.tower;
      const sky = ctx.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, '#0ea5e9'); sky.addColorStop(1, '#fde68a'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 600);
      ctx.save(); ctx.translate(0, gd.cam);
      ctx.fillStyle = '#78350f'; ctx.fillRect(350, 545, 300, 400); ctx.fillStyle = '#a16207'; ctx.fillRect(350, 545, 300, 12);
      for (const b of gd.blocks) {
        const pp = pl(b.owner); ctx.beginPath(); b.vertices.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath();
        ctx.fillStyle = pp?.color || '#888'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0006'; ctx.stroke();
        ctx.save(); ctx.translate(b.position.x, b.position.y); ctx.rotate(b.angle); emo(ctx, pp?.emoji || '', 0, 1, 20); ctx.restore();
      }
      if (gd.state === 'aim' && H.phase === 'tw-go') {
        const x = T.craneX(), y = T.top() - 150, n = gd.next, pp = pl(T.cur());
        ctx.strokeStyle = '#334155'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 400); ctx.lineTo(x, y - n.h / 2); ctx.stroke();
        ctx.setLineDash([8, 8]); ctx.strokeStyle = '#0005'; ctx.beginPath(); ctx.moveTo(x, y + n.h / 2); ctx.lineTo(x, T.top()); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = (pp?.color || '#888') + 'cc'; ctx.fillRect(x - n.w / 2, y - n.h / 2, n.w, n.h); emo(ctx, pp?.emoji || '', x, y + 1, 20);
      }
      ctx.restore();
      nameTag(ctx, `Bloques: ${gd.drops}/${gd.max}`, 110, 30, 20);
      if (H.phase === 'tw-go' && gd.state === 'aim') nameTag(ctx, `Turno: ${pl(T.cur())?.emoji || ''} ${pl(T.cur())?.name || ''}`, 500, 30, 26);
      if (gd.culprit) nameTag(ctx, `💥 ¡${pl(gd.culprit)?.name || ''} tumbó la torre!`, 500, 300, 46);
    },
    end() {
      if (H.phase !== 'tw-go') return;
      const gd = H.gd, g = {};
      gd.ids.forEach(id => { g[id] = id === gd.culprit ? 0 : (gd.ok[id] || 0) * 100 + 150; });
      gd.rows = gd.ids.slice().sort((a, b) => g[b] - g[a]).map(id => ({ id, val: id === gd.culprit ? (gd.why === 'piso' ? '💥 Tocó el piso' : '💥 Tumbó la torre') : `🧱 ${gd.ok[id] || 0} legos`, gain: g[id] }));
      setPhase('tw-res', 6000, () => finishGame(g), 0, false); confetti(70);
    },
    render(ph) {
      if (ph === 'lib-wait') return libWaitHTML;
      if (ph === 'tw-ready') return canvasHTML(true, '🏗️ ¡Construyan la torre más alta!');
      if (ph === 'tw-go') return canvasHTML(false);
      return `<h1 class="title-pop">🧱 ${H.gd.culprit ? '¡Se cayó todo!' : '¡La torre resistió!'}</h1>${resultsList(H.gd.rows)}`;
    }
  }
});
