const options = [
    ["seed", "🌱 Seed"], ["trunk", "🌲 Trunk"], ["branch", "🌿 Branch"],
    ["leaf", "🌴 Palm leaf"], ["dryfrond", "🍂 Dry frond"], ["coconut", "🥥 Coconut"], ["subdivide", "⚛️ Subdivide"], ["randomize", "🎲 Randomize"],
    ["scale", "📐 Scale"], ["rotate", "🔄 Rotate"], ["move", "↔️ Move"],
    ["trunkate", "✂️ Taper"], ["collision", "⬡ Collision"], ["wind", "💨 Wind"], ["output", "📤 Output"],
];
export default function NodeContextMenu({ menu, createNode }) {
    if (!menu) return null;
    return <div className="node-context-menu" style={{ left: menu.x, top: menu.y }}>
        {options.map(([type, label]) => <button key={type} onClick={() => createNode(type)}>{label}</button>)}
    </div>;
}
