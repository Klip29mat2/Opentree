const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", Object.freeze({
    createProject: () => ipcRenderer.invoke("project:create"),
    openProject: () => ipcRenderer.invoke("project:open"),
    saveProject: (filePath, project) => ipcRenderer.invoke("project:save", filePath, project),
}));
