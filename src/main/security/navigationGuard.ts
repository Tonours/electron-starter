import { fileURLToPath, URL } from 'node:url';
import { type BrowserWindow, session } from 'electron';

export const configureSessionSecurity = (): void => {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    }
  );
};

type NavigationGuardOptions = {
  allowedHttpOrigins: string[];
  allowedFilePath: string | null;
};

const isAllowedNavigation = (
  target: URL,
  options: NavigationGuardOptions
): boolean => {
  if (target.protocol === 'file:') {
    if (options.allowedFilePath === null) {
      return false;
    }

    try {
      return fileURLToPath(target) === options.allowedFilePath;
    } catch {
      return false;
    }
  }

  if (target.protocol === 'http:' || target.protocol === 'https:') {
    return options.allowedHttpOrigins.includes(target.origin);
  }

  return false;
};

export const applyNavigationGuard = (
  window: BrowserWindow,
  options: NavigationGuardOptions
): void => {
  const guardedOptions = {
    allowedHttpOrigins: [...new Set(options.allowedHttpOrigins)],
    allowedFilePath: options.allowedFilePath,
  };

  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  window.webContents.on('will-navigate', (event, navigationUrl) => {
    let target: URL;

    try {
      target = new URL(navigationUrl);
    } catch {
      event.preventDefault();
      return;
    }

    if (!isAllowedNavigation(target, guardedOptions)) {
      event.preventDefault();
    }
  });
};
