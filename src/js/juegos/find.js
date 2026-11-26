Object.assign(GAMES, {
  /* 🔍 ¿DÓNDE ESTÁ? */
  find: {
    name: '¿Dónde Está?', emoji: '🔍', color: '#0ea5e9',
    desc: 'En la tele hay una imagen llena de cosas y una figura escondida 🕵️. Muevan su mira con el joystick y toquen ¡AQUÍ! cuando la encuentren. Si fallan, quedan congelados un ratito 🥶',
    start() { const ids = onlineIds(); H.gd = { ids, r: 0, pts: {}, sid: rid() }; this.sub(); },
    sub() {
      const gd = H.gd; gd.r++;
      const th = pickU(FIND_THEMES, 'find'); gd.th = th;
      const items = [], cols = 26, rows = 15, cw = 1000 / cols, ch = 600 / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) items.push({ x: x * cw + cw / 2 + (Math.random() - .5) * 12, y: y * ch + ch / 2 + (Math.random() - .5) * 10, e: th.d[rand(th.d.length)], s: 28 + rand(12), r: (Math.random() - .5) * .8 });
      const ti = (2 + rand(rows - 4)) * cols + 2 + rand(cols - 4); items[ti].e = th.t; gd.target = items[ti];
      const sc = document.createElement('canvas'); sc.width = 1000; sc.height = 600;
      const c = sc.getContext('2d'); c.fillStyle = '#1e293b'; c.fillRect(0, 0, 1000, 600);
      for (const it of items) { c.save(); c.translate(it.x, it.y); c.rotate(it.r); emo(c, it.e, 0, 0, it.s); c.restore(); }
      gd.scene = sc; gd.ps = {}; gd.found = [];
      spreadStart(gd.ids, 500, 300, 150).forEach(([id, x, y]) => gd.ps[id] = { x, y, stun: 0, lb: inp(id).b, miss: 0 });
      gd.sid = rid();
      setPhase('find-ready', 3500, () => { SFX.go(); GAMES.find.go(); }, 0, false);
    },
    go() { setPhase('find-go', 35000, () => GAMES.find.subEnd()); rtLoop(dt => GAMES.find.step(dt), GAMES.find.draw); },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'find-ready') return { screen: 'msg', big: gd.th.t, title: '¡Buscá esto!', text: `Escondido en ${gd.th.n}. Ya casi empieza…` };
      if (H.phase === 'find-go') { const f = gd.found.indexOf(p.id); return f >= 0 ? { screen: 'msg', big: '🎯', title: `¡Lo encontraste de #${f + 1}!`, text: 'Mirá a los demás sufrir 😂' } : joyView(p, `🔍 Buscá el ${gd.th.t} · Botón = ¡AQUÍ!`, '🎯 ¡AQUÍ!'); }
      return watch();
    },
    isDone(id) { return H.phase === 'find-go' && H.gd.found.includes(id); },
    onAct(p, m) { if (H.phase === 'find-go') joyAct(p, m); },
    step(dt) {
      const gd = H.gd, t = gd.target;
      for (const id of gd.ids) {
        const p = gd.ps[id]; if (gd.found.includes(id)) continue;
        const i = inp(id);
        if (p.stun > 0) { p.stun -= dt; p.lb = i.b; continue; }
        /* mira con aceleración: arranca lento (para afinar) y si mantenés se va rápido */
        const mag = Math.min(1, Math.hypot(i.x, i.y)); p.hold = mag > .15 ? Math.min(1, (p.hold || 0) + dt * 1.6) : 0;
        const sp = 110 + 360 * p.hold * p.hold; p.x = Math.max(10, Math.min(990, p.x + i.x * sp * dt)); p.y = Math.max(10, Math.min(590, p.y + i.y * sp * dt));
        if (i.b !== p.lb) {
          const pressed = i.b > p.lb || i.b === 1; p.lb = i.b; if (!pressed) continue;
          if (Math.hypot(p.x - t.x, p.y - t.y) < Math.max(38, t.s * .75)) {
            gd.found.push(id); const pts = [300, 200, 120, 80][gd.found.length - 1] || 50;
            gd.pts[id] = (gd.pts[id] || 0) + pts; SFX.win(); sync(); updateStrip();
            if (onlineIn(gd.ids).every(x => gd.found.includes(x))) { const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.find.subEnd(); }, 900); }
          } else { p.stun = 1.5; p.miss++; SFX.bad(); tell(id, { t: 'live', kind: 'lock', ms: 1500 }); }
        }
      }
    },
    draw(ctx, reveal) {
      const gd = H.gd, t = gd.target;
      ctx.drawImage(gd.scene, 0, 0);
      if (reveal) { ctx.lineWidth = 8; ctx.strokeStyle = '#facc15'; ctx.beginPath(); ctx.arc(t.x, t.y, 32 + Math.sin(Date.now() / 120) * 6, 0, 7); ctx.stroke(); return; }
      for (const id of gd.ids) {
        const p = gd.ps[id], pp = pl(id), f = gd.found.includes(id);
        const x = f ? t.x : p.x + (p.stun > 0 ? Math.sin(Date.now() / 30) * 5 : 0), y = f ? t.y : p.y;
        ctx.lineWidth = 5; ctx.strokeStyle = f ? '#facc15' : p.stun > 0 ? '#ef4444' : (pp?.color || '#fff');
        ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 34, y); ctx.lineTo(x - 14, y); ctx.moveTo(x + 14, y); ctx.lineTo(x + 34, y); ctx.moveTo(x, y - 34); ctx.lineTo(x, y - 14); ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 34); ctx.stroke();
        if (!f) nameTag(ctx, `${pp?.emoji || ''} ${pp?.name || ''}${p.stun > 0 ? ' 🥶' : ''}`, x, y - 44, 15);
      }
    },
    subEnd() {
      if (H.phase !== 'find-go') return;
      const gd = H.gd;
      setPhase('find-res', 4500, () => gd.r < 2 ? GAMES.find.sub() : finishGame(gd.pts), 0, false);
      rtLoop(null, ctx => GAMES.find.draw(ctx, true));
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'find-ready') return `<div class="round-lbl">Ronda ${gd.r} de 2</div><h1 class="title-pop">🔍 Busquen: <span style="font-size:1.4em">${gd.th.t}</span></h1><p class="sub">Escondido en ${gd.th.n}</p><div class="cdown" id="cdown"></div>`;
      if (ph === 'find-go') return `<h2>🔍 Busquen el <span style="font-size:1.3em">${gd.th.t}</span></h2>${canvasHTML(false)}`;
      return `<h2 class="title-pop">🎯 ¡Estaba aquí! ${gd.found.length ? 'Lo encontraron: ' + gd.found.map(id => pl(id)?.emoji).join(' ') : 'Nadie lo encontró 😂'}</h2>${canvasHTML(false)}`;
    }
  }
});
