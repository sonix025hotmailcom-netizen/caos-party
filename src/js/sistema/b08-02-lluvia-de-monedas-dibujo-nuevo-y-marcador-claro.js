/* ---------- 🪙 LLUVIA DE MONEDAS: dibujo nuevo y marcador claro ---------- */
(() => {
  const C = GAMES.coins, oStep = C.step, oStart = C.start;
  C.start = function () { oStart.call(this); const gd = H.gd; const n = gd.ids.length; gd.ids.forEach((id, i) => gd.ps[id].x = n === 1 ? 500 : 110 + i * (780 / Math.max(1, n - 1))); gd.clouds = Array.from({ length: 6 }, (_, i) => ({ x: i * 200 + rand(80), y: 40 + rand(130), s: .6 + Math.random() * .7, v: 8 + rand(18) })); };
  C.step = function (dt) {
    const gd = H.gd, n0 = gd.fx.length; oStep.call(this, dt);
    for (let i = n0; i < gd.fx.length; i++) { const f = gd.fx[i]; const c = f.c === '#ef4444' ? ['#ef4444', '#f97316', '#1a1033'] : f.c === '#22d3ee' ? ['#22d3ee', '#a5f3fc', '#fff'] : ['#ffd23f', '#fff3b0', '#f59e0b']; FX.burst(f.x, 500, c, f.c === '#ef4444' ? 34 : 16, { speed: f.c === '#ef4444' ? 420 : 260, up: 120 }); if (f.c === '#ef4444') FX.ring(f.x, 500, '#f97316', 90); }
    gd.fx = [];
    for (const c of gd.clouds || []) { c.x += c.v * dt; if (c.x > 1150) c.x = -150; }
  };
  const coin = (ctx, x, y, r, rot) => {
    const sx = Math.max(.15, Math.abs(Math.cos(rot)));
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
    ctx.fillStyle = '#b45309'; ctx.beginPath(); ctx.arc(0, 2, r, 0, 6.283); ctx.fill();
    const g = ctx.createRadialGradient(-r * .3, -r * .4, 2, 0, 0, r); g.addColorStop(0, '#fff7c2'); g.addColorStop(.4, '#ffd23f'); g.addColorStop(1, '#f59e0b');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r * .68, 0, 6.283); ctx.stroke();
    ctx.fillStyle = '#b45309'; ctx.font = `900 ${r}px Nunito`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('★', 0, 1);
    ctx.restore();
  };
  const gem = (ctx, x, y, r, t) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * .2);
    ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .9, -r * .2); ctx.lineTo(0, r); ctx.lineTo(-r * .9, -r * .2); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = '#a5f3fc'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r * .45, -r * .2); ctx.lineTo(0, r * .35); ctx.lineTo(-r * .45, -r * .2); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  const bomb = (ctx, x, y, r, t) => {
    ctx.fillStyle = '#1a1033'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#ffffff33'; ctx.beginPath(); ctx.arc(x - r * .35, y - r * .35, r * .3, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + r * .5, y - r * .7); ctx.quadraticCurveTo(x + r, y - r * 1.4, x + r * 1.3, y - r * 1.2); ctx.stroke();
    const f = Math.sin(t * 30) > 0; ctx.fillStyle = f ? '#ffd23f' : '#f97316'; ctx.beginPath(); ctx.arc(x + r * 1.3, y - r * 1.2, f ? 6 : 4, 0, 6.283); ctx.fill();
  };
  const pill = (ctx, x, y, txt, color, size = 18) => {
    ctx.font = `900 ${size}px Nunito, sans-serif`; const w = ctx.measureText(txt).width + 22, h = size + 12;
    ctx.fillStyle = '#1a1033'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2 + 3, w, h, h / 2) : ctx.rect(x - w / 2, y - h / 2 + 3, w, h); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#1a1033'; ctx.strokeText(txt, x, y + 1); ctx.fillText(txt, x, y + 1);
  };
  C.draw = function (ctx) {
    const gd = H.gd, t = performance.now() / 1000;
    const sky = ctx.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, '#38bdf8'); sky.addColorStop(1, '#e0f7ff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, 1000, 600);
    ctx.save(); ctx.shadowColor = '#fde047'; ctx.shadowBlur = 50; ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(880, 90, 48, 0, 6.283); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#ffffffdd';
    for (const c of gd.clouds || []) { ctx.save(); ctx.translate(c.x, c.y); ctx.scale(c.s, c.s); ctx.beginPath(); ctx.arc(0, 0, 34, 0, 6.283); ctx.arc(40, -14, 42, 0, 6.283); ctx.arc(84, 0, 32, 0, 6.283); ctx.rect(0, 0, 84, 30); ctx.fill(); ctx.restore(); }
    const hills = (base, amp, col, f, off) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, 600); for (let x = 0; x <= 1000; x += 20) ctx.lineTo(x, base - Math.sin(x * f + off) * amp - Math.sin(x * f * 2.3 + off) * amp * .4); ctx.lineTo(1000, 600); ctx.fill(); };
    hills(470, 40, '#86efac', .006, 1); hills(505, 28, '#4ade80', .009, 3);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(0, 548, 1000, 52); ctx.fillStyle = '#15803d'; for (let x = 0; x < 1000; x += 24) { ctx.beginPath(); ctx.moveTo(x, 548); ctx.lineTo(x + 6, 538); ctx.lineTo(x + 12, 548); ctx.fill(); }
    ctx.fillStyle = '#92400e'; ctx.fillRect(0, 578, 1000, 22);
    for (const it of gd.items) { if (it.type === 'coin') coin(ctx, it.x, it.y, 19, it.rot); else if (it.type === 'gem') gem(ctx, it.x, it.y, 22, t + it.x); else bomb(ctx, it.x, it.y, 18, t + it.x); }
    const ord = gd.ids.slice().sort((a, b) => gd.ps[a].x - gd.ps[b].x);
    ord.forEach((id, k) => {
      const p = gd.ps[id], pp = pl(id), moving = Math.abs(inp(id).x) > .1 && p.stun <= 0, bob = moving ? Math.abs(Math.sin(t * 14)) * 6 : 0;
      ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(p.x, 552, 30, 8, 0, 0, 6.283); ctx.fill();
      ctx.save(); ctx.translate(p.x, 516 - bob); if (p.stun > 0) ctx.rotate(Math.sin(t * 30) * .25);
      ctx.fillStyle = pp?.color || '#888'; ctx.strokeStyle = '#1a1033'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, 6.283); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff44'; ctx.beginPath(); ctx.arc(-10, -12, 9, 0, 6.283); ctx.fill();
      emo(ctx, pp?.emoji || '?', 0, 2, 34); ctx.restore();
      if (p.stun > 0) for (let s = 0; s < 3; s++) { const a = t * 6 + s * 2.1; emo(ctx, '⭐', p.x + Math.cos(a) * 30, 470 + Math.sin(a) * 8, 16); }
      pill(ctx, p.x, 448 - (k % 2) * 34 - bob, `${pp?.name || ''}  🪙 ${p.coins}`, pp?.color || '#888', 17);
    });
    const rank = gd.ids.slice().sort((a, b) => gd.ps[b].coins - gd.ps[a].coins);
    let x = 14;
    rank.forEach((id, i) => {
      const pp = pl(id), txt = `${i === 0 && gd.ps[id].coins > 0 ? '👑 ' : ''}${pp?.emoji || ''} ${gd.ps[id].coins}`;
      ctx.font = '900 22px Nunito'; const w = ctx.measureText(txt).width + 26;
      ctx.fillStyle = '#1a1033'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 14, w, 40, 20) : ctx.rect(x, 14, w, 40); ctx.fill();
      ctx.fillStyle = pp?.color || '#888'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 3, 14, w - 6, 36, 18) : ctx.rect(x + 3, 14, w - 6, 36); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#1a1033'; ctx.strokeText(txt, x + 13, 33); ctx.fillText(txt, x + 13, 33);
      x += w + 8;
    });
  };
})();
