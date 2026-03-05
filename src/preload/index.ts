import { contracts } from '@shared/ipc/contracts';
import type { RendererApi } from '@shared/ipc/types';
import { contextBridge, ipcRenderer } from 'electron';

const api: RendererApi = {
  ping: async () => {
    const rawResponse = await ipcRenderer.invoke(contracts.ping.channel, {});
    const response = contracts.ping.responseSchema.parse(rawResponse);

    if (!response.ok) {
      throw new Error(`${response.error.code}: ${response.error.message}`);
    }

    return response.data;
  },
};

contextBridge.exposeInMainWorld('api', api);
