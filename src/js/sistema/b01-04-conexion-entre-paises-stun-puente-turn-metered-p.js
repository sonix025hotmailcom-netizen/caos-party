/* ---------- conexión entre países: STUN + puente TURN (Metered, plan gratis) ---------- */
const TURN_USER = '81b86b6ee9bfb6ba0f5126ea', TURN_PASS = 'nf2kVSIkMrdn9f5E';
function peerOpts() {
  const ice = [{ urls: 'stun:stun.cloudflare.com:3478' }, { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.relay.metered.ca:80' }];
  if (TURN_PASS) ['turn:global.relay.metered.ca:80', 'turn:global.relay.metered.ca:80?transport=tcp', 'turn:global.relay.metered.ca:443', 'turns:global.relay.metered.ca:443?transport=tcp'].forEach(urls => ice.push({ urls, username: TURN_USER, credential: TURN_PASS }));
  return { config: { iceServers: ice } };
}
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600); }
function logoHTML() {
  let i = 0; const w = s => [...s].map(c => `<span style="--i:${i};color:${COLORS[i++ % 8]}">${c}</span>`).join('');
  return w('CAOS') + '<br>' + w('PARTY');
}
