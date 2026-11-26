/* ---------- pantalla nueva del cel: soltar bloque ---------- */
XS.drop = function (v) {
  app.innerHTML = shell(`<div class="c-hint">🏗️ ¡Es tu turno! Mirá la grúa en la tele y soltá cuando el bloque esté encima de la torre</div><button class="tapbtn" id="db" style="background:radial-gradient(circle at 35% 30%,#fdba74,#ea580c 55%,#9a3412);box-shadow:0 14px 0 #7c2d12">⬇️<br>¡SOLTAR!</button>`, true);
  const b = $('#db');
  b.addEventListener('pointerdown', e => { e.preventDefault(); if (b.disabled) return; send({ t: 'act', a: 'drop' }); b.disabled = true; b.textContent = '¡Soltado!'; if (navigator.vibrate) navigator.vibrate(40); });
};
