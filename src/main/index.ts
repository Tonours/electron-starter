import { app } from 'electron';
import { createMainWindow } from './bootstrap/createMainWindow';
import { registerAppLifecycle } from './bootstrap/appLifecycle';
import { registerHandlers } from './ipc/registerHandlers';
import { configureSessionSecurity } from './security/navigationGuard';
import { logger } from './services/logger';

const bootstrap = async (): Promise<void> => {
  await app.whenReady();

  configureSessionSecurity();
  registerHandlers();

  let mainWindow = createMainWindow();

  registerAppLifecycle(() => {
    if (mainWindow.isDestroyed()) {
      mainWindow = createMainWindow();
    }
  });

  logger.info('Electron starter ready');
};

void bootstrap();
