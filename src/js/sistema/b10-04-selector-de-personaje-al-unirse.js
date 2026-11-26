/* ---------- selector de personaje al unirse ---------- */
(() => {
  const os = showJoin;
  showJoin = function (code) {
    os(code);
    const btn = $('#bGo'); if (!btn) return;
    let sel = store.get('cp_char'); if (!CHARS.some(c => c[0] === sel)) sel = 'Robot';
    btn.insertAdjacentHTML('beforebegin', `<div class="charpick-l">Elegí tu personaje <small>(el robot toma el color que te toque)</small></div><div class="charpick">${CHARS.map(([k, n]) => `<button class="cpk ${k === sel ? 'sel' : ''}" data-k="${k}" title="${n}"><img src="assets/chars/thumbs/${k}.png" alt=""><span>${n}</span></button>`).join('')}</div>`);
    app.querySelectorAll('.cpk').forEach(b => b.onclick = () => { sel = sel === b.dataset.k ? '' : b.dataset.k; app.querySelectorAll('.cpk').forEach(x => x.classList.toggle('sel', x.dataset.k === sel)); store.set('cp_char', sel); P.char = sel || undefined; SFX.pop(); });
    P.char = sel || undefined;
  };
  const oc = connectToHost;
  connectToHost = function () {
    oc();
    const c = P.conn; if (!c) return;
    const os2 = c.send.bind(c);
    c.send = o => os2(o && o.t === 'join' ? Object.assign({}, o, { char: P.char }) : o);
  };
  const oh = onHostMsg;
  onHostMsg = function (conn, m) {
    oh(conn, m);
    if (m && m.t === 'join') { const p = pl(conn._pid); if (p) { const ch = CHARS.some(c => c[0] === m.char) ? m.char : null; if (p.char !== ch) { p.char = ch; if (H.phase === 'lobby') renderHost(); } preloadChars([charOf(p)]); } }
  };
  const ow = onPlayerMsg;
  onPlayerMsg = function (m) { ow(m); if (m && m.t === 'welcome' && !P.char) P.charColor = m.color; };
  const orc = renderCtrl;
  renderCtrl = function (v) {
    orc(v);
    const el = $('#mini3d'); if (el && v.screen === 'lobby') Stage3D.mount(el, [{ id: 'me', name: P.name, emoji: P.emoji, color: P.color, char: P.char }], 'solo');
  };
})();
