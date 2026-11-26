/* ---------- algoritmos mejorados en juegos que ya existían ---------- */
GAMES.liar.isTruth = function (t) { const f = H.gd.fact; return [f.a, ...(f.alt || [])].some(c => close(t, c) || (norm(c).length > 3 && norm(t).includes(norm(c)) && norm(t).length <= norm(c).length + 6)); };
GAMES.liar.toPick = function () {
  if (H.phase !== 'l-write') return;
  const gd = H.gd, groups = [];
  for (const [pid, t] of Object.entries(gd.lies)) { let g = groups.find(x => close(x.text, t)); if (!g) groups.push(g = { text: t, authors: [], truth: false }); g.authors.push(pid); }
  gd.opts = shuffle([...groups, { text: cap(gd.fact.a), authors: [], truth: true }]); gd.picks = {};
  setPhase('l-pick', 30000, () => GAMES.liar.reveal(), 1500);
};
GAMES.basta.score = function () {
  if (!['b-write', 'b-stop'].includes(H.phase)) return;
  const gd = H.gd, L = norm(gd.letter);
  gd.tab = {}; gd.tot = {}; gd.ids.forEach(id => { gd.tab[id] = []; gd.tot[id] = 0; });
  gd.cats.forEach((_, c) => {
    const ok = {};
    gd.ids.forEach(id => { const a = norm((gd.ans[id] || [])[c] || ''); ok[id] = a.length >= 2 && a[0] === L ? a : null; });
    gd.ids.forEach(id => {
      const a = (gd.ans[id] || [])[c] || '', k = ok[id];
      const rep = k && gd.ids.some(o => o !== id && ok[o] && close(ok[o], k));
      const pts = !k ? 0 : rep ? 50 : 100; gd.tab[id].push({ a, pts }); gd.tot[id] += pts;
    });
  });
  setPhase('b-res', 6000 + gd.ids.length * 900, () => finishGame(gd.tot), 0, false); SFX.win();
};
