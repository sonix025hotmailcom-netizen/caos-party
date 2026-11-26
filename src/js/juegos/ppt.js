Object.assign(GAMES, {
  ppt: {
    name: 'Piedra, Papel o Tijera', emoji: '✌️', color: '#7c3aed', N: 7,
    desc: '¡Todos contra todos! Elegí piedra ✊, papel ✋ o tijera ✌️ en tu cel. Ganás 1 punto por cada jugador al que le ganás. Pero ojo: hay rondas AL REVÉS 🙃 donde gana lo que normalmente pierde.',
    start() {
      const ids = onlineIds(); ['red', 'blue', 'green', 'pink', 'purple', 'yellow'].forEach(c => PPT.forEach(([g]) => IMG('shapes/' + handImg(c, g))));
      H.gd = { ids, r: 0, pts: Object.fromEntries(ids.map(i => [i, 0])), wins: Object.fromEntries(ids.map(i => [i, 0])) };
      setTimeout(() => this.round(), 300);
    },
    round() {
      const gd = H.gd; gd.r++; gd.pick = {}; gd.rev = gd.r > 2 && Math.random() < .3;
      setPhase('pp-go', 7000, () => GAMES.ppt.reveal());
      SND.play(gd.rev ? 'ui_question_001' : 'ui_bong_001', .5);
    },
    beats(a, b, rev) { const w = (a === 0 && b === 2) || (a === 1 && b === 0) || (a === 2 && b === 1); return a === b ? 0 : (rev ? !w : w) ? 1 : -1; },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'pp-go' || m.a !== 'ppt' || !inGame(p) || gd.pick[p.id] != null) return;
      const c = m.c | 0; if (c < 0 || c > 2) return; gd.pick[p.id] = c; SFX.pop(); updateStrip(); sync();
      checkAll(id => gd.pick[id] != null, () => GAMES.ppt.reveal());
    },
    isDone(id) { return H.phase === 'pp-go' && H.gd.pick?.[id] != null; },
    reveal() {
      const gd = H.gd; if (H.phase !== 'pp-go') return;
      gd.ids.forEach(id => { if (gd.pick[id] == null) gd.pick[id] = -1; });
      gd.delta = {};
      for (const a of gd.ids) { let d = 0; if (gd.pick[a] >= 0) for (const b of gd.ids) if (a !== b && gd.pick[b] >= 0 && this.beats(gd.pick[a], gd.pick[b], gd.rev) > 0) d++; gd.delta[a] = d; gd.pts[a] += d; }
      const best = Math.max(...gd.ids.map(id => gd.delta[id])); if (best > 0) gd.ids.forEach(id => { if (gd.delta[id] === best) gd.wins[id]++; });
      SND.play('impactPunch_medium_000', .6);
      setPhase('pp-rev', 3800, () => { if (gd.r >= this.N) this.end(); else this.round(); }, 0, false);
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.pts[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.pts[b] - gd.pts[a]).map(id => ({ id, val: `⭐ ${gd.pts[id]} puntos · 🏅 ${gd.wins[id]} rondas`, gain: g[id] || 0 }));
      setPhase('pp-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'pp-go') return { screen: 'ppt', key: `pp${gd.r}-${gd.pick[p.id] ?? 'x'}`, r: gd.r, N: this.N, rev: gd.rev, picked: gd.pick[p.id] ?? -1, deadline: H.deadline };
      if (H.phase === 'pp-rev') { const d = gd.delta[p.id] || 0, pk = gd.pick[p.id]; return { screen: 'msg', big: pk >= 0 ? PPT[pk][1] : '😴', title: pk < 0 ? 'No elegiste' : d > 0 ? `¡Le ganaste a ${d}!` : 'No le ganaste a nadie', text: `Tenés ${gd.pts[p.id]} puntos` }; }
      return watch();
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'pp-res') return `<h1 class="title-pop">✌️ Los campeones del piedra, papel o tijera</h1>${resultsList(gd.rows)}`;
      const cols = ['red', 'blue', 'green', 'pink', 'purple', 'yellow'];
      if (ph === 'pp-rev') {
        const count = [0, 1, 2].map(c => gd.ids.filter(id => gd.pick[id] === c).length);
        setTimeout(() => { if (window.gsap) { gsap.from('.ppcard', { y: 60, rotation: () => -20 + Math.random() * 40, opacity: 0, stagger: .06, duration: .45, ease: 'back.out(2)' }); } }, 20);
        return `<div class="round-lbl">Ronda ${gd.r} de ${this.N}${gd.rev ? ' · 🙃 AL REVÉS' : ''}</div>
          <div class="ppsum">${PPT.map(([g, e, n], c) => `<span>${e} ${n}: <b>${count[c]}</b></span>`).join('')}</div>
          <div class="ppgrid">${gd.ids.slice().sort((a, b) => gd.delta[b] - gd.delta[a]).map((id, k) => { const p = pl(id), c = gd.pick[id]; return `<div class="ppcard ${gd.delta[id] > 0 && gd.delta[id] === gd.delta[gd.ids.slice().sort((a, b) => gd.delta[b] - gd.delta[a])[0]] ? 'win' : ''}" style="--c:${p?.color}">${c >= 0 ? `<img src="assets/shapes/${handImg(cols[k % 6], PPT[c][0])}" alt="${PPT[c][1]}">` : '<div class="ppz">😴</div>'}<b>${p?.emoji} ${esc(p?.name || '')}</b><span>+${gd.delta[id]}</span></div>`; }).join('')}</div>`;
      }
      setTimeout(() => { if (window.gsap) gsap.fromTo('.ppbig img', { rotation: -25, y: 0 }, { rotation: 15, y: -20, yoyo: true, repeat: -1, duration: .35, stagger: .1, ease: 'sine.inOut' }); }, 20);
      return `<div class="round-lbl">Ronda ${gd.r} de ${this.N}</div>
        ${gd.rev ? '<div class="pprev">🙃 ¡RONDA AL REVÉS! Gana lo que normalmente pierde</div>' : ''}
        <div class="ppbig">${PPT.map(([g], c) => `<img src="assets/shapes/${handImg(cols[(c * 2 + gd.r) % 6], g)}" alt="">`).join('')}</div>
        <h2 class="title-pop">¡Piedra, papel o tijera!</h2><p class="sub">Elegí en tu cel · 1 punto por cada jugador al que le ganés</p>`;
    }
  }
});
