Object.assign(GAMES, {
  /* 🎨 COLORES LOCOS */
  stroop: {
    name: 'Colores Locos', emoji: '🌈', color: '#f472b6',
    desc: 'En la tele sale una palabra de un color, pero pintada de OTRO color 🤯. Toquen en el cel el COLOR de la letra, no lo que dice… y ojo que la regla puede cambiar 😈',
    N: 9,
    start() { const ids = onlineIds(); H.gd = { ids, i: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])) }; this.next(); },
    next() {
      const gd = H.gd; gd.i++;
      const w = rand(6); let ink = rand(6); while (ink === w) ink = rand(6);
      gd.cur = { w, ink, rule: gd.i > 6 ? 'word' : 'ink', t0: Date.now() }; gd.ans = {};
      setPhase('st-go', 3800, () => GAMES.stroop.reveal(), 400);
      A({ targets: '.stw', scale: [0, 1], rotate: [window.anime ? anime.random(-25, 25) : 0, 0], duration: 600, easing: 'easeOutElastic(1,.6)' });
    },
    isDone(id) { return H.phase === 'st-go' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'st-go') return gd.ans[p.id] != null ? { screen: 'msg', big: gd.ans[p.id] ? '✅' : '❌', title: gd.ans[p.id] ? '¡Bien!' : '¡Fallaste!', text: 'Esperá la siguiente…' } : { screen: 'colors', key: 'st' + H.token, title: gd.cur.rule === 'ink' ? '🎨 ¿De qué COLOR está la palabra?' : '🔄 ¡CAMBIO! ¿Qué palabra DICE?', deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'st-go' || m.a !== 'color' || !inGame(p) || gd.ans[p.id] != null) return;
      const right = gd.cur.rule === 'ink' ? gd.cur.ink : gd.cur.w, ok = (m.c | 0) === right;
      gd.ans[p.id] = ok;
      if (ok) { gd.ok[p.id]++; gd.pts[p.id] += 100 + Math.max(0, Math.round(80 * (1 - (Date.now() - gd.cur.t0) / 3800))); SFX.pop(); } else SFX.bad();
      checkAll(id => gd.ans[id] != null, () => GAMES.stroop.reveal());
    },
    reveal() { if (H.phase !== 'st-go') return; const gd = H.gd; setPhase('st-ans', 1500, () => gd.i < this.N ? this.next() : this.end(), 0, false); },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true, id => gd.pts[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `${gd.ok[id]}/${this.N} bien`, gain: g[id] || 0 }));
      setPhase('st-res', 5500, () => finishGame(g), 0, false); confetti(70); SFX.win();
    },
    render(ph) {
      const gd = H.gd, c = gd.cur;
      if (ph === 'st-res') return `<h1 class="title-pop">🌈 Los cerebros más rápidos</h1>${resultsList(gd.rows)}`;
      const word = `<div class="stw" style="color:${SC[c.ink][1]}">${SC[c.w][0]}</div>`;
      const rule = c.rule === 'ink' ? '<div class="rulebox">🎨 Toquen el <b>COLOR</b> de la letra</div>' : '<div class="rulebox flip">🔄 ¡CAMBIO DE REGLA! Toquen lo que <b>DICE</b></div>';
      if (ph === 'st-go') return `<div class="round-lbl">${gd.i} / ${this.N}</div>${rule}${word}`;
      const right = c.rule === 'ink' ? c.ink : c.w;
      return `<div class="round-lbl">${gd.i} / ${this.N}</div>${word}<h2>Era: <span style="color:${SC[right][1]}">${SC[right][0]}</span></h2><div class="avgrid">${gd.ids.map(id => `<div class="av" style="--c:${gd.ans[id] ? '#16a34a' : '#7f1d1d'}"><span class="ae">${pl(id)?.emoji}</span>${gd.ans[id] ? '✅' : gd.ans[id] === false ? '❌' : '😴'}</div>`).join('')}</div>`;
    }
  }
});
