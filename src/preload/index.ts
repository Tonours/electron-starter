import { channels } from '@shared/ipc/channels';
import { contracts, type ResponseEnvelopeOf } from '@shared/ipc/contracts';
import type { RendererApi } from '@shared/ipc/types';
import { contextBridge, ipcRenderer } from 'electron';

let isExitingForFatalError = false;

const toFatalMessage = (reason: unknown): string => {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === 'string') {
    return reason;
  }

  return 'Unknown fatal preload error';
};

const reportFatalError = (kind: string, reason: unknown): void => {
  const message = toFatalMessage(reason);

  try {
    ipcRenderer.send(channels.preloadFatalError, {
      kind,
      message,
    });
  } catch {}

  process.stderr.write(`[preload][fatal] ${kind}: ${message}\n`);
};

const terminateRendererProcess = (): void => {
  if (isExitingForFatalError) {
    return;
  }

  isExitingForFatalError = true;
  process.exit(1);
};

process.on('uncaughtException', (error) => {
  reportFatalError('uncaughtException', error);
  terminateRendererProcess();
});

process.on('unhandledRejection', (reason) => {
  reportFatalError('unhandledRejection', reason);
  terminateRendererProcess();
});

const api: RendererApi = {
  ping: async () => {
    const response = (await ipcRenderer.invoke(
      contracts.ping.channel,
      {}
    )) as ResponseEnvelopeOf<'ping'>;

    if (!response.ok) {
      throw new Error(`${response.error.code}: ${response.error.message}`);
    }

    return response.data;
  },
};

contextBridge.exposeInMainWorld('api', api);
