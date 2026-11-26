/* ---------- ⌨️ íconos de teclas y gestos (Kenney Input Prompts) ---------- */
const KEYIMG = k => `<img class="kicon" src="assets/keys/${k}.png" alt="">`;
const _kbHint0 = kbHint;
kbHint = function (txt) {
  if (!finePointer()) return;
  txt = txt.replace(/ESPACIO/g, KEYIMG('keyboard_space')).replace(/\b1, 2, 3 o 4\b/, KEYIMG('keyboard_1') + KEYIMG('keyboard_2') + KEYIMG('keyboard_3') + KEYIMG('keyboard_4'));
  return _kbHint0(txt);
};
(() => {
  const oj = XS.joy;
  XS.joy = function (v) {
    oj(v);
    const h = app.querySelector('.jhint'); if (!h) return;
    if (finePointer()) h.innerHTML = `${KEYIMG('keyboard_w')}${KEYIMG('keyboard_a')}${KEYIMG('keyboard_s')}${KEYIMG('keyboard_d')} o ${KEYIMG('keyboard_arrows_all')} para moverte${v.btn ? ` · ${KEYIMG('keyboard_space')} = ${esc(v.btn)}` : ''}`;
    else h.innerHTML = `${KEYIMG('touch_swipe_move')} ${esc(v.hint || 'Tocá y arrastrá para moverte')}`;
  };
})();
