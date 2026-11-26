Object.assign(GAMES, {
  /* 💣 PAPA BOMBA */
  potato: {
    name: 'Papa Bomba', emoji: '💣', color: '#dc2626',
    desc: 'Una bomba anda de mano en mano 💣. Si te llega, resolvé la mate en el cel para pasarla a otro. Nadie sabe cuándo explota… ¡el último en pie gana!',
    start() { const ids = onlineIds(); H.gd = { ids, alive: ids.slice(), out: [], qid: 0 }; H.gd.holder = H.gd.alive[rand(H.gd.alive.length)]; this.newQ(); this.round(); },
    newQ() {
      const gd = H.gd, op = Math.random() < .6 ? '+' : Math.random() < .5 ? '−' : '×';
      let a = 2 + rand(9), b = 2 + rand(9); if (op === '−' && b > a) [a, b] = [b, a]; if (op === '×') { a = 2 + rand(5); b = 2 + rand(5); }
      const ans = op === '+' ? a + b : op === '−' ? a - b : a * b, opts = new Set([ans]);
      while (opts.size < 3) { const d = ans + (rand(2) ? 1 : -1) * (1 + rand(3)); if (d >= 0) opts.add(d); }
      gd.q = { t: `${a} ${op} ${b}`, ans, opts: shuffle([...opts]) }; gd.qid++;
    },
    round() {
      const gd = H.gd; gd.fuse = 8000 + rand(9000); gd.t0 = Date.now();
      setPhase('pot-go', gd.fuse, () => GAMES.potato.boom(), 0, false);
      const tok = H.token; let nextTick = 0;
      const iv = setInterval(() => { if (tok !== H.token) return clearInterval(iv); const el = Date.now() - gd.t0, rate = Math.max(120, 700 - el / gd.fuse * 600); if (Date.now() > nextTick) { nextTick = Date.now() + rate; beep(el / gd.fuse > .7 ? 1200 : 900, .04, 'square', .05); } }, 50);
      setTimeout(() => GAMES.potato.moveBomb(), 50);
    },
    pos(i, n) { const a = i / n * Math.PI * 2 - Math.PI / 2; return [50 + Math.cos(a) * 40, 50 + Math.sin(a) * 38]; },
    moveBomb() {
      const gd = H.gd, b = $('#bomb'); if (!b) return;
      const i = gd.ids.indexOf(gd.holder), [x, y] = this.pos(i, gd.ids.length);
      b.style.left = (50 + (x - 50) * .62) + '%'; b.style.top = (50 + (y - 50) * .62) + '%';
      document.querySelectorAll('.pring .pa').forEach(el => el.classList.toggle('hold', el.dataset.id === gd.holder));
      const pc = $('#pcen'); if (pc) pc.innerHTML = `La tiene<br>${who(gd.holder)}`;
      A({ targets: '#bomb', rotate: [-30, 30, 0], duration: 500 });
    },
    view(p) {
      const gd = H.gd;
      if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
      if (gd.out.includes(p.id)) return { screen: 'msg', big: '💥', title: '¡EXPLOTASTE!', text: 'Mirá quién sobrevive 👀' };
      if (H.phase === 'pot-go') return gd.holder === p.id ? { screen: 'choose', key: 'pq' + gd.qid, title: `💣 ¡TENÉS LA BOMBA! Rápido: ${gd.q.t} = ?`, options: gd.q.opts.map(o => ({ id: String(o), label: String(o) })) } : { screen: 'msg', big: '😰', title: '¡Que no te llegue!', text: `La bomba la tiene ${pl(gd.holder)?.emoji} ${pl(gd.holder)?.name}` };
      return watch();
    },
    onAct(p, m) {
      const gd = H.gd;
      if (H.phase !== 'pot-go' || m.a !== 'choose' || p.id !== gd.holder) return;
      if (+m.id === gd.q.ans) {
        const others = gd.alive.filter(id => id !== p.id && pl(id)?.online);
        const pool = others.length ? others : gd.alive.filter(id => id !== p.id);
        if (pool.length) gd.holder = pool[rand(pool.length)];
        SFX.whoosh();
      } else { SFX.bad(); try { p.conn.send({ t: 'toast', text: '❌ ¡Mal! Otra…' }); } catch (e) {} }
      this.newQ(); this.moveBomb(); sync();
    },
    boom() {
      const gd = H.gd, dead = gd.holder;
      gd.out.push(dead); gd.alive = gd.alive.filter(id => id !== dead); gd.last = dead;
      beep(80, .8, 'sawtooth', .12); beep(60, 1, 'square', .1, .1);
      setPhase('pot-boom', 3000, () => { if (gd.alive.length <= 1) GAMES.potato.end(); else { gd.holder = gd.alive[rand(gd.alive.length)]; GAMES.potato.newQ(); GAMES.potato.round(); } }, 0, false);
      shakeScreen(); A({ targets: '.boomtxt', scale: [0, 1.3, 1], duration: 800, easing: 'easeOutElastic(1,.5)' });
    },
    end() {
      const gd = H.gd, sc = id => gd.alive.includes(id) ? 999 : gd.out.indexOf(id);
      const g = rankGains(gd.ids, sc, true);
      gd.rows = gd.ids.slice().sort((a, b) => sc(b) - sc(a)).map(id => ({ id, val: gd.alive.includes(id) ? '😎 Sobrevivió' : '💥 Explotó', gain: g[id] || 0 }));
      setPhase('pot-res', 5500, () => finishGame(g), 0, false); confetti(90); SFX.win();
    },
    render(ph) {
      const gd = H.gd, n = gd.ids.length;
      if (ph === 'pot-res') return `<h1 class="title-pop">💣 Los sobrevivientes</h1>${resultsList(gd.rows)}`;
      const ring = gd.ids.map((id, i) => { const [x, y] = this.pos(i, n), p = pl(id); return `<div class="pa ${gd.out.includes(id) ? 'out' : ''} ${ph === 'pot-go' && gd.holder === id ? 'hold' : ''}" data-id="${id}" style="left:${x}%;top:${y}%;--c:${p?.color}"><span class="e">${gd.out.includes(id) ? '💀' : p?.emoji}</span><b>${esc(p?.name || '')}</b></div>`; }).join('');
      if (ph === 'pot-go') return `<h2 class="title-pop">💣 ¡PÁSENLA! ¿Quién explotará?</h2><div class="pring">${ring}<div id="bomb" style="left:50%;top:50%">💣</div><div class="pcen pcenter" id="pcen"></div></div>`;
      return `<div class="pring">${ring}<div class="pcenter boomtxt">💥<br>¡BOOM!<br>${who(gd.last)} explotó</div></div>`;
    }
  }
});
