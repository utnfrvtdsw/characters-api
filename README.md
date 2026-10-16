# Characters API

API de personajes con Node.js, TypeScript y PostgreSQL o MongoDB.

## Ejecutar con Podman

Requiere Podman y un proveedor de Compose (`docker-compose` o `podman-compose`).
En macOS, iniciá la máquina con `podman machine start` antes de ejecutar los comandos.
El Dockerfile también es compatible con Podman.

```sh
npm run compose:up
```

La API queda disponible en http://localhost:3000/api/characters. Por defecto usa
PostgreSQL. Compose levanta ambas bases y espera sus healthchecks antes de iniciar
la API. Los datos se conservan en volúmenes.

Para usar MongoDB:

```sh
DB_ENGINE=mongodb npm run compose:up
```

Podés copiar `.env.example` a `.env` y configurar `DB_ENGINE`, `PORT`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `MONGO_DB`. Compose define
los hosts internos de las bases automáticamente. Las credenciales incluidas son
para desarrollo local.

```sh
npm run compose:logs -- api
npm run compose:down
```

PostgreSQL ejecuta `src/db/sql/init.sql` (tabla y personajes de ejemplo) únicamente
cuando su volumen está vacío. Si ya tenés un volumen previo sin la tabla, podés
aplicar el script manualmente; incluye inserciones de datos de ejemplo:

```sh
podman compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/sql/init.sql
```

## Imagen sin Compose

```sh
npm run podman:up
```

`npm run podman:build` construye la imagen y `npm run podman:run` la ejecuta
por separado. Copiá `.env.example` a `.env` antes de ejecutarla.

En este caso, las variables de conexión deben apuntar a bases accesibles desde el
contenedor; `localhost` se refiere al propio contenedor.

## Desarrollo local

```sh
npm ci
npm run dev:postgres
```

Para compilar y ejecutar JavaScript:

```sh
npm run build
npm start
```

## Test de performance

Requiere el ejecutable de Grafana k6 instalado (`brew install k6` en macOS).
El paquete npm llamado `k6` no instala ese ejecutable.

Con la API y su base de datos en ejecución:

```sh
npm run test:performance
```

Por defecto consulta `http://localhost:3000/api/characters` con 5 usuarios
virtuales durante 30 segundos. Para usar `npm run dev:postgres` (puerto 3500)
o personalizar la carga:

```sh
BASE_URL=http://localhost:3500 VUS=10 DURATION=1m npm run test:performance
```

El test verifica primero que el endpoint responda 200 y devuelva un array JSON.
Durante la carga exige menos de 1% de requests fallidos, latencia p95 menor a
500 ms y más de 99% de checks exitosos. Devuelve un código de error si no se
cumplen los umbrales o si falla la verificación inicial.
