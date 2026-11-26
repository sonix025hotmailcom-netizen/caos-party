Object.assign(GAMES, {
  /* 🐑 LA MAYORÍA MANDA */
  major: {
    name: 'La Mayoría Manda', emoji: '🐑', color: '#facc15', desc: 'Elijan A o B. Solo ganan puntos los que piensan como la MAYORÍA. 3 preguntas, ¡sean ovejas! 🐑',
    start() { const ids = onlineIds(); H.gd = { ids, r: 0, qs: shuffle(MAJOR).slice(0, 3), pts: {} }; this.sub(); },
    sub() { const gd = H.gd; gd.q = gd.qs[gd.r]; gd.r++; gd.picks = {}; setPhase('m-pick', 12000, () => GAMES.major.subEnd(), 1200); },
    isDone(id) { return H.phase === 'm-pick' && H.gd.picks[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'm-pick') return gd.picks[p.id] != null ? done('¡Votado! Ojalá pensés como la mayoría 🐑') : { screen: 'choose', key: 'mp' + H.token, title: gd.q.q, ab: true, deadline: H.deadline, options: [{ id: '0', label: gd.q.a }, { id: '1', label: gd.q.b }] };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'm-pick' || m.a !== 'choose' || !inGame(p) || gd.picks[p.id] != null || !['0', '1'].includes(m.id)) return;
      gd.picks[p.id] = +m.id; SFX.pop();
      checkAll(id => gd.picks[id] != null, () => GAMES.major.subEnd());
    },
    subEnd() {
      if (H.phase !== 'm-pick') return;
      const gd = H.gd;
      gd.A = gd.ids.filter(id => gd.picks[id] === 0); gd.B = gd.ids.filter(id => gd.picks[id] === 1);
      gd.win = gd.A.length > gd.B.length ? 0 : gd.B.length > gd.A.length ? 1 : -1;
      if (gd.win === -1) [...gd.A, ...gd.B].forEach(id => gd.pts[id] = (gd.pts[id] || 0) + 100);
      else (gd.win ? gd.B : gd.A).forEach(id => gd.pts[id] = (gd.pts[id] || 0) + 200);
      setPhase('m-sub', 4500, () => gd.r < 3 ? GAMES.major.sub() : finishGame(gd.pts), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd, q = gd.q;
      if (ph === 'm-pick') return `<div class="round-lbl">Pregunta ${gd.r} de 3</div><h1 class="title-pop">${esc(q.q)}</h1><div class="ab"><div class="abox a pop"><small>A</small>${esc(q.a)}</div><div class="vs">VS</div><div class="abox b pop" style="animation-delay:.15s"><small>B</small>${esc(q.b)}</div></div><p class="sub">🐑 Elijan en el cel. ¡Solo ganan los que van con la mayoría!</p>`;
      const box = (k, ids, lbl, txt) => `<div class="abox ${k} ${gd.win === -1 ? '' : (gd.win === (k === 'a' ? 0 : 1) ? 'winb' : 'lose')}"><small>${lbl} · ${ids.length} voto${ids.length === 1 ? '' : 's'}</small>${esc(txt)}<div class="voters">${ids.map(id => pl(id)?.emoji || '👻').join(' ')}</div></div>`;
      return `<h1 class="title-pop">${gd.win === -1 ? '⚖️ ¡EMPATE! +100 a todos los que votaron' : '🐑 ¡La mayoría manda! +200'}</h1><div class="ab">${box('a', gd.A, 'A', q.a)}<div class="vs">VS</div>${box('b', gd.B, 'B', q.b)}</div>`;
    }
  }
});
