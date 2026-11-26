GAME_TAGS.auction = ['luck', 'interaction'];
XS.auction = function (v) {
  if (v.bid != null) { app.innerHTML = shell(`<div class="pau"><div class="pau-big">🔨</div><h2>Pujaste ${v.bid} 🪙</h2><p class="tag">Esperando a los demás…</p></div>`, true); return; }
  let b = Math.min(v.money, P._auLast ?? 10);
  app.innerHTML = shell(`<div class="pau"><div class="pau-top"><span>Subasta ${v.r}/${v.N}</span><span>Tenés <b>${v.money}</b> 🪙</span></div>
    <div class="pau-hint">📦 Puede ser<br><b>${v.hint.join('</b> o <b>')}</b></div>
    <div class="pau-amt"><button class="btn gray" data-d="-10">−10</button><button class="btn gray" data-d="-1">−1</button><span id="aub">${b}</span><button class="btn gray" data-d="1">+1</button><button class="btn gray" data-d="10">+10</button></div>
    <div class="pau-quick">${[0, 10, 25, 50].map(q => `<button class="btn" data-q="${q}" ${q > v.money ? 'disabled' : ''}>${q}</button>`).join('')}<button class="btn" data-q="${v.money}">Todo</button></div>
    <button class="btn big pink" id="aubid">🔨 Pujar</button></div>`, true);
  const show = () => { $('#aub').textContent = b; };
  app.querySelectorAll('[data-d]').forEach(x => x.onclick = () => { b = Math.max(0, Math.min(v.money, b + +x.dataset.d)); show(); SFX.pop(); });
  app.querySelectorAll('[data-q]').forEach(x => x.onclick = () => { b = Math.min(v.money, +x.dataset.q); show(); SFX.pop(); });
  $('#aubid').onclick = () => { P._auLast = b; send({ t: 'act', a: 'bid', v: b }); $('#aubid').disabled = true; if (navigator.vibrate) navigator.vibrate(30); };
  P.onKey = (k, first) => { if (k === 'arrowup' || k === 'w') { b = Math.min(v.money, b + 1); show(); } else if (k === 'arrowdown' || k === 's') { b = Math.max(0, b - 1); show(); } else if (k === 'arrowright' || k === 'd') { b = Math.min(v.money, b + 10); show(); } else if (k === 'arrowleft' || k === 'a') { b = Math.max(0, b - 10); show(); } else if (first && (k === ' ' || k === 'enter')) $('#aubid')?.click(); };
};
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    if (H.game === GAMES.auction && H.phase === 'au-go') {
      const gd = H.gd, M = p._au || (p._au = {}); if (gd.bids[p.id]) return;
      if (M.r !== gd.r) { M.r = gd.r; M.t = Date.now() + 1500 + rand(6000); } if (Date.now() < M.t) return;
      const ev = gd.hint.reduce((s, i) => s + (SUB_ITEMS[i][2] + SUB_ITEMS[i][3]) / 2, 0) / 2, bid = Math.max(0, Math.round(ev * (.4 + Math.random() * .6)));
      return GAMES.auction.onAct(p, { a: 'bid', v: Math.min(gd.money[p.id], bid) });
    }
    return ob(p);
  };
})();
