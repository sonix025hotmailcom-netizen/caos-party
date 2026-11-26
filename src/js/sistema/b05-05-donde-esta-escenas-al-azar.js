/* ---------- 🔍 ¿DÓNDE ESTÁ?: escenas al azar ---------- */
GAMES.find.sub = function () {
  const gd = H.gd; gd.r++;
  const th = pickU(FIND_THEMES, 'find'); gd.th = { n: th.n, t: pickR(th.ts) };
  const cols = 20 + rand(10), rows = Math.round(cols * .6), cw = 1000 / cols, ch = 600 / rows, base = Math.min(cw, ch);
  const items = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (Math.random() < .94) items.push({ x: x * cw + cw / 2 + (Math.random() - .5) * cw * .4, y: y * ch + ch / 2 + (Math.random() - .5) * ch * .4, e: pickR(th.d), s: base * (.72 + Math.random() * .38), r: (Math.random() - .5) * 1.2 });
  const cand = items.filter(it => it.x > 60 && it.x < 940 && it.y > 60 && it.y < 540), tgt = pickR(cand);
  tgt.e = gd.th.t; gd.target = tgt;
  const sc = document.createElement('canvas'); sc.width = 1000; sc.height = 600;
  const c = sc.getContext('2d'), bg = pickR(['#1e293b', '#14532d', '#1e1b4b', '#3f1d38', '#0c4a6e', '#422006']);
  c.fillStyle = bg; c.fillRect(0, 0, 1000, 600);
  const paint = () => { c.fillStyle = bg; c.fillRect(0, 0, 1000, 600); for (const it of items) { if (it === tgt) continue; c.save(); c.translate(it.x, it.y); c.rotate(it.r); emo(c, it.e, 0, 0, it.s); c.restore(); } c.save(); c.translate(tgt.x, tgt.y); c.rotate(tgt.r); emo(c, tgt.e, 0, 0, tgt.s); c.restore(); };
  shuffle(items); paint();
  /* que la tele dibuje los mismos emojis 3D que ve el cel (si no, el objetivo se ve distinto) */
  if (window.feImg && typeof feSrc === 'function') { const srcs = [...new Set(items.map(it => feSrc(it.e)).filter(Boolean))].map(window.feImg); const sid0 = gd.r; Promise.race([Promise.all(srcs.map(im => im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; }))), new Promise(r => setTimeout(r, 2500))]).then(() => { if (H.gd === gd && gd.r === sid0) paint(); }); }
  gd.scene = sc; gd.ps = {}; gd.found = [];
  spreadStart(gd.ids, 500, 300, 150).forEach(([id, x, y]) => gd.ps[id] = { x, y, stun: 0, lb: inp(id).b, miss: 0 });
  gd.sid = rid();
  setPhase('find-ready', 3500, () => { SFX.go(); GAMES.find.go(); }, 0, false);
};
