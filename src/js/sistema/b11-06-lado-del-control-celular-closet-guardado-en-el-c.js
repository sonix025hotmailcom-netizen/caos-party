/* ---------- lado del control (celular): closet guardado en el cel ---------- */
const myInv = () => { try { const a = JSON.parse(store.get('cp_inv') || '[]'); return Array.isArray(a) ? a.filter(x => ITEMS[x]) : []; } catch (e) { return []; } };
const myEq = () => { try { return cleanEq(JSON.parse(store.get('cp_eq') || '{}')); } catch (e) { return cleanEq(); } };
const saveInv = a => store.set('cp_inv', JSON.stringify([...new Set(a)]));
const saveEq = q => { q = cleanEq(q); store.set('cp_eq', JSON.stringify(q)); P.eq = q; send({ t: 'equip', eq: q }); return q; };
function rollItem(owned) {
  const pool = ITEM_IDS.filter(i => !owned.includes(i)); if (!pool.length) return null;
  const tot = pool.reduce((s, i) => s + RAR[ITEMS[i].r].w, 0); let x = Math.random() * tot;
  for (const i of pool) { x -= RAR[ITEMS[i].r].w; if (x <= 0) return i; } return pool[pool.length - 1];
}
const meActor = (eq, color) => ({ id: 'me', name: P.name || '', emoji: P.emoji || '🤖', color: color || P.color || P.wantColor || '#ff4d6d', char: 'Robot', eq });
function remountMini() { const el = $('#mini3d'); if (el) Stage3D.mount(el, [meActor(P.eq)], 'solo'); }

function closetHTML(tab) {
  const inv = myInv(), eq = P.eq || myEq();
  const list = ITEM_IDS.filter(i => ITEMS[i].s === tab);
  return `<div class="closet"><div class="cl-head"><b>👕 Mi closet</b><span>${inv.length}/${ITEM_IDS.length}</span></div>
    <div class="cl-tabs">${Object.entries(SLOTS).map(([k, n]) => `<button class="cl-tab ${k === tab ? 'on' : ''}" data-tab="${k}">${n}</button>`).join('')}</div>
    <div class="cl-grid"><button class="cl-it ${!eq[tab] ? 'on' : ''}" data-it="">🚫<small>Nada</small></button>${list.map(i => {
      const own = inv.includes(i), it = ITEMS[i];
      return own ? `<button class="cl-it ${eq[tab] === i ? 'on' : ''}" data-it="${i}" style="--rc:${RAR[it.r].col}">${it.e}<small>${it.n}</small></button>`
        : `<button class="cl-it lock" disabled style="--rc:${RAR[it.r].col}">❔<small>${RAR[it.r].n}</small></button>`;
    }).join('')}</div>${inv.length ? '' : '<div class="cl-tip">Ganá un minijuego en primer lugar para abrir regalos sorpresa 🎁</div>'}</div>`;
}
function wireCloset(root, tab) {
  const box = root.querySelector('.closet'); if (!box) return;
  box.querySelectorAll('.cl-tab').forEach(b => b.onclick = () => { box.outerHTML = closetHTML(b.dataset.tab); wireCloset(root, b.dataset.tab); SFX.pop(); });
  box.querySelectorAll('.cl-it:not(.lock)').forEach(b => b.onclick = () => {
    const q = Object.assign({}, P.eq || myEq()); q[tab] = b.dataset.it || null; saveEq(q);
    box.outerHTML = closetHTML(tab); wireCloset(root, tab); remountMini(); SFX.pop(); if (navigator.vibrate) navigator.vibrate(12);
  });
}

(() => {
  /* el equipo viaja con el "join" */
  const oc = connectToHost;
  connectToHost = function () {
    oc();
    const c = P.conn; if (!c) return;
    P.eq = myEq();
    const os2 = c.send.bind(c);
    c.send = o => os2(o && o.t === 'join' ? Object.assign({}, o, { eq: P.eq }) : o);
  };
  /* la vista previa de la pantalla de unirse también se viste */
  const os = showJoin;
  showJoin = function (code) {
    os(code); P.eq = myEq();
    const pv = $('#colprev'); if (pv) Stage3D.mount(pv, [meActor(P.eq, P.wantColor)], 'solo');
    const pick = app.querySelector('.colpick');
    if (pick) pick.addEventListener('click', () => setTimeout(() => { const v = $('#colprev'); if (v) Stage3D.mount(v, [meActor(P.eq, P.wantColor)], 'solo'); }, 30));
    const inp = app.querySelector('.colpick input[type=color]'); if (inp) inp.addEventListener('input', () => { const v = $('#colprev'); if (v) Stage3D.mount(v, [meActor(P.eq, inp.value)], 'solo'); });
  };
  /* en el lobby: closet debajo de los colores */
  let tab = 'h';
  const orc = renderCtrl;
  renderCtrl = function (v) {
    orc(v);
    if (!v || v.screen !== 'lobby') return;
    const el = $('#mini3d'); if (!el) return;
    if (!P.eq) P.eq = myEq();
    remountMini();
    const host = el.parentElement;
    const pick = host.querySelector('.colpick');
    if (pick && !pick.dataset.dress) { pick.dataset.dress = 1; pick.addEventListener('click', () => setTimeout(remountMini, 30)); const inp = pick.querySelector('input[type=color]'); if (inp) inp.addEventListener('input', () => setTimeout(remountMini, 30)); }
    if (!host.querySelector('.closet')) { (pick || el).insertAdjacentHTML('afterend', closetHTML(tab)); wireCloset(host, tab); host.querySelectorAll('.cl-tab').forEach(b => b.addEventListener('click', () => tab = b.dataset.tab)); }
  };
  /* ¡regalo! */
  const ow = onPlayerMsg;
  onPlayerMsg = function (m) {
    if (m && m.t === 'gift') { openGift(m); return; }
    if (m && m.t === 'nogift') { toast(`🏆 ¡Ganaste! Pero esta vez el cofre salió vacío 📦😅 · Próxima vez: ${m.next | 0}% de chance`); if (navigator.vibrate) navigator.vibrate([40, 60, 40]); SND.play('ui_error_006', .5); return; }
    ow(m);
  };
})();

