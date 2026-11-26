# CAOS PARTY 🎉

Juego party multijugador en el navegador: la tele/tablet es el host y los celulares son los controles.

> ⚠️ **No edites `index.html` a mano.** Se genera solo a partir de la carpeta `src/`.

## Estructura

```
src/
  index.html        plantilla de la página (marcadores donde va el CSS y el JS)
  orden.json        el ORDEN en que se arman los archivos (importa mucho)
  css/              estilos, por secciones
  js/sistema/       núcleo: conexión, host, controles, 3D, bots, menús, mejoras…
  js/juegos/        un archivo por juego (54 juegos)
tools/
  build.mjs         arma index.html desde src/
  check.mjs         revisa que todos los archivos JS sean válidos
assets/             modelos, sonidos e imágenes (con sus licencias)
index.html          ← archivo final que publica GitHub Pages (generado)
```

Todos los archivos de `src/js` comparten el mismo espacio global (como scripts clásicos), así que
un juego puede usar funciones del sistema sin `import`. El build los une **en el orden de `orden.json`**.

## Cómo trabajar

```bash
npm install          # una sola vez (instala esbuild y acorn)
npm run check        # revisa errores de sintaxis
npm run build        # arma index.html minificado (para publicar)
npm run build:dev    # arma index.html legible (para depurar)
```

Para probar en tu compu: `npx serve .` (o cualquier servidor estático) y abrí `http://localhost:3000`.

### Agregar un juego nuevo
1. Creá `src/js/juegos/mi-juego.js` con `Object.assign(GAMES, { miJuego: { ... } });`
2. Agregá la ruta en `src/orden.json`, dentro del último bloque, **después** de los archivos del sistema que use.
3. `npm run check && npm run build`, probá y hacé commit (incluyendo el `index.html` generado).

## Seguridad (honesto)
- Un juego web se descarga entero al navegador de cada jugador: **nadie puede impedir al 100 %** que alguien
  vea o copie el código del cliente. Lo que hacemos:
  - El `index.html` publicado va **minificado** (difícil de leer y más liviano).
  - El host **ignora mensajes raros o en exceso** de los controles (anti-spam) y limpia nombres.
  - La licencia (`LICENSE`) deja claro que el código es tuyo y no se puede usar sin permiso.
- Para que nadie vea el código fuente (`src/`), el repositorio tiene que ser **privado**.
- Las credenciales del servidor TURN (Metered) quedan visibles en el cliente; si alguien abusa,
  borralas y creá otras en el panel de Metered.
