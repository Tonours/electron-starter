import type {
  IpcContract,
  SuccessDataFromContract,
} from '@shared/ipc/contracts';
import { ipcMain } from 'electron';
import type { ZodTypeAny, z } from 'zod';
import { isTrustedIpcSender } from '../security/ipcSender';
import { incrementErrorMetric } from '../services/errorMetrics';
import { logger } from '../services/logger';
import { createIpcRequestContext } from './context';
import { executeValidated } from './executeValidated';

export const validatedHandle = <
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
>(
  contract: Contract,
  handler: (
    payload: z.output<Contract['requestSchema']>
  ) => Promise<SuccessDataFromContract<Contract>>
): void => {
  ipcMain.handle(contract.channel, async (event, rawPayload) => {
    const context = createIpcRequestContext(contract.channel, event);

    if (!isTrustedIpcSender(event)) {
      const count = incrementErrorMetric('ipc.unauthorized_sender');
      logger.warn('IPC request rejected: unauthorized sender', {
        ...context,
        count,
      });

      return contract.responseSchema.parse({
        ok: false as const,
        error: {
          code: 'UNAUTHORIZED_SENDER',
          message: 'Unauthorized IPC sender.',
          retryable: false,
        },
      }) as Contract['responseSchema']['_output'];
    }

    return executeValidated(contract, handler, rawPayload, context);
  });
};
