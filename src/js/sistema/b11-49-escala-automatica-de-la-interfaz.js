/* ---------- escala automática de la interfaz ---------- */
function fitUI() {
  const w = innerWidth, h = innerHeight, land = w > h, ctrl = !!document.querySelector('#app > .ctrl');
  // los controles del cel no se escalan (sus joysticks/lienzos usan coordenadas de pantalla)
  let z = ctrl ? 1 : (land ? Math.min(w / 1280, h / 800) : (w < 700 ? 1 : Math.min(w / 620, h / 1000)));
  z = ctrl ? 1 : Math.max(.55, Math.min(2.2, z));
  const v = z.toFixed(3); if (document.documentElement.style.getPropertyValue('--z') !== v) document.documentElement.style.setProperty('--z', v);
}
addEventListener('resize', fitUI); addEventListener('orientationchange', () => setTimeout(fitUI, 200));
new MutationObserver(fitUI).observe(app, { childList: true });
fitUI();

boot();

