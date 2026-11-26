/* ================== JUEGOS NUEVOS v6 ================== */
const libWait = (g, lib, startFn) => {
  if (window[lib === 'matter' ? 'Matter' : lib]) return startFn();
  H.gd = { ids: onlineIds(), waiting: true };
  setPhase('lib-wait', 9000, () => { toast('No se pudo cargar el motor de física 😕'); finishGame({}); }, 0, false);
  const tok = H.token;
  loadScript(LIBS[lib]).then(() => { if (tok === H.token) startFn(); }).catch(() => {});
};
const libWaitHTML = '<div class="g-emoji float">⚙️</div><h2>Cargando el motor de física…</h2>';
