/* ================== MARCO DE TELE ALREDEDOR DEL JUEGO + RESULTADOS MEJORADOS ================== */
(() => {
  /* ---------- resultados de cada juego: filas tipo marcador de TV ---------- */
  resultsList = function (rows) {
    const n = rows.length, sz = n > 7 ? ' rsx-many' : n > 5 ? ' rsx-mid' : '';
    return `<div class="results rsx${sz}">${rows.map((r, i) => {
      const p = pl(r.id), rk = i < 3 ? ` rk${i + 1}` : '';
      return `<div class="rrow pop${rk}" style="--c:${p?.color || '#888'};animation-delay:${(i * .09).toFixed(2)}s">
        <span class="rpos">${i < 3 ? medal(i) : `<i>${i + 1}</i>`}</span>
        <span class="ravt">${p?.emoji || '👻'}${i === 0 ? '<span class="rcrown">👑</span>' : ''}</span>
        <b class="rname">${esc(p?.name || '?')}</b>
        <span class="rval">${esc(r.val)}</span>${r.gain ? `<em class="gain">+${r.gain}<small>pts</small></em>` : '<em class="gain rsx0">+0</em>'}</div>`;
    }).join('')}</div>`;
  };

  /* ---------- marco de tele alrededor del canvas del juego ---------- */
  const visCanvas = w => { for (const c of w.querySelectorAll(':scope > canvas')) if (c.style.display !== 'none' && c.offsetWidth > 50) return c; return null; };
  const frame = () => {
    const w = document.querySelector('#app > .host .stage .gwrap');
    if (!w) return;
    const cv = visCanvas(w); let f = w.querySelector(':scope > .tvf');
    if (!cv) { if (f) f.style.display = 'none'; return; }
    const g = H.game || {}, col = g.color || '#a855f7';
    if (!f) {
      f = document.createElement('div'); f.className = 'tvf'; f.setAttribute('aria-hidden', 'true');
      f.innerHTML = `<div class="tvf-tab"><span class="tvf-dot"></span>${g.emoji || '🎮'} ${esc(g.name || 'En vivo')}</div><div class="tvf-floor"></div>`;
      w.prepend(f); w.classList.add('tvon');
      const st = w.closest('.stage'); if (st) { st.style.setProperty('--gc', col); st.classList.add('tvst'); }
      if (window.__lowq) f.classList.add('lowq');
    }
    f.style.display = '';
    const b = Math.round(Math.max(10, Math.min(22, cv.offsetWidth * .017)));
    const k = [cv.offsetLeft - b, cv.offsetTop - b, cv.offsetWidth + b * 2, cv.offsetHeight + b * 2, b].join(',');
    if (f._k !== k) { f._k = k; Object.assign(f.style, { left: cv.offsetLeft - b + 'px', top: cv.offsetTop - b + 'px', width: cv.offsetWidth + b * 2 + 'px', height: cv.offsetHeight + b * 2 + 'px' }); f.style.setProperty('--b', b + 'px'); f.style.setProperty('--gc', col); }
  };
  setInterval(() => { try { frame(); } catch (e) {} }, 250);
  const orh = renderHost; renderHost = function () { const r = orh.apply(this, arguments); try { frame(); } catch (e) {} return r; };
})();
