/* ================== PANTALLAS DEL CEL (más cómodas) ================== */
Object.assign(XS, {
  joy(v) {
    app.innerHTML = shell(`<div class="jhint">${esc(v.hint || 'Tocá y arrastrá para moverte')}</div><div class="jarea ${v.btn ? 'hasbtn' : ''}" id="jz"><div class="jbase idle" id="jbase"><div class="knob" id="knob"></div></div></div>${v.btn ? `<button class="actbtn" id="act"><span class="albl">${esc(v.btn)}</span><span class="cdov" id="cdov"></span></button>` : ''}`);
    app.firstElementChild.classList.add('joy');
    const zone = $('#jz'), base = $('#jbase'), knob = $('#knob');
    let x = 0, y = 0, b = 0, id = null, cx = 0, cy = 0, lx = 9, ly = 9, lb = -1, ls = 0, coolUntil = 0;
    const R = () => base.offsetWidth / 2;
    const place = (px, py) => { const z = zone.getBoundingClientRect(), r = R(); cx = Math.max(z.left + r, Math.min(z.right - r, px)); cy = Math.max(z.top + r, Math.min(z.bottom - r, py)); base.style.left = (cx - z.left) + 'px'; base.style.top = (cy - z.top) + 'px'; };
    const upd = e => { const m = R() * .72; let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > m) { dx = dx / d * m; dy = dy / d * m; } x = dx / m; y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`; };
    zone.addEventListener('pointerdown', e => { e.preventDefault(); if (id !== null) return; id = e.pointerId; try { zone.setPointerCapture(id); } catch (er) {} place(e.clientX, e.clientY); base.classList.remove('idle'); upd(e); });
    zone.addEventListener('pointermove', e => { if (e.pointerId === id) { e.preventDefault(); upd(e); } });
    const rel = e => { if (e.pointerId !== id) return; id = null; x = y = 0; knob.style.transform = ''; base.classList.add('idle'); base.style.left = ''; base.style.top = ''; };
    zone.addEventListener('pointerup', rel); zone.addEventListener('pointercancel', rel);
    const act = $('#act'), ov = $('#cdov');
    const cool = (ms, lbl) => {
      coolUntil = Date.now() + ms; act.classList.add('cool');
      const tick = () => { const left = coolUntil - Date.now(); if (left <= 0) { act.classList.remove('cool'); ov.textContent = ''; if (navigator.vibrate) navigator.vibrate(15); return; } ov.style.setProperty('--p', (left / ms * 100) + '%'); ov.textContent = (lbl ? lbl + ' ' : '') + (left / 1000).toFixed(1); P.timers.push(setTimeout(tick, 80)); };
      tick();
    };
    if (act) act.addEventListener('pointerdown', e => {
      e.preventDefault(); if (Date.now() < coolUntil) { if (navigator.vibrate) navigator.vibrate(8); return; }
      b++; act.classList.remove('hit'); void act.offsetWidth; act.classList.add('hit'); if (navigator.vibrate) navigator.vibrate(25);
      if (v.cd) cool(v.cd * 1000);
    });
    P.onLive = m => { if (m.kind === 'lock' && act) cool(m.ms, '🥶'); };
    P.timers.push(setInterval(() => {
      let kx = 0, ky = 0; if (typeof kdown !== 'undefined' && kdown.size) { const h = g => KEYS[g].some(q => kdown.has(q)); kx = (h('right') ? 1 : 0) - (h('left') ? 1 : 0); ky = (h('down') ? 1 : 0) - (h('up') ? 1 : 0); if (kx && ky) { kx *= .7071; ky *= .7071; } }
      const ux = (kx || ky) ? kx : x, uy = (kx || ky) ? ky : y;
      const rx = Math.round(ux * 100) / 100, ry = Math.round(uy * 100) / 100, now = Date.now();
      if (rx !== lx || ry !== ly || b !== lb || now - ls > 400) { lx = rx; ly = ry; lb = b; ls = now; send({ t: 'act', a: 'joy', x: rx, y: ry, b }); }
    }, 45));
  },
  duelboard(v) {
    const C4 = v.kind === 'c4', S = v.sym;
    const grid = C4 ? `<div class="pboard c4">${v.cells.map((x, i) => `<button class="c4c" data-i="${i}" ${!v.myTurn || v.cells[i % 7] ? 'disabled' : ''}>${S[x]}</button>`).join('')}</div><p class="hint">👆 Tocá cualquier hoyo de la columna donde querés soltar la ficha</p>`
      : `<div class="pboard ttt">${v.cells.map((x, i) => `<button data-i="${i}" ${!v.myTurn || x ? 'disabled' : ''}>${S[x]}</button>`).join('')}</div>`;
    app.innerHTML = shell(`<div class="turnlbl ${v.myTurn ? 'me' : ''}">${v.myTurn ? `¡TU TURNO! Sos ${S[v.me]}` : `Turno de ${esc(v.opp)}…`}</div>${grid}<p class="hint">Contra ${esc(v.opp)}</p>`, v.myTurn);
    const btns = [...app.querySelectorAll('.pboard [data-i]')];
    if (C4) {
      const hl = col => btns.forEach(b => b.classList.toggle('hl', col != null && (+b.dataset.i) % 7 === col));
      btns.forEach(b => {
        b.addEventListener('pointerenter', () => { if (v.myTurn) hl((+b.dataset.i) % 7); });
        b.addEventListener('pointerdown', () => { if (v.myTurn) hl((+b.dataset.i) % 7); });
        b.onclick = () => { if (b.disabled) return; const col = (+b.dataset.i) % 7; send({ t: 'act', a: 'move', i: col }); btns.forEach(x => x.disabled = true); hl(col); SFX.pop(); };
      });
    } else btns.forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'move', i: +b.dataset.i }); btns.forEach(x => x.disabled = true); SFX.pop(); });
  },
  grid9(v) {
    const ICON = { mole: '🐹', gold: '⭐', bomb: '💣' };
    app.innerHTML = shell(`<div class="c-hint">🔨 ¡Dale a los topos! ⭐ = +3 · 💣 = −2</div><div class="pgrid" id="pg">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<button data-i="${i}"><span></span></button>`).join('')}</div>`);
    const bs = [...app.querySelectorAll('#pg button')]; let lockUntil = 0;
    bs.forEach(b => b.addEventListener('pointerdown', e => {
      e.preventDefault(); if (Date.now() < lockUntil) return;
      send({ t: 'act', a: 'hit', i: +b.dataset.i }); b.classList.add('f'); setTimeout(() => b.classList.remove('f'), 120); if (navigator.vibrate) navigator.vibrate(15);
    }));
    P.onLive = m => {
      if (m.kind === 'mole') m.h.forEach((s, i) => { const sp = bs[i].firstChild, nv = !s ? '' : typeof s === 'string' && s[0] === 'x' ? '💥' + s.slice(1) : ICON[s] || ''; if (sp.textContent !== nv) { sp.textContent = nv; bs[i].className = s && s[0] !== 'x' ? 'up ' + s : ''; } });
      if (m.kind === 'lock') { lockUntil = Date.now() + m.ms; const pg = $('#pg'); pg.classList.add('locked'); setTimeout(() => pg.classList.remove('locked'), m.ms); if (navigator.vibrate) navigator.vibrate(60); }
    };
  },
  jump(v) {
    app.innerHTML = shell(`<div class="c-hint">Saltá cuando la cuerda pase por los pies 👣 (el círculo te ayuda)</div><div class="jwrap"><div class="beat" id="beat"></div><button class="tapbtn" id="jb" style="background:radial-gradient(circle at 35% 30%,#fdba74,#f97316 55%,#c2410c);box-shadow:0 14px 0 #7c2d12">⬆️<br>¡SALTÁ!</button></div>`);
    const jb = $('#jb'), bt = $('#beat');
    jb.addEventListener('pointerdown', e => { e.preventDefault(); send({ t: 'act', a: 'jump' }); jb.classList.remove('hit'); void jb.offsetWidth; jb.classList.add('hit'); if (navigator.vibrate) navigator.vibrate(20); });
    jb.addEventListener('contextmenu', e => e.preventDefault());
    P.onLive = m => { if (m.kind !== 'beat') return; bt.style.transition = 'none'; bt.style.transform = 'translate(-50%,-50%) scale(1.9)'; bt.style.opacity = '1'; void bt.offsetWidth; bt.style.transition = `transform ${m.ms}ms linear, opacity .25s ${m.ms}ms`; bt.style.transform = 'translate(-50%,-50%) scale(1)'; bt.style.opacity = '0'; };
  },
  judge(v) {
    app.innerHTML = shell(`<div class="c-prompt small">⚖️ Letra <span class="bl">${esc(v.letter)}</span><br>Tocá 👎 las palabras que <b>NO valen</b>: inventadas, mal escritas o que no son de esa categoría.</div>
      <div class="jlist">${v.cats.map((c, ci) => { const its = v.items.filter(x => x.c === ci); return its.length ? `<div class="jcat">${esc(c)}</div>` + its.map(x => `<button class="jrow" data-i="${x.i}"><span>${esc(x.a)}</span><b>👍</b></button>`).join('') : ''; }).join('')}</div>
      <button class="btn big green" id="bJ">Listo ✅</button>`, true);
    const rej = new Set(); let sent = false;
    app.querySelectorAll('.jrow').forEach(r => r.onclick = () => { const i = +r.dataset.i; if (rej.has(i)) { rej.delete(i); r.classList.remove('no'); r.lastChild.textContent = '👍'; } else { rej.add(i); r.classList.add('no'); r.lastChild.textContent = '👎'; } if (navigator.vibrate) navigator.vibrate(10); });
    const go = () => { if (sent) return; sent = true; send({ t: 'act', a: 'judge', rej: [...rej] }); $('#bJ').disabled = true; $('#bJ').textContent = 'Enviado ⚖️'; };
    $('#bJ').onclick = go;
    if (P.deadline) P.timers.push(setTimeout(go, Math.max(0, P.deadline - Date.now() - 500)));
  },
});


