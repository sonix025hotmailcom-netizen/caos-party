// Arma el index.html final a partir de src/ (mismo orden, mismos bloques <script>).
//   node tools/build.mjs          -> index.html legible
//   node tools/build.mjs --min    -> index.html minificado (más liviano y difícil de leer)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src'), min = process.argv.includes('--min');
const orden = JSON.parse(fs.readFileSync(path.join(SRC, 'orden.json'), 'utf8'));
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
let esbuild = null; if (min) esbuild = await import('esbuild');
let css = orden.css.map(read).join('');
if (min) css = (await esbuild.transform(css, { loader: 'css', minify: true })).code;
const blocks = [];
for (const files of orden.js) { let code = files.map(read).join('\n'); if (min) code = (await esbuild.transform(code, { loader: 'js', minify: true, target: 'es2020', legalComments: 'none' })).code; blocks.push(code); }
let html = read('index.html').replace('<!--@css-->', () => css);
html = html.replace(/<!--@js (\d+)-->/g, (_, n) => blocks[n - 1]);
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html listo (${min ? 'minificado' : 'legible'}): ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, ${orden.js.flat().length} archivos JS, ${orden.css.length} CSS`);
