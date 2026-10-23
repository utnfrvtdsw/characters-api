export type MetricLabels = Record<string, string | number>;

export interface MetricOptions {
  name: string;
  help: string;
  labelNames?: string[];
}

export interface CounterMetric {
  inc(value?: number, labels?: MetricLabels): void;
}

export interface GaugeMetric extends CounterMetric {
  dec(value?: number, labels?: MetricLabels): void;
  set(value: number, labels?: MetricLabels): void;
}

export interface HistogramMetric {
  observe(value: number, labels?: MetricLabels): void;
}

export interface MetricsService {
  readonly contentType: string;
  createCounter(options: MetricOptions): CounterMetric;
  createGauge(options: MetricOptions): GaugeMetric;
  createHistogram(options: MetricOptions & { buckets?: number[] }): HistogramMetric;
  metrics(): Promise<string>;
}
