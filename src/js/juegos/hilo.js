Object.assign(GAMES, {
  /* =================================================================== */
  /* 🃏 MAYOR O MENOR                                                     */
  /* =================================================================== */
  hilo: {
    name: 'Mayor o Menor', emoji: '🃏', color: '#be123c', N: 7,
    desc: 'Sale una carta 🃏. ¿La siguiente será MAYOR o MENOR? Apostá 1, 2 o 3 fichas desde el cel. Si te atrevés, apostá a IGUAL (paga x5). Empiezan con 10 fichas y gana el que termine con más.',
    start() {
      const ids = onlineIds(), deck = shuffle(CARD_SUITS.flatMap(s => CARD_RANKS.map((r, v) => ({ s, r, v }))));
      deck.slice(0, 12).forEach(c => IMG('deck/card' + c.s + c.r + '.png')); IMG('deck/cardBack_red2.png');
      H.gd = { ids, deck, i: 0, cur: deck[0], chips: Object.fromEntries(ids.map(i => [i, 10])), bet: {}, turn: 0, hist: [] };
      this.turn();
    },
    turn() {
      const gd = H.gd; gd.turn++; gd.bet = {}; gd.next = gd.deck[gd.i + 1];
      setPhase('hl-go', 11000, () => GAMES.hilo.reveal());
      SND.play('ui_open_002', .5);
    },
    reveal() {
      const gd = H.gd; if (H.phase !== 'hl-go') return;
      const a = gd.cur, b = gd.next, res = b.v > a.v ? 'up' : b.v < a.v ? 'down' : 'eq';
      gd.res = res; gd.delta = {};
      for (const id of gd.ids) {
        const bt = gd.bet[id]; if (!bt) { gd.delta[id] = 0; continue; }
        const win = bt.c === res, d = win ? (res === 'eq' ? bt.n * 5 : bt.n) : -bt.n;
        gd.delta[id] = d; gd.chips[id] = Math.max(0, gd.chips[id] + d);
      }
      gd.hist.push(a);
      setPhase('hl-rev', 4200, () => { gd.i++; gd.cur = gd.next; if (gd.turn >= this.N || gd.i >= gd.deck.length - 1) this.end(); else this.turn(); }, 0, false);
      SND.play('ui_switch_002', .6);
      setTimeout(() => { const wins = gd.ids.filter(id => gd.delta[id] > 0).length; if (wins) SND.play('ui_confirmation_001', .5); else SND.play('ui_error_006', .45); if (res === 'eq' && wins) { SND.voice('combo'); confetti(80); } }, 700);
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'hl-go' || m.a !== 'hilo' || !inGame(p)) return;
      if (!['up', 'down', 'eq'].includes(m.c)) return;
      const n = Math.max(1, Math.min(3, m.n | 0, gd.chips[p.id] || 0)); if (!gd.chips[p.id]) return;
      gd.bet[p.id] = { c: m.c, n }; SFX.pop(); updateStrip(); this.paint(); sync();
      checkAll(id => gd.bet[id] || !gd.chips[id], () => GAMES.hilo.reveal());
    },
    isDone(id) { return H.phase === 'hl-go' && !!H.gd.bet[id]; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'hl-go') {
        if (!gd.chips[p.id]) return { screen: 'msg', big: '💸', title: 'Te quedaste sin fichas', text: 'Mirá la tele… ¡la próxima con más cuidado! 😅' };
        return { screen: 'hilo', key: `hl${gd.turn}-${gd.bet[p.id] ? 1 : 0}`, card: gd.cur, chips: gd.chips[p.id], bet: gd.bet[p.id] || null, turn: gd.turn, N: this.N, deadline: H.deadline };
      }
      if (H.phase === 'hl-rev') { const d = gd.delta[p.id] || 0; return { screen: 'msg', big: d > 0 ? '🤑' : d < 0 ? '😭' : '😐', title: d > 0 ? `¡Ganaste ${d} ficha${d > 1 ? 's' : ''}!` : d < 0 ? `Perdiste ${-d} ficha${d < -1 ? 's' : ''}` : 'No apostaste', text: `Tenés ${gd.chips[p.id]} fichas` }; }
      return watch();
    },
    paint() {
      const gd = H.gd, el = $('#hlpl'); if (!el) return;
      const rev = H.phase === 'hl-rev';
      el.innerHTML = gd.ids.slice().sort((a, b) => gd.chips[b] - gd.chips[a]).map(id => {
        const p = pl(id), bt = gd.bet[id], d = gd.delta?.[id] || 0;
        const tag = rev ? (bt ? `<b class="${d > 0 ? 'ok' : 'no'}">${bt.c === 'up' ? '▲' : bt.c === 'down' ? '▼' : '='} ${d > 0 ? '+' : ''}${d}</b>` : '<b>—</b>') : bt ? '<b class="ok">✅ listo</b>' : '<b>🤔</b>';
        return `<div class="hlp" style="--c:${p?.color}">${chipStack(gd.chips[id])}<div><div class="hln">${p?.emoji} ${esc(p?.name || '')}</div><div class="hlc">${gd.chips[id]} fichas ${tag}</div></div></div>`;
      }).join('');
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.chips[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.chips[b] - gd.chips[a]).map(id => ({ id, val: `🪙 ${gd.chips[id]} fichas`, gain: g[id] || 0 }));
      setPhase('hl-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'hl-res') return `<h1 class="title-pop">🃏 Los más suertudos</h1>${resultsList(gd.rows)}`;
      const rev = ph === 'hl-rev', res = gd.res;
      setTimeout(() => { this.paint(); if (rev) { const c = $('#hlnext'); if (c) { c.classList.add('flip'); } } }, 30);
      return `<div class="round-lbl">Carta ${gd.turn} de ${this.N}</div>
        <div class="hlwrap"><div class="hltable">
          <div class="hlhist">${gd.hist.slice(-6).map(c => `<img src="${cardImg(c)}" alt="">`).join('')}</div>
          <img class="hlcard cur" src="${cardImg(gd.cur)}" alt="">
          <div class="hlq">${rev ? (res === 'up' ? '▲ ¡MAYOR!' : res === 'down' ? '▼ ¡MENOR!' : '= ¡IGUAL! 🤯') : '¿Mayor o menor?'}</div>
          <div class="hlcard next" id="hlnext"><div class="hlin"><img class="hlb" src="${cardImg(null)}" alt=""><img class="hlf" src="${cardImg(gd.next)}" alt=""></div></div>
        </div><div class="hlpl" id="hlpl"></div></div>
        <p class="sub">El orden: 2 · 3 · … · 10 · J · Q · K · A (el As es la más alta)</p>`;
    }
  }
});
