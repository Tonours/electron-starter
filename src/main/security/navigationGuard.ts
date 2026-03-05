import { URL } from 'node:url';
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
  allowFileProtocol: boolean;
};

const isAllowedNavigation = (
  target: URL,
  options: NavigationGuardOptions
): boolean => {
  if (target.protocol === 'file:') {
    return options.allowFileProtocol;
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
    allowFileProtocol: options.allowFileProtocol,
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
