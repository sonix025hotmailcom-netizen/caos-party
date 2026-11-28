/* ================== PRESENTACIÓN DE CADA JUEGO MÁS DECORADA: rayos, brillo, emojis flotando, tarjeta, círculo y barra de carga ================== */
(() => {
  const TIPS = ['😎 Tocá el botón de reacciones en tu cel para mandar emotes', '⚙️ Si la tele va lenta, usá la calidad Liviano', '🏆 Ganar te da chance de un cofre con regalo', '🤝 Si empatan, se reparten los puntos', '⛶ Poné pantalla completa para verlo mejor', '🕹️ En la compu también podés jugar con WASD y espacio'];
  const deco = () => {
    if (H.phase !== 'intro') return; const st = document.querySelector('#app > .host .stage'), intro = st && st.querySelector('.intro'); if (!intro || st.querySelector('.introfx')) return;
    const g = H.game || {}, col = g.color || '#a855f7', em = g.emoji || '🎉', n = window.__lowq ? 6 : 14, src = typeof feSrc === 'function' ? feSrc(em) : null;
    st.style.setProperty('--gc', col); st.classList.add('introst');
    let parts = ''; for (let k = 0; k < n; k++) parts += `<i class="ifx-p" style="left:${(k * 97 % 100)}%;animation-delay:${-(k * 1.37 % 9).toFixed(2)}s;animation-duration:${(8 + k % 5 * 1.6).toFixed(1)}s;--s:${(.6 + (k * 7 % 10) / 12).toFixed(2)}">${src ? `<img src="${src}" alt="">` : em}</i>`;
    const left = Math.max(1, (H.deadline || Date.now()) - Date.now());
    st.insertAdjacentHTML('afterbegin', `<div class="introfx"><div class="ifx-rays"></div><div class="ifx-glow"></div>${parts}<div class="ifx-bar"><b style="animation-duration:${left}ms"></b></div></div>`);
    if (!intro.querySelector('.ifx-tip')) intro.insertAdjacentHTML('beforeend', `<div class="ifx-tip">${pickR(TIPS)}</div>`);
  };
  const orh = renderHost; renderHost = function () { const r = orh.apply(this, arguments); try { deco(); } catch (e) {} return r; };
})();
