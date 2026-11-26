Object.assign(GAMES, {
  /* 🧠 MEMORIA FLASH */
  simon: {
    name: 'Memoria Flash', emoji: '🧠', color: '#22c55e',
    desc: 'La tele muestra una secuencia de colores 🟩🟥🟨🟦. Repítanla en el cel. Cada ronda es más larga… ¡el que se equivoque queda fuera!',
    start() { const ids = onlineIds(); H.gd = { ids, alive: ids.slice(), len: 3, round: 0, outR: {} }; this.next(); },
    next() {
      const gd = H.gd; gd.round++; gd.seq = Array.from({ length: gd.len }, () => rand(4)); gd.ans = {};
      setPhase('s-show', 1000 + gd.len * 650 + 400, () => GAMES.simon.input(), 0, false);
      const tok = H.token;
      gd.seq.forEach((c, i) => setTimeout(() => { if (tok !== H.token) return; const el = $('#sp' + c); if (!el) return; el.classList.add('on'); beep(SIMON[c].f, .35, 'triangle', .1); A({ targets: el, scale: [1, 1.12, 1], duration: 380, easing: 'easeOutQuad' }); setTimeout(() => el.classList.remove('on'), 400); }, 1000 + i * 650));
    },
    input() { setPhase('s-in', 4000 + H.gd.len * 900, () => GAMES.simon.check(), 1000); },
    isDone(id) { return H.phase === 's-in' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (!gd.alive.includes(p.id)) return { screen: 'msg', big: '😵', title: 'Quedaste fuera', text: `Aguantaste ${gd.outR[p.id] - 1} ronda(s). ¡Mirá la tele!` };
      if (H.phase === 's-show') return { screen: 'msg', big: '👀', title: '¡Mirá la tele!', text: `Memorizá la secuencia (${gd.len} colores)` };
      if (H.phase === 's-in') return gd.ans[p.id] != null ? done('¡Enviado! 🤞') : { screen: 'simon', key: 'si' + H.token, len: gd.len, deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 's-in' || m.a !== 'seq' || !gd.alive.includes(p.id) || gd.ans[p.id] != null || !Array.isArray(m.s)) return;
      gd.ans[p.id] = m.s.length === gd.len && m.s.every((c, i) => c === gd.seq[i]);
      SFX.pop(); checkAll(id => !gd.alive.includes(id) || gd.ans[id] != null, () => GAMES.simon.check());
    },
    check() {
      if (H.phase !== 's-in') return;
      const gd = H.gd, ok = gd.alive.filter(id => gd.ans[id] === true), bad = gd.alive.filter(id => gd.ans[id] !== true);
      gd.ok = ok; gd.bad = bad;
      gd.over = ok.length <= 1 || gd.round >= 8;
      if (ok.length) { bad.forEach(id => gd.outR[id] = gd.round); gd.alive = ok; }
      if (bad.length) SFX.bad(); else SFX.win();
      setPhase('s-res', 3500, () => gd.over ? GAMES.simon.end() : (gd.len++, GAMES.simon.next()), 0, false);
    },
    end() {
      const gd = H.gd, sc = id => gd.alive.includes(id) ? 100 : (gd.outR[id] || 0);
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.alive.includes(id) ? '🧠 ¡Cerebro de acero!' : `Fuera en ronda ${gd.outR[id]}`, gain: g[id] || 0 }));
      setPhase('s-end', 5500, () => finishGame(g), 0, false); confetti(80);
    },
    render(ph) {
      const gd = H.gd;
      const pads = (on) => `<div class="spads hpads">${SIMON.map((s, i) => `<div class="spad ${on ? 'on' : ''}" id="sp${i}" style="background:${s.c};--c:${s.c};display:flex;align-items:center;justify-content:center">${s.s}</div>`).join('')}</div>`;
      if (ph === 's-show') return `<div class="round-lbl">Ronda ${gd.round} · ${gd.len} colores</div><h2 class="title-pop">👀 ¡MEMORICEN!</h2>${pads(false)}`;
      if (ph === 's-in') return `<div class="round-lbl">Ronda ${gd.round}</div><h2 class="title-pop">📱 ¡Repitan la secuencia en el cel!</h2>${pads(false)}`;
      if (ph === 's-res') return `<h2 class="title-pop">${gd.bad.length ? '❌ ¡Algunos se equivocaron!' : '✅ ¡Todos acertaron!'}</h2>
        <div class="avgrid">${gd.ok.map(id => `<div class="av pop" style="--c:#16a34a"><span class="ae">${pl(id)?.emoji}</span>${esc(pl(id)?.name || '')}<span>✅</span></div>`).join('')}${gd.bad.map(id => `<div class="av pop" style="--c:#b91c1c"><span class="ae">${pl(id)?.emoji}</span>${esc(pl(id)?.name || '')}<span>${gd.ok.length ? '❌ Fuera' : '❌'}</span></div>`).join('')}</div>
        <p class="sub">${gd.over ? '🏁 ¡Se acabó!' : '⬆️ Próxima ronda: +1 color'}</p>`;
      return `<h1 class="title-pop">🧠 Las mejores memorias</h1>${resultsList(gd.rows)}`;
    }
  }
});
