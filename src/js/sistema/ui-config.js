/* ================== BOTONES DE CONFIGURACIÓN ⚙️ Y PANTALLA COMPLETA (inicio y lobby) ================== */
const CFGUI = {
  fs() { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} },
  btns() { return `<button class="btn small gray cfgb" data-cfg="open" title="Configuración">${ICO('settings')}</button><button class="btn small gray cfgb" data-cfg="fs" title="Pantalla completa">${ICO(document.fullscreenElement ? 'minimize' : 'maximize')}</button>`; },
  open() {
    document.getElementById('cfgModal')?.remove();
    const op = (k, t, d) => `<button class="cfgq${CFG.q === k ? ' on' : ''}" data-cfg="q" data-q="${k}"><b>${t}</b><span>${d}</span></button>`;
    const m = document.createElement('div'); m.id = 'cfgModal';
    m.innerHTML = `<div class="cfgbox"><div class="cfghd">${ICO('settings')} Configuración<button class="cfgx" data-cfg="close">✕</button></div>
      <div class="cfglbl">Calidad gráfica</div>
      <div class="cfgqs">${op('liviano', '🐢 Liviano', 'Para Fire TV, Smart TV o aparatos lentos. Sin sombras ni efectos.')}${op('medio', '⚖️ Medio', 'Buen equilibrio para tablets y compus normales.')}${op('alto', '✨ Alto', 'Todo al máximo. Para compus o tablets potentes.')}</div>
      <div class="cfgnote">Se guarda en este aparato. Se aplica desde el próximo juego.</div>
      <div class="cfglbl">Pantalla</div>
      <button class="btn green cfgfs" data-cfg="fs">${ICO('maximize')} Pantalla completa</button></div>`;
    document.body.appendChild(m); if (typeof drawIcons === 'function') drawIcons();
  },
  click(e) {
    const b = e.target.closest('[data-cfg]'); if (!b) { if (e.target.id === 'cfgModal') e.target.remove(); return; }
    const a = b.dataset.cfg; e.stopPropagation();
    if (a === 'open') CFGUI.open();
    else if (a === 'close') document.getElementById('cfgModal')?.remove();
    else if (a === 'fs') CFGUI.fs();
    else if (a === 'q') { CFG.q = b.dataset.q; cfgSave(); window.__lowq = CFG.q === 'liviano'; document.querySelectorAll('.cfgq').forEach(x => x.classList.toggle('on', x === b)); if (typeof toast === 'function') toast(`Calidad: ${b.querySelector('b').textContent}`); }
  },
  sync() {
    /* inicio (pantalla de elegir tele o control): botones en la esquina */
    const home = document.getElementById('bHost'); let c = document.getElementById('cfgCorner');
    if (home && !c) { c = document.createElement('div'); c.id = 'cfgCorner'; c.innerHTML = CFGUI.btns(); document.body.appendChild(c); if (typeof drawIcons === 'function') drawIcons(); }
    if (!home && c) c.remove();
    /* lobby de la tele: al lado del botón de música */
    const lh = document.querySelector('.lob-head'); if (lh && !lh.querySelector('.cfgb')) { lh.insertAdjacentHTML('beforeend', `<span class="cfggrp">${CFGUI.btns()}</span>`); if (typeof drawIcons === 'function') drawIcons(); }
  }
};
document.addEventListener('click', CFGUI.click, true);
setInterval(CFGUI.sync, 400);
document.addEventListener('fullscreenchange', () => document.querySelectorAll('.cfgb[data-cfg="fs"]').forEach(b => { b.innerHTML = ICO(document.fullscreenElement ? 'minimize' : 'maximize'); if (typeof drawIcons === 'function') drawIcons(); }));
