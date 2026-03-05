import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';

type FatalErrorKind = 'uncaughtException' | 'unhandledRejection';

type ShutdownProcess = () => void;

let isShuttingDown = false;

const toReasonMessage = (reason: unknown): string => {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === 'string') {
    return reason;
  }

  return 'Unknown fatal error';
};

const handleFatalError = (
  kind: FatalErrorKind,
  reason: unknown,
  shutdown: ShutdownProcess
): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  const count = incrementErrorMetric('process.fatal');

  logger.error('Fatal process error', {
    kind,
    reason: toReasonMessage(reason),
    count,
  });

  shutdown();
};

export const registerFatalErrorPolicy = (shutdown: ShutdownProcess): void => {
  process.on('uncaughtException', (error) => {
    handleFatalError('uncaughtException', error, shutdown);
  });

  process.on('unhandledRejection', (reason) => {
    handleFatalError('unhandledRejection', reason, shutdown);
  });
};
