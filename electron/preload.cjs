const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer if needed in future
contextBridge.exposeInMainWorld('electronAPI', {
    // example: saveFile: (data) => ipcRenderer.invoke('save-file', data)
});
