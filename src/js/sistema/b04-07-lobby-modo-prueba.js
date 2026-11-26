/* ================== LOBBY: MODO PRUEBA ================== */
function lobbyExtra() {
  const bots = [...H.players.values()].filter(p => p.isBot).length;
  return `<div class="settings"><button class="btn small purple" data-act="addbot">🤖 + Bot</button><button class="btn small gray" data-act="rmbot" ${bots ? '' : 'disabled'}>🤖 − Bot</button><button class="btn small orange" data-act="testmenu">🧪 ${H.testMenu ? 'Ocultar juegos' : 'Probar un juego'}</button></div>
    ${H.testMenu ? `<div class="hint">Tocá un juego para probarlo solo (sirve con 1 jugador + bots)</div><div class="tgrid">${Object.entries(GAMES).map(([k, g]) => `<button class="btn small gray" data-act="test" data-k="${k}">${g.emoji} ${esc(g.name)}</button>`).join('')}</div>` : ''}`;
}
function onHostClick2(a, b) {
  if (a === 'addbot') { addBot(); return true; }
  if (a === 'rmbot') { rmBot(); return true; }
  if (a === 'testmenu') { H.testMenu = !H.testMenu; renderHost(); return true; }
  if (a === 'test') {
    if (onlineIds().length < 1) { toast('Metete con un cel o agregá un bot 🤖'); return true; }
    for (const p of H.players.values()) { p.score = 0; p.prev = 0; p.gain = 0; }
    H.testMode = true; H.order = [b.dataset.k]; H.roundIdx = 0; nextRound(); return true;
  }
  if (a === 'next' && H.testMode && H.phase === 'board') { H.testMode = false; resetGame(); return true; }
  if (a === 'start') H.testMode = false;
  return false;
}


