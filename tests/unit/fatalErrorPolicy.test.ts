import { beforeEach, describe, expect, it, vi } from 'vitest';

const incrementErrorMetricMock = vi.fn(() => 1);
const loggerErrorMock = vi.fn();

vi.mock('@main/services/errorMetrics', () => ({
  incrementErrorMetric: incrementErrorMetricMock,
}));

vi.mock('@main/services/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: loggerErrorMock,
  },
}));

describe('registerFatalErrorPolicy', () => {
  beforeEach(() => {
    vi.resetModules();
    incrementErrorMetricMock.mockClear();
    loggerErrorMock.mockClear();
  });

  it('registers handlers and shutdowns once for multiple fatal events', async () => {
    const handlers = new Map<string | symbol, (reason: unknown) => void>();
    const onSpy = vi
      .spyOn(process, 'on')
      .mockImplementation((event, handler) => {
        handlers.set(event, handler as (reason: unknown) => void);
        return process;
      });

    const { registerFatalErrorPolicy } = await import(
      '@main/bootstrap/fatalErrorPolicy'
    );

    const shutdown = vi.fn();
    registerFatalErrorPolicy(shutdown);

    handlers.get('unhandledRejection')?.(new Error('boom'));
    handlers.get('uncaughtException')?.(new Error('again'));

    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(incrementErrorMetricMock).toHaveBeenCalledTimes(1);
    expect(loggerErrorMock).toHaveBeenCalledTimes(1);

    onSpy.mockRestore();
  });
});
