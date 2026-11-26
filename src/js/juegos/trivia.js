/* ================== JUEGOS NUEVOS v4 ================== */
Object.assign(GAMES, {
  /* ❓ TRIVIA TURBO */
  trivia: {
    name: 'Trivia Turbo', emoji: '❓', color: '#6366f1', N: 6,
    desc: 'Preguntas de cultura general (¡y de Costa Rica! 🇨🇷). Respondan en el cel: entre más rápido acierten, más puntos. 6 preguntas.',
    start() { const ids = onlineIds(); H.gd = { ids, i: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])) }; this.next(); },
    next() {
      const gd = H.gd; gd.i++; gd.q = pickU(TRIVIA, 'tr'); gd.ord = shuffle([0, 1, 2, 3]); gd.ans = {}; gd.t0 = Date.now();
      setPhase('tv-q', 13000, () => GAMES.trivia.reveal(), 700);
      A({ targets: '.qopt', translateX: [-80, 0], opacity: [0, 1], delay: anime_stagger(90), duration: 500, easing: 'easeOutBack' });
    },
    isDone(id) { return H.phase === 'tv-q' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'tv-q') return gd.ans[p.id] ? done('¡Respuesta enviada! 🤞') : { screen: 'quiz', key: 'tq' + H.token, title: gd.q.q, opts: gd.ord.map(j => gd.q.o[j]), deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'tv-q' || m.a !== 'quiz' || !inGame(p) || gd.ans[p.id]) return;
      const i = m.i | 0; if (i < 0 || i > 3) return;
      const ok = gd.ord[i] === 0;
      gd.ans[p.id] = { i, ok };
      if (ok) { gd.ok[p.id]++; gd.pts[p.id] += 100 + Math.max(0, Math.round(100 * (1 - (Date.now() - gd.t0) / 13000))); }
      SFX.pop(); checkAll(id => gd.ans[id] != null, () => GAMES.trivia.reveal());
    },
    reveal() { if (H.phase !== 'tv-q') return; const gd = H.gd; setPhase('tv-a', 3500, () => gd.i < GAMES.trivia.N ? GAMES.trivia.next() : GAMES.trivia.end(), 0, false); SFX.win(); },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true, id => gd.pts[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `${gd.ok[id]}/${GAMES.trivia.N} correctas`, gain: g[id] || 0 }));
      setPhase('tv-res', 5500, () => finishGame(g), 0, false); confetti(70);
    },
    render(ph) {
      const gd = H.gd, L = ['A', 'B', 'C', 'D'], CC = ['#3b82f6', '#ff4d8d', '#22c55e', '#f59e0b'];
      if (ph === 'tv-res') return `<h1 class="title-pop">❓ Los sabelotodo</h1>${resultsList(gd.rows)}`;
      const reveal = ph === 'tv-a';
      return `<div class="round-lbl">${gd.q.c} Pregunta ${gd.i} de ${this.N}</div><div class="prompt-card">${esc(gd.q.q)}</div>
        <div class="qgrid">${gd.ord.map((j, i) => { const who_ = reveal ? gd.ids.filter(id => gd.ans[id] && gd.ans[id].i === i).map(id => pl(id)?.emoji).join('') : ''; return `<div class="qopt ${reveal ? (j === 0 ? 'right' : 'wrong') : ''}" style="--c:${CC[i]}"><b>${L[i]}</b><span>${esc(gd.q.o[j])}</span><em>${who_}</em></div>`; }).join('')}</div>`;
    }
  }
});
