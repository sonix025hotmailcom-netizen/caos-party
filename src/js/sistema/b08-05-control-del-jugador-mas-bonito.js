/* ---------- 📱 control del jugador más bonito ---------- */
const _renderCtrl1 = renderCtrl;
renderCtrl = function (v) {
  _renderCtrl1(v);
  document.body.classList.add('isctrl');
  const top = app.querySelector('.c-top');
  if (top && !top.dataset.v8) {
    top.dataset.v8 = 1;
    top.innerHTML = `<span class="me-badge"><span class="me-av">${P.emoji}</span><span class="me-name">${esc(P.name)}</span></span><span class="me-score">${ICO('star')} ${P.score}</span>`;
    drawIcons();
  }
  const body = app.querySelector('.c-body');
  if (body && ['msg', 'watch', 'lobby', 'board', 'final'].includes(v.screen)) body.classList.add('calm');
  if (v.screen === 'lobby') {
    const b = body.querySelector('.big'); if (b) b.outerHTML = `<div class="mini3d" id="mini3d"><span class="mini-fallback">${P.emoji}</span></div>`;
    const el = $('#mini3d'); if (el) Stage3D.mount(el, [{ id: 'me', name: P.name, emoji: P.emoji, color: P.color }], 'solo');
  }
};


