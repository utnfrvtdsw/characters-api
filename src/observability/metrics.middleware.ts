import type { RequestHandler } from 'express';
import type { MetricsService } from './metrics.service.interface';
import { metrics } from './metrics.service';

export function createMetricsMiddleware(service: MetricsService): RequestHandler {
  const requests = service.createCounter({
    name: 'http_requests_total',
    help: 'Completed HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });
  const duration = service.createHistogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  return (req, res, next) => {
    if (req.path === '/metrics') {
      next();
      return;
    }

    const started = process.hrtime.bigint();
    res.once('finish', () => {
      const labels = {
        method: req.method,
        route: req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched',
        status_code: res.statusCode,
      };
      requests.inc(1, labels);
      duration.observe(Number(process.hrtime.bigint() - started) / 1e9, labels);
    });
    next();
  };
}

export const metricsMiddleware = createMetricsMiddleware(metrics);
