const { test } = require('node:test');
const assert = require('node:assert/strict');
const { PrometheusMetricsService } = require('../dist/observability/metrics.service');
const { createMetricsMiddleware } = require('../dist/observability/metrics.middleware');
const { EventEmitter } = require('node:events');

test('exposes process metrics without registering custom metrics', async () => {
  const output = await new PrometheusMetricsService().metrics();
  assert.match(output, /process_cpu_user_seconds_total/);
  assert.match(output, /nodejs_heap_size_used_bytes/);
});

test('records HTTP status and normalized route without counting scrapes', async () => {
  const service = new PrometheusMetricsService();
  const middleware = createMetricsMiddleware(service);
  const req = { path: '/api/character/123', method: 'GET', baseUrl: '/api' };
  const res = Object.assign(new EventEmitter(), { statusCode: 404 });
  middleware(req, res, () => {
    req.route = { path: '/character/:id' };
  });
  res.emit('finish');
  const scrape = Object.assign(new EventEmitter(), { statusCode: 200 });
  middleware({ path: '/metrics' }, scrape, () => {});
  assert.equal(scrape.listenerCount('finish'), 0);
  const output = await service.metrics();
  assert.match(output, /http_requests_total\{[^}]*route="\/api\/character\/:id"[^}]*status_code="404"[^}]*\} 1/);
  assert.match(output, /http_request_duration_seconds_count\{[^}]*\} 1/);
  assert.doesNotMatch(output, /route="[^"\n]*123/);
});

test('exports counters, gauges and histogram buckets with labels', async () => {
  const service = new PrometheusMetricsService();
  const counter = service.createCounter({
    name: 'characters_created_total', help: 'Created characters', labelNames: ['race'],
  });
  counter.inc(2, { race: 'elf' });
  counter.inc(1, { race: 'elf' });
  assert.throws(() => counter.inc(-1, { race: 'elf' }));

  const gauge = service.createGauge({ name: 'active_operations', help: 'Active operations' });
  gauge.set(4);
  gauge.inc();
  gauge.dec(2);
  const histogram = service.createHistogram({
    name: 'operation_seconds', help: 'Operation duration', buckets: [0.1, 1],
  });
  histogram.observe(0.25);

  const output = await service.metrics();
  assert.match(service.contentType, /text\/plain/);
  assert.match(output, /characters_created_total\{[^}]*race="elf"[^}]*\} 3/);
  assert.match(output, /active_operations\{[^}]*\} 3/);
  assert.match(output, /operation_seconds_bucket\{[^}]*le="0.1"[^}]*\} 0/);
  assert.match(output, /operation_seconds_bucket\{[^}]*le="1"[^}]*\} 1/);
  assert.match(output, /service="characters-api"/);
});

test('keeps registries isolated and rejects duplicate metric names', async () => {
  const first = new PrometheusMetricsService();
  const second = new PrometheusMetricsService();
  const options = { name: 'operations_total', help: 'Operations' };
  first.createCounter(options).inc(3);
  second.createCounter(options).inc();
  assert.throws(() => first.createGauge(options));
  assert.match(await first.metrics(), /operations_total\{[^}]*\} 3/);
  assert.match(await second.metrics(), /operations_total\{[^}]*\} 1/);
});
