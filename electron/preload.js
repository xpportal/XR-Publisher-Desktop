const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  startEliza: (config) => ipcRenderer.invoke('eliza:start', config),
  sendElizaMessage: (message) => ipcRenderer.invoke('eliza:message', message),
  stopEliza: () => ipcRenderer.invoke('eliza:stop'),
  eliza: {
    start: (config) => ipcRenderer.invoke('eliza:start', config),
    sendMessage: (message) => ipcRenderer.invoke('eliza:message', message),
    stop: () => ipcRenderer.invoke('eliza:stop')
  },
  invoke: (channel, ...args) => {
    const validChannels = ['db:execute', 'db:query'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  }
})

