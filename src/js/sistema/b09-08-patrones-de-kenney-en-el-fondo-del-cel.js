/* ---------- 🎨 patrones de Kenney en el fondo del cel ---------- */
(() => {
  const pats = ['pattern_004', 'pattern_020', 'pattern_031', 'pattern_045', 'pattern_010', 'pattern_000'];
  const or = renderCtrl;
  renderCtrl = function (v) {
    or(v);
    if (!document.body.dataset.pat) { const k = [...(P.name || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % pats.length; document.body.dataset.pat = 1; document.documentElement.style.setProperty('--pat', `url(assets/patterns/${pats[k]}.png)`); }
  };
})();
