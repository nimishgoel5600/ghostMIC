import { desktopCapturer, BrowserWindow } from 'electron';

export async function getAudioSources(): Promise<{ id: string; name: string }[]> {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
  });

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
  }));
}

// Audio capture is handled in the renderer process via desktopCapturer constraints
// The main process provides the source list and coordinates IPC
export function notifyAudioStatus(
  mainWindow: BrowserWindow,
  connected: boolean,
  source: string
): void {
  mainWindow.webContents.send('audio-status', { connected, source });
}
