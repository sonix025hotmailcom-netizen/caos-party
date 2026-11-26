Object.assign(GAMES, {
  /* =================================================================== */
  /* ✋ LO QUE SIMÓN DIGA                                                 */
  /* =================================================================== */
  manos: {
    name: 'Lo que Simón Diga', emoji: '✋', color: '#f59e0b', N: 12,
    desc: 'Un muñequito hace una seña con la mano ✌️👍🤘. Si dice "Simón dice", ¡tocá esa seña rapidísimo en tu cel! Pero si NO dice "Simón dice"… ¡no toqués nada! Cada vez es más rápido.',
    start() {
      const ids = onlineIds();
      ['red', 'blue', 'green', 'pink', 'purple', 'yellow'].forEach(c => { IMG(`shapes/${c}_body_squircle.png`); GESTOS.forEach(([g]) => IMG('shapes/' + handImg(c, g))); });
      H.gd = { ids, r: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), ok: Object.fromEntries(ids.map(i => [i, 0])), oops: Object.fromEntries(ids.map(i => [i, 0])) };
      setTimeout(() => this.round(), 300);
    },
    round() {
      const gd = H.gd; gd.r++;
      const col = pickR(['red', 'blue', 'green', 'pink', 'purple', 'yellow']), body = pickR(['circle', 'rhombus', 'square', 'squircle']), face = pickR('abcdefghijkl'.split(''));
      const g = rand(6), trap = gd.r > 2 && Math.random() < .3, ms = Math.max(1500, 3200 - gd.r * 140);
      gd.cur = { g, trap, col, body, face, t0: Date.now(), ms }; gd.ans = {};
      setPhase('mn-go', ms, () => GAMES.manos.reveal(), 0, false);
      SND.play(trap ? 'ui_question_001' : 'ui_bong_001', .5);
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'mn-go' || m.a !== 'gesto' || !inGame(p) || gd.ans[p.id]) return;
      const g = m.g | 0; if (g < 0 || g > 5) return;
      gd.ans[p.id] = { g, t: Date.now() - gd.cur.t0 }; SFX.pop(); updateStrip(); sync();
      if (!gd.cur.trap && gd.ids.every(id => gd.ans[id] || !pl(id)?.online)) { const tok = H.token; setTimeout(() => { if (tok === H.token) this.reveal(); }, 350); }
    },
    isDone(id) { return H.phase === 'mn-go' && !!H.gd.ans?.[id]; },
    reveal() {
      const gd = H.gd, c = gd.cur; if (H.phase !== 'mn-go') return;
      gd.delta = {};
      for (const id of gd.ids) {
        const a = gd.ans[id]; let d = 0;
        if (c.trap) { d = a ? -60 : 40; if (a) gd.oops[id]++; }
        else if (a && a.g === c.g) { d = 60 + Math.round(Math.max(0, 1 - a.t / c.ms) * 90); gd.ok[id]++; }
        else if (a) d = -20;
        gd.delta[id] = d; gd.pts[id] = Math.max(0, gd.pts[id] + d);
      }
      const goodN = gd.ids.filter(id => gd.delta[id] > 0).length;
      SND.play(goodN >= gd.ids.length / 2 ? 'ui_confirmation_001' : 'ui_error_006', .45);
      setPhase('mn-rev', 2000, () => { if (gd.r >= this.N) this.end(); else this.round(); }, 0, false);
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `⭐ ${gd.pts[id]} · ✅ ${gd.ok[id]} · 🙈 ${gd.oops[id]} trampas`, gain: g[id] || 0 }));
      setPhase('mn-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'mn-go') return { screen: 'manos', key: `mn${gd.r}-${gd.ans[p.id] ? gd.ans[p.id].g : 'x'}`, r: gd.r, N: this.N, picked: gd.ans[p.id] ? gd.ans[p.id].g : -1 };
      if (H.phase === 'mn-rev') { const d = gd.delta[p.id] || 0, c = gd.cur; return { screen: 'msg', big: d > 0 ? '✅' : d < 0 ? (c.trap ? '🙈' : '❌') : '😶', title: d > 0 ? `+${d}` : d < 0 ? (c.trap ? '¡Simón no lo dijo!' : 'Esa no era') : 'No tocaste', text: `${d < 0 ? d + ' · ' : ''}Tenés ${gd.pts[p.id]} puntos` }; }
      return watch();
    },
    guy(c, big) {
      return `<div class="mnguy ${big ? 'big' : ''}"><img class="mnb" src="assets/shapes/${c.col}_body_${c.body}.png" alt=""><img class="mnf" src="assets/shapes/face_${c.face}.png" alt=""><img class="mnh" src="assets/shapes/${handImg(c.col, GESTOS[c.g][0])}" alt=""><img class="mnh2" src="assets/shapes/${handImg(c.col, 'open')}" alt=""></div>`;
    },
    render(ph) {
      const gd = H.gd, c = gd.cur;
      if (ph === 'mn-res') return `<h1 class="title-pop">✋ Los que mejor escuchan a Simón</h1>${resultsList(gd.rows)}`;
      if (ph === 'mn-rev') {
        const good = gd.ids.filter(id => gd.delta[id] > 0), bad = gd.ids.filter(id => gd.delta[id] < 0);
        return `<div class="round-lbl">Seña ${gd.r} de ${this.N}</div><div class="mnwrap">${this.guy(c, false)}<div class="mnsay ${c.trap ? 'trap' : ''}">${c.trap ? '🙊 ¡Simón NO lo dijo!' : `${GESTOS[c.g][1]} ${GESTOS[c.g][2]}`}</div></div>
          <div class="mnres"><div class="ok">✅ ${good.map(id => `${pl(id)?.emoji} ${esc(pl(id)?.name || '')} <b>+${gd.delta[id]}</b>`).join(' · ') || '—'}</div>${bad.length ? `<div class="no">${c.trap ? '🙈' : '❌'} ${bad.map(id => `${pl(id)?.emoji} ${esc(pl(id)?.name || '')} <b>${gd.delta[id]}</b>`).join(' · ')}</div>` : ''}</div>`;
      }
      setTimeout(() => { if (window.gsap) { gsap.from('.mnguy', { scale: .3, rotation: -20, duration: .4, ease: 'back.out(2)' }); gsap.from('.mnsay', { y: -30, opacity: 0, duration: .3, delay: .1 }); gsap.fromTo('.mnh', { rotation: -25 }, { rotation: 10, yoyo: true, repeat: 5, duration: .15 }); } }, 20);
      return `<div class="round-lbl">Seña ${gd.r} de ${this.N}</div><div class="mnwrap">${this.guy(c, true)}<div class="mnsay">${c.trap ? '' : '<small>Simón dice:</small>'}${GESTOS[c.g][1]} ¡${GESTOS[c.g][2]}!</div></div>
        <p class="sub">${gd.r <= 2 ? 'Solo tocá si dice <b>"Simón dice"</b> 😉' : '¿Lo dijo o no lo dijo? 🤔'}</p>`;
    }
  }
});
