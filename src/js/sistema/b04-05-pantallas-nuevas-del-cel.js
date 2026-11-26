/* ---------- pantallas nuevas del cel ---------- */
Object.assign(XS, {
  quiz(v) {
    const L = ['A', 'B', 'C', 'D'], CC = ['#3b82f6', '#ff4d8d', '#22c55e', '#f59e0b'];
    app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.title)}</div><div class="opts">${v.opts.map((o, i) => `<button class="opt" data-i="${i}" style="--c:${CC[i]};animation-delay:${i * .06}s"><b>${L[i]}</b> · ${esc(o)}</button>`).join('')}</div>`, true);
    app.querySelectorAll('.opt').forEach(b => b.onclick = () => { send({ t: 'act', a: 'quiz', i: +b.dataset.i }); app.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add('picked'); SFX.pop(); });
  },
  guess(v) {
    app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.title)}</div>${v.hint ? `<div class="c-hint">${esc(v.hint)}</div>` : ''}<input id="gs" maxlength="30" autocomplete="off" autocapitalize="characters" placeholder="Tu respuesta…"><button class="btn big pink" id="bG">Enviar 🚀</button>`, true);
    const gs = $('#gs'), go = () => { const t = gs.value.trim(); if (!t) return; send({ t: 'act', a: 'guess', text: t }); gs.value = ''; gs.focus(); };
    $('#bG').onclick = go; gs.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); go(); } };
    setTimeout(() => gs.focus(), 200);
  },
  pdraw(v) {
    app.innerHTML = shell(`<div class="c-prompt small pop">✏️ Dibujá: <b>${esc(v.word)}</b> <small>(¡sin letras!)</small></div>
      <canvas id="cv" width="320" height="320"></canvas>
      <div class="pal">${PAL.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
      <div class="tools"><button class="btn small gray" data-s="4">✏️</button><button class="btn small gray sel" data-s="10">🖌️</button><button class="btn small gray" data-s="22">🧽</button><button class="btn small gray" id="bUndo">↩️</button><button class="btn small gray" id="bClr">🗑️</button></div>
      <p class="hint">📺 Tu dibujo sale en vivo en la tele</p>`, true);
    const c = $('#cv'), g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, 320, 320); g.lineCap = 'round'; g.lineJoin = 'round';
    let col = PAL[0], size = 10, drawing = false, last = null, hist = [], dirty = true;
    const pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * 320 / r.width, y: (e.clientY - r.top) * 320 / r.height }; };
    c.addEventListener('pointerdown', e => { e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (er) {} hist.push(g.getImageData(0, 0, 320, 320)); if (hist.length > 25) hist.shift(); drawing = true; last = pos(e); g.fillStyle = col; g.beginPath(); g.arc(last.x, last.y, size / 2, 0, 7); g.fill(); dirty = true; });
    c.addEventListener('pointermove', e => { if (!drawing) return; e.preventDefault(); const p = pos(e); g.strokeStyle = col; g.lineWidth = size; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p; dirty = true; });
    const stop = () => { drawing = false; }; c.addEventListener('pointerup', stop); c.addEventListener('pointercancel', stop);
    app.querySelectorAll('.sw').forEach(b => b.onclick = () => { col = b.dataset.c; app.querySelectorAll('.sw').forEach(x => x.classList.toggle('sel', x === b)); });
    app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { size = +b.dataset.s; app.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('sel', x === b)); });
    $('#bUndo').onclick = () => { const h = hist.pop(); if (h) { g.putImageData(h, 0, 0); dirty = true; } };
    $('#bClr').onclick = () => { hist.push(g.getImageData(0, 0, 320, 320)); g.fillStyle = '#fff'; g.fillRect(0, 0, 320, 320); dirty = true; };
    P.timers.push(setInterval(() => { if (!dirty) return; dirty = false; send({ t: 'act', a: 'live', img: c.toDataURL('image/jpeg', .55) }); }, 650));
  },
  jump(v) {
    app.innerHTML = shell(`<div class="c-hint">📺 Mirá la cuerda en la tele y saltá cuando pase por abajo</div><button class="tapbtn" id="jb" style="background:radial-gradient(circle at 35% 30%,#fdba74,#f97316 55%,#c2410c);box-shadow:0 14px 0 #7c2d12">⬆️<br>¡SALTÁ!</button>`);
    const jb = $('#jb');
    jb.addEventListener('pointerdown', e => { e.preventDefault(); send({ t: 'act', a: 'jump' }); jb.classList.remove('hit'); void jb.offsetWidth; jb.classList.add('hit'); if (navigator.vibrate) navigator.vibrate(20); });
    jb.addEventListener('contextmenu', e => e.preventDefault());
  },
});
