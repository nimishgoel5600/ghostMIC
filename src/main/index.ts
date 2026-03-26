import { app, BrowserWindow, desktopCapturer, screen, session, systemPreferences } from 'electron';
import path from 'path';
import { createTray, destroyTray } from './tray';
import { registerShortcuts, unregisterAll } from './shortcuts';
import { setupIpcHandlers } from './ipc-handlers';
import { getSettings } from './store';
import { OVERLAY_SIZES } from '../shared/constants';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const settings = getSettings();
  const sizeConfig = OVERLAY_SIZES[settings.size];
  const display = screen.getPrimaryDisplay();
  const { width: screenWidth } = display.workAreaSize;

  let x = screenWidth - sizeConfig.width - 20;
  let y = 40;

  if (settings.position === 'top-left') {
    x = 20; y = 40;
  } else if (settings.position === 'bottom-right') {
    x = screenWidth - sizeConfig.width - 20;
    y = display.workAreaSize.height - sizeConfig.height - 20;
  } else if (settings.position === 'bottom-left') {
    x = 20;
    y = display.workAreaSize.height - sizeConfig.height - 20;
  }

  mainWindow = new BrowserWindow({
    width: sizeConfig.width,
    height: sizeConfig.height,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // ─── STEALTH ───────────────────────────────────────────────
  // Disabled for debugging — re-enable for production:
  // mainWindow.setContentProtection(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setOpacity(settings.opacity / 100);

  if (process.platform === 'darwin') {
    app.dock?.hide();
  }

  // ─── SYSTEM AUDIO CAPTURE ─────────────────────────────────
  // When renderer calls getDisplayMedia(), this handler auto-approves
  // with system audio loopback (captures interviewer, not your mic).
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    console.log('[GhostMic] Display media requested');
    try {
      // Try to get a screen source for the video requirement
      const sources = await desktopCapturer.getSources({ types: ['screen'] });
      if (sources.length > 0) {
        console.log('[GhostMic] Granting system audio loopback with screen source');
        callback({ video: sources[0], audio: 'loopback' });
      } else {
        console.log('[GhostMic] No screen sources, trying audio-only loopback');
        callback({ audio: 'loopback' });
      }
    } catch (err) {
      console.log('[GhostMic] desktopCapturer failed, trying audio-only loopback');
      callback({ audio: 'loopback' });
    }
  });

  // ─── Load renderer ─────────────────────────────────────────
  const builtFile = path.join(__dirname, '../../renderer/index.html');

  if (process.env.GHOSTMIC_DEV === '1') {
    mainWindow.loadURL('http://localhost:5173/');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(builtFile);
  }

  mainWindow.webContents.on('did-fail-load', (_e, code, _desc) => {
    if (code === -102 || code === -6) {
      mainWindow?.loadFile(builtFile);
    }
  });

  setupIpcHandlers(mainWindow);
  createTray(mainWindow);
  registerShortcuts(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) mainWindow.show();
  });
}

app.whenReady().then(async () => {
  if (process.platform === 'darwin') {
    const micStatus = systemPreferences.getMediaAccessStatus('microphone');
    console.log('[GhostMic] Microphone permission:', micStatus);
    if (micStatus !== 'granted') {
      await systemPreferences.askForMediaAccess('microphone');
    }
    const screenStatus = systemPreferences.getMediaAccessStatus('screen');
    console.log('[GhostMic] Screen Recording permission:', screenStatus);
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
  else mainWindow.show();
});

app.on('will-quit', () => {
  unregisterAll();
  destroyTray();
});
