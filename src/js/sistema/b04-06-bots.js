/* ================== BOTS 🤖 ================== */
const botWord = L => cap((L + pickR(['ana', 'ito', 'ero', 'olo', 'ama', 'uca', 'eta', 'ino', 'osa'])).toLowerCase());
function addBot() {
  if (H.players.size >= 8) { toast('La sala ya está llena (8) 😅'); return; }
  const used = [...H.players.values()];
  const name = BOT_NAMES.find(n => !used.some(p => p.name === '🤖' + n)) || 'Bot' + rand(99);
  const id = 'bot' + rid();
  H.players.set(id, { id, name: '🤖' + name, emoji: pickR(EMOJIS), color: COLORS.find(c => !used.some(p => p.color === c)) || COLORS[rand(8)], score: 0, prev: 0, gain: 0, online: true, conn: null, isBot: true });
  SFX.join(); renderHost(); startBots();
}
function rmBot() { const b = [...H.players.values()].reverse().find(p => p.isBot); if (b) { H.players.delete(b.id); renderHost(); } }
let botIv = null;
function startBots() { if (botIv) return; botIv = setInterval(() => { for (const p of H.players.values()) if (p.isBot) try { botBrain(p); } catch (e) { console.warn('bot', e); } }, 220); }
function botBrain(p) {
  if (!H.game || !H.game.onAct || ['lobby', 'intro', 'board', 'final'].includes(H.phase)) return;
  const v = ctrlView(p), now = Date.now(), k = JSON.stringify(v);
  if (!p.mem || p.mem.k !== k) p.mem = { k, t0: now, wait: 900 + rand(2600), done: false, n: 0, dir: [0, 0], dt: 0, b: 0 };
  const M = p.mem, act = m => { if (H.game && H.game.onAct) H.game.onAct(p, m); }, el = now - M.t0, ready = el > M.wait;
  switch (v.screen) {
    case 'tap': M.n += 1 + rand(3); act({ a: 'taps', n: M.n }); break;
    case 'mash': M.n += 1 + rand(2); act({ a: 'steps', n: M.n }); break;
    case 'reflex': if (!M.done && el > v.delay + 230 + rand(300)) { M.done = true; act(Math.random() < .08 ? { a: 'rx', early: true } : { a: 'rx', ms: 220 + rand(260) }); } break;
    case 'write': if (!M.done && el > 3000 + rand(5000)) { M.done = true; act({ a: 'text', text: H.game === GAMES.liar ? pickR(BOT_LIES) : pickR(BOT_QUIPS) }); } break;
    case 'choose': if (!M.done && ready && v.options.length) {
      M.done = true; let o = pickR(v.options);
      if (H.game === GAMES.potato && Math.random() < .75) o = v.options.find(x => +x.id === H.gd.q.ans) || o;
      if (H.game === GAMES.liar && Math.random() < .4) { const ti = H.gd.opts.findIndex(x => x.truth); o = v.options.find(x => +x.id === ti) || o; }
      act({ a: 'choose', id: o.id });
    } break;
    case 'draw': if (!M.done && el > 5000 + rand(6000)) { M.done = true; act({ a: 'draw', img: botDoodle(v.prompt) }); } break;
    case 'pdraw': if (!M.done && el > 1500) { M.done = true; act({ a: 'live', img: botDoodle(v.word) }); } break;
    case 'simon': if (!M.done && el > 1500 + rand(1500)) { M.done = true; const s = H.gd.seq.slice(); if (Math.random() < .18) s[rand(s.length)] = (s[0] + 1 + rand(3)) % 4; act({ a: 'seq', s }); } break;
    case 'number': if (!M.done && ready) { M.done = true; act({ a: 'num', n: Math.max(0, H.gd.n + rand(7) - 3) }); } break;
    case 'colors': if (!M.done && el > 700 + rand(1700)) { M.done = true; const c = H.gd.cur, r = c.rule === 'ink' ? c.ink : c.w; act({ a: 'color', c: Math.random() < .72 ? r : rand(6) }); } break;
    case 'quiz': if (!M.done && el > 1500 + rand(5000)) { M.done = true; act({ a: 'quiz', i: Math.random() < .55 ? H.gd.ord.indexOf(0) : rand(4) }); } break;
    case 'guess': if (el > 2500 && Math.random() < .06) {
      const w = H.game === GAMES.anagram ? H.gd.word : H.gd.word;
      act({ a: 'guess', text: Math.random() < Math.min(.7, el / 40000) ? w : pickR(H.game === GAMES.anagram ? ANAGRAMS : PICT) });
    } break;
    case 'duelboard': if (v.myTurn && !M.done && el > 900 + rand(1500)) {
      M.done = true; const C4 = v.kind === 'c4';
      const val = C4 ? [0, 1, 2, 3, 4, 5, 6].filter(c => !v.cells[c]) : v.cells.map((x, i) => x ? -1 : i).filter(i => i >= 0);
      if (val.length) act({ a: 'move', i: pickR(val) });
    } break;
    case 'form': if (!M.done && (H.phase === 'b-stop' || el > 10000 + M.wait * 8)) { M.done = true; act({ a: 'basta', ans: v.cats.map(() => botWord(v.letter)) }); } break;
    case 'grid9': if (Math.random() < .3) { const hs = H.gd.holes.map((h, i) => h && !h.hit && h.type !== 'bomb' ? i : -1).filter(i => i >= 0); if (hs.length) act({ a: 'hit', i: pickR(hs) }); } break;
    case 'jump': { const gd = H.gd, toBottom = ((1.5 - (gd.ph % 1)) % 1) * gd.period, cy = Math.floor(gd.ph + .5); if (H.phase === 'jp-go' && M.cyc !== cy && toBottom > .3) { M.cyc = cy; if (Math.random() < .95) setTimeout(() => { if (H.phase === 'jp-go') act({ a: 'jump' }); }, Math.max(0, toBottom - .22) * 1000); } } break;
    case 'judge': if (!M.done && el > 3000 + rand(6000)) { M.done = true; act({ a: 'judge', rej: v.items.filter(() => Math.random() < .12).map(x => x.i) }); } break;
    case 'joy': botJoy(p, M, act); break;
  }
}
function botJoy(p, M, act) {
  const gd = H.gd, g = H.game; let x = 0, y = 0;
  const toward = (tx, ty, sx, sy, noise = .35) => { const d = Math.hypot(tx - sx, ty - sy) || 1; return [(tx - sx) / d + (Math.random() - .5) * noise, (ty - sy) / d + (Math.random() - .5) * noise]; };
  if (g === GAMES.maze) {
    const s = gd.ps[p.id], W = gd.W, D = [[1, 0, 2], [-1, 0, 8], [0, 1, 4], [0, -1, 1]];
    if (Math.random() < .8) { let best = null; for (const [dx, dy, b] of D) { if (gd.g[s.c] & b) continue; const n = s.c + dy * W + dx; if (!best || gd.dist[n] < best[2]) best = [dx, dy, gd.dist[n]]; } if (best) [x, y] = best; }
    else [x, y] = pickR(D);
  } else if (g === GAMES.find) {
    const s = gd.ps[p.id], t = gd.target;
    if (!M.aim || Math.random() < .02) M.aim = [t.x + (Math.random() - .5) * 300, t.y + (Math.random() - .5) * 200];
    if (M.t2 === undefined) M.t2 = Date.now();
    if (Date.now() - M.t2 > 6000) M.aim = [t.x, t.y];
    [x, y] = toward(M.aim[0], M.aim[1], s.x, s.y, .2);
    if (Math.hypot(s.x - M.aim[0], s.y - M.aim[1]) < 20) { M.b++; M.aim = null; M.t2 = Date.now() - 3000; }
  } else if (g === GAMES.coins) {
    const s = gd.ps[p.id], it = gd.items.filter(i => i.type !== 'bomb' && i.y < 500).sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0];
    x = it ? Math.max(-1, Math.min(1, (it.x - s.x) / 60)) : 0;
  } else if (g === GAMES.snake) {
    const s = gd.ps[p.id]; if (!s.alive) return;
    const free = (dx, dy) => { const nx = s.x + dx, ny = s.y + dy; return nx >= 0 && ny >= 0 && nx < GAMES.snake.GW && ny < GAMES.snake.GH && !gd.grid[ny * GAMES.snake.GW + nx]; };
    const look = (dx, dy) => { let n = 0; for (let k = 1; k <= 8 && free(dx * k, dy * k); k++) n++; return n; };
    const opts = [[s.dx, s.dy], [s.dy, -s.dx], [-s.dy, s.dx]].map(d => [d, look(d[0], d[1])]);
    let pick = opts[0]; if (pick[1] < 4 || Math.random() < .04) pick = opts.sort((a, b) => b[1] - a[1] + (Math.random() - .5))[0];
    [x, y] = pick[0];
  } else if (g === GAMES.sumo) {
    const s = gd.bs[p.id]; if (!s.alive) return;
    const others = gd.ids.filter(id => id !== p.id && gd.bs[id].alive);
    if (Math.hypot(s.x - 500, s.y - 300) > gd.R * .6 || !others.length) [x, y] = toward(500, 300, s.x, s.y);
    else { const o = gd.bs[pickR(others)]; [x, y] = toward(o.x, o.y, s.x, s.y, .6); if (Math.random() < .05) M.b++; }
  } else {
    M.dt -= .22; if (M.dt <= 0) { M.dt = .6 + Math.random() * 1.4; const a = Math.random() * 6.28; M.dir = [Math.cos(a), Math.sin(a)]; }
    [x, y] = M.dir; if (Math.random() < .03) M.b++;
  }
  act({ a: 'joy', x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), b: M.b });
}
