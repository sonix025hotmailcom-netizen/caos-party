/* ================== CAOS PARTY v5 ================== */
function tell(id, o) { const p = pl(id); if (p && p.online && p.conn && p.conn.open) try { p.conn.send(o); } catch (e) {} }
function bcast(o, ids) { for (const id of (ids || H.gd.ids || [])) tell(id, o); }
EMOJIS.push('🐨', '🐯', '🦁', '🐮', '🐰', '🐻', '🐲', '🦉', '🦋', '🐝', '🤠', '😎', '🍔', '🍩', '🐧', '🦩');
