Object.assign(GAMES, {
  /* 🔤 PALABRA REVUELTA */
  anagram: {
    name: 'Palabra Revuelta', emoji: '🔤', color: '#0891b2', N: 3,
    desc: 'En la tele salen las letras de una palabra todas revueltas 🌀. ¡Escriban la palabra en el cel! El más rápido gana más. Pueden intentar varias veces.',
    start() { const ids = onlineIds(); H.gd = { ids, i: 0, pts: {} }; this.next(); },
    next() {
      const gd = H.gd; gd.i++; gd.word = pickU(ANAGRAMS, 'an');
      let s; do { s = shuffle([...gd.word]).join(''); } while (s === gd.word && gd.word.length > 2);
      gd.scr = s; gd.sol = []; gd.hint = 0; gd.tries = {};
      setPhase('an-go', 30000, () => GAMES.anagram.reveal(), 500);
      const tok = H.token;
      setTimeout(() => { if (tok === H.token) { gd.hint = 1; const h = $('#anh'); if (h) h.innerHTML = `💡 Empieza con <b>${gd.word[0]}</b>`; } }, 14000);
      A({ targets: '.tile', translateY: [-120, 0], rotate: () => window.anime ? anime.random(-30, 30) : 0, opacity: [0, 1], delay: anime_stagger(70), duration: 700, easing: 'easeOutBounce' });
    },
    isDone(id) { return H.phase === 'an-go' && H.gd.sol.includes(id); },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (H.phase === 'an-go') return gd.sol.includes(p.id) ? { screen: 'msg', big: '🎉', title: `¡Correcto! Llegaste de #${gd.sol.indexOf(p.id) + 1}`, text: 'Mirá a los demás sufrir 😂' } : { screen: 'guess', key: 'an' + H.token, title: `🔤 ${gd.scr.split('').join(' ')}`, hint: 'Ordená las letras y escribí la palabra', deadline: H.deadline };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'an-go' || m.a !== 'guess' || !inGame(p) || gd.sol.includes(p.id)) return;
      if (norm(m.text) === norm(gd.word)) {
        gd.sol.push(p.id); gd.pts[p.id] = (gd.pts[p.id] || 0) + ([300, 220, 160, 120][gd.sol.length - 1] || 80);
        SFX.win(); const f = $('#anf'); if (f) f.innerHTML += `<span class="schip pop" style="--c:${p.color}">${medal(gd.sol.length - 1)} ${p.emoji} ${esc(p.name)}</span>`;
        checkAll(id => gd.sol.includes(id), () => GAMES.anagram.reveal());
      } else { try { p.conn && p.conn.send({ t: 'toast', text: close(m.text, gd.word, 2) ? '🔥 ¡Casi! Revisá las letras' : '❌ Nop, intentá otra vez' }); } catch (e) {} }
    },
    reveal() { if (H.phase !== 'an-go') return; const gd = H.gd; setPhase('an-ans', 3500, () => gd.i < GAMES.anagram.N ? GAMES.anagram.next() : finishGame(gd.pts), 0, false); },
    render(ph) {
      const gd = H.gd, tiles = w => `<div class="tiles">${[...w].map(c => `<span class="tile">${c}</span>`).join('')}</div>`;
      if (ph === 'an-go') return `<div class="round-lbl">Palabra ${gd.i} de ${this.N}</div><h2 class="title-pop">🔤 ¡Ordenen las letras!</h2>${tiles(gd.scr)}<div class="sub" id="anh">${gd.hint ? `💡 Empieza con <b>${gd.word[0]}</b>` : '📱 Escriban la palabra en el cel'}</div><div class="mscore" id="anf">${gd.sol.map((id, i) => `<span class="schip" style="--c:${pl(id)?.color}">${medal(i)} ${who(id)}</span>`).join('')}</div>`;
      return `<h2 class="title-pop">La palabra era…</h2>${tiles(gd.word)}<p class="sub">${gd.sol.length ? 'La sacaron: ' + gd.sol.map(who).join(', ') : 'Nadie la sacó 😅'}</p>`;
    }
  }
});
