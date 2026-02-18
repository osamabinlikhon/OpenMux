import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('openmux', {
  sandboxRequest: async (opts: { method?: string; path: string; body?: any; headers?: any }) => {
    return ipcRenderer.invoke('sandbox:request', opts);
  },
});
