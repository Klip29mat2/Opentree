const {
    contextBridge,
    ipcRenderer
} = require("electron");


console.log("PRELOAD CHARGE");


contextBridge.exposeInMainWorld(
    "electronAPI",
    {


        openProject:()=>{

            return ipcRenderer.invoke(
                "open-project"
            );

        },


        createProject:()=>{

            return ipcRenderer.invoke(
                "create-project"
            );

        }


    }
);
