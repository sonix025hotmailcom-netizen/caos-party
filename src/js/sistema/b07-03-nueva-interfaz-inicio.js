/* ================== NUEVA INTERFAZ: INICIO ================== */
showHome = function () {
  app.innerHTML = `<div class="home">
    <div class="home-hero">${marqueeHTML()}<p class="home-tag">Minijuegos para jugar en grupo: la tele muestra el juego y cada uno usa su cel (o compu) como control.</p></div>
    <div class="home-cards">
      <button class="hcard tv" id="bHost">${ICO('tv')}<b>Ser la tele</b><span>Creá la sala en la pantalla grande</span></button>
      <div class="hcard join">${ICO('smartphone')}<b>Unirme</b><span>Escribí el código de 4 letras</span>
        <div class="row"><input id="iCode" maxlength="4" placeholder="ABCD" autocomplete="off" autocapitalize="characters"><button class="btn blue" id="bJoin">Entrar</button></div></div>
    </div>
    <p class="credit">Personaje 3D: Quaternius (CC0) · Hecho con three.js, Matter.js, GSAP, anime.js y Tone.js</p>
  </div>`;
  drawIcons();
  $('#bHost').onclick = () => { beep(1, .01, 'sine', .0001); startHost(); };
  const go = () => { const c = $('#iCode').value.trim().toUpperCase(); if (/^[A-Z]{4}$/.test(c)) location.search = '?sala=' + c; else { const i = $('#iCode'); i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake'); } };
  $('#bJoin').onclick = go; $('#iCode').onkeydown = e => { if (e.key === 'Enter') go(); };
  if (window.gsap) try { gsap.from('.mq-word span', { y: -90, opacity: 0, rotation: () => gsap.utils.random(-40, 40), stagger: .05, duration: .8, ease: 'back.out(2)' }); gsap.from('.hcard', { y: 60, opacity: 0, stagger: .12, duration: .7, delay: .4, ease: 'power3.out', clearProps: 'transform,opacity' }); } catch (e) {}
};
const _showJoin0 = showJoin;
showJoin = function (code) {
  _showJoin0(code);
  const lg = app.querySelector('.logo'); if (lg) lg.outerHTML = marqueeHTML(true);
  const s = app.querySelector('.screen'); if (s) s.classList.add('joinscr');
};
