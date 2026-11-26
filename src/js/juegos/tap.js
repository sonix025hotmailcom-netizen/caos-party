Object.assign(GAMES, {
  /* 👆 TOQUE TURBO */
  tap: {
    name: 'Toque Turbo', emoji: '👆', color: '#ff4d6d', desc: '¡Toquen el botón del cel como si no hubiera mañana! Tienen 10 segundos.',
    start() {
      const ids = onlineIds(); H.gd = { ids, taps: Object.fromEntries(ids.map(i => [i, 0])) };
      setPhase('tap-ready', 3000, () => { SFX.go(); setPhase('tap-go', 10000, () => GAMES.tap.end(), 700); }, 0, false);
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'tap-ready') return { screen: 'msg', big: '🖐️', title: '¡Prepará el dedo!', text: 'Cuando empiece, tocá el botón lo más rápido que podás' };
      if (H.phase === 'tap-go') return { screen: 'tap', key: 'tap' + H.token, deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'tap-go' || m.a !== 'taps' || !inGame(p)) return;
      gd.taps[p.id] = Math.max(gd.taps[p.id], Math.min(m.n | 0, 250));
      const max = Math.max(40, ...Object.values(gd.taps));
      for (const id of gd.ids) { const f = $('#lf-' + id), c = $('#lc-' + id); if (f) f.style.width = (gd.taps[id] / max * 100) + '%'; if (c) c.textContent = gd.taps[id]; }
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.taps[id], true, id => gd.taps[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.taps[b] - gd.taps[a]).map(id => ({ id, val: gd.taps[id] + ' toques', gain: g[id] || 0 }));
      setPhase('tap-res', 5500, () => finishGame(g), 0, false); SFX.win(); confetti(80);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'tap-ready') return `<h2 class="title-pop">¡Prepárense! 🖐️</h2><div class="cdown huge" id="cdown"></div>`;
      if (ph === 'tap-go') return `<h1 class="title-pop wiggle">👆 ¡TOQUEN, TOQUEN, TOQUEN! 👆</h1><div class="lanes">${gd.ids.map(id => { const p = pl(id); return `<div class="lane"><span class="lemo">${p?.emoji}</span><div class="lbar"><div class="lfill" id="lf-${id}" style="--c:${p?.color}"></div></div><b id="lc-${id}">0</b></div>`; }).join('')}</div>`;
      return `<h1 class="title-pop">👆 Resultados</h1>${resultsList(gd.rows)}`;
    }
  }
});
