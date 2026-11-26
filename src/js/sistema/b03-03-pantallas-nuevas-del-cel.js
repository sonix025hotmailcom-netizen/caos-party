/* ---------- pantallas nuevas del cel ---------- */
Object.assign(XS, {
  colors(v) {
    app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.title)}</div><div class="colbtns">${SC.map((c, i) => `<button class="cbtn" data-c="${i}" style="--c:${c[1]}">${c[0]}</button>`).join('')}</div>`, true);
    app.querySelectorAll('.cbtn').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); send({ t: 'act', a: 'color', c: +b.dataset.c }); app.querySelectorAll('.cbtn').forEach(x => x.disabled = true); }));
  },
  duelboard(v) {
    const C4 = v.kind === 'c4', S = v.sym;
    const cells = C4 ? `<div class="c4cols">${[0, 1, 2, 3, 4, 5, 6].map(c => `<button data-i="${c}" ${!v.myTurn || v.cells[c] ? 'disabled' : ''}>⬇</button>`).join('')}</div><div class="pboard c4">${v.cells.map(x => `<div>${S[x]}</div>`).join('')}</div>`
      : `<div class="pboard ttt">${v.cells.map((x, i) => `<button data-i="${i}" ${!v.myTurn || x ? 'disabled' : ''}>${S[x]}</button>`).join('')}</div>`;
    app.innerHTML = shell(`<div class="turnlbl ${v.myTurn ? 'me' : ''}">${v.myTurn ? `¡TU TURNO! Sos ${S[v.me]}` : `Turno de ${esc(v.opp)}…`}</div>${cells}<p class="hint">Contra ${esc(v.opp)}</p>`, v.myTurn);
    app.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'move', i: +b.dataset.i }); app.querySelectorAll('[data-i]').forEach(x => x.disabled = true); });
  },
  form(v) {
    app.innerHTML = shell(`<div class="c-prompt small">Letra: <span class="bl">${esc(v.letter)}</span></div>${v.cats.map((c, i) => `<label class="fl">${esc(c)}<input data-i="${i}" maxlength="24" autocomplete="off" autocapitalize="words" placeholder="${esc(v.letter)}…"></label>`).join('')}<button class="btn big pink" id="bB">✋ ¡BASTA!</button>`, true);
    const ins = [...app.querySelectorAll('.fl input')]; let sent = false;
    const go = () => { if (sent) return; sent = true; send({ t: 'act', a: 'basta', ans: ins.map(i => i.value.trim()) }); const b = $('#bB'); if (b) { b.disabled = true; b.textContent = 'Enviado ✅'; } };
    $('#bB').onclick = () => { if (ins.some(i => !i.value.trim())) { toast('Llená todo para gritar ¡BASTA! ✋'); return; } go(); };
    ins.forEach((inp, k) => inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); (ins[k + 1] || $('#bB')).focus(); } });
    P.onCut = (ms, by) => { toast(`✋ ¡${by || 'Alguien'} dijo BASTA! Te quedan ${Math.round(ms / 1000)} segundos`); if (navigator.vibrate) navigator.vibrate([100, 50, 100]); P.deadline = Date.now() + ms; P.dur = ms; P.timers.push(setTimeout(go, Math.max(0, ms - 700))); };
    if (P.deadline) P.timers.push(setTimeout(go, Math.max(0, P.deadline - Date.now() - 600)));
  },
  grid9(v) {
    app.innerHTML = shell(`<div class="c-hint">🔨 Tocá el hoyo donde salió el topo en la tele</div><div class="pgrid">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<button data-i="${i}">🕳️</button>`).join('')}</div>`);
    app.querySelectorAll('.pgrid button').forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); send({ t: 'act', a: 'hit', i: +b.dataset.i }); b.classList.add('f'); b.textContent = '🔨'; setTimeout(() => { b.classList.remove('f'); b.textContent = '🕳️'; }, 150); if (navigator.vibrate) navigator.vibrate(15); }));
  },
});


