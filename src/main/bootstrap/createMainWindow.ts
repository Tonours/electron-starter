import path from 'node:path';
import { BrowserWindow } from 'electron';
import { getBrowserWindowOptions } from '../security/config';
import { applyNavigationGuard } from '../security/navigationGuard';
import { resolveRendererEntry } from '../security/rendererEntry';
import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';

export const createMainWindow = (): BrowserWindow => {
  const preloadFile = path.resolve(__dirname, '..', 'preload', 'index.cjs');
  const window = new BrowserWindow(getBrowserWindowOptions(preloadFile));
  const rendererEntry = resolveRendererEntry();

  void window.loadURL(rendererEntry.entryUrl).catch((error: unknown) => {
    logger.error('Failed to load renderer entry', {
      entryUrl: rendererEntry.entryUrl,
      error: error instanceof Error ? error.message : 'Unknown loadURL error',
    });
  });

  window.webContents.on('unresponsive', () => {
    const count = incrementErrorMetric('process.unresponsive');
    logger.warn('Renderer became unresponsive', {
      windowId: window.id,
      count,
    });
  });

  window.webContents.on('responsive', () => {
    logger.info('Renderer became responsive again', {
      windowId: window.id,
    });
  });

  window.once('ready-to-show', () => {
    window.show();
  });

  applyNavigationGuard(window, {
    allowedHttpOrigins: rendererEntry.allowedHttpOrigins,
    allowedFilePath: rendererEntry.allowedFilePath,
  });

  return window;
};
