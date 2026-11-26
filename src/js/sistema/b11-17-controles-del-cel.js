/* ---------- controles del cel ---------- */
XS.domino = function (v) {
  const pend = P._dmPend; P._dmPend = null;
  app.innerHTML = shell(`<div class="pdm">
    <div class="pdm-ends"><span>⬅ Punta <b>${v.L}</b></span><span class="pdm-pile">🫳 ${v.pile}</span><span>Punta <b>${v.R}</b> ➡</span></div>
    <div class="pdm-hand">${v.hand.map((t, i) => { const [l, r] = v.fits[i]; return `<button class="pdmt ${l || r ? 'ok' : 'no'}" data-i="${i}" data-l="${l ? 1 : 0}" data-r="${r ? 1 : 0}"><img src="${domSrc(v.st, t[0], t[1])}" alt="${t[0]}|${t[1]}"></button>`; }).join('')}</div>
    <div class="pdm-side" id="dmside" hidden><button class="btn big" data-s="L">⬅ Izquierda (${v.L})</button><button class="btn big" data-s="R">Derecha (${v.R}) ➡</button></div>
    <button class="btn ${v.fits.some(f => f[0] || f[1]) ? 'gray' : 'big pink'}" id="dmdraw" ${v.pile ? '' : 'disabled'}>🫳 Robar ficha ${v.pile ? `(${v.pile})` : '(no quedan)'}</button>
    <div class="pdm-tip">Las que brillan pegan en la mesa · ¡Sé el más rápido!</div></div>`, true);
  let sel = -1;
  const side = $('#dmside');
  app.querySelectorAll('.pdmt').forEach(b => b.onclick = () => {
    if (b.classList.contains('no')) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); SFX.bad(); return; }
    const i = +b.dataset.i, l = b.dataset.l === '1', r = b.dataset.r === '1';
    if (l && r && v.L !== v.R) { sel = i; app.querySelectorAll('.pdmt').forEach(x => x.classList.toggle('sel', x === b)); side.hidden = false; return; }
    send({ t: 'act', a: 'play', i }); b.classList.add('gone'); if (navigator.vibrate) navigator.vibrate(20);
  });
  side.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { if (sel < 0) return; send({ t: 'act', a: 'play', i: sel, side: b.dataset.s }); side.hidden = true; app.querySelector(`.pdmt[data-i="${sel}"]`)?.classList.add('gone'); });
  $('#dmdraw').onclick = () => { send({ t: 'act', a: 'draw' }); if (navigator.vibrate) navigator.vibrate(12); };
  P.onKey = (k, first) => { if (!first) return; if (k === ' ' || k === 'enter') $('#dmdraw')?.click(); else if (/^[1-9]$/.test(k)) app.querySelectorAll('.pdmt')[+k - 1]?.click(); else if (k === 'arrowleft' || k === 'a') side.querySelector('[data-s="L"]')?.click(); else if (k === 'arrowright' || k === 'd') side.querySelector('[data-s="R"]')?.click(); };
};
XS.manos = function (v) {
  app.innerHTML = shell(`<div class="pmn"><div class="pmn-top">Seña ${v.r}/${v.N} · <b>¿Simón lo dijo?</b></div>
    <div class="pmn-grid">${GESTOS.map(([g, e, n], i) => `<button class="pmnb ${v.picked === i ? 'on' : ''}" data-g="${i}" ${v.picked >= 0 ? 'disabled' : ''}><img src="assets/shapes/hand_yellow_${g}.png" alt="${e}"><small>${n}</small></button>`).join('')}</div>
    <div class="pmn-tip">${v.picked >= 0 ? '¡Listo! 🤞' : 'Si NO dice "Simón dice", ¡no toqués nada!'}</div></div>`, false);
  app.querySelectorAll('.pmnb').forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'gesto', g: +b.dataset.g }); app.querySelectorAll('.pmnb').forEach(x => { x.disabled = true; x.classList.toggle('on', x === b); }); if (navigator.vibrate) navigator.vibrate(20); });
  P.onKey = (k, first) => { if (first && /^[1-6]$/.test(k)) app.querySelectorAll('.pmnb')[+k - 1]?.click(); };
};
