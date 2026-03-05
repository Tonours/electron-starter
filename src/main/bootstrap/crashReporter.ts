import { crashReporter } from 'electron';
import { logger } from '../services/logger';

let hasStartedCrashReporter = false;

const resolveCrashReporterConfig = () => {
  const uploadToServer = process.env.CRASH_REPORTER_UPLOAD === '1';
  const submitURL =
    process.env.CRASH_REPORTER_SUBMIT_URL ?? 'https://example.invalid';

  return {
    uploadToServer,
    submitURL,
  };
};

export const startCrashReporter = (): void => {
  if (hasStartedCrashReporter) {
    return;
  }

  const config = resolveCrashReporterConfig();

  if (config.uploadToServer && config.submitURL === 'https://example.invalid') {
    logger.warn('Crash reporter upload enabled with placeholder submitURL');
  }

  crashReporter.start({
    submitURL: config.submitURL,
    uploadToServer: config.uploadToServer,
    compress: true,
  });

  hasStartedCrashReporter = true;
};
