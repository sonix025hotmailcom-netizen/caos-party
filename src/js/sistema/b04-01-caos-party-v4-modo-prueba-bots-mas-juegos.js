/* ================== CAOS PARTY v4 — MODO PRUEBA, BOTS, MÁS JUEGOS ================== */
const pickR = a => a[rand(a.length)];
function lev(a, b) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
/* parecido: ignora tildes, mayúsculas, plurales simples y 1 letra mal escrita en palabras largas */
function close(a, b, tol) {
  a = norm(a); b = norm(b); if (!a || !b) return false;
  if (a === b) return true;
  const st = s => s.replace(/(es|s)$/, '');
  if (st(a) === st(b)) return true;
  const L = Math.max(a.length, b.length);
  return lev(a, b) <= (tol ?? (L >= 8 ? 2 : L >= 5 ? 1 : 0));
}
