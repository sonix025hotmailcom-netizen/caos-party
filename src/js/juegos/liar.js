Object.assign(GAMES, {
  /* 🤥 EL MENTIROSO */
  liar: {
    name: 'El Mentiroso', emoji: '🤥', color: '#f97316', desc: 'Les sale un dato REAL incompleto. Inventen una respuesta falsa para engañar a los demás… y después encuentren la verdad.',
    start() { const ids = onlineIds(); H.gd = { ids, fact: pickU(FACTS, 'f'), lies: {} }; setPhase('l-write', 50000, () => GAMES.liar.toPick(), 1500); },
    isDone(id) { const gd = H.gd; if (H.phase === 'l-write') return gd.lies[id] != null; if (H.phase === 'l-pick') return gd.picks[id] != null; return false; },
    isTruth(t) {
      const f = H.gd.fact, n = norm(t), st = s => s.replace(/(es|s)$/, '');
      return [f.a, ...(f.alt || [])].map(norm).some(c => n === c || st(n) === st(c) || (c.length > 3 && n.includes(c) && n.length <= c.length + 6));
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'l-write') return gd.lies[p.id] != null ? done('¡Mentira enviada! 😈') : { screen: 'write', key: 'lw' + H.token, prompt: gd.fact.q, hint: '😈 Inventá una respuesta FALSA que suene real', deadline: H.deadline, max: 40 };
      if (H.phase === 'l-pick') {
        if (gd.picks[p.id] != null) return done('¡Elegiste! 🤞');
        return { screen: 'choose', key: 'lp' + H.token, title: '¿Cuál es la VERDAD? 🤔', deadline: H.deadline, options: gd.opts.map((o, i) => ({ id: String(i), label: o.text, own: o.authors.includes(p.id) })).filter(o => !o.own).map(({ id, label }) => ({ id, label })) };
      }
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd; if (!inGame(p)) return;
      if (H.phase === 'l-write' && m.a === 'text' && gd.lies[p.id] == null) {
        const t = clean(m.text, 40); if (!t) return;
        if (this.isTruth(t)) { try { p.conn.send({ t: 'toast', text: '😱 ¡Esa es la respuesta REAL! Inventá otra.' }); } catch (e) {} return; }
        gd.lies[p.id] = t; SFX.pop(); checkAll(id => gd.lies[id] != null, () => GAMES.liar.toPick());
      }
      if (H.phase === 'l-pick' && m.a === 'choose' && gd.picks[p.id] == null) {
        const i = parseInt(m.id, 10), o = gd.opts[i];
        if (!o || o.authors.includes(p.id)) return;
        gd.picks[p.id] = i; SFX.pop(); checkAll(id => gd.picks[id] != null, () => GAMES.liar.reveal());
      }
    },
    toPick() {
      if (H.phase !== 'l-write') return;
      const gd = H.gd, map = new Map();
      for (const [pid, t] of Object.entries(gd.lies)) { const k = norm(t); if (!map.has(k)) map.set(k, { text: t, authors: [], truth: false }); map.get(k).authors.push(pid); }
      gd.opts = shuffle([...map.values(), { text: cap(gd.fact.a), authors: [], truth: true }]);
      gd.picks = {};
      setPhase('l-pick', 30000, () => GAMES.liar.reveal(), 1500);
    },
    reveal() {
      if (H.phase !== 'l-pick') return;
      const gd = H.gd, g = {};
      gd.opts.forEach(o => o.pickers = []);
      for (const [pid, i] of Object.entries(gd.picks)) {
        const o = gd.opts[i]; o.pickers.push(pid);
        if (o.truth) g[pid] = (g[pid] || 0) + 300;
        else o.authors.forEach(a => { if (a !== pid) g[a] = (g[a] || 0) + 150; });
      }
      gd.order = gd.opts.filter(o => !o.truth).sort((a, b) => a.pickers.length - b.pickers.length).concat(gd.opts.filter(o => o.truth));
      setPhase('l-reveal', 4500 + gd.opts.length * 1200, () => finishGame(g), 0, false);
    },
    render(ph) {
      const gd = H.gd, q = esc(gd.fact.q).replace('___', '<span class="blank">???</span>');
      if (ph === 'l-write') return `<div class="prompt-card">${q}</div><p class="sub float">😈 Inventen en el cel una respuesta FALSA que suene real</p>`;
      if (ph === 'l-pick') return `<div class="prompt-card" style="font-size:clamp(20px,3vw,34px)">${q}</div><div class="agrid">${gd.opts.map((o, i) => `<div class="acard" style="--a:${i * .12}s"><span class="num">${i + 1}</span><div class="atext">${esc(o.text)}</div></div>`).join('')}</div><p class="sub">🤔 ¿Cuál es la verdad? Elijan en el cel</p>`;
      return `<div class="prompt-card" style="font-size:clamp(20px,3vw,34px)">${q}</div><div class="agrid">${gd.order.map((o, i) => `<div class="acard ${o.truth ? 'truth win' : ''}" style="--a:${i * .1}s;--d:${(i * 1.1 + .3).toFixed(1)}s;--w:${(i * 1.1 + .5).toFixed(1)}s;--c:${o.truth ? '#15803d' : '#f97316'}">
        <div class="atext">${esc(o.text)}</div>
        <div class="aauth" style="flex-direction:column;align-items:flex-start">${o.truth ? '<span>✅ ¡LA VERDAD!</span>' : `<span>🤥 Mentira de: ${o.authors.map(who).join(', ')}</span>`}<span>${o.truth ? 'Acertaron' : 'Cayeron'}: ${o.pickers.length ? o.pickers.map(id => pl(id)?.emoji || '👻').join(' ') : 'nadie 🤷'}</span></div></div>`).join('')}</div>`;
    }
  }
});
