Object.assign(GAMES, {
  /* =================================================================== */
  /* 🎲 GENERALA LOCA                                                     */
  /* =================================================================== */
  dice: {
    name: 'Generala Loca', emoji: '🎲', color: '#dc2626', R: 3,
    desc: 'Tirá 5 dados desde el cel 🎲. Tocá los que querés guardar y volvé a tirar (máximo 3 tiros). Generala, póker, full, escalera… ¡y cada ronda hay un número de la suerte que vale extra! 3 rondas.',
    start() {
      const ids = onlineIds(); for (let i = 1; i <= 6; i++) { IMG('dice/dieWhite_border' + i + '.png'); IMG('dice/dieRed_border' + i + '.png'); }
      H.gd = { ids, r: 0, tot: Object.fromEntries(ids.map(i => [i, 0])), hist: Object.fromEntries(ids.map(i => [i, []])) };
      this.round();
    },
    round() {
      const gd = H.gd; gd.r++; gd.lucky = 1 + rand(6);
      gd.st = Object.fromEntries(gd.ids.map(id => [id, { d: [1, 2, 3, 4, 5].map(() => 1 + rand(6)), hold: [0, 0, 0, 0, 0], rolls: 0, done: false, rid: 0 }]));
      setPhase('dc-go', 32000, () => GAMES.dice.closeRound());
      SND.play('ui_question_001', .5);
    },
    score(d, rolls) {
      const c = [0, 0, 0, 0, 0, 0, 0]; d.forEach(v => c[v]++); const cs = c.slice(1).filter(Boolean).sort((a, b) => b - a), s = d.slice().sort().join('');
      let n, b;
      if (cs[0] === 5) [n, b] = rolls === 1 ? ['¡GENERALA SERVIDA!', 100] : ['¡GENERALA!', 60];
      else if (cs[0] === 4) [n, b] = ['Póker', 40];
      else if (cs[0] === 3 && cs[1] === 2) [n, b] = ['Full', 30];
      else if (s === '12345' || s === '23456') [n, b] = ['Escalera', 25];
      else if (cs[0] === 3) [n, b] = ['Trío', 15];
      else if (cs[0] === 2 && cs[1] === 2) [n, b] = ['Doble par', 10];
      else if (cs[0] === 2) [n, b] = ['Par', 5];
      else [n, b] = ['Nada', 0];
      const lucky = H.gd.lucky ? c[H.gd.lucky] * 3 : 0, sum = d.reduce((a, v) => a + v, 0);
      return { n, b, lucky, sum, pts: b + lucky + sum };
    },
    roll(id) {
      const gd = H.gd, s = gd.st[id]; if (!s || s.done || s.rolls >= 3) return;
      s.d = s.d.map((v, i) => s.rolls && s.hold[i] ? v : 1 + rand(6)); s.rolls++; s.rid++;
      if (s.rolls >= 3) s.done = true;
      const sc = this.score(s.d, s.rolls);
      SND.play(['impactWood_medium_000', 'impactPlate_light_000'], .5, 1.2); setTimeout(() => SND.play('impactWood_medium_000', .35, 1.5), 120);
      if (sc.b >= 60) { SND.voice('flawless_victory'); confetti(120); } else if (sc.b >= 30) SND.play('ui_confirmation_001', .5);
      this.paint(id, true); sync(); this.check();
    },
    check() { const gd = H.gd; if (H.phase === 'dc-go' && gd.ids.every(id => !pl(id)?.online || gd.st[id].done)) setTimeout(() => { if (H.phase === 'dc-go' && H.gd === gd) this.closeRound(); }, 1300); },
    onAct(p, m) {
      if (H.phase !== 'dc-go') return; const s = H.gd.st[p.id]; if (!s) return;
      if (m.a === 'roll') this.roll(p.id);
      else if (m.a === 'hold' && s.rolls && !s.done) { const i = m.i | 0; if (i >= 0 && i < 5) { s.hold[i] = s.hold[i] ? 0 : 1; SFX.pop(); this.paint(p.id); sync(); } }
      else if (m.a === 'stand' && s.rolls && !s.done) { s.done = true; SFX.pop(); this.paint(p.id); sync(); this.check(); }
    },
    isDone(id) { return H.phase === 'dc-go' && H.gd.st && H.gd.st[id] && H.gd.st[id].done; },
    closeRound() {
      const gd = H.gd; if (H.phase !== 'dc-go') return;
      gd.last = gd.ids.map(id => { const s = gd.st[id]; if (!s.rolls) { s.d = s.d.map(() => 1 + rand(6)); s.rolls = 1; } s.done = true; const sc = this.score(s.d, s.rolls); gd.tot[id] += sc.pts; gd.hist[id].push(sc.pts); return { id, sc }; }).sort((a, b) => b.sc.pts - a.sc.pts);
      if (gd.r >= this.R) return this.end();
      setPhase('dc-sub', 6000, () => GAMES.dice.round(), 0, false); SFX.win();
    },
    end() {
      const gd = H.gd, g = rankGains(gd.ids, id => gd.tot[id], true);
      gd.rows = gd.ids.slice().sort((a, b) => gd.tot[b] - gd.tot[a]).map(id => ({ id, val: `🎲 ${gd.tot[id]} pts (${gd.hist[id].join(' + ')})`, gain: g[id] || 0 }));
      setPhase('dc-res', 6500, () => finishGame(g), 0, false); confetti(100); SFX.win();
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase !== 'dc-go') return watch();
      const s = gd.st[p.id], sc = s.rolls ? this.score(s.d, s.rolls) : null;
      return { screen: 'dice', key: `dc${gd.r}-${s.rolls}-${s.hold.join('')}-${s.done ? 1 : 0}`, r: gd.r, R: this.R, lucky: gd.lucky, d: s.d, hold: s.hold, rolls: s.rolls, done: s.done, rid: s.rid, hand: sc ? `${sc.n} · ${sc.pts} pts` : '', deadline: H.deadline };
    },
    dieSrc(v, red) { return `assets/dice/die${red ? 'Red' : 'White'}_border${v}.png`; },
    paint(id, rolled) {
      const gd = H.gd, el = $('#dcp-' + id); if (!el || !gd.st) return;
      const s = gd.st[id], sc = s.rolls ? this.score(s.d, s.rolls) : null;
      const dice = el.querySelectorAll('.dcd');
      dice.forEach((im, i) => {
        im.classList.toggle('held', !!(s.rolls && s.hold[i]));
        if (rolled && !(s.rolls > 1 && s.hold[i])) {
          let k = 0; const iv = setInterval(() => { im.src = this.dieSrc(1 + rand(6), (1 + rand(6)) === gd.lucky); if (++k > 6) { clearInterval(iv); im.src = this.dieSrc(s.d[i], s.d[i] === gd.lucky); } }, 70);
          if (window.gsap) gsap.fromTo(im, { rotation: -200 + Math.random() * 400, y: -18 }, { rotation: 0, y: 0, duration: .55, ease: 'back.out(2)' });
        } else im.src = s.rolls ? this.dieSrc(s.d[i], s.d[i] === gd.lucky) : this.dieSrc(1 + i, false);
        im.style.opacity = s.rolls ? 1 : .35;
      });
      const h = el.querySelector('.dch'); if (h) { h.textContent = sc ? `${sc.n} · ${sc.pts}` : 'Esperando su tiro…'; h.classList.toggle('big', !!(sc && sc.b >= 30)); }
      const t = el.querySelector('.dct'); if (t) t.textContent = s.done ? '✅' : `🎲 ${s.rolls}/3`;
      el.classList.toggle('done', s.done);
    },
    render(ph) {
      const gd = H.gd;
      if (ph === 'dc-res') return `<h1 class="title-pop">🎲 Los reyes de los dados</h1>${resultsList(gd.rows)}`;
      if (ph === 'dc-sub') return `<div class="round-lbl">Ronda ${gd.r} de ${this.R}</div><h2 class="title-pop">🎲 Así quedó la ronda</h2><div class="dcgrid">${gd.last.map((x, k) => { const p = pl(x.id), s = gd.st[x.id]; return `<div class="dcp pop ${k === 0 ? 'win' : ''}" style="--c:${p?.color};animation-delay:${k * .12}s"><div class="dcn">${p?.emoji} ${esc(p?.name || '')}<span>+${x.sc.pts}</span></div><div class="dcds">${s.d.map(v => `<img class="dcd" src="${this.dieSrc(v, v === gd.lucky)}" alt="${v}">`).join('')}</div><div class="dch ${x.sc.b >= 30 ? 'big' : ''}">${x.sc.n} · ${x.sc.b} + ${x.sc.sum} dados${x.sc.lucky ? ` + ${x.sc.lucky} 🍀` : ''}</div></div>`; }).join('')}</div>`;
      setTimeout(() => gd.ids.forEach(id => this.paint(id)), 20);
      return `<div class="dctop"><div class="round-lbl">Ronda ${gd.r} de ${this.R}</div><div class="dclucky">🍀 Número de la suerte <img src="${this.dieSrc(gd.lucky, true)}" alt="${gd.lucky}"> <small>cada uno vale +3</small></div></div>
        <div class="dcgrid">${gd.ids.map(id => { const p = pl(id); return `<div class="dcp" id="dcp-${id}" style="--c:${p?.color}"><div class="dcn">${p?.emoji} ${esc(p?.name || '')}<span class="dct"></span></div><div class="dcds">${[0, 1, 2, 3, 4].map(i => `<img class="dcd" src="${this.dieSrc(i + 1)}" alt="">`).join('')}</div><div class="dch"></div></div>`; }).join('')}</div>
        <div class="dclegend">Generala 60 · Póker 40 · Full 30 · Escalera 25 · Trío 15 · Doble par 10 · Par 5 · + la suma de los dados</div>`;
    }
  }
});
