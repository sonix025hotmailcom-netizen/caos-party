/* ---------- helpers host ---------- */
function rtLoop(step, draw) {
  const tok = H.token; let last = performance.now();
  const f = t => {
    if (tok !== H.token) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    if (step) step(dt);
    if (tok !== H.token) return;
    const c = $('#gc'); if (c) draw(c.getContext('2d'));
    requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
}
function canvasHTML(ready, text) {
  return `<div class="gwrap"><canvas id="gc" class="gc" width="1000" height="600"></canvas>${ready ? `<div class="ov">${text ? `<div class="ovt">${text}</div>` : ''}<div class="cdown huge" id="cdown"></div></div>` : ''}</div>`;
}
function joyAct(p, m) {
  if (m.a !== 'joy' || !inGame(p)) return;
  const cl = v => Math.max(-1, Math.min(1, +v || 0));
  H.inp[p.id] = { x: cl(m.x), y: cl(m.y), b: m.b | 0 };
}
const inp = id => H.inp[id] || { x: 0, y: 0, b: 0 };
function nameTag(ctx, t, x, y, size = 16) {
  ctx.font = `900 ${size}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 5; ctx.strokeStyle = '#000a'; ctx.strokeText(t, x, y); ctx.fillStyle = '#fff'; ctx.fillText(t, x, y);
}
var emo = function (ctx, e, x, y, size) { ctx.font = `${size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e, x, y); };
function shakeScreen() { const g = $('.gc') || $('.stage'); if (!g) return; g.classList.remove('fx-shake'); void g.offsetWidth; g.classList.add('fx-shake'); }
function spreadStart(ids, cx, cy, r) { const n = ids.length; return ids.map((id, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return [id, cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); }
function countUp() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const from = +el.dataset.from, to = +el.dataset.count;
    if (window.anime && from !== to) { const o = { v: from }; A({ targets: o, v: to, round: 1, duration: 1700, easing: 'easeOutExpo', update: () => el.textContent = o.v }); }
    else el.textContent = to;
  });
}
function hostFx(ph) {
  if (!window.anime) return;
  if (ph === 'intro') {
    A({ targets: '.round-lbl', translateY: [-60, 0], opacity: [0, 1], duration: 700, easing: 'easeOutBack' });
  }
  if (ph === 'board') A({ targets: '.tlane .tpos', scale: [0, 1], delay: anime.stagger(90, { start: 300 }), duration: 600, easing: 'easeOutElastic(1,.5)' });
  if (ph === 'final') A({ targets: '.pemo', rotate: [-20, 20], direction: 'alternate', loop: true, duration: 500, easing: 'easeInOutSine', delay: anime.stagger(120) });
}
const joyView = (p, hint, btn, cd) => ({ screen: 'joy', key: 'joy' + H.gd.sid, hint, btn: btn || '', cd: cd || 0 });
