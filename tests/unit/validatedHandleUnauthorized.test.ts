import { validatedHandle } from '@main/ipc/validatedHandle';
import { logger } from '@main/services/logger';
import { contracts } from '@shared/ipc/contracts';
import type { IpcMainInvokeEvent } from 'electron';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  ipcMainHandleMock,
  browserWindowFromWebContentsMock,
  isTrustedIpcSenderMock,
} = vi.hoisted(() => ({
  ipcMainHandleMock: vi.fn(),
  browserWindowFromWebContentsMock: vi.fn(),
  isTrustedIpcSenderMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: ipcMainHandleMock,
  },
  BrowserWindow: {
    fromWebContents: browserWindowFromWebContentsMock,
  },
}));

vi.mock('@main/security/ipcSender', () => ({
  isTrustedIpcSender: isTrustedIpcSenderMock,
}));

beforeEach(() => {
  vi.restoreAllMocks();
  ipcMainHandleMock.mockReset();
  browserWindowFromWebContentsMock.mockReset();
  isTrustedIpcSenderMock.mockReset();
});

describe('validatedHandle unauthorized sender', () => {
  it('returns unauthorized envelope and skips handler', async () => {
    let invokeCallback:
      | ((event: IpcMainInvokeEvent, payload: unknown) => Promise<unknown>)
      | undefined;

    ipcMainHandleMock.mockImplementation(
      (
        _channel: string,
        callback: (
          event: IpcMainInvokeEvent,
          payload: unknown
        ) => Promise<unknown>
      ) => {
        invokeCallback = callback;
      }
    );

    browserWindowFromWebContentsMock.mockReturnValue(null);
    isTrustedIpcSenderMock.mockReturnValue(false);
    vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

    const handler = vi.fn(async () => ({ message: 'pong' as const }));
    validatedHandle(contracts.ping, handler);

    const event = {
      senderFrame: { url: 'https://evil.example' },
      sender: {
        id: 99,
        getURL: () => 'https://evil.example',
      },
    } as unknown as IpcMainInvokeEvent;

    if (invokeCallback === undefined) {
      throw new Error('ipcMain.handle callback not registered');
    }

    const response = await invokeCallback(event, {});

    expect(handler).not.toHaveBeenCalled();
    expect(response).toEqual({
      ok: false,
      error: {
        code: 'UNAUTHORIZED_SENDER',
        message: 'Unauthorized IPC sender.',
        retryable: false,
      },
    });
  });
});
