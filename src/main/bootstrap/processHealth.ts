import { app, BrowserWindow } from 'electron';
import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';

type RecoverWindow = (windowId: number | null) => void;

export const registerProcessHealthHandlers = (
  recoverWindow: RecoverWindow
): void => {
  app.on('render-process-gone', (_event, webContents, details) => {
    const windowId = BrowserWindow.fromWebContents(webContents)?.id ?? null;
    const count = incrementErrorMetric('process.renderer_gone');

    logger.error('Renderer process gone', {
      windowId,
      reason: details.reason,
      exitCode: details.exitCode,
      count,
    });

    if (details.reason !== 'clean-exit') {
      recoverWindow(windowId);
    }
  });

  app.on('child-process-gone', (_event, details) => {
    const count = incrementErrorMetric('process.child_gone');

    logger.warn('Child process gone', {
      type: details.type,
      reason: details.reason,
      exitCode: details.exitCode,
      count,
    });
  });
};
