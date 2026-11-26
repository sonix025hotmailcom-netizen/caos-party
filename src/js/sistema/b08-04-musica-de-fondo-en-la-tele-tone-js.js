/* ---------- 🎵 música de fondo en la tele (Tone.js) ---------- */
const Music = {
  url: 'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js', on: store.get('cp_music') !== '0', ready: false, playing: false,
  preload() { if (isWide()) loadScript(this.url).catch(() => {}); },
  async ensure() {
    if (!this.on) return;
    try {
      if (!window.Tone) await loadScript(this.url);
      await Tone.start();
      if (!this.ready) this.build();
      this.sync();
    } catch (e) {}
  },
  build() {
    const T = window.Tone; this.ready = true;
    const vol = new T.Volume(-17).toDestination(), rev = new T.Reverb({ decay: 2.2, wet: .25 }).connect(vol);
    const keys = new T.PolySynth(T.Synth, { oscillator: { type: 'triangle' }, envelope: { attack: .01, decay: .25, sustain: .2, release: .5 } }).connect(rev);
    const bass = new T.MonoSynth({ oscillator: { type: 'square' }, filter: { Q: 2, type: 'lowpass' }, filterEnvelope: { attack: .01, decay: .15, sustain: .2, baseFrequency: 180, octaves: 2.5 }, envelope: { attack: .01, decay: .2, sustain: .3, release: .2 } }).connect(vol);
    const kick = new T.MembraneSynth({ pitchDecay: .03, octaves: 6, envelope: { attack: .001, decay: .3, sustain: 0 } }).connect(vol);
    const hat = new T.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: .001, decay: .05, sustain: 0 }, volume: -16 }).connect(vol);
    const prog = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']], bl = ['C2', 'G1', 'A1', 'F1'];
    let step = 0;
    T.Transport.bpm.value = 120;
    T.Transport.scheduleRepeat(time => {
      const bar = Math.floor(step / 8) % 4, s = step % 8, ch = prog[bar];
      if (s === 0 || s === 4) kick.triggerAttackRelease('C1', '8n', time);
      if (s % 2 === 1) hat.triggerAttackRelease('16n', time);
      if (s === 0 || s === 3 || s === 6) bass.triggerAttackRelease(bl[bar], '8n', time);
      if ([0, 2, 3, 5, 7].includes(s)) keys.triggerAttackRelease(ch[(s + bar) % 3].replace(/\d/, d => +d + (s > 4 ? 1 : 0)), '16n', time, .5);
      step++;
    }, '8n');
  },
  sync() {
    if (!window.Tone || !this.ready) return;
    const want = this.on && ['lobby', 'board', 'final', 'intro'].includes(H.phase);
    if (want && !this.playing) { Tone.Transport.start('+0.05'); this.playing = true; }
    else if (!want && this.playing) { Tone.Transport.pause(); this.playing = false; }
  },
  toggle() { this.on = !this.on; store.set('cp_music', this.on ? '1' : '0'); if (this.on) this.ensure(); else this.sync(); renderHost(); },
};
Music.preload();
const _startHost2 = startHost;
startHost = function () { Music.ensure(); return _startHost2(); };
const _onHostClick2 = onHostClick;
onHostClick = function (e) {
  const b = e.target.closest('[data-act]');
  if (b && b.dataset.act === 'music') { Music.toggle(); return; }
  if (Music.on && !Music.playing) Music.ensure();
  return _onHostClick2(e);
};
const _renderHost2 = renderHost;
renderHost = function () {
  _renderHost2();
  Music.sync();
  const mb = `<button class="btn small gray mbtn" data-act="music" title="Música">${ICO(Music.on ? 'volume-2' : 'volume-x')}</button>`;
  const tb = app.querySelector('.topbar .tb-right'); if (tb && !tb.querySelector('.mbtn')) { tb.insertAdjacentHTML('afterbegin', mb); drawIcons(); }
  const lh = app.querySelector('.lob-head'); if (lh && !lh.querySelector('.mbtn')) { lh.insertAdjacentHTML('beforeend', mb); drawIcons(); }
};
