/* ================== v13 — SOLO ROBOTS, CON EL COLOR QUE QUIERAS ================== */
CHARS.splice(1);                                   // el único personaje elegible es el robot
const ROBO_COLORS = ['#ff4d6d','#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#14b8a6','#06b6d4','#3b82f6','#6366f1','#a855f7','#ec4899','#f5f5f4','#78716c','#1f2937'];
const okColor = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
function colorPickHTML(sel) {
  const custom = !ROBO_COLORS.includes(sel);
  return `<div class="colpick">${ROBO_COLORS.map(c => `<button class="sw ${c === sel ? 'sel' : ''}" data-c="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}<label class="sw custom ${custom ? 'sel' : ''}" title="Elegí cualquier color"${custom ? ` style="background:${sel}"` : ''}><input type="color" value="${sel}"></label></div>`;
}
function wireColorPick(root, onPick) {
  const all = () => root.querySelectorAll('.colpick .sw');
  const mark = (el, c) => { all().forEach(x => x.classList.toggle('sel', x === el)); onPick(c); };
  root.querySelectorAll('.colpick button.sw').forEach(b => b.onclick = () => { const cu = root.querySelector('.colpick .sw.custom'); if (cu) cu.style.background = ''; mark(b, b.dataset.c); SFX.pop(); });
  const inp = root.querySelector('.colpick input[type=color]');
  if (inp) { const f = () => { inp.parentElement.style.background = inp.value; mark(inp.parentElement, inp.value.toLowerCase()); }; inp.oninput = f; inp.onchange = f; }
}
const myColor = () => { const c = store.get('cp_color'); return okColor(c) ? c : null; };
const preview = (el, color) => { if (el) Stage3D.mount(el, [{ id: 'me', name: P.name || '', emoji: P.emoji || '🤖', color, char: 'Robot' }], 'solo'); };

/* pantalla de unirse: en vez de elegir personaje, se elige el color del robot */
(() => {
  const os = showJoin;
  showJoin = function (code) {
    os(code);
    app.querySelectorAll('.charpick-l,.charpick').forEach(e => e.remove());
    P.char = 'Robot'; store.set('cp_char', 'Robot');
    const btn = $('#bGo'); if (!btn) return;
    let sel = myColor() || pickR(ROBO_COLORS);
    btn.insertAdjacentHTML('beforebegin', `<div class="colpick-l">Pintá tu robot</div><div class="mini3d colprev" id="colprev"><span class="mini-fallback">🤖</span></div>${colorPickHTML(sel)}`);
    const pv = $('#colprev'); preview(pv, sel);
    store.set('cp_color', sel); P.wantColor = sel;
    wireColorPick(app, c => { sel = c; store.set('cp_color', c); P.wantColor = c; preview(pv, c); });
  };
  /* el color viaja con el "join" */
  const oc = connectToHost;
  connectToHost = function () {
    oc();
    const c = P.conn; if (!c) return;
    const os2 = c.send.bind(c);
    c.send = o => os2(o && o.t === 'join' ? Object.assign({}, o, { color: P.wantColor || myColor() || undefined }) : o);
  };
  /* anfitrión: aplica el color pedido (al entrar o desde el lobby) */
  const applyColor = (p, c) => {
    if (!p || !okColor(c) || p.color === c) return;
    p.color = c.toLowerCase();
    try { p.conn && p.conn.send({ t: 'welcome', pid: p.id, name: p.name, color: p.color, emoji: p.emoji }); } catch (e) {}
    if (H.phase === 'lobby') renderHost(); else updateStrip();
    sync();
  };
  const oh = onHostMsg;
  onHostMsg = function (conn, m) {
    if (m && m.t === 'color') { const p = pl(conn._pid); if (p && p.conn === conn && H.phase === 'lobby') applyColor(p, m.c); return; }
    const isNew = m && m.t === 'join' && !H.players.has(m.pid);
    oh(conn, m);
    if (m && m.t === 'join') { const p = pl(conn._pid); if (p) { p.char = null; if (isNew || H.phase === 'lobby') applyColor(p, m.color); } }
  };
  /* control: en el lobby se puede seguir cambiando el color */
  const orc = renderCtrl;
  renderCtrl = function (v) {
    orc(v);
    if (!v || v.screen !== 'lobby') return;
    const el = $('#mini3d'); if (!el || el.parentElement.querySelector('.colpick')) return;
    el.insertAdjacentHTML('afterend', colorPickHTML(P.color));
    wireColorPick(el.parentElement, c => {
      P.color = c; P.wantColor = c; store.set('cp_color', c);
      document.documentElement.style.setProperty('--me', c);
      preview($('#mini3d'), c); send({ t: 'color', c });
      if (navigator.vibrate) navigator.vibrate(12);
    });
  };
})();
