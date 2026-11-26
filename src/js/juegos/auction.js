Object.assign(GAMES, {
  auction: {
    name: 'Subasta Misteriosa', emoji: '🔨', color: '#a16207', N: 6,
    desc: 'Cada ronda sale una caja misteriosa 📦 con una pista: "puede ser 💎 o 💣". Todos pujan en secreto desde el cel. El que más ofrece se la lleva… ¡y descubre si era un tesoro o una bomba! Empiezan con 100 🪙 y gana el que termine con más.',
    start() {
      const ids = onlineIds(); IMG('dungeon/chest.png');
      H.gd = { ids, r: 0, money: Object.fromEntries(ids.map(i => [i, 100])), won: Object.fromEntries(ids.map(i => [i, []])) };
      setTimeout(() => this.round(), 300);
    },
    round() {
      const gd = H.gd; gd.r++; gd.bids = {}; gd.order = 0;
      const a = rand(SUB_ITEMS.length); let b = rand(SUB_ITEMS.length); while (b === a) b = rand(SUB_ITEMS.length);
      const real = Math.random() < .5 ? a : b, it = SUB_ITEMS[real];
      gd.hint = Math.random() < .5 ? [a, b] : [b, a]; gd.item = real; gd.value = it[2] + rand(it[3] - it[2] + 1);
      setPhase('au-go', 15000, () => GAMES.auction.reveal());
      SND.play('ui_open_002', .5);
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'au-go' || m.a !== 'bid' || !inGame(p) || gd.bids[p.id]) return;
      const v = Math.max(0, Math.min(gd.money[p.id], Math.round(+m.v || 0)));
      gd.bids[p.id] = { v, o: gd.order++ }; SFX.pop(); updateStrip(); this.paint(); sync();
      checkAll(id => gd.bids[id], () => GAMES.auction.reveal());
    },
    isDone(id) { return H.phase === 'au-go' && !!H.gd.bids?.[id]; },
    reveal() {
      const gd = H.gd; if (H.phase !== 'au-go') return;
      const list = gd.ids.filter(id => gd.bids[id] && gd.bids[id].v > 0).sort((a, b) => gd.bids[b].v - gd.bids[a].v || gd.bids[a].o - gd.bids[b].o);
      gd.winner = list[0] || null;
      if (gd.winner) { gd.money[gd.winner] += gd.value - gd.bids[gd.winner].v; gd.money[gd.winner] = Math.max(0, gd.money[gd.winner]); gd.won[gd.winner].push(SUB_ITEMS[gd.item][0]); }
      SND.play(gd.value > 0 ? 'ui_confirmation_001' : 'sf_explosionCrunch_000', .55);
      if (gd.value < 0) shakeScreen(); else if (gd.value >= 40) confetti(70);
      setPhase('au-rev', 5000, () => { if (gd.r >= this.N) this.end(); else this.round(); }, 0, false);
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.money[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.money[b] - gd.money[a]).map(id => ({ id, val: `🪙 ${gd.money[id]} ${gd.won[id].join('')}`, gain: g[id] || 0 }));
      setPhase('au-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'au-go') return { screen: 'auction', key: `au${gd.r}-${gd.bids[p.id] ? 1 : 0}`, r: gd.r, N: this.N, money: gd.money[p.id], hint: gd.hint.map(i => SUB_ITEMS[i][0] + ' ' + SUB_ITEMS[i][1]), bid: gd.bids[p.id] ? gd.bids[p.id].v : null, deadline: H.deadline };
      if (H.phase === 'au-rev') { const w = gd.winner === p.id; return { screen: 'msg', big: w ? (gd.value >= 0 ? '🤑' : '💥') : '👀', title: w ? `¡Te llevaste ${SUB_ITEMS[gd.item][0]} ${SUB_ITEMS[gd.item][1]}!` : 'No te la llevaste', text: `${w ? `Pagaste ${gd.bids[p.id].v} y valía ${gd.value} · ` : ''}Tenés ${gd.money[p.id]} 🪙` }; }
      return watch();
    },
    paint() {
      const gd = H.gd, el = $('#aupl'); if (!el) return; const rev = H.phase === 'au-rev';
      el.innerHTML = gd.ids.slice().sort((a, b) => rev ? ((gd.bids[b]?.v || 0) - (gd.bids[a]?.v || 0)) : gd.money[b] - gd.money[a]).map(id => { const p = pl(id), bd = gd.bids[id]; return `<div class="aup ${rev && id === gd.winner ? 'win' : ''}" style="--c:${p?.color}"><b>${p?.emoji} ${esc(p?.name || '')}</b><span>🪙 ${gd.money[id]}</span><em>${rev ? (bd ? `pujó ${bd.v}` : '—') : bd ? '✅ pujó' : '🤔'}</em></div>`; }).join('');
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'au-res') return `<h1 class="title-pop">🔨 Los mejores negociantes</h1>${resultsList(gd.rows)}`;
      const it = SUB_ITEMS[gd.item], rev = ph === 'au-rev';
      setTimeout(() => { this.paint(); if (window.gsap) { if (rev) { gsap.fromTo('.aubox', { rotation: -8 }, { rotation: 8, yoyo: true, repeat: 5, duration: .07 }); gsap.from('.auitem', { scale: 0, rotation: -90, duration: .6, delay: .45, ease: 'back.out(2)' }); } else gsap.fromTo('.aubox', { y: -6 }, { y: 6, yoyo: true, repeat: -1, duration: .8, ease: 'sine.inOut' }); } }, 30);
      return `<div class="round-lbl">Subasta ${gd.r} de ${this.N}</div><div class="auwrap">
        <div class="austage">${rev ? `<div class="auitem">${it[0]}</div><div class="auval ${gd.value < 0 ? 'neg' : ''}">${it[1]} · vale ${gd.value > 0 ? '+' : ''}${gd.value} 🪙</div>${gd.winner ? `<div class="auwho">🔨 ¡Vendido a ${pl(gd.winner)?.emoji} ${esc(pl(gd.winner)?.name || '')} por ${gd.bids[gd.winner].v}!</div>` : '<div class="auwho">Nadie pujó 🤷</div>'}` : `<img class="aubox" src="assets/dungeon/chest.png" alt=""><div class="auhint">Puede ser <b>${gd.hint.map(i => SUB_ITEMS[i][0] + ' ' + SUB_ITEMS[i][1]).join('</b> o <b>')}</b></div>`}</div>
        <div class="aupl" id="aupl"></div></div>`;
    }
  }
});
