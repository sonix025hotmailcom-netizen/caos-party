/* ================== v41 — EMOTES / REACCIONES + más animaciones de los personajes ================== */
const EMO = {
  L: [['😂', 'Yes'], ['😎', 'Dance'], ['❤️', 'Wave'], ['🔥', 'Punch'], ['👍', 'ThumbsUp'], ['😱', 'Jump'], ['😭', 'No'], ['💀', 'Death']],
  CD: 2000, ACT: new Map(), last: {}, tex: {},
  h(e) { const s = typeof feSrc === 'function' ? feSrc(e) : null; return s ? `<img src="${s}" alt="${e}" draggable="false">` : e; },
  /* registro de los personajes 3D de cada jugador (cualquier juego o el lobby) */
  reg(id, a) { if (!id) return; let s = EMO.ACT.get(id); if (!s) EMO.ACT.set(id, s = new Set()); s.add(a); if (s.size > 6) s.delete(s.values().next().value); },
  live(a) { let o = a.obj; while (o.parent) o = o.parent; return !!o.isScene; },
  doAnim(a, anim, back) {
    const nx = a.acts[anim] || a.acts[ANIM_ALIAS[anim]] || a.acts[ANIM_ALIAS[ANIM_ALIAS[anim]]]; if (!nx || a._emoting) return;
    a._emoting = true; a._op(anim, true);
    const done = () => { if (!a._emoting) return; a._emoting = false; a.mixer.removeEventListener('finished', f); a.cur = null; a._idleT = performance.now(); a._op(a._want || back || 'Idle'); };
    const f = e => { if (e.action === nx) done(); }; a.mixer.addEventListener('finished', f); setTimeout(done, 3200);
  },
  sprite(a, e) {
    const T = C3D.T; if (!T) return; const src = typeof feSrc === 'function' ? feSrc(e) : null;
    let tx = EMO.tex[e]; if (!tx) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); tx = EMO.tex[e] = new T.CanvasTexture(c); tx.colorSpace = T.SRGBColorSpace;
      const txt = () => { g.font = '100px system-ui, "Apple Color Emoji", "Segoe UI Emoji"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 64, 70); tx.needsUpdate = true; };
      if (src) { const im = new Image(); im.onload = () => { g.drawImage(im, 8, 8, 112, 112); tx.needsUpdate = true; }; im.onerror = txt; im.src = src; } else txt(); }
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); sp.renderOrder = 20;
    const k = 1 / (a.obj.scale.x || 1); sp.scale.setScalar(.9 * k); sp.position.set(0, 2.25 * k, 0); a.obj.add(sp);
    const t0 = performance.now(), tick = () => { const u = (performance.now() - t0) / 1900; if (u >= 1 || !sp.parent) { sp.parent && sp.parent.remove(sp); sp.material.dispose(); return; } sp.position.y = (2.25 + u * .9) * k; const s = (u < .15 ? u / .15 * 1.15 : 1.15 - Math.min(.15, (u - .15))) * .9 * k; sp.scale.setScalar(s); sp.material.opacity = u > .75 ? (1 - u) / .25 : 1; requestAnimationFrame(tick); }; tick();
  },
  bubble(p, e) {
    const pill = document.querySelector(`.schip[data-id="${p.id}"]`), r = pill ? pill.getBoundingClientRect() : null, d = document.createElement('div');
    d.className = 'emob'; d.innerHTML = `<span class="emoi">${EMO.h(e)}</span><span class="emon" style="--c:${p.color}">${esc(p.name)}</span>`;
    if (r && r.width) { d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top - 4) + 'px'; } else { d.style.left = (12 + Math.random() * 76) + '%'; d.style.top = '88%'; }
    document.body.appendChild(d); setTimeout(() => d.remove(), 2300);
  },
  fire(p, i) {
    const now = Date.now(), em = EMO.L[i]; if (!p || !em || now - (EMO.last[p.id] || 0) < EMO.CD - 250) return; EMO.last[p.id] = now;
    EMO.bubble(p, em[0]); try { Stage3D.emo && Stage3D.emo(p.id, em[1], em[0]); } catch (e) {} try { SND.play('ui_pluck_001', .25, 1.3 + Math.random() * .3); } catch (e) {}
    const s = EMO.ACT.get(p.id); if (s) for (const a of [...s]) { if (!EMO.live(a)) { s.delete(a); continue; } EMO.doAnim(a, em[1], a._want); EMO.sprite(a, em[0]); }
  },
  /* lado del cel: botón flotante 😀 con 8 reacciones y su enfriamiento */
  ctrl() {
    if (document.getElementById('emobtn')) return;
    const b = document.createElement('button'); b.id = 'emobtn'; b.type = 'button'; b.innerHTML = EMO.h('😎');
    const pad = document.createElement('div'); pad.id = 'emopad'; pad.innerHTML = EMO.L.map(([e], i) => `<button type="button" data-i="${i}">${EMO.h(e)}</button>`).join('');
    document.body.append(b, pad); let cdT = 0;
    b.onclick = ev => { ev.stopPropagation(); if (Date.now() < cdT) return; pad.classList.toggle('on'); };
    pad.onclick = ev => { const t = ev.target.closest('button'); if (!t) return; ev.stopPropagation(); send({ t: 'emo', i: +t.dataset.i }); pad.classList.remove('on'); cdT = Date.now() + EMO.CD; b.classList.remove('cd'); void b.offsetWidth; b.classList.add('cd'); if (navigator.vibrate) navigator.vibrate(25); };
    document.addEventListener('pointerdown', ev => { if (!pad.contains(ev.target) && ev.target !== b && !b.contains(ev.target)) pad.classList.remove('on'); });
    /* PC: teclas 1-8 abren reacciones directo (solo si no se está escribiendo) */
    document.addEventListener('keydown', ev => { if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '') || ev.repeat) return; const k = +ev.key; if (k >= 1 && k <= 8 && ev.altKey) { pad.querySelector(`[data-i="${k - 1}"]`)?.click(); } });
  }
};
/* cada personaje 3D: se anota de quién es y gana animaciones extra (gestos cuando está quieto) */
(() => {
  const om = C3D.make;
  C3D.make = function (g, height, tint) {
    const id = window._dressId, a = om.apply(this, arguments);
    a._op = a.play; a._idleT = performance.now(); a._fid = 15000 + Math.random() * 15000;
    a.play = (n, once, then) => {
      if (!once) a._want = n; if (a._emoting) return;
      const now = performance.now();
      if (n === 'Idle' && !once) { if (a.cur && a.cur !== (a.acts.Idle || a.acts[ANIM_ALIAS.Idle])) a._idleT = now; else if (now - a._idleT > a._fid) { a._idleT = now; a._fid = 18000 + Math.random() * 18000; EMO.doAnim(a, pickR(['Wave', 'Yes', 'ThumbsUp', 'Dance']), 'Idle'); return; } }
      a._op(n, once, then);
    };
    if (id && pl(id)) EMO.reg(id, a);
    return a;
  };
  const oh = onHostMsg;
  onHostMsg = function (conn, m) { if (m && m.t === 'emo') { const p = pl(conn._pid); if (p && p.conn === conn) EMO.fire(p, m.i | 0); return; } return oh.apply(this, arguments); };
  const orc = renderCtrl;
  renderCtrl = function () { const r = orc.apply(this, arguments); try { EMO.ctrl(); } catch (e) {} return r; };
  const on = nextRound; nextRound = function () { EMO.ACT.forEach(s => { for (const a of [...s]) if (!EMO.live(a)) s.delete(a); }); return on.apply(this, arguments); };
  /* los bots también reaccionan de vez en cuando */
})();

