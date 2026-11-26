/* ---------- control del cel para Mayor o Menor ---------- */
XS.hilo = function (v) {
  if (v.bet) { app.innerHTML = shell(`<div class="phl"><img class="phl-card" src="${cardImg(v.card)}" alt=""><h2>Apostaste ${v.bet.n} ficha${v.bet.n > 1 ? 's' : ''} a ${v.bet.c === 'up' ? '▲ MAYOR' : v.bet.c === 'down' ? '▼ MENOR' : '= IGUAL'}</h2><p class="tag">Esperando a los demás…</p></div>`, true); return; }
  let n = Math.min(P._hlN || 1, v.chips);
  app.innerHTML = shell(`<div class="phl">
    <div class="phl-top"><span>Carta ${v.turn}/${v.N}</span><span>🪙 ${v.chips} fichas</span></div>
    <img class="phl-card" src="${cardImg(v.card)}" alt="">
    <div class="phl-bets">${[1, 2, 3].map(k => `<button class="phl-chip ${k === n ? 'on' : ''}" data-n="${k}" ${k > v.chips ? 'disabled' : ''}><img src="assets/deck/chip${CHIP_COL[k - 1]}_border.png" alt=""><b>${k}</b></button>`).join('')}</div>
    <div class="phl-btns"><button class="btn big phl-up" data-c="up">▲ MAYOR</button><button class="btn big phl-dn" data-c="down">▼ MENOR</button></div>
    <button class="btn phl-eq" data-c="eq">= IGUAL <small>(paga x5)</small></button></div>`, true);
  app.querySelectorAll('.phl-chip').forEach(b => b.onclick = () => { if (b.disabled) return; n = +b.dataset.n; P._hlN = n; app.querySelectorAll('.phl-chip').forEach(x => x.classList.toggle('on', x === b)); SFX.pop(); });
  app.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { send({ t: 'act', a: 'hilo', c: b.dataset.c, n }); app.querySelectorAll('[data-c]').forEach(x => x.disabled = true); if (navigator.vibrate) navigator.vibrate(25); });
  P.onKey = (k, first) => { if (!first) return; if (k === 'arrowup' || k === 'w') app.querySelector('.phl-up')?.click(); else if (k === 'arrowdown' || k === 's') app.querySelector('.phl-dn')?.click(); else if (k === 'e') app.querySelector('.phl-eq')?.click(); else if (/^[1-3]$/.test(k)) app.querySelectorAll('.phl-chip')[+k - 1]?.click(); };
};
