// Revisa que cada archivo de src/js sea JavaScript válido (antes de armar el index.html).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as acorn from 'acorn';
const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const orden = JSON.parse(fs.readFileSync(path.join(SRC, 'orden.json'), 'utf8'));
let bad = 0;
for (const f of orden.js.flat()) { try { acorn.parse(fs.readFileSync(path.join(SRC, f), 'utf8'), { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true }); } catch (e) { bad++; console.log(`❌ ${f}: ${e.message}`); } }
const all = new Set(orden.js.flat().concat(orden.css)), walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.relative(SRC, path.join(d, e.name)).split(path.sep).join('/')]);
const sueltos = walk(SRC).filter(f => /\.(js|css)$/.test(f) && !all.has(f));
if (sueltos.length) console.log('⚠️ Archivos que no están en orden.json (no se incluyen en el juego):', sueltos.join(', '));
console.log(bad ? `${bad} archivo(s) con errores` : `✅ ${orden.js.flat().length} archivos JS sin errores`); process.exit(bad ? 1 : 0);
