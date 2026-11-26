Object.assign(GAMES, {
  /* 🐹 DALE AL TOPO */
  mole: {
    name: 'Dale al Topo', emoji: '🐹', color: '#84cc16',
    desc: 'Salen topos 🐹 de los hoyos en la tele. Toquen el MISMO hoyo en su cel para darles. ⭐ = +3, 💣 = −2. ¡Si tocan un hoyo vacío se traban un ratito!',
    start() { const ids = onlineIds(); H.gd = { ids, holes: new Array(9).fill(null), sc: Object.fromEntries(ids.map(i => [i, 0])), lock: {}, sid: rid() }; setPhase('mole-ready', 3000, () => { SFX.go(); GAMES.mole.go(); }, 0, false); },
    go() {
      setPhase('mole-go', 30000, () => GAMES.mole.end());
      const tok = H.token, gd = H.gd; let next = 0;
      const iv = setInterval(() => {
        if (tok !== H.token) return clearInterval(iv);
        const now = Date.now();
        gd.holes.forEach((h, i) => { if (h && now > h.until) { gd.holes[i] = null; GAMES.mole.cell(i); } });
        if (now > next) {
          next = now + 380 + rand(450);
          const free = gd.holes.map((h, i) => h ? -1 : i).filter(i => i >= 0);
          if (free.length) { const i = free[rand(free.length)], r = Math.random(); gd.holes[i] = { type: r < .12 ? 'gold' : r < .3 ? 'bomb' : 'mole', until: now + (r < .12 ? 800 : 1150), hit: null }; GAMES.mole.cell(i, true); }
        }
      }, 60);
    },
    cell(i, popIn) {
      const el = $('#mh' + i); if (!el) return; const h = H.gd.holes[i];
      el.innerHTML = h ? `<span>${h.hit ? (h.type === 'bomb' ? '💥' : '😵') : h.type === 'gold' ? '⭐' : h.type === 'bomb' ? '💣' : '🐹'}</span>${h.hit ? `<span class="hb">${pl(h.hit)?.emoji || ''}</span>` : ''}` : '';
      if (h && popIn) A({ targets: el.firstChild, translateY: [40, 0], scale: [.3, 1], duration: 300, easing: 'easeOutBack' });
      if (GAMES.mole.sync9) GAMES.mole.sync9();
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'mole-ready') return { screen: 'msg', big: '🔨', title: '¡Prepará el martillo!', text: 'Tocá en tu cel el mismo hoyo donde sale el topo en la tele' };
      if (H.phase === 'mole-go') return { screen: 'grid9', key: 'mg' + H.gd.sid };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'mole-go' || m.a !== 'hit' || !inGame(p)) return;
      const now = Date.now(); if ((gd.lock[p.id] || 0) > now) return;
      const i = m.i | 0, h = gd.holes[i];
      if (h && !h.hit) {
        h.hit = p.id; h.until = now + 450;
        const d = h.type === 'gold' ? 3 : h.type === 'bomb' ? -2 : 1; gd.sc[p.id] = Math.max(0, gd.sc[p.id] + d);
        if (d > 0) beep(h.type === 'gold' ? 1400 : 700, .08, 'square', .07); else SFX.bad();
        this.cell(i); this.board();
      } else { gd.lock[p.id] = now + 650; tell(p.id, { t: 'live', kind: 'lock', ms: 650 }); }
    },
    board() { const b = $('#msc'); if (b) b.innerHTML = H.gd.ids.slice().sort((a, c) => H.gd.sc[c] - H.gd.sc[a]).map(id => `<span class="schip" style="--c:${pl(id)?.color}">${pl(id)?.emoji} ${H.gd.sc[id]}</span>`).join(''); },
    end() {
      if (H.phase !== 'mole-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.sc[id], true, id => gd.sc[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.sc[b] - gd.sc[a]).map(id => ({ id, val: '🐹 ' + gd.sc[id], gain: g[id] || 0 }));
      setPhase('mole-res', 5500, () => finishGame(g), 0, false); confetti(70); SFX.win();
    },
    render(ph) {
      if (ph === 'mole-res') return `<h1 class="title-pop">🐹 Los mejores martillazos</h1>${resultsList(H.gd.rows)}`;
      setTimeout(() => this.board(), 30);
      return `${ph === 'mole-ready' ? '<h2 class="title-pop">🔨 ¡Prepárense!</h2><div class="cdown" id="cdown"></div>' : '<h2 class="title-pop">🐹 ¡DALE AL TOPO!</h2>'}<div class="mgrid">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<div class="mhole" id="mh${i}"></div>`).join('')}</div><div class="mscore" id="msc"></div>`;
    }
  }
});
