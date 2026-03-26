import { globalShortcut, BrowserWindow } from 'electron';
import { getSettings } from './store';

let registeredShortcuts: string[] = [];

export function registerShortcuts(mainWindow: BrowserWindow): void {
  unregisterAll();

  const settings = getSettings();
  const shortcuts = settings.shortcuts;

  const register = (accelerator: string, action: string) => {
    try {
      const success = globalShortcut.register(accelerator, () => {
        mainWindow.webContents.send('shortcut-triggered', action);

        if (action === 'toggleVisibility') {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        }

        if (action === 'panicHide') {
          mainWindow.hide();
        }
      });

      if (success) {
        registeredShortcuts.push(accelerator);
      } else {
        console.warn(`Failed to register shortcut: ${accelerator}`);
      }
    } catch (err) {
      console.warn(`Error registering shortcut ${accelerator}:`, err);
    }
  };

  register(shortcuts.toggleVisibility, 'toggleVisibility');
  register(shortcuts.toggleListening, 'toggleListening');
  register(shortcuts.switchMode, 'switchMode');
  register(shortcuts.copyLastAnswer, 'copyLastAnswer');
  register(shortcuts.copyLastCode, 'copyLastCode');
  register(shortcuts.panicHide, 'panicHide');
}

export function unregisterAll(): void {
  for (const shortcut of registeredShortcuts) {
    try {
      globalShortcut.unregister(shortcut);
    } catch {
      // ignore
    }
  }
  registeredShortcuts = [];
}
