import { contracts } from '@shared/ipc/contracts';
import { validatedHandle } from './validatedHandle';

export const registerHandlers = (): void => {
  validatedHandle(contracts.ping, async () => ({
    message: 'pong' as const
  }));
};
