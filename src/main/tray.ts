import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow): Tray {
  // Create a small 16x16 tray icon (simple colored square)
  const icon = nativeImage.createEmpty();
  // Use a template image on macOS for menu bar compatibility
  const trayIcon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAADlJREFUOI1jYBhowMjAwPCfgYHhPzYJJnySTAxEAKoBo2EADQMGXE5hwuUUYgCKAYMhDIYiGAANAwBJjgW7VZU1xwAAAABJRU5ErkJggg==',
      'base64'
    )
  );

  tray = new Tray(trayIcon);
  tray.setToolTip('GhostMic');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Interview Mode',
      type: 'radio',
      checked: true,
      click: () => mainWindow.webContents.send('shortcut-triggered', 'switchMode'),
    },
    {
      label: 'Coding Mode',
      type: 'radio',
      click: () => mainWindow.webContents.send('shortcut-triggered', 'switchMode'),
    },
    { type: 'separator' },
    {
      label: 'Quit GhostMic',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
