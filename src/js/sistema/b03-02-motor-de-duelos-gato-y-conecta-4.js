/* ---------- motor de duelos (Gato y Conecta 4) ---------- */
function makeDuel(kind) {
  const C4 = kind === 'c4', N = C4 ? 42 : 9, TURN = C4 ? 10000 : 8000;
  const SYM = C4 ? ['', '🔴', '🟡'] : ['', '❌', '⭕'];
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const winOf = cells => {
    if (!C4) { for (const l of LINES) if (cells[l[0]] && cells[l[0]] === cells[l[1]] && cells[l[1]] === cells[l[2]]) return l; return null; }
    for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
      const v = cells[r * 7 + c]; if (!v) continue;
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
        const l = [0, 1, 2, 3].map(k => [r + dr * k, c + dc * k]);
        if (l.every(([rr, cc]) => rr >= 0 && rr < 6 && cc >= 0 && cc < 7 && cells[rr * 7 + cc] === v)) return l.map(([rr, cc]) => rr * 7 + cc);
      }
    }
    return null;
  };
  const valid = cells => C4 ? [0, 1, 2, 3, 4, 5, 6].filter(c => !cells[c]) : cells.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  const place = (cells, mv, who) => { const cl = cells.slice(); if (C4) { for (let r = 5; r >= 0; r--) if (!cl[r * 7 + mv]) { cl[r * 7 + mv] = who; break; } } else cl[mv] = who; return cl; };
  const G = {
    name: C4 ? 'Conecta 4' : 'Gato Relámpago', emoji: C4 ? '🔴' : '❌', color: C4 ? '#ef4444' : '#0ea5e9',
    desc: C4 ? 'Torneo 1 vs 1 en el cel: metan 4 fichas en línea 🔴🟡 antes que su rival. Todos los duelos van al mismo tiempo y se ven en la tele.'
      : 'Torneo 1 vs 1 de Gato (❌ y ⭕) en el cel. ¡Hagan 3 en raya antes que su rival! Tienen poquitos segundos por turno 😱',
    start() {
      const ids = shuffle(onlineIds()), ms = [];
      for (let i = 0; i < ids.length; i += 2) { const a = ids[i], b = ids[i + 1] || 'cpu', first = Math.random() < .5 ? a : b; ms.push({ a, b, cells: new Array(N).fill(0), turn: first, done: false, win: null, line: null, tEnd: Date.now() + TURN + 2500 }); }
      H.gd = { ids, ms };
      setPhase('du-go', C4 ? 130000 : 70000, () => G.end());
      const tok = H.token;
      const iv = setInterval(() => { if (tok !== H.token) return clearInterval(iv); for (const m of H.gd.ms) if (!m.done && m.turn !== 'cpu' && Date.now() > m.tEnd) { const v = valid(m.cells); G.move(m, m.turn, v[rand(v.length)]); } }, 300);
      ms.forEach(m => G.cpu(m));
    },
    mOf: id => H.gd.ms.find(m => m.a === id || m.b === id),
    move(m, id, mv) {
      if (m.done || m.turn !== id || !valid(m.cells).includes(mv)) return;
      const me = id === m.a ? 1 : 2;
      m.cells = place(m.cells, mv, me); SFX.pop();
      const l = winOf(m.cells);
      if (l) { m.done = true; m.win = id; m.line = l; beep(784, .3, 'triangle', .09); beep(1046, .4, 'triangle', .09, .15); }
      else if (!valid(m.cells).length) m.done = true;
      else { m.turn = id === m.a ? m.b : m.a; m.tEnd = Date.now() + TURN; }
      G.paint(); updateStrip(); sync(); G.cpu(m);
      if (H.gd.ms.every(x => x.done)) { const tok = H.token; setTimeout(() => { if (tok === H.token) G.end(); }, 1800); }
    },
    cpu(m) {
      if (m.done || m.turn !== 'cpu') return;
      const tok = H.token;
      setTimeout(() => {
        if (tok !== H.token || m.done || m.turn !== 'cpu') return;
        const v = valid(m.cells), me = m.a === 'cpu' ? 1 : 2, op = 3 - me;
        let pick = v.find(x => winOf(place(m.cells, x, me))) ?? v.find(x => winOf(place(m.cells, x, op)));
        if (pick == null || Math.random() < .25) pick = C4 && v.includes(3) && Math.random() < .4 ? 3 : v[rand(v.length)];
        G.move(m, 'cpu', pick);
      }, 900 + rand(700));
    },
    isDone(id) { const m = H.gd.ms && G.mOf(id); return H.phase === 'du-go' && !!m && m.done; },
    view(p) {
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      const m = G.mOf(p.id); if (!m || H.phase !== 'du-go') return watch();
      const opp = m.a === p.id ? m.b : m.a, oppName = opp === 'cpu' ? '🤖 CPU' : `${pl(opp)?.emoji} ${pl(opp)?.name}`;
      if (m.done) return m.win === p.id ? { screen: 'msg', big: '🏆', title: '¡GANASTE EL DUELO!', text: 'Le ganaste a ' + oppName } : m.win ? { screen: 'msg', big: '😭', title: 'Perdiste…', text: 'Te ganó ' + oppName } : { screen: 'msg', big: '🤝', title: '¡Empate!', text: 'Contra ' + oppName };
      const mine = m.turn === p.id;
      return { screen: 'duelboard', kind, key: 'bd' + H.gd.ms.indexOf(m) + '-' + m.cells.filter(Boolean).length, cells: m.cells, me: m.a === p.id ? 1 : 2, sym: SYM, myTurn: mine, opp: oppName, deadline: mine ? m.tEnd : 0 };
    },
    onAct(p, m) { if (H.phase === 'du-go' && m.a === 'move') { const mt = G.mOf(p.id); if (mt) G.move(mt, p.id, m.i | 0); } },
    duelsHTML() {
      return H.gd.ms.map(m => `<div class="duel ${m.done ? 'over' : ''}">
        <div class="dvs"><span class="${!m.done && m.turn === m.a ? 'on' : ''}">${SYM[1]} ${pname(m.a)}</span> vs <span class="${!m.done && m.turn === m.b ? 'on' : ''}">${SYM[2]} ${pname(m.b)}</span></div>
        <div class="mini ${kind}">${m.cells.map((v, i) => `<div class="${m.line && m.line.includes(i) ? 'w' : ''}">${SYM[v]}</div>`).join('')}</div>
        <div>${m.done ? (m.win ? '🏆 Gana ' + pname(m.win) : '🤝 Empate') : '⏳ Jugando…'}</div></div>`).join('');
    },
    paint() { const d = $('#duels'); if (d) d.innerHTML = G.duelsHTML(); },
    end() {
      if (H.phase !== 'du-go') return;
      const g = {}, res = {};
      for (const m of H.gd.ms) for (const id of [m.a, m.b]) {
        if (id === 'cpu') continue;
        if (m.done && m.win === id) { g[id] = (m.a === 'cpu' || m.b === 'cpu') ? 400 : 500; res[id] = '🏆 Ganó'; }
        else if (m.win) { g[id] = 0; res[id] = '😭 Perdió'; }
        else { g[id] = 250; res[id] = '🤝 Empate'; }
      }
      H.gd.rows = Object.keys(res).sort((a, b) => g[b] - g[a]).map(id => ({ id, val: res[id], gain: g[id] }));
      setPhase('du-res', 5500, () => finishGame(g), 0, false); SFX.win(); confetti(70);
    },
    render(ph) {
      if (ph === 'du-go') return `<h1 class="title-pop">${G.emoji} ¡A DUELAR! ${G.emoji}</h1><p class="sub">📱 Jueguen en el cel — los duelos van en vivo aquí</p><div class="duels" id="duels">${G.duelsHTML()}</div>`;
      return `<h1 class="title-pop">${G.emoji} Resultados del torneo</h1><div class="duels">${G.duelsHTML()}</div>${resultsList(H.gd.rows)}`;
    }
  };
  return G;
}
