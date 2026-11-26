GAME_TAGS.bumper = ['miniatures']; GAME_TAGS.carball = ['miniatures', 'interaction'];

/* bots de los dos juegos */
(() => {
  const ob = botBrain;
  botBrain = function (p) {
    const gd = H.gd;
    if (H.game === GAMES.bumper && gd.ps && (H.phase === 'bp-go' || H.phase === 'bp-ready')) {
      const s = gd.ps[p.id]; if (!s || s.out) return; if (H.phase === 'bp-ready') return joyAct(p, { a: 'joy', x: 0, y: 0, b: s.lb });
      const M = p._bp || (p._bp = { skill: .55 + Math.random() * .4, tgt: null, tT: 0 });
      M.tT -= .1; if (!M.tgt || gd.ps[M.tgt]?.out || M.tT <= 0) { const opp = gd.ids.filter(id => id !== p.id && !gd.ps[id].out); M.tgt = opp.length ? opp.sort((a, b) => Math.hypot(gd.ps[a].x - s.x, gd.ps[a].z - s.z) - Math.hypot(gd.ps[b].x - s.x, gd.ps[b].z - s.z))[Math.random() < .7 ? 0 : opp.length - 1] : null; M.tT = 2 + Math.random() * 2; }
      const d0 = Math.hypot(s.x, s.z); let tx = 0, tz = 0;
      if (M.tgt) { const o = gd.ps[M.tgt]; tx = o.x + o.vx * .25; tz = o.z + o.vz * .25; }
      const outward = (s.vx * s.x + s.vz * s.z) / Math.max(1, d0);
      if ((d0 > gd.R * (.55 + M.skill * .1) && (outward > .5 || s.hit > 0)) || d0 > gd.R * .8 || !M.tgt) { tx = 0; tz = 0; }
      return CARX.bot(p, s, tx, tz, !!M.tgt && Math.hypot(tx - s.x, tz - s.z) < 7);
    }
    if (H.game === GAMES.carball && gd.ps && (H.phase === 'cb-go' || H.phase === 'cb-ready')) {
      const s = gd.ps[p.id]; if (!s) return; if (H.phase === 'cb-ready') return joyAct(p, { a: 'joy', x: 0, y: 0, b: s.lb });
      const G = GAMES.carball, b = gd.ball, gx = gd.team[p.id] ? -G.FW - 2 : G.FW + 2, M = p._cb || (p._cb = { role: Math.random() });
      const mates = gd.ids.filter(id => gd.team[id] === gd.team[p.id]); const closest = mates.sort((x, y) => Math.hypot(gd.ps[x].x - b.x, gd.ps[x].z - b.z) - Math.hypot(gd.ps[y].x - b.x, gd.ps[y].z - b.z))[0] === p.id;
      let tx, tz;
      if (closest || mates.length === 1) { const ax = gx - b.x, az = 0 - b.z, al = Math.hypot(ax, az) || 1; const behind = { x: b.x - ax / al * 2.6, z: b.z - az / al * 2.6 }; const dB = Math.hypot(s.x - behind.x, s.z - behind.z), ahead = (s.x - b.x) * (ax / al) > 0; if (ahead && dB > 3) { tx = behind.x; tz = behind.z + (s.z > b.z ? 2.5 : -2.5); } else if (dB > 1.8) { tx = behind.x; tz = behind.z; } else { tx = b.x + ax / al * 2; tz = b.z + az / al * 2; } }
      else { const own = -gx * .8; tx = (own + b.x) / 2; tz = b.z * .5; }
      return CARX.bot(p, s, tx, tz, closest && Math.hypot(b.x - s.x, b.z - s.z) < 6);
    }
    return ob(p);
  };
})();
