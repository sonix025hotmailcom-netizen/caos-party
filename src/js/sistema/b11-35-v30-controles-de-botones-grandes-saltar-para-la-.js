/* ---------- v30: controles de botones grandes ◀ ▶ + SALTAR para la Carrera de Canicas (mucho mejor en cel/tablet) ---------- */
XS.pads = function (v) {
  app.innerHTML = shell(`<div class="jhint">${esc(v.hint || '')}</div><div class="pdz" id="pdz"><div class="pdb" data-d="-1"><span>◀</span></div><div class="pdb" data-d="1"><span>▶</span></div></div><button class="actbtn padjump" id="act"><span class="albl">${esc(v.btn)}</span></button>`);
  app.firstElementChild.classList.add('joy');
  const zone = $('#pdz'), bl = zone.children[0], br = zone.children[1], act = $('#act'), touches = new Map();
  let b = 0, lx = 9, lb = -1, ls = 0;
  const dirAt = e => { const r = zone.getBoundingClientRect(); return e.clientX < r.left + r.width / 2 ? -1 : 1; };
  const paint = () => { const v2 = [...touches.values()]; bl.classList.toggle('on', v2.includes(-1)); br.classList.toggle('on', v2.includes(1)); };
  zone.addEventListener('pointerdown', e => { e.preventDefault(); try { zone.setPointerCapture(e.pointerId); } catch (er) {} touches.set(e.pointerId, dirAt(e)); paint(); if (navigator.vibrate) navigator.vibrate(10); });
  zone.addEventListener('pointermove', e => { if (!touches.has(e.pointerId)) return; e.preventDefault(); const d = dirAt(e); if (touches.get(e.pointerId) !== d) { touches.set(e.pointerId, d); paint(); } });
  const up = e => { touches.delete(e.pointerId); paint(); }; zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
  const jump = () => { b++; act.classList.remove('hit'); void act.offsetWidth; act.classList.add('hit'); if (navigator.vibrate) navigator.vibrate(25); };
  act.addEventListener('pointerdown', e => { e.preventDefault(); jump(); });
  P.onKey = (k, first) => { if (first && keyIs(k, 'act')) jump(); if (first && keyIs(k, 'up')) jump(); };
  if (finePointer()) { const h = app.querySelector('.jhint'); if (h) h.innerHTML = `${KEYIMG('keyboard_a')}${KEYIMG('keyboard_d')} o ← → para rodar · ${KEYIMG('keyboard_space')} o W = saltar`; }
  P.timers.push(setInterval(() => {
    let x = 0; const vs = [...touches.values()]; if (vs.length) x = vs[vs.length - 1];
    if (typeof kdown !== 'undefined' && kdown.size) { const h = g => KEYS[g].some(q => kdown.has(q)); const kx = (h('right') ? 1 : 0) - (h('left') ? 1 : 0); if (kx) x = kx; }
    const now = Date.now(); if (x !== lx || b !== lb || now - ls > 400) { lx = x; lb = b; ls = now; send({ t: 'act', a: 'joy', x, y: 0, b }); }
  }, 40));
};

/* roundRect para tablets/navegadores viejos */
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(typeof r === 'number' ? r : (r && r[0]) || 0, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this; };
