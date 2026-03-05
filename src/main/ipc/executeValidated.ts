import type {
  IpcContract,
  SuccessDataFromContract,
} from '@shared/ipc/contracts';
import type { ZodTypeAny, z } from 'zod';
import { logger } from '../services/logger';
import { toErrorPayload } from './error';

export const executeValidated = async <
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
>(
  contract: Contract,
  handler: (
    payload: z.output<Contract['requestSchema']>
  ) => Promise<SuccessDataFromContract<Contract>>,
  rawPayload: unknown
): Promise<Contract['responseSchema']['_output']> => {
  try {
    const request = contract.requestSchema.parse(rawPayload);
    const data = await handler(request as z.output<Contract['requestSchema']>);
    const response = { ok: true as const, data };
    return contract.responseSchema.parse(response);
  } catch (error) {
    const safeError = toErrorPayload(error);
    const meta = {
      channel: contract.channel,
      code: safeError.code,
    };

    if (
      safeError.code === 'INTERNAL_ERROR' ||
      safeError.code === 'UNKNOWN_ERROR'
    ) {
      logger.error('IPC handler failed', meta);
    } else {
      logger.warn('IPC handler rejected request', meta);
    }

    return contract.responseSchema.parse({
      ok: false as const,
      error: safeError,
    }) as Contract['responseSchema']['_output'];
  }
};
