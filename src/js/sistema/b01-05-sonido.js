/* ---------- SONIDO ---------- */
let actx = null;
function beep(freq = 600, dur = .12, type = 'square', vol = .07, when = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const t = actx.currentTime + when, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + dur + .03);
  } catch (e) {}
}
const SFX = {
  join() { beep(660, .1, 'triangle', .09); beep(990, .16, 'triangle', .09, .1); },
  tick() { beep(880, .05, 'square', .04); },
  go() { beep(523, .1); beep(659, .1, 'square', .07, .1); beep(784, .28, 'square', .07, .2); },
  win() { [523, 659, 784, 1046].forEach((f, i) => beep(f, .22, 'triangle', .1, i * .12)); },
  bad() { beep(180, .35, 'sawtooth', .07); },
  pop() { beep(1100 + rand(300), .06, 'sine', .07); },
  whoosh() { [300, 450, 650, 900].forEach((f, i) => beep(f, .08, 'triangle', .06, i * .05)); }
};
