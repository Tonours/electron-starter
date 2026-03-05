import { randomUUID } from 'node:crypto';
import { BrowserWindow, type IpcMainInvokeEvent } from 'electron';

export type IpcRequestContext = {
  requestId: string;
  channel: string;
  frameUrl: string;
  webContentsId: number;
  windowId: number | null;
};

export const createIpcRequestContext = (
  channel: string,
  event: IpcMainInvokeEvent
): IpcRequestContext => {
  const window = BrowserWindow.fromWebContents(event.sender);

  return {
    requestId: randomUUID(),
    channel,
    frameUrl: event.senderFrame?.url ?? event.sender.getURL(),
    webContentsId: event.sender.id,
    windowId: window?.id ?? null,
  };
};

export const createFallbackIpcRequestContext = (
  channel: string
): IpcRequestContext => ({
  requestId: randomUUID(),
  channel,
  frameUrl: 'unknown',
  webContentsId: -1,
  windowId: null,
});
