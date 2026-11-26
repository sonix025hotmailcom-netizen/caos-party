/* ---------- 🔤 PALABRA REVUELTA: dificultad que sube ---------- */
GAMES.anagram.next = function () {
  const gd = H.gd; gd.i++;
  const [mn, mx] = [[4, 6], [6, 8], [7, 13]][Math.min(gd.i - 1, 2)];
  H.used.an = H.used.an || new Set();
  let pool = ANAGRAMS.filter(w => w.length >= mn && w.length <= mx && !H.used.an.has(w)); if (!pool.length) { H.used.an.clear(); pool = ANAGRAMS.filter(w => w.length >= mn && w.length <= mx); }
  gd.word = pickR(pool); H.used.an.add(gd.word);
  let s, best = null, bestSame = 99;
  for (let k = 0; k < 30; k++) { s = shuffle([...gd.word]).join(''); const same = [...s].filter((c, i) => c === gd.word[i]).length; if (s !== gd.word && same < bestSame) { best = s; bestSame = same; } }
  gd.scr = best || s; gd.sol = []; gd.hint = 0;
  setPhase('an-go', 30000, () => GAMES.anagram.reveal(), 500);
  const tok = H.token;
  setTimeout(() => { if (tok === H.token) { gd.hint = 1; const h = $('#anh'); if (h) h.innerHTML = `💡 Empieza con <b>${gd.word[0]}</b> y termina con <b>${gd.word[gd.word.length - 1]}</b>`; } }, 14000);
  A({ targets: '.tile', translateY: [-120, 0], rotate: () => window.anime ? anime.random(-30, 30) : 0, opacity: [0, 1], delay: anime_stagger(70), duration: 700, easing: 'easeOutBounce' });
};
