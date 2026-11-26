/* ----- render host ----- */
function renderHost() {
  const ph = H.phase; let inner = '';
  if (ph === 'lobby') { app.innerHTML = lobbyHTML(); return; }
  if (ph === 'intro') inner = introHTML();
  else if (ph === 'board') inner = boardHTML();
  else if (ph === 'final') inner = finalHTML();
  else if (H.game) inner = H.game.render(ph);
  const strip = !['final', 'board', 'intro'].includes(ph);
  app.innerHTML = `<div class="host">${topBar()}<div class="stage">${inner}</div>${strip ? `<div class="strip" id="strip">${stripInner()}</div>` : ''}</div>`;
  if (ph === 'board') setTimeout(() => { document.querySelectorAll('.runner').forEach(r => r.style.left = r.dataset.to + '%'); countUp(); }, 120);
  if (typeof hostFx === 'function') hostFx(ph);
  hostTick();
}
function topBar() {
  const round = H.order.length ? `Ronda ${Math.min(H.roundIdx + 1, H.order.length)}/${H.order.length}` : '';
  const timer = H.deadline && H.showTimer ? `<div class="timer"><div class="tfill" id="tfill"></div><b id="tnum"></b></div>` : '';
  return `<div class="topbar"><div>${round && H.phase !== 'final' ? `<span class="chip">${round}</span>` : ''}</div><div class="timer-wrap">${timer}</div>
    <div class="tb-right"><span class="chip">Sala <b>${H.code}</b></span>${H.onEnd ? '<button class="btn small gray" data-act="skip" title="Saltar">⏭️</button>' : ''}<button class="btn small gray" data-act="fs" title="Pantalla completa">⛶</button></div></div>`;
}
function stripInner() {
  return [...H.players.values()].map(p => {
    const d = H.game && H.game.isDone ? H.game.isDone(p.id) : false;
    return `<div class="schip ${p.online ? '' : 'off'} ${d ? 'done' : ''}" data-id="${p.id}" style="--c:${p.color}">${p.emoji} ${esc(p.name)}${d ? ' ✅' : ''}<b>${p.score}</b></div>`;
  }).join('');
}
function updateStrip() { const s = $('#strip'); if (s) s.innerHTML = stripInner(); }
let QRN = 0;
function qrHTML() {
  try {
    const q = qrcode(0, 'H'); q.addData(joinLink()); q.make();
    const n = q.getModuleCount(), P = 2, S = n + P * 2, id = 'qg' + (++QRN), eye = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    const L = Math.ceil(n * .24), l0 = (n - L) / 2, inLogo = (r, c) => r + .5 > l0 - .4 && r + .5 < l0 + L + .4 && c + .5 > l0 - .4 && c + .5 < l0 + L + .4;
    let dots = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c) && !eye(r, c) && !inLogo(r, c)) dots += `<rect x="${c + P + .06}" y="${r + P + .06}" width=".88" height=".88" rx=".36"/>`;
    const eyes = [[0, 0], [n - 7, 0], [0, n - 7]].map(([x, y]) => `<rect x="${x + P + .5}" y="${y + P + .5}" width="6" height="6" rx="1.3" fill="none" stroke="url(#${id})" stroke-width="1"/><rect x="${x + P + 2}" y="${y + P + 2}" width="3" height="3" rx="1" fill="#1a1033"/>`).join('');
    const lx = l0 + P, fs = L * .3;
    const logo = `<rect x="${lx - .2}" y="${lx - .2}" width="${L + .4}" height="${L + .4}" rx="${L * .28}" fill="#fff"/><rect x="${lx + .35}" y="${lx + .35}" width="${L - .7}" height="${L - .7}" rx="${L * .22}" fill="url(#${id})"/><text x="${lx + L / 2}" y="${lx + L * .47}" font-family="Bungee, system-ui, sans-serif" font-weight="900" font-size="${fs}" fill="#fff" text-anchor="middle">CAOS</text><text x="${lx + L / 2}" y="${lx + L * .76}" font-family="Bungee, system-ui, sans-serif" font-weight="900" font-size="${fs * .72}" fill="#fde047" text-anchor="middle">PARTY</text>`;
    return `<svg class="qrsvg" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${S}" y2="${S}"><stop offset="0" stop-color="#5b21b6"/><stop offset=".55" stop-color="#be185d"/><stop offset="1" stop-color="#c2410c"/></linearGradient></defs><rect width="${S}" height="${S}" fill="#fff"/><g fill="url(#${id})">${dots}</g>${eyes}${logo}</svg>`;
  } catch (e) { return '<div style="color:#2a0c55;padding:20px;line-height:1.2">📱<br>Usá el link</div>'; }
}
function lobbyHTML() {
  const ps = [...H.players.values()], n = ps.filter(p => p.online).length;
  return `<div class="lobby">
    <div class="logo small">${logoHTML()}</div>
    <div class="join-box pop">
      <div class="qr">${qrHTML()}</div>
      <div><div class="lbl">📱 Escaneá o entrá a este link:</div><div class="link">${esc(joinLink())}</div>
        <div class="lbl">o poné el código:</div><div class="code">${[...H.code].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
        <div style="display:flex;gap:8px;margin-top:8px;justify-content:center"><button class="btn small blue" data-act="copy">📋 Copiar link</button>${navigator.share ? '<button class="btn small purple" data-act="share">📤 Compartir</button>' : ''}</div></div>
    </div>
    <div class="lobby-players">${ps.length ? ps.map(p => `<div class="pchip pop ${p.online ? '' : 'off'}" style="--c:${p.color}"><span class="e">${p.emoji}</span>${esc(p.name)}</div>`).join('') : '<h2 class="float" style="opacity:.8">Esperando jugadores… 👀</h2>'}</div>
    <div class="hint">🎮 ${Object.keys(GAMES).length} minijuegos en total</div>
    <div class="settings"><span>Rondas:</span>${[5, 7, 10, 15].map(r => `<button class="btn small ${H.rounds === r ? 'pink sel' : 'gray'}" data-act="rounds" data-n="${r}">${r}</button>`).join('')}</div>
    ${typeof lobbyExtra === 'function' ? lobbyExtra() : ''}
    <button class="btn big green ${n >= 2 ? 'wiggle' : ''}" data-act="start" ${n < 2 ? 'disabled' : ''}>🚀 ¡EMPEZAR! (${n}/8)</button>
    ${n < 2 ? '<div class="hint">Ocupan al menos 2 jugadores conectados</div>' : ''}
  </div>`;
}
function introHTML() {
  const g = GAMES[H.order[H.roundIdx]];
  return `<div class="intro" style="--gc:${g.color}"><div class="round-lbl">Ronda ${H.roundIdx + 1} de ${H.order.length}</div>
    <div class="g-emoji">${g.emoji}</div><div class="g-name">${g.name}</div><p class="g-desc">${g.desc}</p><div class="cdown" id="cdown"></div></div>`;
}
function boardHTML() {
  const ps = sortedPlayers(), max = Math.max(1, ...ps.map(p => p.score)), last = H.roundIdx + 1 >= H.order.length;
  return `<h1 class="title-pop">📊 La Pista de la Fiesta</h1>
    <div class="track">${ps.map((p, i) => `<div class="tlane pop" style="--c:${p.color};animation-delay:${i * .08}s">
      <div class="tpos">${medal(i)}</div>
      <div class="tway"><div class="tflag">🏁</div><div class="runner" data-to="${(p.score / max * 86).toFixed(1)}" style="left:${((p.prev || 0) / max * 86).toFixed(1)}%">${p.emoji}${i === 0 && p.score > 0 ? '<span class="crown">👑</span>' : ''}</div></div>
      <div class="tinfo"><b>${esc(p.name)}</b><span data-from="${p.prev || 0}" data-count="${p.score}">${p.prev || 0}</span>${p.gain ? `<em class="gain">+${p.gain}</em>` : ''}</div></div>`).join('')}</div>
    <button class="btn big ${last ? 'orange' : 'green'}" data-act="next">${H.testMode ? '🔙 Volver al lobby' : last ? '🏆 ¡Ver quién ganó!' : 'Siguiente juego ▶'}</button>`;
}
function finalHTML() {
  const ps = sortedPlayers(), top = [ps[1], ps[0], ps[2]], places = [2, 1, 3];
  return `<h1 class="title-pop">🏆 ¡${esc(ps[0]?.name || '')} GANA LA FIESTA! 🏆</h1>
    <div class="podium">${top.map((p, j) => p ? `<div class="pod p${places[j]}" style="--c:${p.color}"><div class="pemo">${p.emoji}</div><div class="pname">${esc(p.name)}</div><div class="pblock">${places[j]}<small>${p.score} pts</small></div></div>` : '').join('')}</div>
    <div class="rest">${ps.slice(3).map((p, i) => `<span class="schip" style="--c:${p.color}">${i + 4}° ${p.emoji} ${esc(p.name)} <b>${p.score}</b></span>`).join('')}</div>
    <button class="btn big pink" data-act="again">🔁 Otra partida</button>`;
}
function resultsList(rows) {
  return `<div class="results">${rows.map((r, i) => { const p = pl(r.id); return `<div class="rrow pop" style="--c:${p?.color || '#888'};animation-delay:${i * .15}s"><span class="rmed">${medal(i)}</span><span class="remo">${p?.emoji || '👻'}</span><b class="rname">${esc(p?.name || '?')}</b><span class="rval">${esc(r.val)}</span>${r.gain ? `<em class="gain">+${r.gain}</em>` : ''}</div>`; }).join('')}</div>`;
}
const who = id => { const p = pl(id); return p ? `${p.emoji} ${esc(p.name)}` : '👻'; };
