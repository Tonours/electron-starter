import type { IpcContract } from '@shared/ipc/contracts';
import { ipcMain } from 'electron';
import type { ZodTypeAny, z } from 'zod';
import { executeValidated } from './executeValidated';

type SuccessDataFromContract<
  Contract extends IpcContract<ZodTypeAny, ZodTypeAny>,
> = Contract['responseSchema']['_output'] extends infer Response
  ? Extract<Response, { ok: true }> extends { data: infer SuccessData }
    ? SuccessData
    : never
  : never;

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
