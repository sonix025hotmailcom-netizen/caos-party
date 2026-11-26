Object.assign(GAMES, {
  /* =================================================================== */
  /* 🁫 DOMINÓ VELOZ                                                       */
  /* =================================================================== */
  domino: {
    name: 'Dominó Veloz', emoji: '🁫', color: '#334155',
    desc: '¡Dominó sin turnos! 🁫 Todos juegan al mismo tiempo: tocá en tu cel una ficha que pegue con una de las dos puntas de la mesa. El más rápido la pone. Si no tenés, robá. Gana el primero que se quede sin fichas (o el que tenga menos al final).',
    start() {
      const ids = onlineIds(), n = ids.length, st = pickR(DOM_STYLES);
      const all = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) all.push([a, b]);
      const pile = shuffle(all), per = n <= 3 ? 7 : n <= 4 ? 6 : n <= 6 ? 4 : 3;
      const first = pile.findIndex(t => t[0] === t[1]); const start = pile.splice(first >= 0 ? first : 0, 1)[0];
      const hand = {}; ids.forEach(id => hand[id] = pile.splice(0, per));
      all.forEach(([a, b]) => IMG(domSrc(st, a, b).replace('assets/', '')));
      H.gd = { ids, st, pile, hand, chain: [[start[0], start[1]]], L: start[0], R: start[1], drawn: Object.fromEntries(ids.map(i => [i, 0])), played: Object.fromEntries(ids.map(i => [i, 0])), last: null, stuck: 0, lastAct: Date.now() };
      setPhase('dm-go', 80000, () => GAMES.domino.end());
      SND.play('impactWood_medium_000', .5);
      this.tick();
    },
    tick() {
      const gd = H.gd, tok = H.token;
      const iv = setInterval(() => {
        if (tok !== H.token || H.phase !== 'dm-go') return clearInterval(iv);
        /* si nadie puede jugar y no quedan fichas para robar, se tranca */
        const can = gd.ids.some(id => gd.hand[id].some(t => this.fits(t)));
        if (!can && !gd.pile.length) { clearInterval(iv); gd.locked = true; toastHost('🔒 ¡Se trancó el juego!'); setTimeout(() => this.end(), 1500); }
      }, 1000);
    },
    fits(t) { const gd = H.gd; return t[0] === gd.L || t[1] === gd.L || t[0] === gd.R || t[1] === gd.R; },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'dm-go' || !inGame(p)) return;
      const h = gd.hand[p.id]; if (!h) return;
      if (m.a === 'draw') {
        if (!gd.pile.length) return liveTo(p, { kind: 'toast', text: 'Ya no quedan fichas para robar 🫥' });
        if (h.some(t => this.fits(t))) return liveTo(p, { kind: 'toast', text: '¡Tenés una que pega! 👀 Jugala' });
        h.push(gd.pile.shift()); gd.drawn[p.id]++; SND.play('ui_drop_002', .4); this.paint(); sync(); return;
      }
      if (m.a !== 'play') return;
      const i = m.i | 0, t = h[i]; if (!t) return;
      const side = m.side;
      const okL = t[0] === gd.L || t[1] === gd.L, okR = t[0] === gd.R || t[1] === gd.R;
      if (!okL && !okR) { liveTo(p, { kind: 'toast', text: '¡Te ganaron la punta! 😅 Esa ya no pega' }); SFX.bad(); sync(); return; }
      const useL = side === 'L' ? okL : side === 'R' ? !okR : okL && !okR ? true : okR && !okL ? false : Math.random() < .5;
      h.splice(i, 1); gd.played[p.id]++;
      if (useL) { const l = t[0] === gd.L ? t[1] : t[0]; gd.chain.unshift([l, gd.L]); gd.L = l; gd.last = { side: 'L', id: p.id }; }
      else { const r = t[0] === gd.R ? t[1] : t[0]; gd.chain.push([gd.R, r]); gd.R = r; gd.last = { side: 'R', id: p.id }; }
      SND.play(['impactPlate_light_000', 'impactWood_medium_000'], .6, 1.1 + Math.random() * .2);
      this.paint(true); sync(); updateStrip();
      if (!h.length) { SND.voice('winner'); confetti(120); gd.winner = p.id; setTimeout(() => this.end(), 1200); }
    },
    isDone(id) { return false; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase !== 'dm-go') return watch();
      const h = gd.hand[p.id] || [];
      return { screen: 'domino', key: `dm${gd.L}-${gd.R}-${h.map(t => t.join('')).join('.')}-${gd.pile.length}`, st: gd.st, L: gd.L, R: gd.R, hand: h, pile: gd.pile.length, fits: h.map(t => [t[0] === gd.L || t[1] === gd.L, t[0] === gd.R || t[1] === gd.R]), deadline: H.deadline };
    },
    paint(anim) {
      const gd = H.gd, el = $('#dmchain'); if (!el) return;
      /* la fila de fichas se dobla en "serpiente" en vez de achicarse: así las fichas se ven grandes */
      const wrap = el.parentElement, cap = Math.max(4, Math.floor((wrap.clientWidth - 40) / 124)), N = gd.chain.length, rows = [];
      const isNew = k => anim && gd.last && ((gd.last.side === 'L' && k === 0) || (gd.last.side === 'R' && k === N - 1));
      for (let i = 0; i * cap < N; i++) { const part = gd.chain.slice(i * cap, (i + 1) * cap).map(([l, r], q) => ({ l, r, k: i * cap + q })); rows.push(`<div class="dmrow${i % 2 ? ' rev' : ''}">${(i % 2 ? part.reverse().map(t => domFlat(gd.st, t.r, t.l, isNew(t.k) ? 'new' : '')) : part.map(t => domFlat(gd.st, t.l, t.r, isNew(t.k) ? 'new' : ''))).join('')}</div>`); }
      el.innerHTML = rows.join(''); const sc = Math.min(1, (wrap.clientHeight - 30) / Math.max(1, el.scrollHeight)); el.style.transform = `scale(${Math.max(.45, sc)})`;
      const nw = el.querySelector('.new'); if (nw && window.gsap) gsap.from(nw, { scale: 2.2, y: -80, rotation: gd.last.side === 'L' ? -40 : 40, opacity: 0, duration: .45, ease: 'back.out(1.8)' });
      const lp = $('#dmL'), rp = $('#dmR'); if (lp) lp.textContent = gd.L; if (rp) rp.textContent = gd.R;
      const pc = $('#dmpile'); if (pc) pc.textContent = gd.pile.length;
      const ps = $('#dmps'); if (ps) ps.innerHTML = gd.ids.slice().sort((a, b) => gd.hand[a].length - gd.hand[b].length).map(id => { const p = pl(id), n = gd.hand[id].length; return `<div class="dmp ${gd.last && gd.last.id === id && anim ? 'just' : ''}" style="--c:${p?.color}"><b>${p?.emoji} ${esc(p?.name || '')}</b><span class="dmbacks">${'<i></i>'.repeat(Math.min(n, 9))}</span><em>${n}</em></div>`; }).join('');
    },
    end() {
      const gd = H.gd; if (H.phase !== 'dm-go') return;
      const pips = id => gd.hand[id].reduce((s, t) => s + t[0] + t[1], 0), sc = id => (id === gd.winner ? 1000 : 0) - gd.hand[id].length * 50 - pips(id) + gd.played[id] * 3;
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: id === gd.winner ? '🏆 ¡Se quedó sin fichas!' : `🁫 ${gd.hand[id].length} fichas (${pips(id)} puntos)`, gain: g[id] || 0 }));
      setPhase('dm-res', 5500, () => finishGame(g), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'dm-res') return `<h1 class="title-pop">🁫 ${gd.locked ? '¡Tranque!' : 'Los reyes del dominó'}</h1>${resultsList(gd.rows)}`;
      setTimeout(() => this.paint(), 30);
      return `<div class="dmtop"><span class="dmend">⬅ <b id="dmL">${gd.L}</b></span><span class="dmpile">🁫 Para robar: <b id="dmpile">${gd.pile.length}</b></span><span class="dmend"><b id="dmR">${gd.R}</b> ➡</span></div>
        <div class="dmtable"><div class="dmchain" id="dmchain"></div></div><div class="dmps" id="dmps"></div>
        <p class="sub">¡Sin turnos! Todos juegan a la vez desde el cel · Gana el primero que se quede sin fichas</p>`;
    }
  }
});
