const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serveflowDesktop', {
  isDesktop: true,
  platform: process.platform,
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  openTvDisplay: () => ipcRenderer.send('open-tv-display'),
  getDisplays: () => ipcRenderer.invoke('get-displays'),
});
