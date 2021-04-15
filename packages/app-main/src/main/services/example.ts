import { dialog, MessageBoxReturnValue, BrowserWindow } from 'electron';

export default class ExampleService {
  browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  sayHello(): Promise<MessageBoxReturnValue> {
    return dialog.showMessageBox(this.browserWindow, { message: 'Hello World' });
  }
}