function openGift(m) {
  if (document.querySelector('.giftm')) return;
  const inv = myInv(), id = rollItem(inv), it = id && ITEMS[id];
  if (id) { inv.push(id); saveInv(inv); }
  send({ t: 'got', id: id || '' });
  if (navigator.vibrate) navigator.vibrate([80, 40, 80, 40, 160]);
  const d = document.createElement('div'); d.className = 'giftm';
  d.innerHTML = `<div class="gm-card">
    <div class="gm-t">🏆 ¡Ganaste ${esc(m.game || 'el minijuego')}!</div>
    <div class="gm-s">Te ganaste un regalo sorpresa</div>
    <div class="gm-stage"><div class="gm-box" id="gmBox"><div class="gm-lid"></div><div class="gm-body"></div><div class="gm-bow"></div></div>
      <div class="mini3d gm-prev" id="gmPrev" style="display:none"><span class="mini-fallback">${it ? it.e : '🏆'}</span></div><div class="gm-rays"></div></div>
    <div class="gm-tap">👆 Tocá la caja para abrirla</div>
    <div class="gm-res" style="display:none">${it ? `<div class="gm-rar" style="--rc:${RAR[it.r].col}">${RAR[it.r].n}</div><div class="gm-name">${it.e} ${esc(it.n)}</div><div class="gm-slot">Para: ${SLOTS[it.s]}</div>` : `<div class="gm-name">🏆 ¡Ya tenés todo el closet!</div><div class="gm-slot">Sos coleccionista oficial</div>`}
      <div class="gm-btns">${it ? '<button class="btn big pink" id="gmWear">¡Ponérmelo!</button>' : ''}<button class="btn gray" id="gmClose">${it ? 'Después' : 'Cerrar'}</button></div></div></div>`;
  document.body.appendChild(d);
  const box = d.querySelector('#gmBox'); let opened = false;
  if (window.gsap) { gsap.from(d.querySelector('.gm-card'), { scale: .5, opacity: 0, duration: .5, ease: 'back.out(2)' }); gsap.to(box, { rotation: 6, yoyo: true, repeat: -1, duration: .12, ease: 'sine.inOut', repeatDelay: .6 }); }
  const close = () => { if (window.gsap) gsap.to(d, { opacity: 0, duration: .25, onComplete: () => { d.remove(); remountMini(); } }); else { d.remove(); remountMini(); } };
  box.onclick = () => {
    if (opened) return; opened = true; SFX.win && SFX.win();
    if (navigator.vibrate) navigator.vibrate(120);
    d.querySelector('.gm-tap').style.display = 'none';
    const reveal = () => {
      box.style.display = 'none';
      const pv = d.querySelector('#gmPrev'); pv.style.display = '';
      const eq = Object.assign({}, P.eq || myEq()); if (it) eq[it.s] = id;
      Stage3D.mount(pv, [meActor(eq)], 'solo');
      d.querySelector('.gm-rays').classList.add('on');
      const res = d.querySelector('.gm-res'); res.style.display = '';
      confettiDOM(d.querySelector('.gm-stage'), it ? RAR[it.r].col : '#ffd23f');
      if (window.gsap) gsap.from(res, { y: 30, opacity: 0, duration: .45, ease: 'back.out(2)' });
    };
    if (window.gsap) { gsap.killTweensOf(box); const tl = gsap.timeline({ onComplete: reveal }); tl.to(box, { rotation: -12, duration: .08, yoyo: true, repeat: 5 }).to(box, { scale: 1.25, duration: .15 }).to(box.querySelector('.gm-lid'), { y: -160, rotation: -40, opacity: 0, duration: .35, ease: 'power2.out' }, '-=.05').to(box, { scale: 0, opacity: 0, duration: .2 }); }
    else reveal();
  };
  d.querySelector('#gmClose').onclick = close;
  const w = d.querySelector('#gmWear'); if (w) w.onclick = () => { const q = Object.assign({}, P.eq || myEq()); q[it.s] = id; saveEq(q); close(); };
}
function confettiDOM(el, col) {
  const cols = [col, '#ff3d8b', '#ffd23f', '#4cc9ff', '#22c55e', '#ffffff'];
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i'); s.className = 'gm-cf'; s.style.background = cols[i % cols.length]; el.appendChild(s);
    const a = Math.random() * Math.PI * 2, r = 90 + Math.random() * 170;
    if (window.gsap) gsap.fromTo(s, { x: 0, y: 0, rotation: 0, opacity: 1 }, { x: Math.cos(a) * r, y: Math.sin(a) * r * .8 + 120, rotation: Math.random() * 720, opacity: 0, duration: 1.4 + Math.random() * .8, ease: 'power2.out', onComplete: () => s.remove() });
    else setTimeout(() => s.remove(), 100);
  }
}
