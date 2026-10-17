const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const defaultGraphTemplate = require("./defaultGraph.json");

let mainWindow;
const projectPaths = new Map();
const createDefaultGraph = () => structuredClone(defaultGraphTemplate);
const emptyProject = (name = "NewTreeProject") => ({
    formatVersion: 1,
    name,
    graph: createDefaultGraph(),
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    if (app.isPackaged) {
        mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    } else {
        loadDevelopmentPage(mainWindow);
    }
    mainWindow.on("closed", () => { mainWindow = null; });
}

async function loadDevelopmentPage(window) {
    const url = "http://localhost:5173";
    for (let attempt = 0; attempt < 40 && !window.isDestroyed(); attempt += 1) {
        try {
            await window.loadURL(url);
            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 250));
        }
    }
}

function validateProject(project) {
    if (!project || project.formatVersion !== 1 || !project.graph || !Array.isArray(project.graph.nodes) || !Array.isArray(project.graph.edges)) {
        throw new Error("Fichier OpenTree invalide ou version non prise en charge.");
    }
    return project;
}

ipcMain.handle("project:create", async (event) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: "Créer un projet OpenTree",
        defaultPath: "NewTreeProject.opentree",
        filters: [{ name: "Projet OpenTree", extensions: ["opentree"] }],
    });
    if (result.canceled || !result.filePath) return null;
    const project = emptyProject(path.basename(result.filePath, path.extname(result.filePath)));
    await fs.writeFile(result.filePath, JSON.stringify(project, null, 2), "utf8");
    projectPaths.set(event.sender.id, result.filePath);
    return { path: result.filePath, project };
});

ipcMain.handle("project:open", async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: "Ouvrir un projet OpenTree",
        properties: ["openFile"],
        filters: [{ name: "Projet OpenTree", extensions: ["opentree"] }],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    const project = validateProject(JSON.parse(await fs.readFile(filePath, "utf8")));
    projectPaths.set(event.sender.id, filePath);
    return { path: filePath, project };
});

ipcMain.handle("project:save", async (event, filePath, project) => {
    if (typeof filePath !== "string" || projectPaths.get(event.sender.id) !== filePath) throw new Error("Chemin de projet invalide.");
    validateProject(project);
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), "utf8");
    return true;
});

app.on("web-contents-created", (_event, contents) => {
    contents.on("destroyed", () => projectPaths.delete(contents.id));
});

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
