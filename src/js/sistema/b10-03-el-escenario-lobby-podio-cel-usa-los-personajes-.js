/* ---------- el escenario (lobby / podio / cel) usa los personajes elegidos ---------- */
(() => {
  const src = Stage3D;
  /* parcheamos por dentro reemplazando mount para precargar y reintentar cuando llegue el modelo */
  const om = src.mount;
  src.mount = function (el, players, mode) {
    const need = [...new Set(players.map(charOf))].filter(k => k !== 'Robot' && !CHAR_DONE[k]);
    om.call(src, el, players, mode);
    if (need.length) Promise.all(need.map(k => C3D.load(charURL(k)).catch(() => {}))).then(() => { if (el.isConnected) om.call(src, el, players, mode); });
  };
})();
