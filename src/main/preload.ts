import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (partial: Record<string, unknown>) => ipcRenderer.invoke('set-settings', partial),

  // Desktop capturer (for system audio)
  getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources') as Promise<{ id: string; name: string }[]>,

  // Audio sources
  getAudioSources: () => ipcRenderer.invoke('get-audio-sources') as Promise<{ id: string; name: string }[]>,

  // Screen capture
  startScreenCapture: (interval: number) =>
    ipcRenderer.send('start-screen-capture', { interval }),
  stopScreenCapture: () => ipcRenderer.send('stop-screen-capture'),

  // Window control
  setOpacity: (opacity: number) => ipcRenderer.send('set-opacity', opacity),
  setWindowSize: (width: number, height: number) =>
    ipcRenderer.send('set-window-size', { width, height }),
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  toggleVisibility: () => ipcRenderer.send('toggle-visibility'),

  // File operations
  openFileDialog: (filters: { name: string; extensions: string[] }[]) =>
    ipcRenderer.invoke('open-file-dialog', { filters }),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

  // Open macOS system settings (for granting permissions)
  openScreenRecordingSettings: () => ipcRenderer.send('open-screen-recording-settings'),

  // Event listeners
  onScreenCapture: (callback: (data: { imageData: string }) => void) => {
    const listener = (_event: unknown, data: { imageData: string }) => callback(data);
    ipcRenderer.on('screen-capture', listener);
    return () => { ipcRenderer.removeListener('screen-capture', listener); };
  },
  onShortcutTriggered: (callback: (action: string) => void) => {
    const listener = (_event: unknown, action: string) => callback(action);
    ipcRenderer.on('shortcut-triggered', listener);
    return () => { ipcRenderer.removeListener('shortcut-triggered', listener); };
  },
  onSettingsUpdated: (callback: (data: unknown) => void) => {
    const listener = (_event: unknown, data: unknown) => callback(data);
    ipcRenderer.on('settings-updated', listener);
    return () => { ipcRenderer.removeListener('settings-updated', listener); };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
