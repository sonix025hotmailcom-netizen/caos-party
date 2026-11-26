Object.assign(GAMES, {
  /* 🔢 CUENTA RÁPIDA */
  count: {
    name: 'Cuenta Rápida', emoji: '🔢', color: '#8b5cf6',
    desc: 'En la tele aparecen un montón de cosas moviéndose como locas 🌀. Cuenten las que les pidan. ¡El que se acerque más gana! 2 rondas.',
    start() { const ids = onlineIds(); H.gd = { ids, r: 0, pts: {} }; this.sub(); },
    sub() {
      const gd = H.gd; gd.r++;
      const pool = shuffle(CEMO); gd.target = pool[0]; gd.n = 7 + rand(14 + gd.r * 4);
      const others = 18 + rand(14), items = [];
      for (let i = 0; i < gd.n; i++) items.push(gd.target);
      for (let i = 0; i < others; i++) items.push(pool[1 + rand(3)]);
      gd.items = shuffle(items).map(e => ({ e, x: 3 + Math.random() * 90, y: 3 + Math.random() * 86 }));
      gd.ans = {};
      setPhase('c-show', 7000, () => GAMES.count.ask(), 0, true);
      if (window.anime) setTimeout(() => A({ targets: '.cf span', translateX: () => anime.random(-90, 90), translateY: () => anime.random(-60, 60), rotate: () => anime.random(-180, 180), scale: () => anime.random(7, 13) / 10, duration: () => anime.random(900, 1600), direction: 'alternate', loop: true, easing: 'easeInOutSine', delay: anime.stagger(15) }), 60);
    },
    ask() { setPhase('c-ask', 15000, () => GAMES.count.subEnd(), 1200); },
    isDone(id) { return H.phase === 'c-ask' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'c-show') return { screen: 'msg', big: '👀', title: '¡Mirá la tele y contá!', text: `¿Cuántos ${gd.target} hay?` };
      if (H.phase === 'c-ask') return gd.ans[p.id] != null ? done('¡Número enviado! 🤞') : { screen: 'number', key: 'cn' + H.token, title: `¿Cuántos ${gd.target} había?`, deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'c-ask' || m.a !== 'num' || !inGame(p) || gd.ans[p.id] != null) return;
      const n = parseInt(m.n, 10); if (!(n >= 0 && n < 1000)) return;
      gd.ans[p.id] = n; SFX.pop(); checkAll(id => gd.ans[id] != null, () => GAMES.count.subEnd());
    },
    subEnd() {
      if (H.phase !== 'c-ask') return;
      const gd = H.gd, diff = id => Math.abs(gd.ans[id] - gd.n);
      const g = rankGains(gd.ids, diff, false, id => gd.ans[id] != null, [300, 200, 100], 50);
      Object.keys(g).forEach(id => { if (diff(id) === 0) g[id] += 100; gd.pts[id] = (gd.pts[id] || 0) + g[id]; });
      gd.rows = gd.ids.slice().sort((a, b) => (gd.ans[a] == null ? 1e9 : diff(a)) - (gd.ans[b] == null ? 1e9 : diff(b))).map(id => ({ id, val: gd.ans[id] == null ? '😴 —' : `dijo ${gd.ans[id]}${diff(id) === 0 ? ' 🎯 ¡EXACTO!' : ''}`, gain: g[id] || 0 }));
      setPhase('c-res', 5500, () => gd.r < 2 ? GAMES.count.sub() : finishGame(gd.pts), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'c-show') return `<div class="round-lbl">Ronda ${gd.r} de 2</div><h1 class="title-pop">¡Cuenten los ${gd.target}!</h1><div class="cf">${gd.items.map(it => `<span style="left:${it.x}%;top:${it.y}%">${it.e}</span>`).join('')}</div>`;
      if (ph === 'c-ask') return `<div class="g-emoji" style="font-size:120px">${gd.target}</div><h1 class="title-pop">¿Cuántos ${gd.target} había?</h1><p class="sub">📱 Escriban el número en el cel</p>`;
      return `<h1 class="title-pop">Había <span style="color:var(--yellow)">${gd.n}</span> ${gd.target}</h1>${resultsList(gd.rows)}`;
    }
  }
});
