import { desktopCapturer, BrowserWindow } from 'electron';

let captureInterval: ReturnType<typeof setInterval> | null = null;

export async function captureScreen(): Promise<string | null> {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1280, height: 720 },
    });

    if (sources.length === 0) return null;

    const primaryScreen = sources[0];
    return primaryScreen.thumbnail.toDataURL();
  } catch (err) {
    console.error('Screen capture error:', err);
    return null;
  }
}

export function startScreenCapture(
  mainWindow: BrowserWindow,
  intervalMs: number
): void {
  stopScreenCapture();

  captureInterval = setInterval(async () => {
    const imageData = await captureScreen();
    if (imageData) {
      mainWindow.webContents.send('screen-capture', { imageData });
    }
  }, intervalMs);
}

export function stopScreenCapture(): void {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
  }
}
