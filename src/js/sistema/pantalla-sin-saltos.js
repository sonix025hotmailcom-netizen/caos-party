/* ================== PANTALLA DE LA TELE SIN SALTOS: siempre arriba y la presentación del juego cabe en la pantalla ================== */
(() => {
  const over = () => document.documentElement.scrollHeight > innerHeight + 2;
  const fit = () => { const intro = document.querySelector('#app > .host .intro'); if (!intro) return; intro.classList.remove('tight', 'tight2', 'tight3'); if (over()) intro.classList.add('tight'); if (over()) intro.classList.add('tight2'); if (over()) intro.classList.add('tight3'); };
  const orh = renderHost;
  renderHost = function () { const r = orh.apply(this, arguments); try { if (!document.getElementById('cfgModal')) scrollTo(0, 0); fit(); setTimeout(fit, 120); } catch (e) {} return r; };
  addEventListener('resize', () => setTimeout(fit, 60));
})();
