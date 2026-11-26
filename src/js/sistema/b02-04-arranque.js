/* ================== ARRANQUE ================== */
function boot() {
const sala = (new URLSearchParams(location.search).get('sala') || '').toUpperCase();
if (sala) showJoin(sala); else showHome();
}

