/* ================== 🎨 KIT DE DIBUJO PRO (lo usan Dibujito Desastre y Dibuja y Adivina) ================== */
const PTOOLS = [['marker', '🖊️', 'Plumón'], ['pencil', '✏️', 'Grafito'], ['brush', '🖌️', 'Pincel'], ['crayon', '🖍️', 'Crayón'], ['spray', '💨', 'Spray'], ['fill', '🪣', 'Rellenar'], ['eraser', '🧽', 'Borrar']];
const hexRGB = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
function floodFill(g, x, y, hex, W) {
  const img = g.getImageData(0, 0, W, W), d = img.data, [r, gg, b] = hexRGB(hex);
  x = Math.max(0, Math.min(W - 1, x | 0)); y = Math.max(0, Math.min(W - 1, y | 0));
  const i0 = (y * W + x) * 4, tr = d[i0], tg = d[i0 + 1], tb = d[i0 + 2];
  if (Math.abs(tr - r) + Math.abs(tg - gg) + Math.abs(tb - b) < 12) return;
  const tol = 90, seen = new Uint8Array(W * W);
  const match = p => !seen[p] && Math.abs(d[p * 4] - tr) + Math.abs(d[p * 4 + 1] - tg) + Math.abs(d[p * 4 + 2] - tb) <= tol;
  const st = [x, y];
  while (st.length) {
    const yy = st.pop(); let xx = st.pop();
    while (xx > 0 && match(yy * W + xx - 1)) xx--;
    let up = false, dn = false;
    while (xx < W && match(yy * W + xx)) {
      const p = yy * W + xx, i = p * 4; d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; seen[p] = 1;
      if (yy > 0) { const m = match(p - W); if (m && !up) { st.push(xx, yy - 1); up = true; } else if (!m) up = false; }
      if (yy < W - 1) { const m = match(p + W); if (m && !dn) { st.push(xx, yy + 1); dn = true; } else if (!m) dn = false; }
      xx++;
    }
  }
  g.putImageData(img, 0, 0);
}
function paintScreen(v, mode) {
  const W = 640, live = mode === 'live';
  const title = live ? `✏️ Dibujá: <b>${esc(v.word)}</b> <small>(¡sin letras!)</small>` : `🎨 Dibujá: <b>${esc(v.prompt)}</b>`;
  app.innerHTML = shell(`<div class="c-prompt small pop">${title}</div>
    <div class="cvwrap"><canvas id="cv" width="${W}" height="${W}"></canvas></div>
    <div class="ptools">${PTOOLS.map(([k, ic, lb], i) => `<button class="ptool ${i === 0 ? 'sel' : ''}" data-tool="${k}"><span>${ic}</span><small>${lb}</small></button>`).join('')}</div>
    <div class="pcolors"><label class="sw custom" title="Elegí cualquier color"><input type="color" id="cpick" value="#ff4d8d"><span>🎨</span></label>${PAL.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
    <div class="psize"><span class="dotprev" id="dotp"></span><input type="range" id="psz" min="2" max="60" value="12"><button class="btn small gray" id="bUndo">↩️</button><button class="btn small gray" id="bClr">🗑️</button></div>
    ${live ? '<p class="hint">📺 Tu dibujo sale en vivo en la tele</p>' : '<button class="btn big pink" id="bSend">¡Listo! 🖼️</button>'}`, true);
  const c = $('#cv'), g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, W); g.lineCap = 'round'; g.lineJoin = 'round';
  let tool = 'marker', col = PAL[0], size = 12, drawing = false, pts = [], last = null, lastT = 0, hist = [], dirty = true, strokes = 0, sprayIv = null, sent = false;
  const dotp = $('#dotp');
  const prev = () => { const s = Math.max(4, Math.min(44, size * (tool === 'pencil' ? .5 : tool === 'spray' ? 1.4 : 1))); dotp.style.width = dotp.style.height = s + 'px'; dotp.style.background = tool === 'eraser' ? '#fff' : col; };
  prev();
  const pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * W / r.height, t: performance.now() }; };
  const save = () => { try { hist.push(g.getImageData(0, 0, W, W)); if (hist.length > 8) hist.shift(); } catch (e) {} };
  const sprayAt = p => { const R = size * 1.4; g.fillStyle = col; for (let k = 0; k < 26; k++) { const a = Math.random() * 6.283, rr = Math.random() * R; g.fillRect(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 1.6, 1.6); } };
  const stamp = (p, rad, alpha) => { g.globalAlpha = alpha; g.beginPath(); g.arc(p.x, p.y, Math.max(.6, rad), 0, 6.283); g.fill(); g.globalAlpha = 1; };
  const seg = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(dist / 2));
    if (tool === 'marker' || tool === 'eraser') {
      g.strokeStyle = tool === 'eraser' ? '#fff' : col; g.lineWidth = tool === 'eraser' ? size * 1.6 : size;
      if (pts.length >= 3) { const p0 = pts[pts.length - 3], p1 = pts[pts.length - 2], p2 = pts[pts.length - 1]; const m1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }, m2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }; g.beginPath(); g.moveTo(m1.x, m1.y); g.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y); g.stroke(); }
      else { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    } else if (tool === 'pencil') {
      g.strokeStyle = col; g.globalAlpha = .55; g.lineWidth = Math.max(1.2, size * .35); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); g.globalAlpha = 1;
      g.fillStyle = col; for (let k = 0; k < steps; k++) if (Math.random() < .5) { const t = k / steps; stamp({ x: a.x + dx * t + (Math.random() - .5) * size * .5, y: a.y + dy * t + (Math.random() - .5) * size * .5 }, .7, .35); }
    } else if (tool === 'brush') {
      const speed = dist / Math.max(1, b.t - a.t) * 16, rad = size * .5 * Math.max(.35, 1.35 - Math.min(1, speed / 30));
      g.fillStyle = col; for (let k = 0; k <= steps; k++) { const t = k / steps; stamp({ x: a.x + dx * t, y: a.y + dy * t }, rad, .9); }
    } else if (tool === 'crayon') {
      g.fillStyle = col; for (let k = 0; k <= steps; k++) { const t = k / steps; for (let j = 0; j < 4; j++) stamp({ x: a.x + dx * t + (Math.random() - .5) * size, y: a.y + dy * t + (Math.random() - .5) * size }, Math.random() * size * .18 + .6, .55); }
    } else if (tool === 'spray') sprayAt(b);
  };
  c.addEventListener('pointerdown', e => {
    e.preventDefault(); if (sent) return;
    try { c.setPointerCapture(e.pointerId); } catch (er) {}
    const p = pos(e); save(); strokes++; dirty = true;
    if (tool === 'fill') { floodFill(g, p.x, p.y, col, W); return; }
    drawing = true; pts = [p]; last = p;
    g.fillStyle = tool === 'eraser' ? '#fff' : col;
    if (tool === 'marker' || tool === 'eraser') stamp(p, (tool === 'eraser' ? size * 1.6 : size) / 2, 1);
    else if (tool === 'spray') { sprayAt(p); sprayIv = setInterval(() => { if (drawing) { sprayAt(last); dirty = true; } }, 40); }
    else seg(p, p);
  });
  c.addEventListener('pointermove', e => {
    if (!drawing) return; e.preventDefault();
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (list.length ? list : [e])) { const p = pos(ev); pts.push(p); if (pts.length > 4) pts.shift(); seg(last, p); last = p; }
    dirty = true;
  });
  const stop = () => { drawing = false; pts = []; clearInterval(sprayIv); };
  c.addEventListener('pointerup', stop); c.addEventListener('pointercancel', stop);
  app.querySelectorAll('.ptool').forEach(b => b.onclick = () => { tool = b.dataset.tool; app.querySelectorAll('.ptool').forEach(x => x.classList.toggle('sel', x === b)); prev(); });
  const setCol = (cc, el) => { col = cc; app.querySelectorAll('.pcolors .sw').forEach(x => x.classList.toggle('sel', x === el)); if (tool === 'eraser') { tool = 'marker'; app.querySelectorAll('.ptool').forEach(x => x.classList.toggle('sel', x.dataset.tool === 'marker')); } prev(); };
  app.querySelectorAll('.pcolors button.sw').forEach(b => b.onclick = () => setCol(b.dataset.c, b));
  const cp = $('#cpick'), cl = cp.parentElement;
  cp.addEventListener('input', () => { cl.style.background = cp.value; setCol(cp.value, cl); });
  cp.addEventListener('click', () => setCol(cp.value, cl));
  $('#psz').addEventListener('input', e => { size = +e.target.value; prev(); });
  $('#bUndo').onclick = () => { const h = hist.pop(); if (h) { g.putImageData(h, 0, 0); dirty = true; } };
  $('#bClr').onclick = () => { save(); g.fillStyle = '#fff'; g.fillRect(0, 0, W, W); dirty = true; };
  P.timers.push({ clear: () => clearInterval(sprayIv) });
  if (live) {
    const sm = document.createElement('canvas'); sm.width = sm.height = 260; const sg = sm.getContext('2d');
    P.timers.push(setInterval(() => { if (!dirty) return; dirty = false; sg.drawImage(c, 0, 0, 260, 260); send({ t: 'act', a: 'live', img: sm.toDataURL('image/jpeg', .55) }); }, 600));
  } else {
    const submit = auto => {
      if (sent || (auto && !strokes)) return; sent = true;
      const b = $('#bSend'); b.disabled = true; b.textContent = 'Enviando… 🚀';
      sendBig({ t: 'act', a: 'draw', img: shrinkImg(c, 420, .78) }, tr => { if (b.isConnected) b.textContent = tr ? 'Reintentando… 📡' : '¡Enviado! ✅'; });
    };
    $('#bSend').onclick = () => submit(false);
    if (P.deadline) P.timers.push(setTimeout(() => submit(true), Math.max(0, P.deadline - Date.now() - 600)));
  }
}
drawScreen = v => paintScreen(v, 'draw');
XS.pdraw = v => paintScreen(v, 'live');
const _clearTimers0 = clearTimers;
clearTimers = function () { P.timers.forEach(t => { if (t && t.clear) t.clear(); }); P.timers = P.timers.filter(t => !(t && t.clear)); _clearTimers0(); };
