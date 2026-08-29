# BUSGo! Web 3.0

Landing estática y progresiva de BUSGo! para `javib.es/bg/`. No necesita framework, bundler ni JavaScript para mostrar el contenido principal.

## Desarrollo

Sirve la raíz con cualquier servidor estático. Por ejemplo:

```sh
python3 -m http.server 4173
```

Después abre `http://localhost:4173/`.

## Datos de App Store

`data/site.json` y `data/releases.json` son la fuente de verdad de la web. Para actualizar versión, rating y notas de la versión pública actual:

```sh
npm run sync:appstore
```

La sincronización pública no puede recuperar el historial completo. Las notas históricas marcadas como `pending-app-store-connect` deben rellenarse desde App Store Connect; nunca se inventan.

## Verificación

```sh
npm test
```

La suite comprueba versión actual única, orden semántico, historial mínimo, accesibilidad básica y que 2.0 no vuelva a ocupar el hero.
