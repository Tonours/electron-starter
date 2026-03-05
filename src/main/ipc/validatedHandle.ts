import type {
  IpcContract,
  SuccessDataFromContract,
} from '@shared/ipc/contracts';
import { ipcMain } from 'electron';
import type { ZodTypeAny, z } from 'zod';
import { executeValidated } from './executeValidated';

export const validatedHandle = <
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
>(
  contract: Contract,
  handler: (
    payload: z.output<Contract['requestSchema']>
  ) => Promise<SuccessDataFromContract<Contract>>
): void => {
  ipcMain.handle(contract.channel, async (_event, rawPayload) => {
    return executeValidated(contract, handler, rawPayload);
  });
};
