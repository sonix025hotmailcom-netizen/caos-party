/* ---------- 🪢 SALTA LA CUERDA: ahora revisa cuando la cuerda pasa por los PIES ---------- */
Object.assign(GAMES.jump, {
  start() {
    const ids = onlineIds(), ps = {}, n = ids.length;
    ids.forEach((id, i) => ps[id] = { x: n === 1 ? 500 : 200 + i * (600 / (n - 1)), airT: -9, alive: true, jumps: 0 });
    H.gd = { ids, ps, ph: 0, t: 0, period: 2.1, out: [], sid: rid(), beat: -1 };
    setPhase('jp-ready', 3500, () => { SFX.go(); GAMES.jump.go(); }, 0, false);
    rtLoop(null, GAMES.jump.draw);
  },
  onAct(p, m) {
    const gd = H.gd; if (H.phase !== 'jp-go' || m.a !== 'jump' || !inGame(p)) return;
    const s = gd.ps[p.id]; if (!s.alive || gd.t - s.airT < .62) return;
    s.airT = gd.t; beep(500, .06, 'triangle', .05);
  },
  step(dt) {
    const gd = H.gd; gd.t += dt;
    gd.period = Math.max(.75, 2.1 - gd.t * .03);
    const prev = gd.ph; gd.ph += dt / gd.period;
    const toBottom = ((1.5 - (gd.ph % 1)) % 1) * gd.period, cyc = Math.floor(gd.ph + .5);
    if (toBottom < .45 && gd.beat !== cyc) { gd.beat = cyc; bcast({ t: 'live', kind: 'beat', ms: Math.round(toBottom * 1000) }, gd.ids.filter(id => gd.ps[id].alive)); }
    if (Math.floor(prev + .5) < Math.floor(gd.ph + .5)) {
      const hit = [];
      for (const id of gd.ids) { const s = gd.ps[id]; if (!s.alive) continue; const a = gd.t - s.airT; if (a >= 0 && a <= .62) s.jumps++; else hit.push(id); }
      beep(240, .07, 'sine', .05);
      if (hit.length) { hit.forEach(id => { gd.ps[id].alive = false; gd.out.push(id); }); SFX.bad(); shakeScreen(); sync(); updateStrip(); }
      const left = gd.ids.filter(id => gd.ps[id].alive).length;
      if (!gd.ending && ((gd.ids.length > 1 && left <= 1) || left === 0)) { gd.ending = true; const tok = H.token; setTimeout(() => { if (tok === H.token) GAMES.jump.end(); }, 1200); }
    }
  },
  draw(ctx) {
    const gd = H.gd, a = gd.ph * Math.PI * 2, ground = 520;
    const g = ctx.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#a5f3fc');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1000, 600);
    ctx.fillStyle = '#16a34a'; ctx.fillRect(0, ground, 1000, 80);
    const ry = 290 - Math.cos(a) * 250, low = ry > 420;
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, (ry - 300) / 600)})`; ctx.fillRect(70, ground + 2, 860, 10);
    const rope = () => { ctx.strokeStyle = low ? '#dc2626' : '#7c2d12'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(70, 300); ctx.quadraticCurveTo(500, ry * 2 - 300, 930, 300); ctx.stroke(); };
    if (!low) rope();
    for (const id of gd.ids) {
      const s = gd.ps[id], pp = pl(id), air = gd.t - s.airT;
      const up = s.alive && air >= 0 && air <= .62 ? Math.sin(air / .62 * Math.PI) * 120 : 0;
      ctx.fillStyle = '#0003'; ctx.beginPath(); ctx.ellipse(s.x, ground + 6, 30 - up / 8, 8, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = s.alive ? 1 : .35; emo(ctx, s.alive ? (pp?.emoji || '?') : '🤕', s.x, ground - 34 - up, 60); ctx.globalAlpha = 1;
      nameTag(ctx, `${pp?.name || ''} · ${s.jumps}`, s.x, ground + 40, 15);
    }
    if (low) rope();
    emo(ctx, '🧍', 50, 330, 70); emo(ctx, '🧍', 950, 330, 70);
    nameTag(ctx, `Velocidad x${(2.1 / gd.period).toFixed(1)}`, 110, 30, 20);
    if (H.phase === 'jp-go') { const tb = ((1.5 - (gd.ph % 1)) % 1) * gd.period; if (tb < .35) nameTag(ctx, '¡SALTEN!', 500, 90, 54); }
  },
});
