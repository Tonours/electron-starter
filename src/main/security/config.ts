import type { BrowserWindowConstructorOptions } from 'electron';

export const getBrowserWindowOptions = (preloadFile: string): BrowserWindowConstructorOptions => ({
  width: 980,
  height: 720,
  show: false,
  backgroundColor: '#0f172a',
  webPreferences: {
    preload: preloadFile,
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: false,
    webSecurity: true,
    devTools: !process.env.CI
  }
});
