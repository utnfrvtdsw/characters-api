import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from '@prometheus-io/client';
import type {
  CounterMetric, GaugeMetric, HistogramMetric, MetricOptions, MetricsService,
} from './metrics.service.interface';

export class PrometheusMetricsService implements MetricsService {
  private readonly registry = new Registry();

  constructor() {
    this.registry.setDefaultLabels({ service: 'characters-api' });
    collectDefaultMetrics({ register: this.registry });
  }

  get contentType(): string {
    return this.registry.contentType;
  }

  createCounter(options: MetricOptions): CounterMetric {
    const metric = new Counter<string>({ ...options, registers: [this.registry] });
    return { inc: (value = 1, labels = {}) => metric.inc(labels, value) };
  }

  createGauge(options: MetricOptions): GaugeMetric {
    const metric = new Gauge<string>({ ...options, registers: [this.registry] });
    return {
      inc: (value = 1, labels = {}) => metric.inc(labels, value),
      dec: (value = 1, labels = {}) => metric.dec(labels, value),
      set: (value, labels = {}) => metric.set(labels, value),
    };
  }

  createHistogram(options: MetricOptions & { buckets?: number[] }): HistogramMetric {
    const metric = new Histogram<string>({ ...options, registers: [this.registry] });
    return { observe: (value, labels = {}) => metric.observe(labels, value) };
  }

  metrics(): Promise<string> {
    return this.registry.metrics();
  }
}

export const metrics: MetricsService = new PrometheusMetricsService();
