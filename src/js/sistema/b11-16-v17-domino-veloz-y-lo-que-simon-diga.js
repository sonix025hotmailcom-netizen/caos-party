/* mensajito flotante en la tele */
function toastHost(t) { const d = document.createElement('div'); d.className = 'gifttv'; d.style.setProperty('--c', '#f59e0b'); d.innerHTML = `<div class="gt-ico">📢</div><div><div class="gt-n">${esc(t)}</div></div>`; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
/* mensaje solo para un jugador */
function liveTo(p, m) { try { if (p.conn) p.conn.send({ t: 'toast', text: m.text }); } catch (e) {} }
