import type { IpcContract } from '@shared/ipc/contracts';
import type { ZodTypeAny, z } from 'zod';
import { logger } from '../services/logger';
import { toErrorPayload } from './error';

type SuccessDataFromContract<
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
> = Contract['responseSchema']['_output'] extends infer Response
  ? Extract<Response, { ok: true }> extends { data: infer SuccessData }
    ? SuccessData
    : never
  : never;

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
    logger.error('IPC handler failed', {
      channel: contract.channel,
      code: safeError.code,
    });

    return contract.responseSchema.parse({
      ok: false as const,
      error: safeError,
    }) as Contract['responseSchema']['_output'];
  }
};
