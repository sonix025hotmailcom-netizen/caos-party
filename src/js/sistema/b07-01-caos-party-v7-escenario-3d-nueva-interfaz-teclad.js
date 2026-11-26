/* ================== CAOS PARTY v7 — ESCENARIO 3D, NUEVA INTERFAZ, TECLADO ================== */
const ICO = (n, extra = '') => `<i data-lucide="${n}" ${extra}></i>`;
const drawIcons = () => { try { if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 2.5 } }); } catch (e) {} };
const isWide = () => window.matchMedia && matchMedia('(min-width: 900px)').matches;
const finePointer = () => window.matchMedia && matchMedia('(pointer: fine)').matches;
function marqueeHTML(small) {
  let i = 0; const w = s => [...s].map(c => `<span style="--i:${i++}">${c}</span>`).join('');
  return `<div class="marquee ${small ? 'sm' : ''}"><div class="bulbs"></div><div class="mq-word">${w('CAOS')}</div><div class="mq-word party">${w('PARTY')}</div></div>`;
}
