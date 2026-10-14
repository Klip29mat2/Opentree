import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Viewport3D from "./components/Viewport3D.jsx";
import TreeCompiler from "./Engine/TreeCompiler.js";
import { nodes as initialNodes, edges as initialEdges, nodeTypes } from "./nodes/treeNodes.jsx";
import NodeContextMenu from "./components/NodeContextMenu.jsx";
import StartMenu from "./components/StartMenu.jsx";
import { useTree } from "./context/TreeContext.jsx";

const serialize = (items) => items.map(({ data, ...item }) => ({ ...item, data: Object.fromEntries(Object.entries(data ?? {}).filter(([key]) => key !== "onChange" && key !== "onDelete")) }));

export default function App() {
    const [screen, setScreen] = useState("home");
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [menu, setMenu] = useState(null);
    const [projectPath, setProjectPath] = useState(null);
    const [saveStatus, setSaveStatus] = useState("saved");
    const [fileMenuOpen, setFileMenuOpen] = useState(false);
    const [exportStatus, setExportStatus] = useState("");
    const [exportGLB, setExportGLB] = useState(null);
    const saveQueue = useRef(Promise.resolve());
    const saveRevision = useRef(0);
    const { setTree } = useTree();
    const compiler = useMemo(() => new TreeCompiler(), []);
    const compiled = useMemo(() => compiler.compile(nodes, edges), [compiler, nodes, edges]);
    const registerGLBExporter = useCallback((exporter) => setExportGLB(() => exporter), []);

    const updateNodeData = useCallback((id, data) => setNodes((current) => current.map((node) => node.id === id ? { ...node, data } : node)), []);
    const removeNode = useCallback((id) => {
        setNodes((current) => current.filter((node) => node.id !== id));
        setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id));
    }, []);
    const graphNodes = useMemo(() => nodes.map((node) => ({
        ...node,
        data: { ...node.data, onChange: updateNodeData, onDelete: removeNode },
    })), [nodes, updateNodeData, removeNode]);
    useEffect(() => setTree(compiled.tree), [compiled.tree, setTree]);

    const onNodesChange = useCallback((changes) => setNodes((current) => applyNodeChanges(changes, current)), []);
    const onEdgesChange = useCallback((changes) => setEdges((current) => applyEdgeChanges(changes, current)), []);
    const onConnect = useCallback((connection) => setEdges((current) => addEdge({ ...connection, animated: true, style: { stroke: "#81c784" } }, current)), []);

    async function newProject() {
        const result = await window.electronAPI?.createProject();
        if (!result) return;
        setProjectPath(result.path);
        setNodes(result.project.graph.nodes);
        setEdges(result.project.graph.edges);
        setScreen("editor");
    }
    async function openProject() {
        const result = await window.electronAPI?.openProject();
        if (!result) return;
        setProjectPath(result.path);
        setNodes(result.project.graph.nodes.map((node) => ({ ...node, data: { ...node.data, onChange: updateNodeData } })));
        setEdges(result.project.graph.edges);
        setScreen("editor");
    }
    const saveProject = useCallback(() => {
        if (!projectPath || screen !== "editor") return Promise.resolve(false);
        const save = window.electronAPI?.saveProject;
        if (!save) {
            setSaveStatus("error");
            return Promise.resolve(false);
        }

        const revision = ++saveRevision.current;
        const project = {
            formatVersion: 1,
            name: projectPath.split(/[\\/]/).at(-1).replace(/\.opentree$/i, ""),
            graph: { nodes: serialize(nodes), edges },
        };
        setSaveStatus("saving");
        const task = saveQueue.current.catch(() => {}).then(() => save(projectPath, project));
        saveQueue.current = task;
        return task.then(() => {
            if (saveRevision.current === revision) setSaveStatus("saved");
            return true;
        }).catch((error) => {
            console.error("Impossible de sauvegarder le projet :", error);
            if (saveRevision.current === revision) setSaveStatus("error");
            return false;
        });
    }, [projectPath, screen, nodes, edges]);

    const exportTree = useCallback(async () => {
        if (!exportGLB) {
            setExportStatus("3D view is still loading");
            return;
        }
        setFileMenuOpen(false);
        setExportStatus("Exporting GLB…");
        const projectName = projectPath?.split(/[\\/]/).at(-1).replace(/\.opentree$/i, "");
        try {
            await exportGLB(`${projectName || "opentree"}.glb`);
            setExportStatus("GLB exported");
            window.setTimeout(() => setExportStatus(""), 3000);
        } catch (error) {
            console.error("Impossible d’exporter le modèle GLB :", error);
            setExportStatus("GLB export failed");
        }
    }, [exportGLB, projectPath]);

    useEffect(() => {
        if (!projectPath || screen !== "editor") return undefined;
        setSaveStatus("pending");
        const timeout = window.setTimeout(() => saveProject(), 750);
        return () => window.clearTimeout(timeout);
    }, [projectPath, screen, nodes, edges, saveProject]);
    function createNode(type) {
        const id = crypto.randomUUID();
        setNodes((current) => [...current, { id, type, position: { x: menu?.x ?? 300, y: menu?.y ?? 200 }, data: { onChange: updateNodeData } }]);
        setMenu(null);
    }
    useEffect(() => {
        const shortcut = (event) => {
            if (event.shiftKey && event.key.toLowerCase() === "a") {
                event.preventDefault();
                setMenu({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                saveProject();
            }
        };
        window.addEventListener("keydown", shortcut);
        return () => window.removeEventListener("keydown", shortcut);
    });

    if (screen === "home") return <StartMenu newProject={newProject} openProject={openProject} />;
    return <div className="editor-shell">
        <Viewport3D onExportReady={registerGLBExporter} />
        <ReactFlow className="graph-pane" nodes={graphNodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} deleteKeyCode={["Backspace", "Delete"]} fitView colorMode="dark">
            <Background color="#333" /><Controls />
        </ReactFlow>
        <div className="editor-toolbar">
            <div className="editor-brand"><span>✳</span> OpenTree</div>
            <div className="file-menu-wrap">
                <button className="file-menu-trigger" aria-haspopup="menu" aria-expanded={fileMenuOpen} onClick={() => setFileMenuOpen((open) => !open)}>File <span>⌄</span></button>
                {fileMenuOpen && <div className="file-menu" role="menu">
                    <button role="menuitem" onClick={exportTree}><span>⇧</span><span>Export as GLB<small>Binary glTF · .glb</small></span></button>
                </div>}
            </div>
            <div className="editor-status">{exportStatus || (saveStatus === "saving" ? "Saving…" : saveStatus === "pending" ? "Changes pending…" : saveStatus === "error" ? "Save failed" : "Autosaved")}</div>
        </div>
        <button className="save-button" onClick={saveProject}><span>◉</span> Save project</button>
        {compiled.errors.length > 0 && <div className="graph-error">{compiled.errors.join(" ")}</div>}
        <NodeContextMenu menu={menu} createNode={createNode} />
    </div>;
}
