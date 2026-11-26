Object.assign(GAMES, {
  /* 🔍 ¿QUÉ ES ESO? (zoom) */
  zoom: {
    name: '¿Qué Es Eso?', emoji: '🔎', color: '#0d9488', N: 5,
    desc: 'En la tele sale algo SÚPER de cerca 🔍 y se va alejando poco a poco. ¡Adivinen qué es en el cel! Entre más rápido, más puntos.',
    start() { const ids = onlineIds(); H.gd = { ids, i: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])) }; this.next(); },
    next() {
      const gd = H.gd; gd.i++;
      const it = pickU(ZOOMS, 'zm'), wrong = shuffle(ZOOMS.filter(z => z !== it)).slice(0, 3);
      gd.q = { e: it[0], o: [it[1], ...wrong.map(w => w[1])] }; gd.ord = shuffle([0, 1, 2, 3]); gd.ans = {}; gd.t0 = Date.now();
      gd.ox = 25 + rand(50); gd.oy = 25 + rand(50);
      setPhase('zm-go', 14000, () => GAMES.zoom.reveal(), 500);
      setTimeout(() => {
        const z = $('#zemo'); if (!z) return;
        if (window.gsap) gsap.fromTo(z, { scale: 16, filter: 'blur(6px)' }, { scale: 1, filter: 'blur(0px)', duration: 13.5, ease: 'power2.in' });
        else { z.style.transition = 'transform 13.5s cubic-bezier(.55,0,1,.45), filter 13.5s'; requestAnimationFrame(() => { z.style.transform = 'scale(1)'; z.style.filter = 'blur(0)'; }); }
      }, 30);
    },
    isDone(id) { return H.phase === 'zm-go' && H.gd.ans[id] != null; },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'zm-go') return gd.ans[p.id] ? done('¡Respuesta enviada! 🤞') : { screen: 'quiz', key: 'zm' + H.token, title: '🔍 ¿Qué es eso?', opts: gd.ord.map(j => gd.q.o[j]), deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'zm-go' || m.a !== 'quiz' || !inGame(p) || gd.ans[p.id]) return;
      const i = m.i | 0, ok = gd.ord[i] === 0; gd.ans[p.id] = { i, ok };
      if (ok) { gd.ok[p.id]++; gd.pts[p.id] += 100 + Math.max(0, Math.round(200 * (1 - (Date.now() - gd.t0) / 14000))); }
      SFX.pop(); checkAll(id => gd.ans[id] != null, () => GAMES.zoom.reveal());
    },
    reveal() { if (H.phase !== 'zm-go') return; const gd = H.gd; setPhase('zm-ans', 3000, () => gd.i < GAMES.zoom.N ? GAMES.zoom.next() : GAMES.zoom.end(), 0, false); SFX.win(); },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true, id => gd.pts[id] > 0);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `${gd.ok[id]}/${GAMES.zoom.N} bien`, gain: g[id] || 0 }));
      setPhase('zm-res', 5500, () => finishGame(g), 0, false); confetti(70);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'zm-res') return `<h1 class="title-pop">🔎 Los ojos de águila</h1>${resultsList(gd.rows)}`;
      if (ph === 'zm-go') return `<div class="round-lbl">${gd.i} / ${this.N}</div><div class="zbox"><div class="zemo" id="zemo" style="transform-origin:${gd.ox}% ${gd.oy}%;transform:scale(16);filter:blur(6px)">${gd.q.e}</div></div><p class="sub">📱 ¿Qué es? ¡Respondan en el cel!</p>`;
      return `<div class="zbox"><div class="zemo pop">${gd.q.e}</div></div><h1 class="title-pop">¡Era ${esc(gd.q.o[0])}!</h1><div class="avgrid">${gd.ids.map(id => `<div class="av" style="--c:${gd.ans[id]?.ok ? '#16a34a' : '#7f1d1d'}"><span class="ae">${pl(id)?.emoji}</span>${gd.ans[id]?.ok ? '✅' : gd.ans[id] ? '❌' : '😴'}</div>`).join('')}</div>`;
    }
  }
});
