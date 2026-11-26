/* ================== CAOS PARTY v8 — PARTÍCULAS, BLOOM, MÚSICA, MONEDAS NUEVO, CONTROL MÁS BONITO ================== */

/* ---------- ✨ sistema de partículas para todos los juegos de canvas ---------- */
const FX = {
  ps: [], last: 0, tok: -1,
  burst(x, y, color, n = 16, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = (o.dir ?? Math.random() * 6.283) + (o.spread ? (Math.random() - .5) * o.spread : 0), sp = (o.speed || 260) * (.35 + Math.random() * .8);
      this.ps.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), t: 0, life: (o.life || .8) * (.6 + Math.random() * .6), size: (o.size || 5) * (.5 + Math.random()), color: Array.isArray(color) ? pickR(color) : color, g: o.g ?? 520, shape: o.shape || (Math.random() < .5 ? 'c' : 's'), rot: Math.random() * 6, vr: (Math.random() - .5) * 12 });
    }
  },
  ring(x, y, color, r = 80) { this.ps.push({ x, y, t: 0, life: .45, ring: r, color }); },
  text(x, y, txt, color, size = 34) { this.ps.push({ x, y, vx: 0, vy: -90, t: 0, life: .9, txt, color, size, g: 0 }); },
  render(ctx) {
    if (this.tok !== H.token && !/-res$/.test(H.phase)) { this.tok = H.token; }
    const now = performance.now(), dt = Math.min(.05, (now - (this.last || now)) / 1000); this.last = now;
    if (!this.ps.length) return;
    ctx.save();
    for (const p of this.ps) {
      p.t += dt; const k = p.t / p.life; if (k >= 1) continue;
      if (p.ring) { ctx.globalAlpha = 1 - k; ctx.strokeStyle = p.color; ctx.lineWidth = 8 * (1 - k) + 1; ctx.beginPath(); ctx.arc(p.x, p.y, p.ring * (.2 + k), 0, 6.283); ctx.stroke(); continue; }
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      ctx.globalAlpha = 1 - k * k;
      if (p.txt) { ctx.font = `900 ${p.size}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 6; ctx.strokeStyle = '#1a1033'; ctx.strokeText(p.txt, p.x, p.y); ctx.fillStyle = p.color; ctx.fillText(p.txt, p.x, p.y); continue; }
      ctx.fillStyle = p.color; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.shape === 'c') { ctx.beginPath(); ctx.arc(0, 0, p.size * (1 - k * .5), 0, 6.283); ctx.fill(); } else { const s = p.size * (1 - k * .4); ctx.fillRect(-s, -s / 2, s * 2, s); }
      ctx.restore();
    }
    ctx.restore();
    this.ps = this.ps.filter(p => p.t < p.life);
  },
  clear() { this.ps = []; },
};
const _rtLoop0 = rtLoop;
rtLoop = function (step, draw) { FX.clear(); return _rtLoop0(step, ctx => { draw(ctx); FX.render(ctx); }); };
/* engancha partículas a eventos de los juegos que ya existen, sin cambiar su lógica */
function hookStep(g, before, after) { const o = g.step; g.step = function (dt) { const s = before(H.gd); const r = o.call(this, dt); try { after(H.gd, s); } catch (e) {} return r; }; }
hookStep(GAMES.sumo, gd => gd.out.length, (gd, n) => { for (let i = n; i < gd.out.length; i++) { const b = gd.bs[gd.out[i]]; FX.burst(b.x, b.y, [pl(gd.out[i])?.color || '#fff', '#ffd23f', '#fff'], 30, { speed: 380, g: 0 }); FX.ring(b.x, b.y, '#ffd23f', 110); } });
hookStep(GAMES.paint, gd => gd.blasts.length, (gd, n) => { for (let i = n; i < gd.blasts.length; i++) { const b = gd.blasts[i]; FX.burst(b.x, b.y, b.c || '#fff', 40, { speed: 420, g: 200, size: 7 }); } });
hookStep(GAMES.snake, gd => gd.out.length, (gd, n) => { for (let i = n; i < gd.out.length; i++) { const p = gd.ps[gd.out[i]]; FX.burst(p.x * 10 + 5, p.y * 10 + 5, [pl(gd.out[i])?.color || '#fff', '#fff'], 36, { speed: 360, g: 0, life: 1 }); FX.ring(p.x * 10 + 5, p.y * 10 + 5, pl(gd.out[i])?.color || '#fff', 120); } });
hookStep(GAMES.futbol, gd => gd.score ? gd.score[0] + gd.score[1] : 0, (gd, n) => { if (gd.score && gd.score[0] + gd.score[1] > n) { const x = gd.ball.position.x < 500 ? 30 : 970; for (let k = 0; k < 4; k++) FX.burst(x, 300, ['#ffd23f', '#ff3d8b', '#4cc9ff', '#3ee6b0', '#fff'], 30, { speed: 520, up: 200, size: 6, life: 1.4 }); FX.text(500, 230, '¡GOOOL!', '#ffd23f', 70); } });
hookStep(GAMES.jump, gd => gd.out.length, (gd, n) => { for (let i = n; i < gd.out.length; i++) { const s = gd.ps[gd.out[i]]; FX.burst(s.x, 480, ['#ffd23f', '#fff'], 20, { speed: 300 }); FX.text(s.x, 420, '¡Auch!', '#ff3d8b'); } });
hookStep(GAMES.maze, gd => gd.fin.length, (gd, n) => { for (let i = n; i < gd.fin.length; i++) { const x = gd.OX + (gd.goal % gd.W) * gd.CS + gd.CS / 2, y = gd.OY + ((gd.goal / gd.W) | 0) * gd.CS + gd.CS / 2; FX.burst(x, y, ['#ffd23f', '#fff', pl(gd.fin[i])?.color || '#fff'], 40, { speed: 400, g: 300 }); FX.ring(x, y, '#ffd23f', 100); } });
hookStep(GAMES.tower, gd => gd.drops * 10 + (gd.culprit ? 1 : 0), (gd, n) => { if (gd.culprit && n % 10 === 0) { for (let k = 0; k < 3; k++) FX.burst(500, 520 + gd.cam, ['#a16207', '#78350f', '#fde68a'], 30, { speed: 300, up: 150 }); } else if (gd.drops * 10 > n) FX.burst(500, GAMES.tower.top() + gd.cam, ['#fff', '#fde68a'], 14, { speed: 200, g: 300 }); });
