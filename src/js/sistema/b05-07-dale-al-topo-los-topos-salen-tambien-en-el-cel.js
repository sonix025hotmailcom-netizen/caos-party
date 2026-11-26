/* ---------- 🐹 DALE AL TOPO: los topos salen también en el cel ---------- */
GAMES.mole.sync9 = function () { const gd = H.gd; bcast({ t: 'live', kind: 'mole', h: gd.holes.map(h => !h ? 0 : h.hit ? 'x' + (pl(h.hit)?.emoji || '') : h.type) }); };
GAMES.mole.view = function (p) {
  if (!inGame(p)) return watch('Entrás en el próximo juego 😉');
  if (H.phase === 'mole-ready') return { screen: 'msg', big: '🔨', title: '¡Prepará el martillo!', text: 'Los topos salen en tu cel y en la tele. ¡Tocalos!' };
  if (H.phase === 'mole-go') return { screen: 'grid9', key: 'mg' + H.gd.sid };
  return watch();
};
