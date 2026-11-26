/* ================== v15 — SONIDOS REALES + LOCUTOR, 💥 GUERRA DE TANQUES, 🎲 GENERALA LOCA ================== */
/* ---------- muestras de sonido (Kenney CC0) con respaldo de los beeps ---------- */
const SND = (() => {
  const buf = {}, base = 'assets/sfx/', last = {};
  const C = () => { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); return actx; };
  function load(n) {
    if (buf[n]) return buf[n];
    if (!window.fetch) return Promise.resolve(null);
    return buf[n] = fetch(base + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject()).then(a => new Promise((res, rej) => C().decodeAudioData(a, res, rej))).catch(() => null);
  }
  function play(n, vol = .6, rate = 1, gap = 40) {
    if (Array.isArray(n)) n = pickR(n);
    const now = performance.now(); if (last[n] && now - last[n] < gap) return; last[n] = now;
    try {
      const c = C(); if (c.state === 'suspended') c.resume();
      load(n).then(b => { if (!b) return; const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(c.destination); s.start(); });
    } catch (e) {}
  }
  let vq = Promise.resolve(), vLast = 0;
  /* el locutor nunca se encima consigo mismo */
  function voice(n, vol = .9) { const t = performance.now(); if (t - vLast < 350) return; vLast = t; play('v_' + n, vol, 1, 0); }
  const PRE = ['ui_click_001', 'ui_click_002', 'ui_pluck_001', 'ui_pluck_002', 'ui_tick_002', 'ui_error_004', 'ui_confirmation_002', 'ui_maximize_006', 'ui_drop_002', 'ui_glass_002'];
  const HOSTPRE = ['v_1', 'v_2', 'v_3', 'v_fight', 'v_begin', 'v_winner', 'v_round_1', 'v_round_2', 'v_round_3', 'v_final_round', 'v_game_over'];
  return { play, voice, load, preload(host) { PRE.concat(host ? HOSTPRE : []).forEach(load); } };
})();
(() => {
  const B = Object.assign({}, SFX);
  SFX.pop = () => { SND.play(['ui_click_001', 'ui_click_002', 'ui_pluck_001', 'ui_pluck_002'], .45, .95 + Math.random() * .15); };
  SFX.tick = () => { SND.play('ui_tick_002', .55); };
  SFX.bad = () => { SND.play('ui_error_004', .55); B.bad(); };
  SFX.join = () => { SND.play('ui_confirmation_002', .6); B.join(); };
  SFX.go = () => { SND.play('ui_maximize_006', .5); B.go(); };
  SFX.whoosh = () => { SND.play('ui_drop_002', .5); B.whoosh(); };
  SFX.win = () => { B.win(); SND.play('ui_glass_002', .35); };
  SFX.hit = () => SND.play(['impactPunch_heavy_000', 'impactPunch_heavy_001', 'impactPunch_medium_000'], .7);
  SFX.boom = () => { SND.play(['sf_explosionCrunch_000', 'sf_explosionCrunch_001', 'sf_explosionCrunch_002'], .7); SND.play('sf_lowFrequency_explosion_000', .5); };
  /* precarga en el primer toque (los navegadores exigen un gesto antes de sonar) */
  const once = () => { removeEventListener('pointerdown', once, true); removeEventListener('keydown', once, true); SND.preload(!!(H && H.code)); };
  addEventListener('pointerdown', once, true); addEventListener('keydown', once, true);
})();
