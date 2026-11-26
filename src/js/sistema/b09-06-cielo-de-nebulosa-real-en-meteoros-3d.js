/* ---------- ☄️ cielo de nebulosa real en Meteoros 3D ---------- */
(() => {
  const ob = GAMES.meteor.build3D;
  GAMES.meteor.build3D = function (T) {
    const r = ob.call(this, T);
    new T.TextureLoader().load('assets/sky_nebula.jpg', tex => { tex.mapping = T.EquirectangularReflectionMapping; tex.colorSpace = T.SRGBColorSpace; r.scene.background = tex; r.scene.fog = null; });
    return r;
  };
})();