/* ================== v44 — ANIMACIÓN "VIVA": capa procedural encima de las animaciones ==================
   giro suave, inclinación al correr/frenar/doblar, estirar-aplastar al saltar y caer, cabeza que mira,
   caminar vs correr según la velocidad real, pies sincronizados y polvito al correr y al caer */
const ALIVE = {
  puffTex: null,
  tex(T) { if (ALIVE.puffTex) return ALIVE.puffTex; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.5, 'rgba(235,230,225,.55)'); gr.addColorStop(1, 'rgba(235,230,225,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return ALIVE.puffTex = new T.CanvasTexture(c); },
  scene(o) { while (o.parent) o = o.parent; return o.isScene ? o : null; },
  puff(a, T, x, y, z, s, vx, vz) {
    const sc = ALIVE.scene(a.obj); if (!sc || window.__lowq) return; const P = a._lv.puffs; if (P.length > 14) return;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: ALIVE.tex(T), transparent: true, depthWrite: false, opacity: .8 })); sp.position.set(x, y, z); sp.scale.setScalar(s * .5); sc.add(sp);
    P.push({ sp, t: 0, s, vx: vx || 0, vz: vz || 0, vy: s * .6 });
  },
  rig(a, T0) {
    const T = T0 || C3D.T, L = a._lv = { puffs: [], pos: null, vel: new T.Vector3(), sq: 0, sqv: 0, lp: 0, lr: 0, hy: 0, yawD: null, yawT: null, yawW: null, gy: null, air: false, stride: 0, t: Math.random() * 100, w: new T.Vector3() };
    a.obj.rotation.order = 'YXZ'; L.bs = a.obj.scale.x;
    a.obj.traverse(o => { if (o.isBone && /^Head$/.test(o.name) && !L.head) L.head = o; if (o.isBone && /^Torso$/.test(o.name) && !L.torso) L.torso = o; });
    if (L.head) L.hq = L.head.quaternion.clone();
    const om = a.mixer.update.bind(a.mixer), Q = new T.Quaternion(), AX = new T.Vector3(0, 1, 0);
    a.mixer.update = dt => {
      dt = Math.min(dt || 0, .05); const o = a.obj;
      /* quitar lo que sumamos el cuadro anterior (así no peleamos con el juego) */
      if (o.rotation.x === L.wx) o.rotation.x -= L.lp; if (o.rotation.z === L.wz) o.rotation.z -= L.lr; if (L.sm && o.scale.y === L.wsy && o.scale.x === L.wsx) o.scale.set(o.scale.x / L.sm[0], o.scale.y / L.sm[1], o.scale.z / L.sm[0]);
      if (L.head && L.hqSet) L.head.quaternion.copy(L.hq);
      /* giro suave: el juego pone hacia dónde mirar, nosotros llegamos ahí con resorte */
      const ry = o.rotation.y; if (L.yawW === null || Math.abs(ry - L.yawW) > 1e-6) L.yawT = ry; if (L.yawD === null) L.yawD = L.yawT;
      let dy = ((L.yawT - L.yawD + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; const yr = dy * Math.min(1, dt * 14); L.yawD += yr; o.rotation.y = L.yawD; L.yawW = L.yawD; const yawRate = dt ? yr / dt : 0;
      /* velocidad real en el mundo, en "alturas de personaje" por segundo */
      o.getWorldPosition(L.w); const h = Math.max(.2, (a._h || 1.7) * (o.parent ? o.parent.getWorldScale(new T.Vector3()).y : 1));
      if (L.pos && dt > 0) { const vx = (L.w.x - L.pos.x) / dt, vy = (L.w.y - L.pos.y) / dt, vz = (L.w.z - L.pos.z) / dt, k = Math.min(1, dt * 10); if (Math.hypot(vx, vy, vz) / h < 60) { L.acc = ((Math.hypot(vx, vz) - Math.hypot(L.vel.x, L.vel.z)) / dt) / h; L.vel.x += (vx - L.vel.x) * k; L.vel.y += (vy - L.vel.y) * Math.min(1, dt * 16); L.vel.z += (vz - L.vel.z) * k; } else L.vel.set(0, 0, 0); }
      if (!L.pos) L.pos = new T.Vector3(); L.pos.copy(L.w);
      const spd = Math.hypot(L.vel.x, L.vel.z) / h, fy = L.yawD, fwd = (L.vel.x * Math.sin(fy) + L.vel.z * Math.cos(fy)) / h;
      /* caminar o correr según la velocidad, y patitas al ritmo (menos patinaje) */
      a._spd = spd;
      const cur = a.cur, run = a.acts.Running || a.acts.Run, walk = a.acts.Walking || a.acts.Walk;
      if (a.mixer.timeScale === 1 && cur && (cur === run || cur === walk)) cur.timeScale = Math.max(.65, Math.min(1.6, spd / (cur === run ? 2.4 : 1.1)));
      om(dt);
      /* aire / aterrizaje: estirar al subir, aplastar al caer */
      const vyh = L.vel.y / h; let rest = 0; if (vyh > 2.2) { L.air = true; rest = -.16; }
      if (vyh < -2.5) { L.air = true; L.minVy = Math.min(L.minVy || 0, vyh); rest = Math.max(-.26, vyh * .03); }
      if (L.air && vyh > -.8 && (L.minVy || 0) < -2.5) { L.air = false; L.sqv += Math.min(10, -L.minVy * .95); L.minVy = 0; for (let k = 0; k < 6; k++) { const an = k / 6 * 6.28; ALIVE.puff(a, T, L.w.x + Math.sin(an) * h * .25, L.w.y + h * .05, L.w.z + Math.cos(an) * h * .25, h * .55, Math.sin(an) * h * .9, Math.cos(an) * h * .9); } }
      L.prevVy = vyh;
      L.sqv += (-(L.sq - rest) * 170 - L.sqv * 11) * dt; L.sq += L.sqv * dt; L.sq = Math.max(-.28, Math.min(.42, L.sq));
      const sy = 1 - L.sq, sxz = 1 + L.sq * .55; L.sm = [sxz, sy]; o.scale.set(o.scale.x * sxz, o.scale.y * sy, o.scale.z * sxz); L.wsx = o.scale.x; L.wsy = o.scale.y;
      /* inclinarse: hacia adelante al correr, atrás al frenar, de lado al doblar */
      const tp = Math.max(-.22, Math.min(.3, fwd * .045 + Math.max(-2, Math.min(2, L.acc || 0)) * .03)), tr = Math.max(-.3, Math.min(.3, -yawRate * Math.min(spd, 6) * .022));
      L.lp += (tp - L.lp) * Math.min(1, dt * 8); L.lr += (tr - L.lr) * Math.min(1, dt * 8); o.rotation.x += L.lp; o.rotation.z += L.lr; L.wx = o.rotation.x; L.wz = o.rotation.z;
      /* cabeza: mira hacia donde dobla; quieto, mira alrededor */
      L.t += dt; if (L.head) { const idle = spd < .3; const tgt = idle ? Math.sin(L.t * .55) * .35 * Math.sin(L.t * .21 + 1) : Math.max(-.5, Math.min(.5, yawRate * .18)); L.hy += (tgt - L.hy) * Math.min(1, dt * 5); L.hq.copy(L.head.quaternion); Q.setFromAxisAngle(AX, L.hy); L.head.quaternion.multiply(Q); L.hqSet = true; }
      /* polvito al correr */
      if (spd > 1.6 && !L.air) { L.stride += spd * h * dt; if (L.stride > h * .8) { L.stride = 0; ALIVE.puff(a, T, L.w.x - Math.sin(fy) * h * .2 + (Math.random() - .5) * h * .2, L.w.y + h * .05, L.w.z - Math.cos(fy) * h * .2, h * .4, -L.vel.x * .15, -L.vel.z * .15); } }
      for (let i = L.puffs.length - 1; i >= 0; i--) { const p = L.puffs[i]; p.t += dt; const u = p.t / .7; if (u >= 1 || !p.sp.parent) { p.sp.parent && p.sp.parent.remove(p.sp); p.sp.material.dispose(); L.puffs.splice(i, 1); continue; } p.sp.position.x += p.vx * dt; p.sp.position.z += p.vz * dt; p.sp.position.y += p.vy * dt; p.vx *= .92; p.vz *= .92; p.sp.scale.setScalar(p.s * (.5 + u * .9)); p.sp.material.opacity = .8 * (1 - u); }
    };
  }
};
(() => {
  const om = C3D.make;
  C3D.make = function (g, height) { const a = om.apply(this, arguments); a._h = height; try { ALIVE.rig(a); } catch (e) {} return a; };
  /* cambios de animación más suaves y con caminar cuando va despacio */
  const om2 = C3D.make;
  C3D.make = function () {
    const a = om2.apply(this, arguments), op = a.play;
    a.play = (n, once, then) => { if (!once && (n === 'Running' || n === 'Run') && a._spd != null && a._spd < 1.1 && a._spd > .12 && (a.acts.Walking || a.acts.Walk)) n = 'Walking'; return op(n, once, then); };
    return a;
  };
})();
