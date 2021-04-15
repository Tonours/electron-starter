import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('exampleService', {
  sayHello: async () => await ipcRenderer.invoke('exampleService:sayHello'),
});
