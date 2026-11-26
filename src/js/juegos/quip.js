Object.assign(GAMES, {
  /* 💬 RESPUESTA LOCA */
  quip: {
    name: 'Respuesta Loca', emoji: '💬', color: '#3b82f6', desc: 'Escriban la respuesta más graciosa. Después todos votan por la mejor (anónimo 🤫).',
    start() { const ids = onlineIds(); H.gd = { ids, prompt: pickU(QUIPS, 'q'), ans: {} }; setPhase('q-write', 60000, () => GAMES.quip.toVote(), 1500); },
    isDone(id) { const gd = H.gd; if (H.phase === 'q-write') return gd.ans[id] != null; if (H.phase === 'q-vote') return gd.votes[id] != null; return false; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'q-write') return gd.ans[p.id] != null ? done('¡Respuesta enviada! 😎') : { screen: 'write', key: 'qw' + H.token, prompt: gd.prompt, hint: 'Escribí la respuesta más graciosa', deadline: H.deadline, max: 70 };
      if (H.phase === 'q-vote') return voteView(p, '¿Cuál es la más graciosa? 😂', e => e.text);
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd; if (!inGame(p)) return;
      if (H.phase === 'q-write' && m.a === 'text' && gd.ans[p.id] == null) { const t = clean(m.text, 70); if (!t) return; gd.ans[p.id] = t; SFX.pop(); checkAll(id => gd.ans[id] != null, () => GAMES.quip.toVote()); }
      if (H.phase === 'q-vote' && m.a === 'choose') voteAct(p, m, () => GAMES.quip.reveal());
    },
    toVote() {
      if (H.phase !== 'q-write') return;
      const gd = H.gd; gd.list = shuffle(Object.entries(gd.ans).map(([pid, text]) => ({ pid, text })));
      if (!gd.list.length) return finishGame({});
      startVote('q-vote', 30000, () => GAMES.quip.reveal());
    },
    reveal() { if (H.phase !== 'q-vote') return; const g = tallyVotes(); setPhase('q-reveal', 4500 + H.gd.list.length * 900, () => finishGame(g), 0, false); },
    render(ph) {
      const gd = H.gd;
      if (ph === 'q-write') return `<div class="prompt-card">${esc(gd.prompt)}</div><p class="sub float">✍️ Escriban su respuesta en el cel</p>`;
      if (ph === 'q-vote') return `<div class="prompt-card" style="font-size:clamp(20px,3vw,32px)">${esc(gd.prompt)}</div><div class="agrid">${gd.list.map((e, i) => `<div class="acard" style="--a:${i * .12}s"><span class="num">${i + 1}</span><div class="atext">${esc(e.text)}</div></div>`).join('')}</div><p class="sub">🗳️ ¡Voten en el cel por la más graciosa!</p>`;
      return `<div class="prompt-card" style="font-size:clamp(20px,3vw,32px)">${esc(gd.prompt)}</div>${revealCards(e => `<div class="atext">${esc(e.text)}</div>`)}`;
    }
  }
});
