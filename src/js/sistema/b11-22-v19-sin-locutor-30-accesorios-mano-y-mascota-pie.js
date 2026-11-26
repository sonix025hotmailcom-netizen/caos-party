XS.ppt = function (v) {
  app.innerHTML = shell(`<div class="pmn"><div class="pmn-top">Ronda ${v.r}/${v.N}${v.rev ? ' · <b style="color:#facc15">🙃 AL REVÉS</b>' : ''}</div>
    <div class="pmn-grid ppt3">${PPT.map(([g, e, n], i) => `<button class="pmnb ${v.picked === i ? 'on' : ''}" data-c="${i}" ${v.picked >= 0 ? 'disabled' : ''}><img src="assets/shapes/hand_yellow_${g}.png" alt="${e}"><small>${n}</small></button>`).join('')}</div>
    <div class="pmn-tip">${v.picked >= 0 ? '¡Listo! Esperando a los demás 🤞' : v.rev ? 'Al revés: piedra le gana a papel, papel a tijera, tijera a piedra' : 'Piedra le gana a tijera · Tijera a papel · Papel a piedra'}</div></div>`, true);
  app.querySelectorAll('.pmnb').forEach(b => b.onclick = () => { if (b.disabled) return; send({ t: 'act', a: 'ppt', c: +b.dataset.c }); app.querySelectorAll('.pmnb').forEach(x => { x.disabled = true; x.classList.toggle('on', x === b); }); if (navigator.vibrate) navigator.vibrate(20); });
  P.onKey = (k, first) => { if (first && /^[1-3]$/.test(k)) app.querySelectorAll('.pmnb')[+k - 1]?.click(); };
};
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.ppt && H.phase === 'pp-go') {
      const gd = H.gd, M = p._pp || (p._pp = {}); if (gd.pick[p.id] != null) return;
      if (M.r !== gd.r) { M.r = gd.r; M.t = Date.now() + 700 + rand(3500); } if (Date.now() < M.t) return;
      return GAMES.ppt.onAct(p, { a: 'ppt', c: rand(3) });
    }
    return ob(p);
  };
})();
