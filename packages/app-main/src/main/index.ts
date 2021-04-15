import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

import ExampleService from './services/example';

const ELECTRON_LOCAL_URL = 'http://localhost:3000';

let mainWindow: BrowserWindow;
const preloadPath = app.isPackaged ? process.resourcesPath : process.cwd();

const preload = path.resolve(path.join(preloadPath, 'preload', 'dist'), 'index.js');

const createMainWindow = () => {
  if (mainWindow) {
    return mainWindow;
  }

  const exampleService = new ExampleService(mainWindow);

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload,
    },
  });

  mainWindow.loadURL(
    !app.isPackaged
      ? ELECTRON_LOCAL_URL
      : url.format({
          pathname: path.join(__dirname, '../static/build/index.html'),
          protocol: 'file:',
          slashes: true,
        }),
  );

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  ipcMain.handle('exampleService:sayHello', () => {
    try {
      return exampleService.sayHello();
    } catch (err) {
      console.log('error: ', err);
      return err;
    }
  });

  return mainWindow;
};

// Quit application when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it is common to re-create a window even after all windows have been closed
  if (!mainWindow) {
    createMainWindow();
  }
});

// Create main BrowserWindow when electron is ready
app.on('ready', () => {
  createMainWindow();
});
