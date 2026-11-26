Object.assign(GAMES, {
  /* 🏃 CARRERA ALOCADA */
  race: {
    name: 'Carrera Alocada', emoji: '🏃', color: '#3b82f6',
    desc: 'Toquen IZQUIERDA y DERECHA alternando, como si fueran pies 🦶🦶. Si tocan el mismo dos veces, no avanzan. ¡Primero a la meta gana!',
    GOAL: 70,
    start() {
      const ids = onlineIds(); H.gd = { ids, steps: Object.fromEntries(ids.map(i => [i, 0])), fin: [], sid: rid() };
      setPhase('race-ready', 3500, () => { SFX.go(); setPhase('race-go', 30000, () => GAMES.race.end()); }, 0, false);
    },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'race-ready') return { screen: 'msg', big: '🦶', title: '¡En sus marcas!', text: 'Alterná los botones IZQ y DER lo más rápido que podás' };
      if (H.phase === 'race-go') return H.gd.fin.includes(p.id) ? { screen: 'msg', big: medal(H.gd.fin.indexOf(p.id)), title: '¡LLEGASTE!', text: 'Mirá la tele 📺' } : { screen: 'mash', key: 'race' + H.gd.sid, goal: GAMES.race.GOAL };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'race-go' || m.a !== 'steps' || !inGame(p) || gd.fin.includes(p.id)) return;
      const n = Math.min(this.GOAL, Math.max(gd.steps[p.id], m.n | 0));
      gd.steps[p.id] = n;
      const r = $('#rr-' + p.id); if (r) { r.style.left = `calc(${n / this.GOAL * 100}% - ${n / this.GOAL * 48}px)`; r.classList.add('mv'); clearTimeout(r._t); r._t = setTimeout(() => r.classList.remove('mv'), 250); }
      if (n >= this.GOAL) {
        gd.fin.push(p.id); SFX.win();
        const pl_ = $('#rp-' + p.id); if (pl_) { pl_.textContent = medal(gd.fin.length - 1); A({ targets: pl_, scale: [0, 1.4, 1], duration: 700 }); }
        if (gd.fin.length === 1) confetti(60);
        sync();
        if (onlineIn(gd.ids).every(id => gd.fin.includes(id))) { const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.race.end(); }, 1200); }
      }
    },
    end() {
      if (H.phase !== 'race-go') return;
      const gd = H.gd, sc = id => gd.fin.includes(id) ? 1000 - gd.fin.indexOf(id) : gd.steps[id];
      const g = rankGains(gd.ids, sc, true, id => gd.steps[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.fin.includes(id) ? '🏁 Llegó' : Math.round(gd.steps[id] / this.GOAL * 100) + '%', gain: g[id] || 0 }));
      setPhase('race-res', 5500, () => finishGame(g), 0, false);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'race-res') return `<h1 class="title-pop">🏃 Resultados de la carrera</h1>${resultsList(gd.rows)}`;
      return `${ph === 'race-ready' ? '<h2 class="title-pop">🦶 ¡En sus marcas, listos…!</h2><div class="cdown" id="cdown"></div>' : '<h1 class="title-pop wiggle">🏃 ¡CORRAN!</h1>'}
        <div class="rlanes">${gd.ids.map(id => { const p = pl(id); return `<div class="rlane"><span class="rplace" id="rp-${id}"></span><div class="rtrack" style="--c:${p?.color}"><span class="rrun" id="rr-${id}">${p?.emoji}</span></div><b style="width:110px;text-align:left">${esc(p?.name || '')}</b></div>`; }).join('')}</div>`;
    }
  }
});
