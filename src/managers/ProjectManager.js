export default class ProjectManager {
    constructor() {
        this.projectPath = null;
    }

    async newProject() {
        const result = await window.electronAPI?.createProject();
        if (!result) return null;
        this.projectPath = result.path;
        return result.project;
    }

    async openProject() {
        const result = await window.electronAPI?.openProject();
        if (!result) return null;
        this.projectPath = result.path;
        return result.project;
    }

    async saveProject(project) {
        if (!this.projectPath) return false;
        return window.electronAPI.saveProject(this.projectPath, project);
    }
}
