Object.assign(GAMES, {
  /* ✋ BASTA */
  basta: {
    name: '¡Basta!', emoji: '✋', color: '#f59e0b',
    desc: 'Sale una letra y tienen que llenar todo con palabras que empiecen con ella (nombre, animal, comida…). El primero que llene todo grita ¡BASTA! y a los demás les quedan 6 segundos 😱',
    start() {
      const ids = onlineIds(), letter = BASTA_LETTERS[rand(BASTA_LETTERS.length)], cats = shuffle(BASTA_CATS.slice(2)).slice(0, 3);
      H.gd = { ids, letter, cats: ['Nombre', 'Animal', ...cats], ans: {}, sid: rid(), cutBy: null, end: Date.now() + 90000 };
      setPhase('b-write', 90000, () => GAMES.basta.score(), 2000);
    },
    isDone(id) { return (H.phase === 'b-write' || H.phase === 'b-stop') && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'b-write' || H.phase === 'b-stop') return gd.ans[p.id] ? done('¡Respuestas enviadas! ✋') : { screen: 'form', key: 'bf' + gd.sid, letter: gd.letter, cats: gd.cats, deadline: gd.end };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (!['b-write', 'b-stop'].includes(H.phase) || m.a !== 'basta' || !inGame(p) || gd.ans[p.id] || !Array.isArray(m.ans)) return;
      gd.ans[p.id] = gd.cats.map((_, i) => clean(m.ans[i], 24));
      SFX.pop();
      if (H.phase === 'b-write' && gd.ans[p.id].every(Boolean)) {
        gd.cutBy = p.id; beep(300, .4, 'sawtooth', .09); shakeScreen();
        for (const id of gd.ids) { const q = pl(id); if (q?.online && q.conn && !gd.ans[id]) try { q.conn.send({ t: 'cut', ms: 6000, by: p.name }); } catch (e) {} }
        setPhase('b-stop', 6000, () => GAMES.basta.score(), 2000);
      }
      checkAll(id => gd.ans[id] != null, () => GAMES.basta.score());
    },
    score() {
      if (!['b-write', 'b-stop'].includes(H.phase)) return;
      const gd = H.gd, L = norm(gd.letter);
      gd.tab = {}; gd.tot = {};
      gd.ids.forEach(id => { gd.tab[id] = []; gd.tot[id] = 0; });
      gd.cats.forEach((_, c) => {
        const ok = {}, count = {};
        gd.ids.forEach(id => { const a = norm((gd.ans[id] || [])[c] || ''); ok[id] = a.length >= 2 && a[0] === L ? a : null; if (ok[id]) count[ok[id]] = (count[ok[id]] || 0) + 1; });
        gd.ids.forEach(id => { const a = (gd.ans[id] || [])[c] || ''; const k = ok[id]; const pts = !k ? 0 : count[k] > 1 ? 50 : 100; gd.tab[id].push({ a, pts }); gd.tot[id] += pts; });
      });
      setPhase('b-res', 6000 + gd.ids.length * 900, () => finishGame(gd.tot), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'b-write') return `<div class="bigletter title-pop">${gd.letter}</div><div class="cats">${gd.cats.map(c => `<span>${esc(c)}</span>`).join('')}</div><p class="sub">📱 ¡Llenen todo con la letra <b>${gd.letter}</b>! El primero que termine grita ¡BASTA! ✋</p>`;
      if (ph === 'b-stop') return `<h1 class="title-pop wiggle">✋ ¡BASTA!</h1><h2>Lo gritó ${who(gd.cutBy)}</h2><p class="sub">Les quedan segunditos… ⏳</p><div class="bigletter">${gd.letter}</div>`;
      return `<h2 class="title-pop">✋ Letra <span style="color:var(--yellow)">${gd.letter}</span> · 🟩 única = 100 · 🟨 repetida = 50 · 🟥 = 0</h2>
        <div style="overflow-x:auto;max-width:100%"><table class="btab"><tr><th></th>${gd.cats.map(c => `<th>${esc(c)}</th>`).join('')}<th>Total</th></tr>
        ${gd.ids.slice().sort((a, b) => gd.tot[b] - gd.tot[a]).map((id, i) => `<tr class="pop" style="animation-delay:${i * .25}s"><td>${who(id)}</td>${gd.tab[id].map(x => `<td class="${x.pts === 100 ? 'u' : x.pts === 50 ? 'r' : 'x'}">${esc(x.a) || '—'}</td>`).join('')}<td class="tot">+${gd.tot[id]}</td></tr>`).join('')}</table></div>`;
    }
  }
});
