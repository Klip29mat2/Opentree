console.log("PRELOAD OK");

contextBridge.exposeInMainWorld(
    "electronAPI",
    {

        openProject: () => {

            return ipcRenderer.invoke(
                "open-project"
            );

        }

    }
);