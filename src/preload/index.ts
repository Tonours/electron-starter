import { contextBridge, ipcRenderer } from 'electron';
import { contracts, type ResponseEnvelopeOf } from '@shared/ipc/contracts';
import type { RendererApi } from '@shared/ipc/types';

const api: RendererApi = {
  ping: async () => {
    const response = (await ipcRenderer.invoke(contracts.ping.channel, {})) as ResponseEnvelopeOf<'ping'>;

    if (!response.ok) {
      throw new Error(`${response.error.code}: ${response.error.message}`);
    }

    return response.data;
  }
};

contextBridge.exposeInMainWorld('api', api);
