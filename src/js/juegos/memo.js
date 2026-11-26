Object.assign(GAMES, {
  /* 🃏 MEMORIA DE CARTAS */
  memo: {
    name: 'Memoria de Cartas', emoji: '🃏', color: '#b45309',
    desc: 'Por turnos, voltean 2 cartas desde el cel buscando parejas 🃏. Si aciertan, ¡siguen jugando! El que encuentre más parejas gana.',
    start() {
      const ids = shuffle(onlineIds()), faces = shuffle(CARD_FACES).slice(0, 8), deck = shuffle([...faces, ...faces]);
      preload([...faces.map(f => 'cards/' + f + '.webp'), 'cards/0_CardBack.webp']);
      H.gd = { ids, deck, state: deck.map(() => 0), open: [], turn: 0, turnId: 0, pairs: Object.fromEntries(ids.map(i => [i, 0])), seen: {}, busy: false };
      setPhase('mm-go', 180000, () => GAMES.memo.end());
      const tok = H.token;
      const iv = setInterval(() => {
        if (tok !== H.token) return clearInterval(iv);
        const gd = H.gd; if (gd.busy || !gd.turnEnd || Date.now() < gd.turnEnd) return;
        const cand = gd.state.map((s, i) => s || gd.open.includes(i) ? -1 : i).filter(i => i >= 0); if (cand.length) GAMES.memo.flip(pickR(cand));
      }, 400);
      this.newTurn();
    },
    cur() { const gd = H.gd; for (let k = 0; k < gd.ids.length; k++) { const id = gd.ids[(gd.turn + k) % gd.ids.length]; if (pl(id)?.online) { gd.turn += k; return id; } } return gd.ids[gd.turn % gd.ids.length]; },
    newTurn() { const gd = H.gd; gd.open = []; gd.turnEnd = Date.now() + 12000; gd.turnId++; this.cur(); sync(); updateStrip(); this.paint(); },
    flip(i) {
      const gd = H.gd; if (gd.busy || gd.state[i] || gd.open.includes(i) || i < 0 || i >= gd.deck.length) return;
      gd.open.push(i); gd.seen[i] = gd.deck[i]; SFX.pop(); this.paint();
      if (gd.open.length === 2) {
        gd.busy = true; const [a, b] = gd.open, who_ = this.cur(), tok = H.token;
        if (gd.deck[a] === gd.deck[b]) {
          setTimeout(() => {
            if (tok !== H.token) return;
            gd.state[a] = gd.state[b] = 2; gd.pairs[who_]++; gd.busy = false; SFX.win();
            [a, b].forEach(k => { const el = $('#mc' + k); if (el && window.gsap) gsap.fromTo(el, { scale: 1.15 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.4)' }); });
            if (gd.state.every(s => s === 2)) { this.paint(); setTimeout(() => { if (tok === H.token) GAMES.memo.end(); }, 1200); return; }
            gd.open = []; gd.turnEnd = Date.now() + 12000; gd.turnId++; sync(); this.paint();
          }, 900);
        } else setTimeout(() => { if (tok !== H.token) return; gd.busy = false; gd.turn++; GAMES.memo.newTurn(); }, 1600);
      } else gd.turnEnd = Date.now() + 12000;
      sync();
    },
    isDone(id) { return H.phase === 'mm-go' && this.cur() === id; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase !== 'mm-go') return watch();
      const mine = this.cur() === p.id && !gd.busy;
      return { screen: 'memo', key: `mm${gd.turnId}-${gd.open.join('.')}-${gd.state.join('')}-${gd.busy ? 1 : 0}`, cards: gd.state.map((s, i) => s === 2 ? 'm:' + gd.deck[i] : gd.open.includes(i) ? 'o:' + gd.deck[i] : ''), myTurn: mine, who: `${pl(this.cur())?.emoji} ${pl(this.cur())?.name}`, deadline: mine ? gd.turnEnd : 0 };
    },
    onAct(p, m) { if (H.phase === 'mm-go' && m.a === 'flip' && this.cur() === p.id) this.flip(m.i | 0); },
    paint() {
      const gd = H.gd;
      gd.deck.forEach((f, i) => { const el = $('#mc' + i); if (!el) return; el.classList.toggle('flip', gd.state[i] === 2 || gd.open.includes(i)); el.classList.toggle('done', gd.state[i] === 2); });
      const tb = $('#mmturn'); if (tb) { const c = pl(this.cur()); tb.innerHTML = `Turno de <b style="color:${c?.color}">${c?.emoji} ${esc(c?.name || '')}</b>`; tb.style.borderColor = c?.color; }
      const sc = $('#mmsc'); if (sc) sc.innerHTML = gd.ids.slice().sort((a, b) => gd.pairs[b] - gd.pairs[a]).map(id => `<span class="schip" style="--c:${pl(id)?.color}">${pl(id)?.emoji} ${gd.pairs[id]} 🃏</span>`).join('');
    },
    end() {
      if (H.phase !== 'mm-go') return;
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pairs[id], true, id => gd.pairs[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pairs[b] - gd.pairs[a]).map(id => ({ id, val: `🃏 ${gd.pairs[id]} pareja${gd.pairs[id] === 1 ? '' : 's'}`, gain: g[id] || 0 }));
      setPhase('mm-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'mm-res') return `<h1 class="title-pop">🃏 Los de mejor memoria</h1>${resultsList(gd.rows)}`;
      setTimeout(() => this.paint(), 20);
      return `<div class="mmturn" id="mmturn"></div><div class="mmgrid">${gd.deck.map((f, i) => `<div class="mcard" id="mc${i}"><div class="mc-in"><div class="mc-face mc-back" style="background-image:url(assets/cards/0_CardBack.webp)"><b>${i + 1}</b></div><div class="mc-face mc-front" style="background-image:url(${cardSrc(f)})"></div></div></div>`).join('')}</div><div class="mscore" id="mmsc"></div>`;
    }
  }
});
