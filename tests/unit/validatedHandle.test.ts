import { AppError } from '@main/ipc/error';
import { executeValidated } from '@main/ipc/executeValidated';
import { logger } from '@main/services/logger';
import { contracts } from '@shared/ipc/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
  vi.spyOn(logger, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('executeValidated', () => {
  it('returns pong when handler succeeds', async () => {
    const response = await executeValidated(
      contracts.ping,
      async () => ({
        message: 'pong' as const,
      }),
      {}
    );

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.data.message).toBe('pong');
    }
  });

  it('returns sanitized app error', async () => {
    const response = await executeValidated(
      contracts.ping,
      async () => {
        throw new AppError('PING_FAIL', 'Ping failed', false);
      },
      {}
    );

    expect(response.ok).toBe(false);
    if (!response.ok) {
      expect(response.error.code).toBe('PING_FAIL');
    }
  });
});
