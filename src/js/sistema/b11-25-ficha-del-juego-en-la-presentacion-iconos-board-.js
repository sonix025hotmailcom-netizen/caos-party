/* ---------- ficha del juego en la presentación (íconos Board Game Info) ---------- */
const GTAG = { luck: 'Suerte', knowledge: 'Saber', interaction: 'Social', puzzle: 'Ingenio', stopwatch: 'Reflejos', cards: 'Cartas', tiles: 'Fichas', pen_paper: 'Dibujo', miniatures: 'Acción' };
const GAME_TAGS = {
  tap: ['stopwatch'], reflex: ['stopwatch'], quip: ['interaction'], draw: ['pen_paper', 'interaction'], liar: ['interaction'], major: ['interaction', 'luck'], sumo: ['miniatures'], coins: ['miniatures'], paint: ['pen_paper', 'miniatures'], race: ['stopwatch'],
  simon: ['puzzle'], likely: ['interaction'], count: ['puzzle'], stroop: ['puzzle', 'stopwatch'], maze: ['puzzle', 'miniatures'], ttt: ['puzzle'], c4: ['puzzle'], basta: ['knowledge', 'interaction'], find: ['puzzle', 'stopwatch'], potato: ['luck', 'stopwatch'],
  mole: ['stopwatch'], trivia: ['knowledge'], anagram: ['knowledge', 'puzzle'], pict: ['pen_paper', 'interaction'], snake: ['miniatures'], jump: ['stopwatch'], futbol: ['miniatures'], tower: ['tiles', 'puzzle'], meteor: ['miniatures'], zoom: ['knowledge', 'puzzle'],
  memo: ['cards', 'puzzle'], flags: ['knowledge'], planes: ['miniatures'], chef: ['miniatures'], paintball: ['miniatures'], tanks: ['miniatures'], dice: ['luck'], hilo: ['cards', 'luck'], rocks: ['miniatures'], marbles: ['miniatures', 'stopwatch'],
  domino: ['tiles', 'stopwatch'], manos: ['stopwatch', 'interaction'], ppt: ['luck', 'interaction'], ovni: ['miniatures', 'puzzle'],
};
(() => {
  const oi = introHTML;
  introHTML = function () {
    const h = oi(), key = H.order[H.roundIdx], tags = (GAME_TAGS[key] || ['stopwatch']).concat('tablet');
    const row = `<div class="gtags">${tags.map(t => `<span class="gtag"><img src="assets/info/${t}.png" alt=""><b>${t === 'tablet' ? 'Con el cel' : GTAG[t]}</b></span>`).join('')}</div>`;
    return h.replace('<p class="g-desc">', row + '<p class="g-desc">');
  };
})();
