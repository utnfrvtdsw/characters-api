# Characters API

API de personajes con Node.js, TypeScript y PostgreSQL o MongoDB.

## Desarrollo con Compose (Podman)

Requiere Podman y un proveedor de Compose (`docker-compose` o `podman-compose`).
En macOS, iniciá la máquina con `podman machine start` antes de ejecutar los comandos.
El Dockerfile también es compatible con Podman.

```sh
npm run compose:up
```

Compose levanta PostgreSQL (`localhost:5432`), MongoDB (`localhost:27017`),
Prometheus (`localhost:9090`) y Grafana (`localhost:3001`), con datos persistentes
en volúmenes. Las bases tienen healthchecks.
La API se ejecuta localmente con recarga automática y logs de `pino-pretty`:

```sh
npm ci
npm run dev:postgres
```

La API con PostgreSQL queda disponible en http://localhost:3500/api/characters.
Para usar MongoDB, ejecutá en su lugar:

```sh
npm run dev:mongo
```

La API con MongoDB queda disponible en http://localhost:4000/api/characters.
Las conexiones locales usan los valores por defecto de `src/config.ts`.
Si personalizás las credenciales de Compose en `.env`, exportá también las
variables correspondientes en la terminal donde ejecutás la API; estos comandos
no cargan `.env` automáticamente.

```sh
npm run compose:logs -- postgres mongodb
npm run compose:down
```

Si tenés un contenedor de la API de la configuración anterior, podés retirarlo
con `podman compose up -d --remove-orphans`.

PostgreSQL ejecuta `src/db/sql/init.sql` (tabla y personajes de ejemplo) únicamente
cuando su volumen está vacío. Si ya tenés un volumen previo sin la tabla, podés
aplicar el script manualmente; incluye inserciones de datos de ejemplo:

```sh
podman compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < src/db/sql/init.sql
```

## Imagen de producción sin Compose

El Dockerfile compila TypeScript y genera una imagen con dependencias de
producción, `NODE_ENV=production` y logs JSON. No se usa para el entorno de Compose.

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

## Prometheus y Grafana en desarrollo

`npm run compose:up` también inicia la observabilidad:

- Prometheus: http://localhost:9090. Consultá `up{job="characters-api"}`.
- Grafana: http://localhost:3001. Usuario y contraseña iniciales: `admin` / `admin`.
  Podés configurarlos con `GRAFANA_ADMIN_USER` y `GRAFANA_ADMIN_PASSWORD` en `.env`
  antes del primer arranque; después Grafana conserva las credenciales en su volumen.

Grafana tiene Prometheus configurado automáticamente como fuente predeterminada
y un dashboard `Characters API` con disponibilidad y cantidad de muestras.
En Explore podés consultar tus métricas personalizadas usando la fuente Prometheus.

Prometheus consulta `/metrics` cada 15 segundos en los puertos locales 3500 y
4000 mediante `host.containers.internal` (Podman). La API sigue ejecutándose
con `npm run dev:postgres` o `npm run dev:mongo`. Si ejecutás solo una, el otro
destino aparecerá como `DOWN`; es esperado. Para otros puertos, editá
`observability/prometheus/prometheus.yml` y ejecutá `podman compose restart prometheus`.
En Docker Desktop, reemplazá `host.containers.internal` por `host.docker.internal`.

El historial de Prometheus y la configuración de Grafana persisten al ejecutar
`npm run compose:down`. El dashboard inicial funciona sin custom metrics;
para ver métricas de negocio, registralas y actualizalas desde la API.

## Métricas personalizadas

Las operaciones de personajes registran automáticamente estos contadores:

| Métrica | Cuándo incrementa |
| --- | --- |
| `characters_created_total` | Una creación termina correctamente en el repositorio. |
| `characters_updated_total` | Una actualización termina correctamente y encuentra al personaje. |
| `characters_deleted_total` | Una eliminación devuelve `true`. |

Empiezan en cero al iniciar el proceso. No cuentan validaciones fallidas,
errores de base de datos ni personajes inexistentes. Las modificaciones cuentan
operaciones exitosas sobre personajes existentes, aunque se envíe el mismo valor.
El dashboard `Characters API` incluye estos tres contadores por motor de base.
Son acumulados desde el arranque, no la cantidad de registros actual en la base.
Para consultar creaciones durante la última hora:

```promql
sum by (db_engine) (increase(characters_created_total{job="characters-api"}[1h]))
```

La API expone `GET /metrics` en formato Prometheus en el mismo puerto de la API.
El servicio `metrics` implementa `MetricsService` y permite crear counters,
gauges e histogramas. Registrá cada métrica una sola vez, fuera del handler:

```ts
import { metrics } from './observability/metrics.service';

const viewed = metrics.createCounter({
  name: 'characters_viewed_total',
  help: 'Cantidad de consultas exitosas de personajes por origen',
  labelNames: ['source'],
});

// Ejemplo para instrumentar una consulta exitosa:
viewed.inc(1, { source: 'api' });
```

Los gauges ofrecen `set(value, labels?)`, `inc(value?, labels?)` y
`dec(value?, labels?)`. Los histogramas ofrecen `observe(value, labels?)` y
aceptan `buckets` al crearlos. Usá segundos para duraciones y etiquetas con
valores acotados; evitá IDs de personajes o usuarios. Las métricas viven en
memoria por proceso y se reinician al reiniciar la API. Prometheus puede
consultar `/metrics` para conservar su historial. El endpoint incluye métricas
del proceso Node.js automáticamente. Las peticiones HTTP (excepto `/metrics`)
actualizan `http_requests_total` y `http_request_duration_seconds`, con etiquetas
de método, ruta normalizada y estado HTTP. Las custom metrics se suman a estas.

Si no ves datos, comprobá que la API esté ejecutándose en 3500 o 4000 y que
`http://localhost:9090/targets` muestre ese destino como `UP`. En Prometheus
podés consultar `process_resident_memory_bytes{job="characters-api"}` sin
generar tráfico. Para ver `http_requests_total`, primero hacé peticiones a la API.

Para verificar el servicio:

```sh
npm run build
node --test test/metrics.service.test.cjs
node --test test/character.metrics.test.cjs
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
