Object.assign(GAMES, {
  /* 🎨 DIBUJITO DESASTRE */
  draw: {
    name: 'Dibujito Desastre', emoji: '🎨', color: '#a855f7', desc: 'Cada uno recibe algo secreto para dibujar en el cel. Después votan por la obra maestra (o el desastre) 🖼️.',
    start() {
      const ids = onlineIds(), ps = shuffle(DRAWS);
      H.gd = { ids, prompts: Object.fromEntries(ids.map((id, i) => [id, ps[i % ps.length]])), imgs: {} };
      setPhase('d-draw', 80000, () => GAMES.draw.toVote(), 3000);
    },
    isDone(id) { const gd = H.gd; if (H.phase === 'd-draw') return gd.imgs[id] != null; if (H.phase === 'd-vote') return gd.votes[id] != null; return false; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'd-draw') return gd.imgs[p.id] ? done('¡Obra maestra enviada! 🖼️') : { screen: 'draw', key: 'dd' + H.token, prompt: gd.prompts[p.id], deadline: H.deadline };
      if (H.phase === 'd-vote') return voteView(p, '¿Cuál es el mejor dibujo? 🎨 (mirá la tele)', (e, i) => `#${i + 1} · ${e.prompt}`);
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd; if (!inGame(p)) return;
      if (H.phase === 'd-draw' && m.a === 'draw' && !gd.imgs[p.id] && typeof m.img === 'string' && m.img.length < 700000 && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(m.img)) {
        gd.imgs[p.id] = m.img; SFX.pop(); checkAll(id => gd.imgs[id] != null, () => GAMES.draw.toVote());
      }
      if (H.phase === 'd-vote' && m.a === 'choose') voteAct(p, m, () => GAMES.draw.reveal());
    },
    toVote() {
      if (H.phase !== 'd-draw') return;
      const gd = H.gd; gd.list = shuffle(Object.entries(gd.imgs).map(([pid, img]) => ({ pid, img, prompt: gd.prompts[pid] })));
      if (!gd.list.length) return finishGame({});
      startVote('d-vote', 35000, () => GAMES.draw.reveal());
    },
    reveal() { if (H.phase !== 'd-vote') return; const g = tallyVotes(); setPhase('d-reveal', 4500 + H.gd.list.length * 900, () => finishGame(g), 0, false); },
    render(ph) {
      const gd = H.gd;
      if (ph === 'd-draw') return `<div class="g-emoji" style="font-size:110px">🎨</div><h1 class="title-pop">¡A DIBUJAR!</h1><p class="sub">Cada uno tiene un dibujo SECRETO distinto en su cel 🤫</p>`;
      if (ph === 'd-vote') return `<h2 class="title-pop">🖼️ La galería del caos</h2><div class="agrid">${gd.list.map((e, i) => `<div class="acard" style="--a:${i * .12}s"><span class="num">${i + 1}</span><img src="${e.img}" alt=""><div class="cap">${esc(e.prompt)}</div></div>`).join('')}</div><p class="sub">🗳️ ¡Voten en el cel por el mejor!</p>`;
      return `<h2 class="title-pop">🖼️ Los artistas son…</h2>${revealCards(e => `<img src="${e.img}" alt=""><div class="cap">${esc(e.prompt)}</div>`)}`;
    }
  }
});
