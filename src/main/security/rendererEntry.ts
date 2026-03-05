import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { app } from 'electron';

export type RendererEntry = {
  entryUrl: string;
  allowedHttpOrigins: string[];
  allowedFilePath: string | null;
};

const resolveDevEntry = (devUrl: string): RendererEntry => ({
  entryUrl: devUrl,
  allowedHttpOrigins: [new URL(devUrl).origin],
  allowedFilePath: null,
});

const resolveFileEntry = (): RendererEntry => {
  const filePath = path.resolve(__dirname, '..', 'renderer', 'index.html');

  return {
    entryUrl: pathToFileURL(filePath).toString(),
    allowedHttpOrigins: [],
    allowedFilePath: filePath,
  };
};

export const resolveRendererEntry = (): RendererEntry => {
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (!app.isPackaged && devUrl) {
    return resolveDevEntry(devUrl);
  }

  return resolveFileEntry();
};
