import { ipcMain, dialog, desktopCapturer, BrowserWindow } from 'electron';
import { getSettings, setSettings } from './store';
import { startScreenCapture, stopScreenCapture } from './screen-capture';
import { registerShortcuts } from './shortcuts';
import type { AppSettings } from '../shared/types';

export function setupIpcHandlers(mainWindow: BrowserWindow): void {
  // Settings
  ipcMain.handle('get-settings', () => {
    return getSettings();
  });

  ipcMain.handle('set-settings', (_event, partial: Partial<AppSettings>) => {
    setSettings(partial);
    mainWindow.webContents.send('settings-updated', partial);
    if (partial.shortcuts) {
      registerShortcuts(mainWindow);
    }
    return getSettings();
  });

  // Desktop capturer sources (for system audio capture)
  ipcMain.handle('get-desktop-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
    });
    return sources.map((s) => ({ id: s.id, name: s.name }));
  });

  // Audio sources (legacy — kept for settings UI)
  ipcMain.handle('get-audio-sources', async () => {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
    });
    return sources.map((s) => ({ id: s.id, name: s.name }));
  });

  // Screen capture
  ipcMain.on('start-screen-capture', (_event, { interval }: { interval: number }) => {
    startScreenCapture(mainWindow, interval);
  });

  ipcMain.on('stop-screen-capture', () => {
    stopScreenCapture();
  });

  // Window control
  ipcMain.on('set-opacity', (_event, opacity: number) => {
    mainWindow.setOpacity(opacity / 100);
  });

  ipcMain.on('set-window-size', (_event, { width, height }: { width: number; height: number }) => {
    mainWindow.setSize(width, height);
  });

  ipcMain.on('minimize-to-tray', () => {
    mainWindow.hide();
  });

  ipcMain.on('toggle-visibility', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  // File dialogs
  ipcMain.handle('open-file-dialog', async (_event, options: { filters: { name: string; extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options.filters,
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  // Read file as buffer
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    const fs = await import('fs/promises');
    const buffer = await fs.readFile(filePath);
    return buffer;
  });

  // Open macOS Screen Recording settings
  ipcMain.on('open-screen-recording-settings', () => {
    const { shell } = require('electron') as typeof import('electron');
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
  });
}
