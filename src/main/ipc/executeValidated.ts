import type {
  IpcContract,
  SuccessDataFromContract,
} from '@shared/ipc/contracts';
import type { ZodTypeAny, z } from 'zod';
import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';
import {
  createFallbackIpcRequestContext,
  type IpcRequestContext,
} from './context';
import { toErrorPayload } from './error';

const resolveErrorMetric = (code: string) => {
  if (code === 'INVALID_PAYLOAD') {
    return 'ipc.invalid_payload' as const;
  }

  if (code === 'INTERNAL_ERROR' || code === 'UNKNOWN_ERROR') {
    return 'ipc.internal' as const;
  }

  return 'ipc.rejected' as const;
};

export const executeValidated = async <
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
>(
  contract: Contract,
  handler: (
    payload: z.output<Contract['requestSchema']>
  ) => Promise<SuccessDataFromContract<Contract>>,
  rawPayload: unknown,
  context?: IpcRequestContext
): Promise<Contract['responseSchema']['_output']> => {
  const requestContext =
    context ?? createFallbackIpcRequestContext(contract.channel);

  try {
    const request = contract.requestSchema.parse(rawPayload);
    const data = await handler(request as z.output<Contract['requestSchema']>);
    const response = { ok: true as const, data };
    return contract.responseSchema.parse(response);
  } catch (error) {
    const safeError = toErrorPayload(error);
    const count = incrementErrorMetric(resolveErrorMetric(safeError.code));
    const meta = {
      ...requestContext,
      code: safeError.code,
      count,
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
