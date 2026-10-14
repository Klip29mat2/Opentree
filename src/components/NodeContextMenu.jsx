const options = [
    ["seed", "🌱 Seed"], ["trunk", "🌲 Trunk"], ["branch", "🌿 Branch"],
    ["leaf", "🍃 Leaf"], ["subdivide", "⚛️ Subdivide"], ["randomize", "🎲 Randomize"],
    ["scale", "📐 Scale"], ["rotate", "🔄 Rotate"], ["move", "↔️ Move"],
    ["trunkate", "✂️ Taper"], ["output", "📤 Output"],
];
export default function NodeContextMenu({ menu, createNode }) {
    if (!menu) return null;
    return <div className="node-context-menu" style={{ left: menu.x, top: menu.y }}>
        {options.map(([type, label]) => <button key={type} onClick={() => createNode(type)}>{label}</button>)}
    </div>;
}
