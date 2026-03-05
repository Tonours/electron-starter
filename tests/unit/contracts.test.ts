import { contracts } from '@shared/ipc/contracts';
import { describe, expect, it } from 'vitest';

describe('IPC contracts registry', () => {
  it('contains a single ping contract', () => {
    expect(Object.keys(contracts)).toEqual(['ping']);
    expect(contracts.ping.channel).toBe('app:ping');
  });

  it('accepts standardized error envelope', () => {
    const parsed = contracts.ping.responseSchema.safeParse({
      ok: false,
      error: {
        code: 'TEST_ERROR',
        message: 'error',
        retryable: false,
      },
    });

    expect(parsed.success).toBe(true);
  });
});
