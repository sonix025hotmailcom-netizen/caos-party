/* ================== HOST (LA TELE) ================== */
const H = { peer: null, code: '', players: new Map(), phase: 'lobby', rounds: 10, inp: {}, roundIdx: 0, order: [], game: null, gd: {}, token: 0, deadline: 0, dur: 0, showTimer: true, timer: null, onEnd: null, lastSent: new Map(), used: {} };
const pl = id => H.players.get(id);
const onlineIds = () => [...H.players.values()].filter(p => p.online).map(p => p.id);
const onlineIn = ids => ids.filter(id => pl(id)?.online);
const inGame = p => (H.gd.ids || []).includes(p.id);
const sortedPlayers = () => [...H.players.values()].sort((a, b) => b.score - a.score);
function pickU(arr, key) {
  H.used[key] = H.used[key] || new Set();
  let pool = arr.filter((_, i) => !H.used[key].has(i));
  if (!pool.length) { H.used[key].clear(); pool = arr; }
  const item = pool[rand(pool.length)]; H.used[key].add(arr.indexOf(item)); return item;
}
function joinLink() { return location.origin + location.pathname + '?sala=' + H.code; }

function startHost() {
  if (typeof Peer === 'undefined') return showError('No se pudo cargar la conexión (PeerJS). Revisá tu internet y recargá la página.', () => location.reload());
  app.innerHTML = `<div class="screen"><div class="big float">📡</div><h2>Creando sala…</h2></div>`;
  keepAwake();
  const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  H.code = Array.from({ length: 4 }, () => L[rand(L.length)]).join('');
  const peer = new Peer(PREFIX + H.code, peerOpts());
  H.peer = peer;
  peer.on('open', () => { setPhase('lobby'); });
  peer.on('error', err => {
    if (err.type === 'unavailable-id') { try { peer.destroy(); } catch (e) {} startHost(); }
    else if (['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'].includes(err.type)) { if (H.phase === 'lobby' && !H.players.size && !peer.open) showError('No se pudo conectar al servidor 😕', () => location.reload()); }
    else console.warn('peer error', err.type);
  });
  peer.on('disconnected', () => { setTimeout(() => { try { if (!peer.destroyed) peer.reconnect(); } catch (e) {} }, 1000); });
  peer.on('connection', conn => {
    conn.on('data', m => onHostMsg(conn, m));
    conn.on('close', () => onHostClose(conn));
    conn.on('error', () => onHostClose(conn));
  });
  app.onclick = onHostClick;
  if (typeof bg3D === 'function') bg3D();
  setInterval(hostTick, 150);
}

function onHostMsg(conn, m) {
  if (!m || typeof m !== 'object') return;
  if (m.t === 'join') {
    const pid = /^[a-z0-9]{6,24}$/i.test(m.pid) ? m.pid : rid();
    let p = pl(pid);
    if (!p) {
      if (H.players.size >= 8) { try { conn.send({ t: 'full' }); } catch (e) {} return; }
      let name = clean(m.name, 12) || 'Jugador', base = name, k = 2;
      while ([...H.players.values()].some(q => q.name.toLowerCase() === name.toLowerCase())) name = base.slice(0, 10) + k++;
      const used = [...H.players.values()].map(q => q.color);
      p = { id: pid, name, emoji: EMOJIS.includes(m.emoji) ? m.emoji : EMOJIS[rand(EMOJIS.length)], color: COLORS.find(c => !used.includes(c)) || COLORS[rand(8)], score: 0, prev: 0, gain: 0, online: true, conn };
      H.players.set(pid, p); SFX.join();
    } else {
      if (p.conn && p.conn !== conn) { try { p.conn.close(); } catch (e) {} }
      p.conn = conn; p.online = true;
    }
    conn._pid = pid;
    H.lastSent.delete(pid);
    try { conn.send({ t: 'welcome', pid, name: p.name, color: p.color, emoji: p.emoji }); } catch (e) {}
    if (H.phase === 'lobby') renderHost(); else updateStrip();
    sync();
    return;
  }
  const p = pl(conn._pid);
  if (!p || p.conn !== conn) return;
  if (m.t === 'part') { /* mensajes grandes (dibujos) llegan en pedacitos y se arman acá */
    const k = String(m.k || '').slice(0, 24), n = m.n | 0, i = m.i | 0; if (!k || n < 1 || n > 120 || i < 0 || i >= n || typeof m.d !== 'string' || m.d.length > 16000) return;
    p._pdone = p._pdone || new Set(); if (p._pdone.has(k)) { try { conn.send({ t: 'ack', k }); } catch (e) {} return; }
    p._parts = p._parts || {}; const a = p._parts[k] = p._parts[k] || { n, got: 0, d: [] }; if (a.d[i] == null) { a.d[i] = m.d; a.got++; }
    if (a.got < a.n) return; delete p._parts[k]; p._pdone.add(k); try { conn.send({ t: 'ack', k }); } catch (e) {}
    let o; try { o = JSON.parse(a.d.join('')); } catch (e) { return; } if (o && o.t === 'act' && H.game && H.game.onAct) H.game.onAct(p, o); return;
  }
  if (m.t === 'act' && H.game && H.game.onAct) { H.game.onAct(p, m); if (m.rt) { H.lastSent.delete(p.id); sync(); } }
}
function onHostClose(conn) {
  const p = pl(conn._pid);
  if (!p || p.conn !== conn) return;
  p.online = false; p.conn = null;
  if (H.phase === 'lobby') { H.players.delete(p.id); renderHost(); } else updateStrip();
}

