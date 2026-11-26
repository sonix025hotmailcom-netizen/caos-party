Object.assign(GAMES, {
  /* 🚦 NI SE TE OCURRA */
  reflex: {
    name: 'Ni Se Te Ocurra', emoji: '🚦', color: '#22c55e', desc: 'Esperen a que el cel se ponga VERDE y toquen rapidísimo. Si tocan antes… castigo 🙈. 3 rondas.',
    start() { const ids = onlineIds(); H.gd = { ids, r: 0, tot: Object.fromEntries(ids.map(i => [i, 0])), res: {} }; this.sub(); },
    sub() { const gd = H.gd; gd.r++; gd.res = {}; gd.delay = 2000 + rand(3500); setPhase('rx-wait', gd.delay + 3300, () => GAMES.reflex.subEnd(), 0, false); },
    isDone(id) { return H.phase === 'rx-wait' && H.gd.res[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'rx-wait') {
        const r = gd.res[p.id];
        if (r === 'early') return { screen: 'msg', big: '🙈', title: '¡MUY PRONTO!', text: 'Castigo de +2000 ms' };
        if (r != null) return { screen: 'msg', big: '⚡', title: r + ' ms', text: '¡Esperá a los demás!' };
        return { screen: 'reflex', key: 'rx' + H.token, delay: gd.delay };
      }
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'rx-wait' || m.a !== 'rx' || !inGame(p) || gd.res[p.id] != null) return;
      gd.res[p.id] = m.early ? 'early' : Math.max(90, Math.min(1500, m.ms | 0));
      if (m.early) SFX.bad(); else SFX.pop();
      checkAll(id => gd.res[id] != null, () => GAMES.reflex.subEnd());
    },
    subEnd() {
      if (H.phase !== 'rx-wait') return;
      const gd = H.gd;
      gd.last = gd.ids.map(id => { const v = gd.res[id]; const t = v === 'early' ? 2000 : v == null ? 1500 : v; gd.tot[id] += t; return { id, t, val: v === 'early' ? '🙈 Muy pronto' : v == null ? '😴 No tocó' : v + ' ms' }; }).sort((a, b) => a.t - b.t);
      setPhase('rx-sub', 3800, () => gd.r < 3 ? GAMES.reflex.sub() : GAMES.reflex.end(), 0, false);
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.tot[id], false);
      gd.rows = gd.ids.slice().sort((a, b) => gd.tot[a] - gd.tot[b]).map(id => ({ id, val: gd.tot[id] + ' ms total', gain: g[id] || 0 }));
      setPhase('rx-res', 5500, () => finishGame(g), 0, false); confetti(80);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'rx-wait') return `<div class="round-lbl">Ronda ${gd.r} de 3</div><div class="light" style="--d:${gd.delay}ms"></div><h1 class="title-pop">¡NO TOQUEN TODAVÍA! 🚦</h1><p class="sub">Toquen el cel solo cuando se ponga VERDE</p>`;
      if (ph === 'rx-sub') return `<h2 class="title-pop">⚡ Ronda ${gd.r} de 3</h2>${resultsList(gd.last.map(x => ({ id: x.id, val: x.val })))}`;
      return `<h1 class="title-pop">🚦 Los más rápidos</h1>${resultsList(gd.rows)}`;
    }
  }
});
