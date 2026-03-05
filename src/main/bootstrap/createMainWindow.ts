import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import { getBrowserWindowOptions } from '../security/config';
import { applyNavigationGuard } from '../security/navigationGuard';

type RendererEntry = {
  entryUrl: string;
  allowedHttpOrigins: string[];
  allowFileProtocol: boolean;
};

const resolveRendererEntry = (): RendererEntry => {
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devUrl) {
    return {
      entryUrl: devUrl,
      allowedHttpOrigins: [new URL(devUrl).origin],
      allowFileProtocol: false,
    };
  }

  const fileEntry = `file://${path.resolve(__dirname, '..', 'renderer', 'index.html')}`;
  return {
    entryUrl: fileEntry,
    allowedHttpOrigins: [],
    allowFileProtocol: true,
  };
};

export const createMainWindow = (): BrowserWindow => {
  const preloadFile = path.resolve(__dirname, '..', 'preload', 'index.cjs');
  const window = new BrowserWindow(getBrowserWindowOptions(preloadFile));

  const rendererEntry = resolveRendererEntry();
  void window.loadURL(rendererEntry.entryUrl);

  window.once('ready-to-show', () => {
    window.show();
  });

  applyNavigationGuard(window, {
    allowedHttpOrigins: rendererEntry.allowedHttpOrigins,
    allowFileProtocol: rendererEntry.allowFileProtocol,
  });

  return window;
};
