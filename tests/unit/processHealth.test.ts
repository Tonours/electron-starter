import { registerProcessHealthHandlers } from '@main/bootstrap/processHealth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type AppHandlerMap = {
  'render-process-gone'?: (
    event: unknown,
    webContents: unknown,
    details: { reason: string; exitCode: number }
  ) => void;
  'child-process-gone'?: (
    event: unknown,
    details: { type: string; reason: string; exitCode: number }
  ) => void;
};

const {
  appOnMock,
  browserWindowFromWebContentsMock,
  incrementErrorMetricMock,
  loggerErrorMock,
  loggerWarnMock,
  handlers,
} = vi.hoisted(() => ({
  appOnMock: vi.fn(),
  browserWindowFromWebContentsMock: vi.fn(),
  incrementErrorMetricMock: vi.fn(() => 1),
  loggerErrorMock: vi.fn(),
  loggerWarnMock: vi.fn(),
  handlers: {} as AppHandlerMap,
}));

vi.mock('electron', () => ({
  app: {
    on: appOnMock,
  },
  BrowserWindow: {
    fromWebContents: browserWindowFromWebContentsMock,
  },
}));

vi.mock('@main/services/errorMetrics', () => ({
  incrementErrorMetric: incrementErrorMetricMock,
}));

vi.mock('@main/services/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: loggerWarnMock,
    error: loggerErrorMock,
  },
}));

describe('registerProcessHealthHandlers', () => {
  beforeEach(() => {
    appOnMock.mockReset();
    browserWindowFromWebContentsMock.mockReset();
    incrementErrorMetricMock.mockClear();
    loggerErrorMock.mockClear();
    loggerWarnMock.mockClear();
    delete handlers['render-process-gone'];
    delete handlers['child-process-gone'];

    appOnMock.mockImplementation((event, handler) => {
      if (event === 'render-process-gone') {
        handlers['render-process-gone'] = handler;
      }

      if (event === 'child-process-gone') {
        handlers['child-process-gone'] = handler;
      }
    });
  });

  it('recovers the window when renderer process crashes', () => {
    browserWindowFromWebContentsMock.mockReturnValue({ id: 12 });
    const recoverWindow = vi.fn();

    registerProcessHealthHandlers(recoverWindow);

    handlers['render-process-gone']?.(
      {},
      {},
      { reason: 'crashed', exitCode: 1 }
    );

    expect(recoverWindow).toHaveBeenCalledWith(12);
    expect(incrementErrorMetricMock).toHaveBeenCalledWith(
      'process.renderer_gone'
    );
    expect(loggerErrorMock).toHaveBeenCalledOnce();
  });

  it('does not recover the window on clean exit', () => {
    browserWindowFromWebContentsMock.mockReturnValue({ id: 15 });
    const recoverWindow = vi.fn();

    registerProcessHealthHandlers(recoverWindow);

    handlers['render-process-gone']?.(
      {},
      {},
      { reason: 'clean-exit', exitCode: 0 }
    );

    expect(recoverWindow).not.toHaveBeenCalled();
  });

  it('records child process gone events', () => {
    registerProcessHealthHandlers(vi.fn());

    handlers['child-process-gone']?.(
      {},
      {
        type: 'Utility',
        reason: 'crashed',
        exitCode: 1,
      }
    );

    expect(incrementErrorMetricMock).toHaveBeenCalledWith('process.child_gone');
    expect(loggerWarnMock).toHaveBeenCalledOnce();
  });
});
