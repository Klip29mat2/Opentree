import { Handle, Position } from "@xyflow/react";

const fields = {
    seed: [["seed", "Seed", 1, 2147483647, 1]],
    trunk: [["trunklength", "Length", 0.1, 500, 0.1], ["trunkradius", "Radius", 0.05, 20, 0.1]],
    rotate: [["x", "Rotation X", -360, 360, 1], ["y", "Rotation Y", -360, 360, 1], ["z", "Rotation Z", -360, 360, 1]],
    scale: [["x", "Scale X", 0.01, 100, 0.1], ["y", "Scale Y", 0.01, 100, 0.1], ["z", "Scale Z", 0.01, 100, 0.1]],
    subdivide: [["subdivisions", "Divisions", 1, 100, 1]],
    randomize: [["randomPercentage", "Percentage", 0, 100, 1], ["randomCoefficient", "Coefficient", 0, 100, 0.1]],
    branch: [["branchCount", "Number of branches", 1, 40, 1], ["branchLength", "Length", 0.5, 100, 0.5], ["branchRadius", "Radius", 0.03, 10, 0.05], ["branchAngle", "Upward angle (°)", -20, 85, 1], ["branchStartHeight", "Start height", 0, 0.85, 0.05]],
    coconut: [["coconutCount", "Number of coconuts", 1, 12, 1], ["coconutSize", "Size", 0.25, 5, 0.05], ["coconutHeight", "Cluster height", 0.5, 0.99, 0.01]],
    leaf: [["leafCount", "Number of fronds", 1, 24, 1], ["leafLength", "Length", 2, 60, 1], ["leafWidth", "Leaflet width", 0.08, 2, 0.02], ["leafDroop", "Droop", 0, 1.8, 0.05], ["leafHeight", "Crown height", 0.65, 0.99, 0.01]],
    move: [["x", "Move X", -1000, 1000, 0.1], ["y", "Move Y", -1000, 1000, 0.1], ["z", "Move Z", -1000, 1000, 0.1]],
    trunkate: [["trunkate", "Taper (%)", 0, 100, 1]],
};
const selects = {
    coconut: { key: "coconutColor", label: "Ripeness", options: [["mature", "Mature · brown"], ["yellow", "Yellow"]] },
    leaf: { key: "leafColor", label: "Leaf color", options: [["green", "Palm green"], ["lime", "Lime green"], ["yellow", "Yellow green"]] },
};
const titles = { seed: "🌱 Seed", trunk: "🌳 Trunk", rotate: "🔄 Rotate", scale: "📐 Scale", subdivide: "⚛️ Subdivide", randomize: "🎲 Randomize", move: "↔️ Move", trunkate: "✂️ Taper", branch: "🌿 Branch", coconut: "🥥 Coconut", leaf: "🌴 Leaf", output: "📤 Output" };
const accents = { seed: "#91c99a", trunk: "#bd9465", rotate: "#9ab9bf", scale: "#91c1ca", subdivide: "#b49ac7", randomize: "#d9b97d", move: "#91c1ca", trunkate: "#ce9a6a", branch: "#91c99a", coconut: "#d9b96b", leaf: "#a8d79d", output: "#9bb6a0" };
const defaults = { seed: 1, trunklength: 50, trunkradius: 2, subdivisions: 5, randomPercentage: 0, randomCoefficient: 1, branchCount: 6, branchLength: 12, branchRadius: 0.35, branchAngle: 38, branchStartHeight: 0.25, coconutCount: 3, coconutSize: 1.2, coconutHeight: 0.9, coconutColor: "mature", leafCount: 8, leafLength: 18, leafWidth: 0.55, leafDroop: 0.85, leafHeight: 0.94, leafColor: "green", trunkate: 30, x: 0, y: 0, z: 0 };

export default function ParameterNode({ id, type, data = {} }) {
    const entries = fields[type] ?? [];
    const update = (key, value, numeric = true) => data.onChange?.(id, { ...data, [key]: numeric ? Number(value) : value });
    return <div className="parameter-node" style={{ "--node-accent": accents[type] ?? "#91c99a" }}>
        {type !== "seed" && <Handle type="target" position={Position.Left} />}
        <div className="parameter-node-header">
            <span>{titles[type] ?? type}</span>
            <button
                className="parameter-node-delete nodrag nopan"
                type="button"
                title="Supprimer ce nœud"
                aria-label={`Supprimer le nœud ${titles[type] ?? type}`}
                onClick={(event) => {
                    event.stopPropagation();
                    data.onDelete?.(id);
                }}
            >×</button>
        </div>
        {entries.map(([key, label, min, max, step]) => <label className="parameter-node-field" key={key}>
            {label}<input type="number" min={min} max={max} step={step} value={data[key] ?? defaults[key] ?? 0} onChange={(event) => update(key, event.target.value)} />
        </label>)}
        {selects[type] && <label className="parameter-node-field">
            {selects[type].label}
            <select className="nodrag" value={data[selects[type].key] ?? defaults[selects[type].key]} onChange={(event) => update(selects[type].key, event.target.value, false)}>
                {selects[type].options.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
        </label>}
        {type !== "output" && type !== "leaf" && <Handle type="source" position={Position.Right} />}
    </div>;
}
