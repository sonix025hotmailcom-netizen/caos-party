/* ---------- ✨ mejoras visuales con GSAP en la tele ---------- */
const _hostFx0 = hostFx;
hostFx = function (ph) {
  _hostFx0(ph);
  if (!window.gsap) return;
  try {
    if (ph === 'intro') {
      const n = $('.g-name'); if (n && !n.dataset.split) { n.dataset.split = 1; n.innerHTML = [...n.textContent].map(ch => `<span class="ch">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join(''); n.style.animation = 'none'; }
      gsap.from('.g-name .ch', { y: -120, opacity: 0, rotation: () => gsap.utils.random(-60, 60), stagger: .035, duration: .8, ease: 'back.out(2.2)', delay: .25 });
      gsap.from('.g-desc', { y: 30, opacity: 0, duration: .6, delay: .7 });
    }
    if (ph === 'lobby') gsap.from('.lobby-players .pchip', { scale: 0, rotation: -20, stagger: .06, duration: .5, ease: 'back.out(2)' });
    if (ph === 'final') {
      const tl = gsap.timeline();
      tl.from('.pod', { y: 300, opacity: 0, stagger: { each: .35, from: 'end' }, duration: .9, ease: 'elastic.out(1,.6)' });
    }
    if (/-res$/.test(ph) || ph === 'tap-res') gsap.from('.rrow', { x: -120, opacity: 0, stagger: .12, duration: .55, ease: 'power3.out' });
  } catch (e) {}
};
const _startHost0 = startHost;
startHost = function () { preloadHostLibs(); return _startHost0(); };


