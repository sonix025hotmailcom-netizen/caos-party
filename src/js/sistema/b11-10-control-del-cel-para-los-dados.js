/* ---------- control del cel para los dados ---------- */
XS.dice = function (v) {
  const src = (n, red) => `assets/dice/die${red ? 'Red' : 'White'}_border${n}.png`;
  const fresh = P._dcRid !== v.rid; P._dcRid = v.rid;
  app.innerHTML = shell(`<div class="pdc">
    <div class="pdc-top"><span>Ronda ${v.r}/${v.R}</span><span>🍀 <img src="${src(v.lucky, true)}" alt="${v.lucky}"> = +3</span></div>
    <div class="pdc-dice">${v.d.map((n, i) => `<button class="pdie ${v.rolls && v.hold[i] ? 'held' : ''}" data-i="${i}" ${!v.rolls || v.done ? 'disabled' : ''}><img src="${v.rolls ? src(n, n === v.lucky) : src(i + 1)}" style="${v.rolls ? '' : 'opacity:.35'}" alt="${n}"><small>${v.rolls && v.hold[i] ? 'GUARDADO' : v.rolls && !v.done ? 'tocá' : ''}</small></button>`).join('')}</div>
    <div class="pdc-hand">${v.hand ? esc(v.hand) : '¡Tirá los dados!'}</div>
    ${v.done ? `<div class="pdc-done">✅ ¡Listo! Mirá la tele</div>` : `<button class="btn big pink pdc-roll" id="dcRoll" ${v.rolls >= 3 ? 'disabled' : ''}>🎲 ${v.rolls ? 'Volver a tirar' : 'TIRAR'} <small>(${3 - v.rolls} ${3 - v.rolls === 1 ? 'tiro' : 'tiros'})</small></button>
      ${v.rolls ? '<button class="btn gray pdc-stand" id="dcStand">✋ Me planto</button>' : ''}`}
    <div class="pdc-tip">${v.rolls && !v.done ? 'Tocá los dados que querés guardar y tirá los demás' : ''}</div></div>`, !!v.deadline);
  if (fresh && v.rolls && window.gsap) app.querySelectorAll('.pdie:not(.held) img').forEach(im => gsap.fromTo(im, { rotation: -300 + Math.random() * 600, scale: .6 }, { rotation: 0, scale: 1, duration: .5, ease: 'back.out(2)' }));
  app.querySelectorAll('.pdie').forEach(b => b.onclick = () => { if (b.disabled) return; b.classList.toggle('held'); const sm = b.querySelector('small'); if (sm) sm.textContent = b.classList.contains('held') ? 'GUARDADO' : 'tocá'; send({ t: 'act', a: 'hold', i: +b.dataset.i }); if (navigator.vibrate) navigator.vibrate(12); SFX.pop(); });
  const r = $('#dcRoll'); if (r) r.onclick = () => { if (r.disabled) return; r.disabled = true; send({ t: 'act', a: 'roll' }); if (navigator.vibrate) navigator.vibrate([20, 30, 20]); SND.play('impactWood_medium_000', .4, 1.3); };
  const s = $('#dcStand'); if (s) s.onclick = () => { s.disabled = true; send({ t: 'act', a: 'stand' }); };
  /* teclado: espacio = tirar, 1-5 = guardar dado, P = plantarse */
  P.onKey = (k, first) => { if (!first) return; if (k === ' ' || k === 'enter') { const b = $('#dcRoll'); if (b && !b.disabled) b.click(); } else if (k === 'p') { const b = $('#dcStand'); if (b) b.click(); } else if (/^[1-5]$/.test(k)) { const b = app.querySelectorAll('.pdie')[+k - 1]; if (b) b.click(); } };
};
