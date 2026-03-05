import { logger } from './logger';

export type ErrorMetricKey =
  | 'ipc.unauthorized_sender'
  | 'ipc.invalid_payload'
  | 'ipc.rejected'
  | 'ipc.internal'
  | 'process.renderer_gone'
  | 'process.child_gone'
  | 'process.unresponsive'
  | 'process.fatal';

type ErrorMetricsState = Record<ErrorMetricKey, number>;

const METRICS_SNAPSHOT_INTERVAL = 20;

const createInitialState = (): ErrorMetricsState => ({
  'ipc.unauthorized_sender': 0,
  'ipc.invalid_payload': 0,
  'ipc.rejected': 0,
  'ipc.internal': 0,
  'process.renderer_gone': 0,
  'process.child_gone': 0,
  'process.unresponsive': 0,
  'process.fatal': 0,
});

const metricsState: ErrorMetricsState = createInitialState();
let totalErrorEvents = 0;

export const getErrorMetricsSnapshot = (): Readonly<ErrorMetricsState> => ({
  ...metricsState,
});

const maybeLogMetricsSnapshot = (): void => {
  if (totalErrorEvents % METRICS_SNAPSHOT_INTERVAL !== 0) {
    return;
  }

  logger.info('Error metrics snapshot', {
    totalErrorEvents,
    metrics: getErrorMetricsSnapshot(),
  });
};

export const incrementErrorMetric = (metric: ErrorMetricKey): number => {
  metricsState[metric] += 1;
  totalErrorEvents += 1;
  maybeLogMetricsSnapshot();
  return metricsState[metric];
};
