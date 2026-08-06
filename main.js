const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require("electron");


let mainWindow;



function createWindow() {


    mainWindow = new BrowserWindow({

        width: 1200,

        height: 800,

        webPreferences: {

            nodeIntegration: false,

            contextIsolation: true,

            preload: __dirname + "/preload.js"

        }

    });



    mainWindow.loadURL(
        "http://localhost:5173"
    );


    mainWindow.on(
        "closed",
        () => {

            mainWindow = null;

        }
    );

}





// Ouvrir un dossier projet

ipcMain.handle(
    "open-project",
    async () => {


        const result =
            await dialog.showOpenDialog({

                title: "OpenTree Project",

                properties: [

                    "openDirectory"

                ]

            });



        if (result.canceled) {

            return null;

        }



        return result.filePaths[0];

    }
);

app.whenReady().then(() => {


    createWindow();



    app.on(
        "activate",
        () => {


            if (
                BrowserWindow.getAllWindows().length === 0
            ) {

                createWindow();

            }


        }
    );


});






app.on(
    "window-all-closed",
    () => {


        if (
            process.platform !== "darwin"
        ) {

            app.quit();

        }


    }
);


const fs = require("fs");
const path = require("path");


ipcMain.handle(
    "create-project",
    async()=>{


        const result =
            await dialog.showOpenDialog({

                title:"Choose project location",

                properties:[
                    "openDirectory"
                ]

            });



        if(result.canceled){

            return null;

        }



        const parent =
            result.filePaths[0];



        const projectName =
            "NewTreeProject";



        const projectPath =
            path.join(
                parent,
                projectName
            );



        fs.mkdirSync(
            projectPath,
            {
                recursive:true
            }
        );



        fs.mkdirSync(
            path.join(
                projectPath,
                "assets"
            ),
            {
                recursive:true
            }
        );



        fs.mkdirSync(
            path.join(
                projectPath,
                "thumbnails"
            ),
            {
                recursive:true
            }
        );



        const data = {

            name:projectName,

            nodes:[],

            edges:[]

        };



        fs.writeFileSync(

            path.join(
                projectPath,
                "project.opentree"
            ),

            JSON.stringify(
                data,
                null,
                4
            )

        );



        return projectPath;


    }
);
