/* ================== PRESENTACIÓN DEL JUEGO (diseño tipo show de TV) Y TABLA DE PUNTOS MEJORADA ================== */
(() => {
  const fe = e => { const s = typeof feSrc === 'function' ? feSrc(e) : null; return s ? `<img src="${s}" alt="${e}" draggable="false">` : e; };
  /* parte la descripción en pasos cortos y fáciles de leer */
  const steps = d => String(d || '').split(/(?<=[.!?…])\s+(?=[¡¿A-ZÁÉÍÓÚÑ0-9🎯-🫶])/u).map(s => s.trim()).filter(Boolean).slice(0, 8);
  const intro = () => {
    if (H.phase !== 'intro') return; const st = document.querySelector('#app > .host .stage'), it = st && st.querySelector('.intro'); if (!it || it.classList.contains('ix-done')) return;
    const g = H.game || {}, col = g.color || '#a855f7', tags = it.querySelector('.gtags')?.outerHTML || '', rl = it.querySelector('.round-lbl')?.textContent || '', left = Math.max(1, (H.deadline || Date.now()) - Date.now());
    st.style.setProperty('--gc', col); st.classList.add('ixst'); it.classList.add('ix-done');
    it.innerHTML = `<div class="ix">
      <div class="ix-poster"><div class="ix-round">${esc(rl)}</div><div class="ix-emoji">${fe(g.emoji || '🎉')}</div><div class="ix-name">${esc(g.name || '')}</div>${tags}</div>
      <div class="ix-how"><div class="ix-lbl">Cómo se juega</div><ol>${steps(g.desc).map(s => `<li>${s}</li>`).join('')}</ol></div>
    </div>
    <div class="ix-foot"><div class="ix-track"><b style="animation-duration:${left}ms"></b></div><div class="ix-cd">Empieza en <span class="cdown" id="cdown"></span></div></div>`;
  };
  /* tabla de puntos: barra de color que se llena hasta donde llegó cada uno */
  const board = () => {
    if (H.phase !== 'board') return; const tr = document.querySelector('#app .track'); if (!tr || tr.classList.contains('bd-done')) return; tr.classList.add('bd-done');
    tr.querySelectorAll('.tlane').forEach((l, i) => { const w = l.querySelector('.tway'), r = l.querySelector('.runner'); if (!w || !r) return; l.classList.toggle('lead', i === 0); const f = document.createElement('div'); f.className = 'tfill'; f.style.width = r.style.left; w.insertBefore(f, w.firstChild); setTimeout(() => { f.style.width = `calc(${r.dataset.to}% + 26px)`; }, 140); });
    const t = document.querySelector('#app .stage > .title-pop'); if (t && !t.nextElementSibling?.classList.contains('bd-sub')) { const n = H.order.length, k = H.roundIdx + 1; t.insertAdjacentHTML('afterend', `<div class="bd-sub">${k >= n ? '¡Última ronda terminada!' : `Ronda ${k} de ${n} · faltan ${n - k} ${n - k === 1 ? 'juego' : 'juegos'}`}</div>`); }
  };
  setInterval(() => { const c = document.querySelector('.ix-cd .cdown'); if (!c || !H.deadline) return; const n = Math.max(0, Math.ceil((H.deadline - Date.now()) / 1000)), t = n > 0 ? String(n) : '¡YA!'; if (c.textContent !== t) { c.textContent = t; c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse'); } }, 200);
  const orh = renderHost; renderHost = function () { const r = orh.apply(this, arguments); try { intro(); board(); } catch (e) {} return r; };
})();
