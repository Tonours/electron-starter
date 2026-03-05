import { channels } from '@shared/ipc/channels';
import { contracts } from '@shared/ipc/contracts';
import { BrowserWindow, ipcMain } from 'electron';
import { isTrustedIpcSender } from '../security/ipcSender';
import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';
import { validatedHandle } from './validatedHandle';

type PreloadFatalPayload = {
  kind: string;
  message: string;
};

const toPreloadFatalPayload = (payload: unknown): PreloadFatalPayload => {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'kind' in payload &&
    'message' in payload &&
    typeof payload.kind === 'string' &&
    typeof payload.message === 'string'
  ) {
    return {
      kind: payload.kind,
      message: payload.message,
    };
  }

  return {
    kind: 'unknown',
    message: 'Unknown preload fatal error',
  };
};

const registerPreloadFatalHandler = (): void => {
  ipcMain.on(channels.preloadFatalError, (event, rawPayload) => {
    const context = {
      channel: channels.preloadFatalError,
      frameUrl: event.senderFrame?.url ?? event.sender.getURL(),
      webContentsId: event.sender.id,
      windowId: BrowserWindow.fromWebContents(event.sender)?.id ?? null,
    };

    if (!isTrustedIpcSender(event)) {
      const count = incrementErrorMetric('ipc.unauthorized_sender');
      logger.warn('Preload fatal signal rejected: unauthorized sender', {
        ...context,
        count,
      });
      return;
    }

    const count = incrementErrorMetric('process.fatal');
    const payload = toPreloadFatalPayload(rawPayload);

    logger.error('Preload fatal error reported', {
      ...context,
      kind: payload.kind,
      message: payload.message,
      count,
    });
  });
};

export const registerHandlers = (): void => {
  validatedHandle(contracts.ping, async () => ({
    message: 'pong' as const,
  }));

  registerPreloadFatalHandler();
};
