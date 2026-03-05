import { app } from 'electron';
import { registerAppLifecycle } from './bootstrap/appLifecycle';
import { startCrashReporter } from './bootstrap/crashReporter';
import { createMainWindow } from './bootstrap/createMainWindow';
import { registerFatalErrorPolicy } from './bootstrap/fatalErrorPolicy';
import { registerProcessHealthHandlers } from './bootstrap/processHealth';
import { registerHandlers } from './ipc/registerHandlers';
import { configureSessionSecurity } from './security/navigationGuard';
import { logger } from './services/logger';

startCrashReporter();

let isQuitting = false;
app.on('before-quit', () => {
  isQuitting = true;
});

registerFatalErrorPolicy(() => {
  process.exitCode = 1;

  if (!app.isReady()) {
    app.exit(1);
    return;
  }

  app.quit();
  setTimeout(() => {
    app.exit(1);
  }, 3_000).unref();
});

const bootstrap = async (): Promise<void> => {
  await app.whenReady();

  configureSessionSecurity();
  registerHandlers();

  let mainWindow = createMainWindow();

  registerProcessHealthHandlers((windowId) => {
    if (isQuitting) {
      return;
    }

    if (
      windowId !== null &&
      !mainWindow.isDestroyed() &&
      mainWindow.id !== windowId
    ) {
      return;
    }

    if (!mainWindow.isDestroyed()) {
      try {
        mainWindow.reload();
        return;
      } catch (error) {
        logger.error('Failed to reload renderer after process crash', {
          windowId,
          error:
            error instanceof Error ? error.message : 'Unknown reload error',
        });
        mainWindow.destroy();
      }
    }

    mainWindow = createMainWindow();
  });

  registerAppLifecycle(() => {
    if (mainWindow.isDestroyed()) {
      mainWindow = createMainWindow();
    }
  });

  logger.info('Electron starter ready');
};

void bootstrap().catch((error: unknown) => {
  logger.error('Electron bootstrap failed', {
    error: error instanceof Error ? error.message : 'Unknown bootstrap error',
  });
  app.exit(1);
});
