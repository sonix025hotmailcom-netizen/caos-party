/* ---------- ✋ BASTA: los jugadores juzgan las palabras ---------- */
(() => {
  const B = GAMES.basta, oView = B.view, oAct = B.onAct, oRender = B.render, oDone = B.isDone;
  B.desc = 'Sale una letra y llenan nombre, animal y más. El primero que termina grita ¡BASTA! Después TODOS juzgan las palabras de los demás 👎 para que nadie haga trampa.';
  B.score = function () {
    if (!['b-write', 'b-stop'].includes(H.phase)) return;
    const gd = H.gd, L = norm(gd.letter); gd.items = []; gd.jv = {};
    gd.ids.forEach(id => gd.cats.forEach((_, c) => { const a = clean((gd.ans[id] || [])[c] || '', 24); if (a) { const n = norm(a); gd.items.push({ i: gd.items.length, id, c, a, letterOk: n.length >= 2 && n[0] === L }); } }));
    if (!gd.items.some(x => x.letterOk)) return B.finalScore();
    setPhase('b-judge', 50000, () => GAMES.basta.finalScore(), 1500);
  };
  B.judgeItems = id => H.gd.items.filter(x => x.id !== id && x.letterOk).map(x => ({ i: x.i, c: x.c, a: x.a }));
  B.isDone = id => H.phase === 'b-judge' ? H.gd.jv[id] != null : oDone(id);
  B.view = function (p) {
    const gd = H.gd;
    if (H.phase === 'b-judge') {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (gd.jv[p.id]) return done('¡Veredicto enviado! ⚖️');
      const its = B.judgeItems(p.id);
      if (!its.length) return done('No hay palabras para juzgar 😅');
      return { screen: 'judge', key: 'bj' + H.token, letter: gd.letter, cats: gd.cats, items: its, deadline: H.deadline };
    }
    return oView.call(B, p);
  };
  B.onAct = function (p, m) {
    const gd = H.gd;
    if (H.phase === 'b-judge') {
      if (m.a !== 'judge' || !inGame(p) || gd.jv[p.id] || !Array.isArray(m.rej)) return;
      const allowed = new Set(B.judgeItems(p.id).map(x => x.i));
      gd.jv[p.id] = m.rej.map(x => x | 0).filter(x => allowed.has(x)); SFX.pop();
      checkAll(id => gd.jv[id] != null || !B.judgeItems(id).length, () => GAMES.basta.finalScore());
      return;
    }
    return oAct.call(B, p, m);
  };
  B.finalScore = function () {
    if (!['b-write', 'b-stop', 'b-judge'].includes(H.phase)) return;
    const gd = H.gd;
    gd.items.forEach(x => {
      const voters = Object.keys(gd.jv).filter(v => v !== x.id), no = voters.filter(v => gd.jv[v].includes(x.i)).length;
      x.no = no; x.valid = x.letterOk && !(voters.length && no * 2 > voters.length);
    });
    gd.tab = {}; gd.tot = {};
    gd.ids.forEach(id => { gd.tot[id] = 0; gd.tab[id] = gd.cats.map((_, c) => {
      const x = gd.items.find(y => y.id === id && y.c === c);
      if (!x) return { a: '', pts: 0 };
      const rep = x.valid && gd.items.some(y => y !== x && y.c === c && y.valid && close(y.a, x.a));
      const pts = !x.valid ? 0 : rep ? 50 : 100; gd.tot[id] += pts;
      return { a: x.a, pts, no: x.no, why: !x.letterOk ? '🔤' : !x.valid ? '👎' : '' };
    }); });
    setPhase('b-res', 6000 + gd.ids.length * 900, () => finishGame(gd.tot), 0, false); SFX.win();
  };
  B.render = function (ph) {
    const gd = H.gd;
    if (ph === 'b-judge') return `<h1 class="title-pop">⚖️ ¡A JUZGAR!</h1><div class="bigletter" style="font-size:clamp(80px,14vw,150px)">${gd.letter}</div><p class="sub">📱 En su cel, marquen 👎 las palabras inventadas, mal escritas o que no son de la categoría.<br>Si la mayoría dice 👎, esa palabra vale 0.</p>`;
    if (ph === 'b-res') return `<h2 class="title-pop">✋ Letra <span style="color:var(--yellow)">${gd.letter}</span> · 🟩 única 100 · 🟨 repetida 50 · 🟥 0 (👎 = rechazada por los jueces)</h2>
      <div style="overflow-x:auto;max-width:100%"><table class="btab"><tr><th></th>${gd.cats.map(c => `<th>${esc(c)}</th>`).join('')}<th>Total</th></tr>
      ${gd.ids.slice().sort((a, b) => gd.tot[b] - gd.tot[a]).map((id, i) => `<tr class="pop" style="animation-delay:${i * .25}s"><td>${who(id)}</td>${gd.tab[id].map(x => `<td class="${x.pts === 100 ? 'u' : x.pts === 50 ? 'r' : 'x'}">${esc(x.a) || '—'}${x.why ? ' ' + x.why : ''}${x.no ? ` <small>👎${x.no}</small>` : ''}</td>`).join('')}<td class="tot">+${gd.tot[id]}</td></tr>`).join('')}</table></div>`;
    return oRender.call(B, ph);
  };
})();
