/* ================== INICIO ================== */
function showHome() {
  app.innerHTML = `<div class="screen">
    <div class="logo">${logoHTML()}</div>
    <p class="tag">Minijuegos locos para jugar con tus compas 🎉</p>
    <button class="btn big pink" id="bHost">📺 Crear sala</button>
    <div class="or">— o —</div>
    <div class="row"><input id="iCode" maxlength="4" placeholder="CÓDIGO" autocomplete="off" autocapitalize="characters"><button class="btn blue" id="bJoin">Unirme</button></div>
    <p class="hint">La pantalla que crea la sala es la "tele" 📺. Los demás entran desde el cel y lo usan como control 🎮.</p>
  </div>`;
  $('#bHost').onclick = () => { beep(1, .01, 'sine', .0001); startHost(); };
  const go = () => { const c = $('#iCode').value.trim().toUpperCase(); if (/^[A-Z]{4}$/.test(c)) location.search = '?sala=' + c; else { $('#iCode').classList.remove('shake'); void $('#iCode').offsetWidth; $('#iCode').classList.add('shake'); } };
  $('#bJoin').onclick = go;
  $('#iCode').onkeydown = e => { if (e.key === 'Enter') go(); };
}
function showError(html, retry) {
  app.innerHTML = `<div class="screen"><div class="big wiggle">😵</div><h2>¡Ups!</h2><p class="tag">${html}</p>
    ${retry ? '<button class="btn big blue" id="bRetry">🔄 Reintentar</button>' : ''}
    <button class="btn small gray" id="bHome">Volver al inicio</button></div>`;
  if (retry) $('#bRetry').onclick = retry;
  $('#bHome').onclick = () => { location.href = location.pathname; };
}
