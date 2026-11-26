/* ================== NUEVA INTERFAZ: LOBBY CON ESCENARIO 3D ================== */
lobbyHTML = function () {
  const ps = [...H.players.values()], n = ps.filter(p => p.online).length, bots = ps.filter(p => p.isBot).length;
  return `<div class="lob">
    <header class="lob-head">${marqueeHTML(true)}<span class="lob-count">${ICO('users')} ${n} de 8 jugadores</span></header>
    <section class="lob-stage">
      <div class="stage3d" id="stage3d"></div>
      <div class="stage-chips">${ps.length ? ps.map(p => `<span class="pchip ${p.online ? '' : 'off'}" style="--c:${p.color}"><span class="e">${p.emoji}</span>${esc(p.name)}</span>`).join('') : '<span class="stage-empty">El escenario está vacío. Escaneá el código para subirte 👉</span>'}</div>
    </section>
    <aside class="lob-side">
      <div class="ticket">
        <div class="qr">${qrHTML()}</div>
        <div class="tk-info"><span class="tk-lbl">Código de la sala</span><div class="code">${[...H.code].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
          <div class="tk-link">${esc(joinLink().replace(/^https?:\/\//, ''))}</div>
          <div class="tk-btns"><button class="btn small blue" data-act="copy">${ICO('copy')} Copiar link</button>${navigator.share ? `<button class="btn small purple" data-act="share">${ICO('share-2')} Compartir</button>` : ''}</div></div>
      </div>
      <div class="panel">
        <div class="pn-row"><span>${ICO('repeat')} Rondas</span><div class="seg">${[5, 7, 10, 15].map(r => `<button class="${H.rounds === r ? 'on' : ''}" data-act="rounds" data-n="${r}">${r}</button>`).join('')}</div></div>
        <div class="pn-row"><span>${ICO('bot')} Bots</span><div class="seg"><button data-act="rmbot" ${bots ? '' : 'disabled'}>−</button><b class="segv">${bots}</b><button data-act="addbot">+</button></div></div>
        <button class="pn-test" data-act="testmenu">${ICO('flask-conical')} ${H.testMenu ? 'Ocultar la lista de juegos' : `Probar un juego suelto (${Object.keys(GAMES).length})`}</button>
      </div>
      <button class="go-btn" data-act="start" ${n < 2 ? 'disabled' : ''}>${ICO('play')} ${n < 2 ? 'Faltan jugadores (mínimo 2)' : '¡Empezar la fiesta!'}</button>
    </aside>
    ${H.testMenu ? `<section class="lob-tests">${Object.entries(GAMES).map(([k, g]) => `<button class="tgame" data-act="test" data-k="${k}" style="--gc:${g.color}"><span>${g.emoji}</span>${esc(g.name)}</button>`).join('')}</section>` : ''}
  </div>`;
};
const _renderHost1 = renderHost;
renderHost = function () {
  _renderHost1();
  drawIcons();
  const ps = [...H.players.values()].filter(p => p.online);
  if (H.phase === 'lobby') {
    const el = $('#stage3d'); if (el) Stage3D.mount(el, ps, 'lobby');
  }
  if (H.phase === 'final') { const el = $('#stage3d'); if (el) Stage3D.mount(el, sortedPlayers(), 'podium'); }
};
const _finalHTML0 = finalHTML;
finalHTML = function () {
  return `<div class="final-wrap"><div class="stage3d podium3d" id="stage3d"></div><div class="final-2d">${_finalHTML0()}</div></div>`;
};
const _onHostMsg0 = onHostMsg;
onHostMsg = function (conn, m) { const had = m && m.t === 'join' && H.players.has(m.pid); _onHostMsg0(conn, m); if (m && m.t === 'join' && !had) setTimeout(() => Stage3D.cheer(conn._pid), 900); };
