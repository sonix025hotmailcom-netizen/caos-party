/* ---------- lado del anfitrión ---------- */
(() => {
  const oh = onHostMsg;
  onHostMsg = function (conn, m) {
    if (m && (m.t === 'equip' || m.t === 'got')) {
      const p = pl(conn._pid); if (!p || p.conn !== conn) return;
      if (m.t === 'equip') { p.eq = cleanEq(m.eq); if (H.phase === 'lobby') renderHost(); }
      else { const it = ITEMS[m.id]; giftTV(p, it || null, true); }
      return;
    }
    oh(conn, m);
    if (m && m.t === 'join') { const p = pl(conn._pid); if (p && m.eq) { const q = cleanEq(m.eq); if (JSON.stringify(q) !== JSON.stringify(p.eq || null)) { p.eq = q; if (H.phase === 'lobby') renderHost(); } } }
  };
  const of = finishGame;
  finishGame = function (gains) {
    const gname = H.game ? H.game.name : '';
    of(gains);
    try {
      const ids = [...H.players.keys()], best = Math.max(0, ...ids.map(i => gains[i] || 0));
      if (best <= 0) return;
      const wins = ids.filter(i => (gains[i] || 0) === best);
      if (wins.length > 3 || (wins.length > 1 && wins.length === ids.filter(i => pl(i)?.online).length)) return;   // empate de todos: nadie ganó de verdad
      wins.forEach((id, k) => {
        const p = pl(id); if (!p) return;
        /* no siempre hay cofre: 40%, y si no sale sube a 70% y luego 100% (nunca te quedás sin nada 3 veces seguidas) */
        const miss = p.giftMiss || 0, chance = [.4, .7, 1][Math.min(2, miss)];
        if (Math.random() >= chance) {
          p.giftMiss = miss + 1;
          const next = Math.round([.4, .7, 1][Math.min(2, p.giftMiss)] * 100);
          try { p.conn && p.conn.send({ t: 'nogift', next }); } catch (e) {}
          setTimeout(() => giftTV(p, null, 'miss'), 900 + k * 700);
          return;
        }
        p.giftMiss = 0;
        if (p.isBot || !p.conn) {
          const owned = Object.values(p.eq || {}).filter(Boolean), nid = rollItem(owned);
          if (nid) { p.eq = Object.assign(cleanEq(p.eq), { [ITEMS[nid].s]: nid }); setTimeout(() => giftTV(p, ITEMS[nid], true), 900 + k * 700); }
        } else {
          try { p.conn.send({ t: 'gift', game: gname }); } catch (e) {}
          setTimeout(() => giftTV(p, null, false), 900 + k * 700);
        }
      });
    } catch (e) { console.warn(e); }
  };
})();

/* anuncio en la tele */
const giftQ = []; let giftBusy = false;
function giftTV(p, it, opened) { giftQ.push({ p, it, opened }); if (!giftBusy) giftNext(); }
function giftNext() {
  const g = giftQ.shift(); if (!g) { giftBusy = false; return; } giftBusy = true;
  const { p, it, opened } = g;
  const d = document.createElement('div'); d.className = 'gifttv'; d.style.setProperty('--c', p.color);
  d.innerHTML = opened === 'miss'
    ? `<div class="gt-ico" style="--rc:#64748b">📦</div><div><div class="gt-l"><b>${esc(p.name)}</b> ganó… pero</div><div class="gt-n">¡el cofre salió vacío! 😅</div><div class="gt-s">La próxima tiene más chance</div></div>`
    : opened && it
    ? `<div class="gt-ico" style="--rc:${RAR[it.r].col}">${it.e}</div><div><div class="gt-l"><b>${esc(p.name)}</b> abrió su regalo</div><div class="gt-n">${esc(it.n)} <span style="color:${RAR[it.r].col}">· ${RAR[it.r].n}</span></div></div>`
    : opened ? `<div class="gt-ico">🏆</div><div><div class="gt-l"><b>${esc(p.name)}</b> ya tiene todo el closet</div></div>`
    : `<div class="gt-ico gt-box">🎁</div><div><div class="gt-l">¡Regalo sorpresa para</div><div class="gt-n">${esc(p.name)}!</div><div class="gt-s">Abrilo en tu cel 📱</div></div>`;
  document.body.appendChild(d); if (SFX.pop) SFX.pop();
  const out = () => { if (window.gsap) gsap.to(d, { x: 420, opacity: 0, duration: .35, ease: 'power2.in', onComplete: () => { d.remove(); giftNext(); } }); else { d.remove(); giftNext(); } };
  if (window.gsap) { gsap.from(d, { x: 420, opacity: 0, duration: .5, ease: 'back.out(1.6)' }); const ic = d.querySelector('.gt-ico'); gsap.fromTo(ic, { rotation: -15 }, { rotation: 15, yoyo: true, repeat: 7, duration: .18 }); }
  setTimeout(out, 3400);
  if (opened && it && H.phase === 'lobby') renderHost();
}
