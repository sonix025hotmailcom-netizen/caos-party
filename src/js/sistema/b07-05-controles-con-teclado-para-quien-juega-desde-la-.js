/* ================== CONTROLES CON TECLADO (para quien juega desde la compu) ================== */
const KEYS = { up: ['w', 'arrowup'], down: ['s', 'arrowdown'], left: ['a', 'arrowleft'], right: ['d', 'arrowright'], act: [' ', 'enter', 'k', 'j', 'e'] };
const kdown = new Set();
const isTyping = () => { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'); };
window.addEventListener('keydown', e => {
  if (isTyping()) return; const k = e.key.toLowerCase();
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  const first = !kdown.has(k); kdown.add(k);
  if (P.onKey) P.onKey(k, first, e);
});
window.addEventListener('keyup', e => { kdown.delete(e.key.toLowerCase()); });
window.addEventListener('blur', () => kdown.clear());
const keyIs = (k, g) => KEYS[g].includes(k);
const pdown = el => { if (!el || el.disabled) return; const E = window.PointerEvent || MouseEvent; el.dispatchEvent(new E('pointerdown', { bubbles: true, cancelable: true })); };
const numKey = k => { const n = parseInt(k, 10); return n >= 1 && n <= 9 ? n - 1 : -1; };
function kbHint(txt) { if (!finePointer()) return; const b = app.querySelector('.c-body'); if (b && !b.querySelector('.kbhint')) b.insertAdjacentHTML('beforeend', `<p class="kbhint">${ICO('keyboard')} ${txt}</p>`); drawIcons(); }
const _clearTimers1 = clearTimers;
clearTimers = function () { _clearTimers1(); P.onKey = null; };

const wrapScreen = (get, set, hint, onKey) => { const orig = get(); set(function (v) { orig.apply(this, arguments); P.onKey = onKey; if (hint) kbHint(typeof hint === 'function' ? hint(v) : hint); }); };
wrapScreen(() => tapScreen, f => tapScreen = f, 'Apretá ESPACIO lo más rápido que podás', (k, first) => { if (first && keyIs(k, 'act')) pdown($('#tb')); });
wrapScreen(() => reflexScreen, f => reflexScreen = f, 'ESPACIO cuando se ponga verde', (k, first) => { if (first && keyIs(k, 'act')) pdown($('#rx')); });
wrapScreen(() => chooseScreen, f => chooseScreen = f, 'Usá los números 1, 2, 3… para elegir', (k, first) => { const i = numKey(k); if (first && i >= 0) { const o = app.querySelectorAll('.opt')[i]; if (o && !o.disabled) o.click(); } });
const xsWrap = (name, hint, onKey) => wrapScreen(() => XS[name], f => XS[name] = f, hint, onKey);
xsWrap('quiz', 'Usá 1, 2, 3 o 4 para responder', (k, first) => { const i = numKey(k); if (first && i >= 0) { const o = app.querySelectorAll('.opt')[i]; if (o && !o.disabled) o.click(); } });
xsWrap('mash', 'Alterná A y D (o ← y →)', (k, first) => { if (!first) return; if (keyIs(k, 'left')) pdown($('#mL')); if (keyIs(k, 'right')) pdown($('#mR')); });
xsWrap('jump', 'ESPACIO o ↑ para saltar', (k, first) => { if (first && (keyIs(k, 'act') || keyIs(k, 'up'))) pdown($('#jb')); });
xsWrap('drop', 'ESPACIO o ↓ para soltar', (k, first) => { if (first && (keyIs(k, 'act') || keyIs(k, 'down'))) pdown($('#db')); });
xsWrap('simon', 'Teclas 1, 2, 3 y 4 (en el orden de los colores)', (k, first) => { const i = numKey(k); if (first && i >= 0 && i < 4) pdown(app.querySelectorAll('.spad')[i]); });
xsWrap('colors', 'Teclas 1 a 6 para elegir el color', (k, first) => { const i = numKey(k); if (first && i >= 0 && i < 6) pdown(app.querySelectorAll('.cbtn')[i]); });
xsWrap('grid9', 'Teclas 1 a 9 (como un teclado numérico: 1 arriba a la izquierda) o Q W E / A S D / Z X C', (k, first) => {
  if (!first) return; let i = numKey(k); if (i < 0) i = 'qweasdzxc'.indexOf(k); if (i >= 0) pdown(app.querySelectorAll('#pg button')[i]);
});
xsWrap('duelboard', v => v.kind === 'c4' ? 'Teclas 1 a 7 para elegir la columna' : 'Teclas 1 a 9 para elegir la casilla (1 arriba a la izquierda)', (k, first) => {
  const i = numKey(k); if (!first || i < 0) return;
  if (app.querySelector('.pboard.c4')) { if (i > 6) return; const b = [...app.querySelectorAll('.pboard [data-i]')].find(x => (+x.dataset.i) % 7 === i && !x.disabled); if (b) b.click(); }
  else { const b = app.querySelectorAll('.pboard [data-i]')[i]; if (b && !b.disabled) b.click(); }
});
/* joystick: WASD / flechas + ESPACIO para la habilidad */
const _joy0 = XS.joy;
XS.joy = function (v) {
  _joy0(v);
  if (finePointer()) { const h = app.querySelector('.jhint'); if (h) h.innerHTML = `${ICO('keyboard')} WASD o flechas para moverte${v.btn ? ' · ESPACIO = ' + esc(v.btn) : ''}`; drawIcons(); }
  const act = $('#act');
  P.onKey = (k, first) => { if (first && act && keyIs(k, 'act')) pdown(act); };
};
