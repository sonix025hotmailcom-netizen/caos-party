/* ----- votación compartida ----- */
function startVote(ph, ms, next) {
  const gd = H.gd; gd.votes = {};
  gd.voters = gd.ids.filter(id => gd.list.some(e => e.pid !== id));
  setPhase(ph, ms, next, 1500);
}
function voteView(p, title, label) {
  const gd = H.gd;
  if (!gd.voters.includes(p.id)) return watch('Esta vez no te toca votar 😅');
  if (gd.votes[p.id] != null) return done('¡Voto enviado! 🗳️');
  return { screen: 'choose', key: 'v' + H.token, title, deadline: H.deadline, options: gd.list.map((e, i) => ({ id: String(i), label: label(e, i), own: e.pid === p.id })).filter(o => !o.own).map(({ id, label }) => ({ id, label })) };
}
function voteAct(p, m, next) {
  const gd = H.gd;
  if (!gd.voters.includes(p.id) || gd.votes[p.id] != null) return;
  const i = parseInt(m.id, 10), e = gd.list[i];
  if (!e || e.pid === p.id) return;
  gd.votes[p.id] = i; SFX.pop();
  checkAll(id => !gd.voters.includes(id) || gd.votes[id] != null, next);
}
function tallyVotes() {
  const gd = H.gd; gd.list.forEach(e => e.votes = []);
  Object.entries(gd.votes).forEach(([voter, i]) => gd.list[i].votes.push(voter));
  const max = Math.max(0, ...gd.list.map(e => e.votes.length)), g = {};
  gd.list.forEach(e => { e.win = max > 0 && e.votes.length === max; g[e.pid] = (g[e.pid] || 0) + e.votes.length * 100 + (e.win ? 200 : 0); });
  gd.revealOrder = gd.list.slice().sort((a, b) => a.votes.length - b.votes.length);
  return g;
}
function revealCards(content) {
  const gd = H.gd, n = gd.revealOrder.length, w = (n * .9 + .4).toFixed(1) + 's';
  return `<div class="agrid">${gd.revealOrder.map((e, i) => { const p = pl(e.pid); return `<div class="acard ${e.win ? 'win' : ''}" style="--a:${i * .1}s;--d:${(i * .9 + .3).toFixed(1)}s;--w:${w};--c:${p?.color || '#888'}">${e.win ? '<span class="crown">👑</span>' : ''}${content(e)}<div class="aauth"><span>${who(e.pid)}</span><span>${e.votes.length ? '👍'.repeat(Math.min(e.votes.length, 6)) + ' ' + e.votes.length : '0 votos'}</span></div></div>`; }).join('')}</div>`;
}
