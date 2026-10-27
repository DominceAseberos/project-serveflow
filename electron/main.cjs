const { app, BrowserWindow, screen, ipcMain, Menu, shell } = require('electron');
const path = require('node:path');

let mainWindow = null;
let tvWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: 'ServeFlow POS — Enterprise Cloud Point of Sale',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle external links securely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (tvWindow) {
      tvWindow.close();
      tvWindow = null;
    }
  });

  buildMenu();
}

function openTvWindow() {
  if (tvWindow) {
    tvWindow.focus();
    return;
  }

  const displays = screen.getAllDisplays();
  // If secondary display exists, place TV window on second display
  const externalDisplay = displays.find((display) => display.bounds.x !== 0 || display.bounds.y !== 0);

  const windowOptions = {
    width: 1280,
    height: 720,
    title: 'ServeFlow — Customer TV Order Display',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  };

  if (externalDisplay) {
    windowOptions.x = externalDisplay.bounds.x + 50;
    windowOptions.y = externalDisplay.bounds.y + 50;
  }

  tvWindow = new BrowserWindow(windowOptions);

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    tvWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    tvWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // After loading, tell the page to switch to TV view
  tvWindow.webContents.on('did-finish-load', () => {
    tvWindow.webContents.executeJavaScript(`
      try {
        const store = window.__SERVEFLOW_SESSION_STORE__;
        if (store && typeof store.setActiveView === 'function') {
          store.setActiveView('tv');
        }
      } catch (e) {}
    `);
  });

  tvWindow.on('closed', () => {
    tvWindow = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: 'ServeFlow',
      submenu: [
        {
          label: 'Toggle Fullscreen (POS Kiosk)',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
        {
          label: 'Customer TV Display Window',
          accelerator: 'F10',
          click: () => openTvWindow(),
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on('open-tv-display', () => {
  openTvWindow();
});

ipcMain.handle('get-displays', () => {
  return screen.getAllDisplays().map((d) => ({
    id: d.id,
    bounds: d.bounds,
    isPrimary: d.bounds.x === 0 && d.bounds.y === 0,
  }));
});

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
