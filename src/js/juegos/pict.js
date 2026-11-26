Object.assign(GAMES, {
  /* ✏️ DIBUJA Y ADIVINA */
  pict: {
    name: 'Dibuja y Adivina', emoji: '✏️', color: '#d946ef',
    desc: 'A uno le toca dibujar una palabra secreta en su cel y el dibujo sale EN VIVO en la tele 📺. Los demás escriben qué creen que es. ¡Rápido!',
    start() {
      const ids = onlineIds();
      H.gd = { ids, drawers: shuffle(ids).slice(0, Math.min(ids.length, 3)), r: 0, pts: {} };
      this.sub();
    },
    sub() {
      const gd = H.gd; gd.drawer = gd.drawers[gd.r]; gd.r++;
      gd.word = pickU(PICT, 'pi'); gd.img = null; gd.sol = []; gd.feed = []; gd.hint = 0;
      setPhase('pc-go', 75000, () => GAMES.pict.subEnd());
      const tok = H.token;
      setTimeout(() => { if (tok === H.token) { gd.hint = 1; GAMES.pict.paintHint(); } }, 35000);
      setTimeout(() => { if (tok === H.token) { gd.hint = 2; GAMES.pict.paintHint(); } }, 55000);
    },
    hintTxt() { const gd = H.gd, w = gd.word; return [...w].map((c, i) => c === ' ' ? '&nbsp;' : (gd.hint >= 1 && i === 0) || (gd.hint >= 2 && i === w.length - 1) ? c : '_').join(' '); },
    paintHint() { const h = $('#phint'); if (h) h.innerHTML = this.hintTxt() + ` <small>(${H.gd.word.length} letras)</small>`; },
    paintFeed() { const f = $('#pfeed'); if (f) f.innerHTML = H.gd.feed.slice(-7).map(x => `<div class="fd ${x.ok ? 'ok' : ''}">${x.html}</div>`).join(''); },
    isDone(id) { return H.phase === 'pc-go' && (H.gd.sol.includes(id) || id === H.gd.drawer); },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase !== 'pc-go') return watch();
      if (p.id === gd.drawer) return { screen: 'pdraw', key: 'pd' + H.token, word: gd.word, deadline: H.deadline };
      if (gd.sol.includes(p.id)) return { screen: 'msg', big: '🎉', title: '¡Adivinaste!', text: `Era "${gd.word}"` };
      return { screen: 'guess', key: 'pg' + H.token, title: `✏️ ¿Qué está dibujando ${pl(gd.drawer)?.emoji} ${pl(gd.drawer)?.name}?`, hint: 'Mirá la tele y escribí tu respuesta', deadline: H.deadline };
    },
    onAct(p, m) {
      const gd = H.gd; if (H.phase !== 'pc-go' || !inGame(p)) return;
      if (m.a === 'live' && p.id === gd.drawer && typeof m.img === 'string' && m.img.length < 500000 && /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(m.img)) {
        gd.img = m.img; const im = $('#pimg'); if (im) im.src = m.img; return;
      }
      if (m.a === 'guess' && p.id !== gd.drawer && !gd.sol.includes(p.id)) {
        const t = clean(m.text, 30); if (!t) return;
        if (close(t, gd.word)) {
          gd.sol.push(p.id);
          gd.pts[p.id] = (gd.pts[p.id] || 0) + ([300, 230, 180, 140][gd.sol.length - 1] || 100);
          gd.pts[gd.drawer] = (gd.pts[gd.drawer] || 0) + 90;
          gd.feed.push({ ok: true, html: `✅ ${who(p.id)} ¡lo adivinó!` }); SFX.win();
          this.paintFeed(); checkAll(id => id === gd.drawer || gd.sol.includes(id), () => GAMES.pict.subEnd());
        } else {
          gd.feed.push({ html: `${p.emoji} ${esc(t)}` }); this.paintFeed();
          try { p.conn && p.conn.send({ t: 'toast', text: close(t, gd.word, 2) ? '🔥 ¡Casi casi!' : '❌ No es eso' }); } catch (e) {}
        }
      }
    },
    subEnd() {
      if (H.phase !== 'pc-go') return;
      const gd = H.gd;
      setPhase('pc-res', 4500, () => gd.r < gd.drawers.length ? GAMES.pict.sub() : finishGame(gd.pts), 0, false); SFX.win();
    },
    render(ph) {
      const gd = H.gd, img = `<img id="pimg" class="pimg" ${gd.img ? `src="${gd.img}"` : ''} alt="">`;
      if (ph === 'pc-go') return `<div class="round-lbl">Dibujante ${gd.r} de ${gd.drawers.length}: ${who(gd.drawer)}</div>
        <div class="pwrap"><div class="pboxx">${img}</div><div class="pside"><div class="phint" id="phint">${this.hintTxt()} <small>(${gd.word.length} letras)</small></div><div class="pfeed" id="pfeed"></div></div></div>`;
      return `<h1 class="title-pop">Era: <span style="color:var(--yellow)">${esc(gd.word)}</span></h1><div class="pboxx" style="max-width:420px">${img}</div><p class="sub">${gd.sol.length ? 'Adivinaron: ' + gd.sol.map(who).join(', ') : 'Nadie lo adivinó 🙈'}</p>`;
    }
  }
});
