Object.assign(GAMES, {
  /* 🏳️ BANDERAS DEL MUNDO */
  flags: {
    name: 'Banderas del Mundo', emoji: '🏳️', color: '#0284c7', N: 7,
    desc: 'Sale una bandera en la tele 🌍. ¿De qué país es? Respondan en el cel: entre más rápido, más puntos. 7 banderas.',
    start() { const ids = onlineIds(); H.gd = { ids, i: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])) }; this.next(); },
    next() {
      const gd = H.gd; gd.i++;
      const code = pickU(FLAG_CODES, 'fl'), wrong = shuffle(FLAG_CODES.filter(c => c !== code)).slice(0, 3);
      IMG('flags/' + code + '.png');
      gd.q = { code, o: [COUNTRIES[code], ...wrong.map(c => COUNTRIES[c])] }; gd.ord = shuffle([0, 1, 2, 3]); gd.ans = {}; gd.t0 = Date.now();
      setPhase('fl-q', 12000, () => GAMES.flags.reveal(), 600);
      if (window.gsap) try { gsap.from('.flagbig', { rotationY: 90, scale: .4, duration: .8, ease: 'back.out(2)' }); } catch (e) {}
    },
    isDone(id) { return H.phase === 'fl-q' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'fl-q') return gd.ans[p.id] ? done('¡Respuesta enviada! 🤞') : { screen: 'quiz', key: 'fl' + H.token, title: '🏳️ ¿De qué país es la bandera de la tele?', opts: gd.ord.map(j => gd.q.o[j]), deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'fl-q' || m.a !== 'quiz' || !inGame(p) || gd.ans[p.id]) return;
      const i = m.i | 0, ok = gd.ord[i] === 0; gd.ans[p.id] = { i, ok };
      if (ok) { gd.ok[p.id]++; gd.pts[p.id] += 100 + Math.max(0, Math.round(120 * (1 - (Date.now() - gd.t0) / 12000))); }
      SFX.pop(); checkAll(id => gd.ans[id] != null, () => GAMES.flags.reveal());
    },
    reveal() { if (H.phase !== 'fl-q') return; const gd = H.gd; setPhase('fl-a', 3000, () => gd.i < GAMES.flags.N ? GAMES.flags.next() : GAMES.flags.end(), 0, false); SFX.win(); },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true, id => gd.pts[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `${gd.ok[id]}/${GAMES.flags.N} bien`, gain: g[id] || 0 }));
      setPhase('fl-res', 5500, () => finishGame(g), 0, false); confetti(70);
    },
    render(ph) {
      const gd = H.gd, L = ['A', 'B', 'C', 'D'], CC = ['#3b82f6', '#ff4d8d', '#22c55e', '#f59e0b'];
      if (ph === 'fl-res') return `<h1 class="title-pop">🌍 Los trotamundos</h1>${resultsList(gd.rows)}`;
      const rv = ph === 'fl-a';
      return `<div class="round-lbl">🏳️ Bandera ${gd.i} de ${this.N}</div><div class="flagwrap"><img class="flagbig" src="assets/flags/${gd.q.code}.png" alt=""></div>
        <div class="qgrid">${gd.ord.map((j, i) => `<div class="qopt ${rv ? (j === 0 ? 'right' : 'wrong') : ''}" style="--c:${CC[i]}"><b>${L[i]}</b><span>${esc(gd.q.o[j])}</span><em>${rv ? gd.ids.filter(id => gd.ans[id] && gd.ans[id].i === i).map(id => pl(id)?.emoji).join('') : ''}</em></div>`).join('')}</div>`;
    }
  }
});
