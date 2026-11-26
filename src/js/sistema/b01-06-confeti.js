/* ---------- CONFETI ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d'); let parts = [], confRun = false;
function resizeCv() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener('resize', resizeCv); resizeCv();
function confetti(n = 160) {
  for (let i = 0; i < n; i++) parts.push({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * .6, vx: (Math.random() - .5) * 4, vy: 2 + Math.random() * 4, r: Math.random() * 6.3, vr: (Math.random() - .5) * .3, c: COLORS[rand(8)], w: 7 + Math.random() * 8, h: 4 + Math.random() * 6 });
  if (!confRun) { confRun = true; requestAnimationFrame(confLoop); }
}
function confLoop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += .04; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); }
  parts = parts.filter(p => p.y < cv.height + 40);
  if (parts.length) requestAnimationFrame(confLoop); else { confRun = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
