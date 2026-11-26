/* ================== CAOS PARTY v9 — ASSETS KENNEY + QUATERNIUS (CC0) ================== */
const IMG = (() => { const c = {}; return n => { if (!c[n]) { const i = new Image(); i.decoding = 'async'; i.src = 'assets/' + n; c[n] = i; } return c[n]; }; })();
const imgOk = i => i && i.complete && i.naturalWidth > 0;
const ALIEN_BY_COLOR = { '#ff4d6d': 'pink', '#3b82f6': 'purple', '#22c55e': 'green', '#f59e0b': 'yellow', '#a855f7': 'purple', '#f97316': 'yellow', '#14b8a6': 'green', '#ec4899': 'pink' };
const alienOf = id => ALIEN_BY_COLOR[pl(id)?.color] || 'beige';
const alienImg = (id, pose) => IMG(`plat/char_${alienOf(id)}_${pose}.png`);
function tileX(ctx, img, y, h, speed, t, alpha = 1) { if (!imgOk(img)) return false; const w = img.naturalWidth * (h / img.naturalHeight), off = -((t * speed) % w); ctx.globalAlpha = alpha; for (let x = off; x < 1000; x += w - 1) ctx.drawImage(img, x, y, w, h); ctx.globalAlpha = 1; return true; }
function pill2(ctx, x, y, txt, color, size = 17) {
  ctx.font = `900 ${size}px Nunito, sans-serif`; const w = ctx.measureText(txt).width + 22, h = size + 12, rr = (X, Y) => { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(X, Y, w, h, h / 2) : ctx.rect(X, Y, w, h); ctx.fill(); };
  ctx.fillStyle = '#1a1033'; rr(x - w / 2, y - h / 2 + 3); ctx.fillStyle = color; rr(x - w / 2, y - h / 2);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#1a1033'; ctx.strokeText(txt, x, y + 1); ctx.fillText(txt, x, y + 1);
}
function hudChips(ctx, rows) {
  let x = 14;
  rows.forEach(({ color, txt }) => {
    ctx.font = '900 22px Nunito'; const w = ctx.measureText(txt).width + 26;
    ctx.fillStyle = '#1a1033'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 14, w, 40, 20) : ctx.rect(x, 14, w, 40); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 3, 14, w - 6, 36, 18) : ctx.rect(x + 3, 14, w - 6, 36); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.lineWidth = 4; ctx.strokeStyle = '#1a1033'; ctx.strokeText(txt, x + 13, 33); ctx.fillText(txt, x + 13, 33);
    x += w + 8;
  });
}
const preload = list => list.forEach(n => IMG(n));
const ALIEN_FILES = ['beige', 'green', 'pink', 'purple', 'yellow'].flatMap(c => ['idle', 'walk_a', 'walk_b', 'jump', 'hit', 'front'].map(s => `plat/char_${c}_${s}.png`));
