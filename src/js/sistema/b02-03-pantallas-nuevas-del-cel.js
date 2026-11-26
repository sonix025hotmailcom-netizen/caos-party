/* ================== PANTALLAS NUEVAS DEL CEL ================== */
const XS = {
  joy(v) {
    app.innerHTML = shell(`<div class="c-hint">${esc(v.hint || 'Mové tu personaje')}</div><div class="joywrap"><div class="pad" id="pad"><div class="knob" id="knob"></div></div>${v.btn ? `<button class="actbtn" id="act">${esc(v.btn)}</button>` : ''}</div><p class="hint">📺 Mirá la tele mientras jugás</p>`);
    const pad = $('#pad'), knob = $('#knob'); let x = 0, y = 0, b = 0, id = null, lx = 9, ly = 9, lb = -1, ls = 0;
    const upd = e => {
      const r = pad.getBoundingClientRect(), R = r.width / 2;
      let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const d = Math.hypot(dx, dy), m = R * .75;
      if (d > m) { dx = dx / d * m; dy = dy / d * m; }
      x = dx / m; y = dy / m; knob.style.transform = `translate(${dx}px,${dy}px)`;
    };
    pad.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; try { pad.setPointerCapture(id); } catch (er) {} upd(e); });
    pad.addEventListener('pointermove', e => { if (e.pointerId === id) { e.preventDefault(); upd(e); } });
    const rel = e => { if (e.pointerId !== id) return; id = null; x = y = 0; knob.style.transform = ''; };
    pad.addEventListener('pointerup', rel); pad.addEventListener('pointercancel', rel);
    const act = $('#act');
    if (act) act.addEventListener('pointerdown', e => { e.preventDefault(); b++; act.classList.remove('hit'); void act.offsetWidth; act.classList.add('hit'); if (navigator.vibrate) navigator.vibrate(25); });
    P.timers.push(setInterval(() => {
      let kx = 0, ky = 0; if (typeof kdown !== 'undefined' && kdown.size) { const h = g => KEYS[g].some(q => kdown.has(q)); kx = (h('right') ? 1 : 0) - (h('left') ? 1 : 0); ky = (h('down') ? 1 : 0) - (h('up') ? 1 : 0); if (kx && ky) { kx *= .7071; ky *= .7071; } }
      const ux = (kx || ky) ? kx : x, uy = (kx || ky) ? ky : y;
      const rx = Math.round(ux * 100) / 100, ry = Math.round(uy * 100) / 100, now = Date.now();
      if (rx !== lx || ry !== ly || b !== lb || now - ls > 400) { lx = rx; ly = ry; lb = b; ls = now; send({ t: 'act', a: 'joy', x: rx, y: ry, b }); }
    }, 45));
  },
  mash(v) {
    app.innerHTML = shell(`<div class="tapcount" id="mc">0%</div><div class="mash"><button class="L next" id="mL">⬅️<br>IZQ</button><button class="R" id="mR">➡️<br>DER</button></div>`);
    let n = 0, want = 'L', sent = 0;
    const L = $('#mL'), R = $('#mR');
    const hit = side => e => {
      e.preventDefault();
      if (n >= v.goal) return;
      if (side === want) { n++; want = side === 'L' ? 'R' : 'L'; L.classList.toggle('next', want === 'L'); R.classList.toggle('next', want === 'R'); $('#mc').textContent = Math.round(n / v.goal * 100) + '%'; if (n % 6 === 0) SFX.pop(); }
      else { if (navigator.vibrate) navigator.vibrate(60); }
    };
    L.addEventListener('pointerdown', hit('L')); R.addEventListener('pointerdown', hit('R'));
    [L, R].forEach(x => x.addEventListener('contextmenu', e => e.preventDefault()));
    P.timers.push(setInterval(() => { if (n !== sent) { sent = n; send({ t: 'act', a: 'steps', n }); } }, 120));
  },
  simon(v) {
    app.innerHTML = shell(`<div class="c-prompt small">🧠 Repetí la secuencia (${v.len} colores)</div><div class="dots" id="dots">${'<i></i>'.repeat(v.len)}</div><div class="spads">${SIMON.map((s, i) => `<button class="spad" data-i="${i}" style="background:${s.c};--c:${s.c}">${s.s}</button>`).join('')}</div>`, true);
    const seq = [];
    app.querySelectorAll('.spad').forEach(btn => btn.addEventListener('pointerdown', e => {
      e.preventDefault(); if (seq.length >= v.len) return;
      const i = +btn.dataset.i; seq.push(i);
      btn.classList.add('on'); setTimeout(() => btn.classList.remove('on'), 200); beep(SIMON[i].f, .2, 'triangle', .09);
      const d = app.querySelectorAll('#dots i'); if (d[seq.length - 1]) d[seq.length - 1].className = 'f';
      if (seq.length === v.len) { send({ t: 'act', a: 'seq', s: seq }); app.querySelectorAll('.spad').forEach(b => b.disabled = true); }
    }));
  },
  number(v) {
    app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.title)}</div><input id="nn" class="numin" type="number" inputmode="numeric" min="0" max="999" placeholder="0"><button class="btn big pink" id="bN">Enviar 🔢</button>`, true);
    const nn = $('#nn'), go = auto => { const n = parseInt(nn.value, 10); if (!(n >= 0)) { if (!auto) { nn.classList.remove('shake'); void nn.offsetWidth; nn.classList.add('shake'); } return; } send({ t: 'act', a: 'num', n }); $('#bN').disabled = true; };
    $('#bN').onclick = () => go(false); nn.onkeydown = e => { if (e.key === 'Enter') go(false); };
    setTimeout(() => nn.focus(), 200);
    if (P.deadline) P.timers.push(setTimeout(() => go(true), Math.max(0, P.deadline - Date.now() - 300)));
  },
};
