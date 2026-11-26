/* ================== JUGADOR (EL CONTROL) ================== */
const P = { peer: null, conn: null, code: '', pid: '', name: '', emoji: '🐸', color: '#ff4d8d', viewStr: '', rem: 0, deadline: 0, dur: 0, timers: [], unlock: null, score: 0 };

function showJoin(code) {
  if (!/^[A-Z]{4}$/.test(code)) return showError('Ese código de sala no es válido 🤔', null);
  let sel = store.get('cp_emoji') || EMOJIS[rand(EMOJIS.length)];
  app.innerHTML = `<div class="screen">
    <div class="logo small">${logoHTML()}</div>
    <div class="sala">Sala <b>${esc(code)}</b></div>
    <input id="iName" maxlength="12" placeholder="Tu nombre" value="${esc(store.get('cp_name') || '')}" autocomplete="off">
    <div class="emojis">${EMOJIS.map(e => `<button class="emo ${e === sel ? 'sel' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
    <button class="btn big pink" id="bGo">¡Entrar a la fiesta! 🎉</button>
  </div>`;
  app.querySelectorAll('.emo').forEach(b => b.onclick = () => { sel = b.dataset.e; app.querySelectorAll('.emo').forEach(x => x.classList.toggle('sel', x === b)); SFX.pop(); });
  const go = () => {
    const name = clean($('#iName').value, 12);
    if (!name) { const i = $('#iName'); i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake'); i.focus(); return; }
    store.set('cp_name', name); store.set('cp_emoji', sel);
    beep(1, .01, 'sine', .0001);
    startPlayer(code, name, sel);
  };
  $('#bGo').onclick = go;
  $('#iName').onkeydown = e => { if (e.key === 'Enter') go(); };
}

function startPlayer(code, name, emoji) {
  Object.assign(P, { code, name, emoji });
  P.pid = store.get('cp_pid', true) || rid(); store.set('cp_pid', P.pid, true);
  ctrlMsg('🔌', 'Conectando…', 'Buscando la sala ' + code);
  if (typeof Peer === 'undefined') return showError('No se pudo cargar la conexión. Revisá tu internet y recargá.', () => location.reload());
  keepAwake();
  P.peer = new Peer(peerOpts());
  P.peer.on('open', connectToHost);
  P.peer.on('error', err => {
    if (err.type === 'peer-unavailable') showError(`No encontré la sala <b>${esc(code)}</b> 😕<br>Revisá el código o que la tele siga abierta.`, () => { ctrlMsg('🔌', 'Conectando…', ''); P.conn = null; connectToHost(); });
    else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) { ctrlMsg('📡', 'Problemas de internet…', 'Reintentando'); setTimeout(() => { try { if (P.peer.disconnected) P.peer.reconnect(); } catch (e) {} }, 2500); }
  });
  P.peer.on('disconnected', () => setTimeout(() => { try { if (!P.peer.destroyed) P.peer.reconnect(); } catch (e) {} }, 1500));
  setInterval(() => { const f = $('#ctf'); if (f && P.dur) f.style.width = Math.max(0, (P.deadline - Date.now()) / P.dur * 100) + '%'; }, 100);
}
function connectToHost() {
  if (P.conn && P.conn.open) return;
  const c = P.peer.connect(PREFIX + P.code, { reliable: true });
  P.conn = c;
  c.on('open', () => c.send({ t: 'join', pid: P.pid, name: P.name, emoji: P.emoji }));
  c.on('data', onPlayerMsg);
  c.on('close', () => {
    if (P.conn !== c) return;
    P.viewStr = ''; clearTimers();
    ctrlMsg('📡', 'Se cortó la conexión…', 'Reconectando 🔄');
    setTimeout(() => { if (P.conn === c) { P.conn = null; connectToHost(); } }, 2000);
  });
}
function send(o) { try { if (P.conn && P.conn.open) P.conn.send(o); } catch (e) {} }
/* manda algo grande (un dibujo) en pedacitos chicos y lo reintenta hasta que la tele confirme */
function sendBig(o, onAck) {
  const s = JSON.stringify(o), k = Math.random().toString(36).slice(2, 12), CH = 12000, n = Math.ceil(s.length / CH);
  const go = () => { for (let i = 0; i < n; i++) send({ t: 'part', k, i, n, d: s.slice(i * CH, (i + 1) * CH) }); };
  P.acks = P.acks || new Set(); go(); let tries = 0;
  const iv = setInterval(() => { if (P.acks.has(k)) { clearInterval(iv); onAck && onAck(); return; } if (++tries > 12) { clearInterval(iv); return; } go(); onAck && onAck(tries); }, 3500);
  P.timers.push({ clear: () => clearInterval(iv) }); return k;
}
function shrinkImg(c, max, q) { const w = Math.min(max, c.width), t = document.createElement('canvas'); t.width = t.height = w; const g = t.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, w); g.drawImage(c, 0, 0, w, w); return t.toDataURL('image/jpeg', q); }
function onPlayerMsg(m) {
  if (!m || typeof m !== 'object') return;
  if (m.t === 'ack') { (P.acks = P.acks || new Set()).add(m.k); return; }
  if (m.t === 'welcome') { P.color = m.color; P.name = m.name; P.emoji = m.emoji; document.documentElement.style.setProperty('--me', m.color); }
  else if (m.t === 'full') { P.conn = null; showError('La sala está llena (máximo 8) 😢', null); }
  else if (m.t === 'cut') { if (P.onCut) P.onCut(m.ms, m.by); }
  else if (m.t === 'live') { if (P.onLive) P.onLive(m); }
  else if (m.t === 'toast') { toast(m.text); if (navigator.vibrate) navigator.vibrate([60, 40, 60]); if (P.unlock) P.unlock(); }
  else if (m.t === 'view' && m.v) {
    const s = JSON.stringify(m.v); if (s === P.viewStr) return;
    P.viewStr = s; P.rem = m.v.deadline ? Math.max(0, m.v.deadline - m.now) : 0;
    renderCtrl(m.v);
  }
}
function clearTimers() { P.timers.forEach(t => { if (t && typeof t.clear === 'function') t.clear(); else { clearTimeout(t); clearInterval(t); } }); P.timers = []; P.unlock = null; P.onCut = null; P.onLive = null; }
function shell(inner, timer) {
  return `<div class="ctrl"><div class="c-top"><span>${P.emoji} ${esc(P.name)}</span><span>⭐ ${P.score}</span></div>${timer ? '<div class="ctimer"><div id="ctf"></div></div>' : ''}<div class="c-body">${inner}</div></div>`;
}
function ctrlMsg(big, title, text) {
  app.innerHTML = shell(`<div class="big float">${big}</div>${title ? `<h2>${esc(title)}</h2>` : ''}${text ? `<p class="tag">${esc(text)}</p>` : ''}`);
}

function renderCtrl(v) {
  clearTimers();
  P.score = v.score ?? P.score;
  P.deadline = P.rem ? Date.now() + P.rem : 0; P.dur = P.rem;
  if (navigator.vibrate && ['tap', 'reflex', 'write', 'choose', 'draw'].includes(v.screen)) navigator.vibrate(40);
  switch (v.screen) {
    case 'lobby': app.innerHTML = shell(`<div class="big" style="animation:bob 1.3s infinite">${P.emoji}</div><h2>¡Estás dentro! 🎉</h2><p class="tag">Esperando que la tele empiece la fiesta…</p><p class="hint">${v.count} jugador${v.count === 1 ? '' : 'es'} en la sala</p>`); break;
    case 'watch': app.innerHTML = shell(`<div class="big float">📺</div><h2>¡Mirá la tele!</h2>${v.text ? `<p class="tag">${esc(v.text)}</p>` : ''}`); break;
    case 'msg': app.innerHTML = shell(`<div class="big pop">${v.big || '✨'}</div>${v.title ? `<h2 class="title-pop">${esc(v.title)}</h2>` : ''}${v.text ? `<p class="tag">${esc(v.text)}</p>` : ''}`); break;
    case 'board': app.innerHTML = shell(`<div class="big pop">${v.rank === 1 ? '👑' : medal(v.rank - 1)}</div><h2>Vas de #${v.rank}</h2><div class="c-score">⭐ ${v.score}</div>${v.gain ? `<div class="c-gain">+${v.gain} 🎉</div>` : '<p class="hint">Esta vez no sumaste 😅</p>'}<p class="tag">📺 Mirá la pista en la tele</p>`); if (v.gain) SFX.win(); break;
    case 'final': app.innerHTML = shell(v.rank === 1 ? `<div class="big wiggle">🏆</div><h1 class="title-pop">¡GANASTE!</h1><div class="c-score">⭐ ${v.score}</div>` : `<div class="big pop">${medal(v.rank - 1)}</div><h2>Quedaste #${v.rank}</h2><div class="c-score">⭐ ${v.score}</div><p class="tag">¡La revancha te espera! 😤</p>`); if (v.rank === 1) { confetti(200); SFX.win(); } break;
    case 'tap': tapScreen(); break;
    case 'reflex': reflexScreen(v); break;
    case 'write': writeScreen(v); break;
    case 'choose': chooseScreen(v); break;
    case 'draw': drawScreen(v); break;
    default: if (typeof XS !== 'undefined' && XS[v.screen]) XS[v.screen](v); else ctrlMsg('📺', '¡Mirá la tele!', '');
  }
}
function tapScreen() {
  app.innerHTML = shell(`<div class="tapcount" id="tc">0</div><button class="tapbtn" id="tb">¡TOCÁ!</button>`, true);
  let n = 0, sent = 0, over = false; const tb = $('#tb');
  tb.addEventListener('pointerdown', e => {
    e.preventDefault(); if (over) return;
    n++; $('#tc').textContent = n; tb.classList.remove('hit'); void tb.offsetWidth; tb.classList.add('hit');
    if (n % 5 === 0) SFX.pop();
  });
  tb.addEventListener('contextmenu', e => e.preventDefault());
  P.timers.push(setInterval(() => {
    if (n !== sent) { sent = n; send({ t: 'act', a: 'taps', n }); }
    if (!over && Date.now() > P.deadline + 200) { over = true; tb.disabled = true; tb.textContent = '¡TIEMPO!'; }
  }, 150));
}
function reflexScreen(v) {
  app.innerHTML = shell(`<div class="rx" id="rx"><div class="rx-t">ESPERÁ…</div><div class="rx-s">No toqués hasta que se ponga VERDE</div></div>`);
  const rx = $('#rx'); let state = 'wait', t0 = 0;
  P.timers.push(setTimeout(() => { if (state !== 'wait') return; state = 'go'; t0 = performance.now(); rx.className = 'rx go'; rx.innerHTML = '<div class="rx-t">¡TOCÁ!</div>'; if (navigator.vibrate) navigator.vibrate(80); }, v.delay));
  P.timers.push(setTimeout(() => { if (state === 'go') { state = 'done'; send({ t: 'act', a: 'rx', ms: 1500 }); rx.className = 'rx late'; rx.innerHTML = '<div class="rx-t">😴</div><div class="rx-s">Muy lento…</div>'; } }, v.delay + 3000));
  rx.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (state === 'wait') { state = 'done'; send({ t: 'act', a: 'rx', early: true }); rx.className = 'rx early'; rx.innerHTML = '<div class="rx-t">🙈</div><div class="rx-s">¡MUY PRONTO!</div>'; SFX.bad(); }
    else if (state === 'go') { state = 'done'; const ms = Math.round(performance.now() - t0); send({ t: 'act', a: 'rx', ms }); rx.className = 'rx done'; rx.innerHTML = `<div class="rx-t">⚡ ${ms} ms</div>`; SFX.pop(); }
  });
}
function writeScreen(v) {
  app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.prompt).replace('___', '<b style="color:#ff4d8d">___</b>')}</div>${v.hint ? `<div class="c-hint">${esc(v.hint)}</div>` : ''}<textarea id="tx" maxlength="${v.max || 70}" placeholder="Escribí aquí…"></textarea><button class="btn big pink" id="bSend">Enviar ✉️</button>`, true);
  const tx = $('#tx'), btn = $('#bSend');
  const doSend = auto => {
    const t = tx.value.trim();
    if (!t) { if (!auto) { tx.classList.remove('shake'); void tx.offsetWidth; tx.classList.add('shake'); } return; }
    send({ t: 'act', a: 'text', text: t }); btn.disabled = true; btn.textContent = 'Enviando…';
    P.unlock = () => { btn.disabled = false; btn.textContent = 'Enviar ✉️'; tx.select(); };
  };
  btn.onclick = () => doSend(false);
  tx.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(false); } };
  if (P.deadline) P.timers.push(setTimeout(() => doSend(true), Math.max(0, P.deadline - Date.now() - 300)));
}
function chooseScreen(v) {
  if (!v.options.length) { ctrlMsg('🤷', 'Nada para elegir', 'Mirá la tele'); return; }
  app.innerHTML = shell(`<div class="c-prompt pop">${esc(v.title)}</div><div class="opts ${v.ab ? 'ab' : ''}">${v.options.map((o, i) => `<button class="opt" data-id="${esc(o.id)}" style="--c:${COLORS[(i + 1) % 8]};animation-delay:${i * .07}s">${v.ab ? (i ? 'B · ' : 'A · ') : ''}${esc(o.label)}</button>`).join('')}</div>`, true);
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const msg = { t: 'act', a: 'choose', id: b.dataset.id }; send(msg);
    app.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add('picked'); SFX.pop();
    /* si la tele no responde, reintenta (por si el mensaje se perdió en la red) */
    let n = 0; const iv = setInterval(() => { if (!b.isConnected || ++n > 8) return clearInterval(iv); send(Object.assign({ rt: n }, msg)); }, 2500); P.timers.push({ clear: () => clearInterval(iv) });
  });
}
function drawScreen(v) {
  app.innerHTML = shell(`<div class="c-prompt small pop">🎨 Dibujá: <b>${esc(v.prompt)}</b></div>
    <canvas id="cv" width="320" height="320"></canvas>
    <div class="pal">${PAL.map((c, i) => `<button class="sw ${i === 0 ? 'sel' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
    <div class="tools"><button class="btn small gray" data-s="4">✏️</button><button class="btn small gray sel" data-s="10">🖌️</button><button class="btn small gray" data-s="22">🧽</button><button class="btn small gray" id="bUndo">↩️</button><button class="btn small gray" id="bClr">🗑️</button></div>
    <button class="btn big pink" id="bSend">¡Listo! 🖼️</button>`, true);
  const c = $('#cv'), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 320, 320); g.lineCap = 'round'; g.lineJoin = 'round';
  let col = PAL[0], size = 10, drawing = false, last = null, hist = [], sent = false;
  const pos = e => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * 320 / r.width, y: (e.clientY - r.top) * 320 / r.height }; };
  c.addEventListener('pointerdown', e => {
    e.preventDefault(); if (sent) return;
    try { c.setPointerCapture(e.pointerId); } catch (er) {}
    hist.push(g.getImageData(0, 0, 320, 320)); if (hist.length > 25) hist.shift();
    drawing = true; last = pos(e); g.fillStyle = col; g.beginPath(); g.arc(last.x, last.y, size / 2, 0, 7); g.fill();
  });
  c.addEventListener('pointermove', e => { if (!drawing) return; e.preventDefault(); const p = pos(e); g.strokeStyle = col; g.lineWidth = size; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p; });
  const stop = () => { drawing = false; }; c.addEventListener('pointerup', stop); c.addEventListener('pointercancel', stop);
  app.querySelectorAll('.sw').forEach(b => b.onclick = () => { col = b.dataset.c; app.querySelectorAll('.sw').forEach(x => x.classList.toggle('sel', x === b)); });
  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { size = +b.dataset.s; app.querySelectorAll('[data-s]').forEach(x => x.classList.toggle('sel', x === b)); });
  $('#bUndo').onclick = () => { const h = hist.pop(); if (h) g.putImageData(h, 0, 0); };
  $('#bClr').onclick = () => { hist.push(g.getImageData(0, 0, 320, 320)); g.fillStyle = '#fff'; g.fillRect(0, 0, 320, 320); };
  const submit = auto => {
    if (sent) return; if (auto && !hist.length) return;
    sent = true; const b = $('#bSend'); b.disabled = true; b.textContent = 'Enviando… 🚀';
    sendBig({ t: 'act', a: 'draw', img: shrinkImg(c, 320, .72) }, tr => { if (b.isConnected) b.textContent = tr ? 'Reintentando… 📡' : '¡Enviado! ✅'; });
  };
  $('#bSend').onclick = () => submit(false);
  if (P.deadline) P.timers.push(setTimeout(() => submit(true), Math.max(0, P.deadline - Date.now() - 500)));
}


