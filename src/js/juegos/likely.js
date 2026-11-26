Object.assign(GAMES, {
  /* 👉 ¿QUIÉN ES MÁS PROBABLE? */
  likely: {
    name: '¿Quién Es Más Probable?', emoji: '👉', color: '#f43f5e',
    desc: 'Les sale una situación y votan por el jugador que más probablemente haría eso 😂. Ganan puntos los que voten igual que la mayoría. 2 preguntas.',
    start() { const ids = onlineIds(); H.gd = { ids, r: 0, qs: [pickU(LIKELY, 'lk'), pickU(LIKELY, 'lk')], pts: {} }; this.sub(); },
    sub() { const gd = H.gd; gd.q = gd.qs[gd.r]; gd.r++; gd.votes = {}; setPhase('k-vote', 20000, () => GAMES.likely.subEnd(), 1200); },
    isDone(id) { return H.phase === 'k-vote' && H.gd.votes[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'k-vote') return gd.votes[p.id] != null ? done('¡Votado! 🤭') : { screen: 'choose', key: 'k' + H.token, title: '¿Quién es más probable que ' + gd.q + '?', deadline: H.deadline, options: gd.ids.map(id => ({ id, label: `${pl(id)?.emoji} ${pl(id)?.name}` })) };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'k-vote' || m.a !== 'choose' || !inGame(p) || gd.votes[p.id] != null || !gd.ids.includes(m.id)) return;
      gd.votes[p.id] = m.id; SFX.pop();
      checkAll(id => gd.votes[id] != null, () => GAMES.likely.subEnd());
    },
    subEnd() {
      if (H.phase !== 'k-vote') return;
      const gd = H.gd, cnt = {};
      gd.ids.forEach(id => cnt[id] = []);
      Object.entries(gd.votes).forEach(([v, t]) => cnt[t].push(v));
      const max = Math.max(0, ...Object.values(cnt).map(a => a.length));
      gd.cnt = cnt; gd.tops = max ? gd.ids.filter(id => cnt[id].length === max) : [];
      Object.entries(gd.votes).forEach(([v, t]) => { if (gd.tops.includes(t)) gd.pts[v] = (gd.pts[v] || 0) + 200; });
      gd.tops.forEach(id => gd.pts[id] = (gd.pts[id] || 0) + 100);
      setPhase('k-res', 6000, () => gd.r < 2 ? GAMES.likely.sub() : finishGame(gd.pts), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd, title = `¿Quién es más probable que ${esc(gd.q)}?`;
      if (ph === 'k-vote') return `<div class="round-lbl">Pregunta ${gd.r} de 2</div><div class="prompt-card">${title}</div><div class="avgrid">${gd.ids.map((id, i) => `<div class="av pop" style="--c:${pl(id)?.color};animation-delay:${i * .08}s"><span class="ae">${pl(id)?.emoji}</span>${esc(pl(id)?.name || '')}</div>`).join('')}</div><p class="sub">👉 ¡Voten en el cel! (se vale votarse a uno mismo)</p>`;
      return `<div class="prompt-card" style="font-size:clamp(20px,3vw,34px)">${title}</div>
        <div class="avgrid">${gd.ids.slice().sort((a, b) => gd.cnt[b].length - gd.cnt[a].length).map((id, i) => `<div class="av pop ${gd.tops.includes(id) ? 'top' : ''}" style="--c:${pl(id)?.color};animation-delay:${i * .12}s">${gd.tops.includes(id) ? '<span class="crown">👑</span>' : ''}<span class="ae">${pl(id)?.emoji}</span>${esc(pl(id)?.name || '')}<span class="vv">${gd.cnt[id].map(v => pl(v)?.emoji || '👻').join('')}</span><b>${gd.cnt[id].length} voto${gd.cnt[id].length === 1 ? '' : 's'}</b></div>`).join('')}</div>
        <p class="sub">${gd.tops.length ? '😂 ¡La gente ha hablado! +200 a quienes votaron por ' + gd.tops.map(who).join(' y ') : '🤷 Nadie votó'}</p>`;
    }
  }
});
