import { metrics } from '../observability/metrics.service';
import type { CounterMetric, MetricsService } from '../observability/metrics.service.interface';

export interface CharacterMetrics {
  created: CounterMetric;
  updated: CounterMetric;
  deleted: CounterMetric;
}

export function createCharacterMetrics(service: MetricsService): CharacterMetrics {
  return {
    created: service.createCounter({
      name: 'characters_created_total',
      help: 'Characters successfully created since the process started',
    }),
    updated: service.createCounter({
      name: 'characters_updated_total',
      help: 'Successful updates to existing characters since the process started',
    }),
    deleted: service.createCounter({
      name: 'characters_deleted_total',
      help: 'Characters successfully deleted since the process started',
    }),
  };
}

export const characterMetrics = createCharacterMetrics(metrics);