function sync() {
  for (const p of H.players.values()) {
    if (!p.online || !p.conn || !p.conn.open) continue;
    const v = ctrlView(p), s = JSON.stringify(v);
    if (H.lastSent.get(p.id) === s) continue;
    H.lastSent.set(p.id, s);
    try { p.conn.send({ t: 'view', v, now: Date.now() }); } catch (e) {}
  }
}
function ctrlView(p) {
  let v;
  if (H.phase === 'lobby') v = { screen: 'lobby', count: H.players.size };
  else if (H.phase === 'board' || H.phase === 'final') v = { screen: H.phase, rank: sortedPlayers().indexOf(p) + 1, gain: p.gain || 0, last: H.roundIdx + 1 >= H.order.length };
  else if (H.phase === 'intro') { const g = GAMES[H.order[H.roundIdx]]; v = { screen: 'msg', big: g.emoji, title: g.name, text: g.desc }; }
  else if (H.game && H.game.view) v = H.game.view(p);
  else v = watch();
  v.score = p.score;
  return v;
}
const watch = t => ({ screen: 'watch', text: t || '' });
const done = t => ({ screen: 'msg', big: '✅', text: t || '¡Listo! Esperando a los demás…' });

function setPhase(ph, ms = 0, onEnd = null, grace = 0, showTimer = true) {
  H.phase = ph; H.token++; const tok = H.token;
  clearTimeout(H.timer); H.onEnd = null;
  H.deadline = ms ? Date.now() + ms : 0; H.dur = ms; H.showTimer = showTimer; H.lastTickS = null;
  if (ms && onEnd) {
    H.onEnd = () => { if (tok !== H.token) return; clearTimeout(H.timer); H.onEnd = null; onEnd(); };
    H.timer = setTimeout(H.onEnd, ms + grace);
  }
  renderHost(); sync();
}
function checkAll(pred, fn) {
  updateStrip(); sync();
  const ids = onlineIn(H.gd.ids || []);
  if (ids.length && ids.every(pred)) { const tok = H.token; setTimeout(() => { if (tok === H.token) fn(); }, 800); }
}

function hostTick() {
  if (!H.deadline) return;
  const rem = Math.max(0, H.deadline - Date.now()), s = Math.ceil(rem / 1000);
  const f = $('#tfill'); if (f && H.dur) f.style.width = (rem / H.dur * 100) + '%';
  const n = $('#tnum'); if (n) n.textContent = s + 's';
  const c = $('#cdown');
  if (c && c.textContent !== String(s)) { c.textContent = s > 0 ? s : '¡YA!'; c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); if (s > 0) SFX.tick(); }
  else if (!c && H.showTimer && rem > 0 && s <= 5 && H.lastTickS !== s) { H.lastTickS = s; SFX.tick(); }
}

function onHostClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (typeof onHostClick2 === 'function' && onHostClick2(a, b)) return;
  if (a === 'start') startGame();
  else if (a === 'rounds') { H.rounds = +b.dataset.n; renderHost(); }
  else if (a === 'next') { if (H.phase === 'board') { H.roundIdx++; nextRound(); } }
  else if (a === 'again') resetGame();
  else if (a === 'skip') { if (H.onEnd) H.onEnd(); }
  else if (a === 'copy') { const l = joinLink(); (navigator.clipboard ? navigator.clipboard.writeText(l) : Promise.reject()).then(() => toast('¡Link copiado! 📋')).catch(() => prompt('Copiá este link:', l)); }
  else if (a === 'share') { if (navigator.share) navigator.share({ title: 'CAOS PARTY', text: '¡Entrá a mi sala de CAOS PARTY! 🎉', url: joinLink() }).catch(() => {}); }
  else if (a === 'fs') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} }
}

function startGame() {
  if (onlineIds().length < 2) return;
  for (const p of H.players.values()) { p.score = 0; p.prev = 0; p.gain = 0; }
  const keys = Object.keys(GAMES); let out = [];
  while (out.length < H.rounds) { const bag = shuffle(keys); if (out.length && bag[0] === out[out.length - 1]) bag.push(bag.shift()); out.push(...bag); }
  H.order = out.slice(0, H.rounds); H.roundIdx = 0;
  nextRound();
}
function nextRound() {
  if (H.roundIdx >= H.order.length) {
    H.game = null; setPhase('final'); SFX.win(); confetti(250); setTimeout(() => confetti(200), 1400); setTimeout(() => confetti(200), 2800); return;
  }
  H.game = GAMES[H.order[H.roundIdx]]; H.gd = {};
  setPhase('intro', 6000, () => H.game.start(), 0, false); SFX.whoosh();
}
function finishGame(gains) {
  for (const p of H.players.values()) { p.prev = p.score; p.gain = gains[p.id] || 0; p.score += p.gain; }
  H.game = null; setPhase('board'); SFX.win();
}
function resetGame() {
  for (const [id, p] of H.players) { if (!p.online) H.players.delete(id); else { p.score = 0; p.prev = 0; p.gain = 0; } }
  H.game = null; H.gd = {}; setPhase('lobby');
}
function rankGains(ids, scoreFn, higherBetter, valid = () => true, pts = [500, 300, 200], rest = 100) {
  const arr = ids.filter(valid).sort((a, b) => higherBetter ? scoreFn(b) - scoreFn(a) : scoreFn(a) - scoreFn(b));
  const g = {}; let prevS = null, prevR = 0;
  /* si todos quedaron igual (por ej. nadie hizo nada) nadie gana: todos se llevan lo mínimo */
  if (arr.length > 1 && arr.every(id => scoreFn(id) === scoreFn(arr[0]))) { arr.forEach(id => g[id] = rest); return g; }
  arr.forEach((id, i) => { const s = scoreFn(id); const r = s === prevS ? prevR : i; prevS = s; prevR = r; g[id] = pts[r] ?? rest; });
  return g;
}
