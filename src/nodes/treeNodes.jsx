import ParameterNode from "./ParameterNode.jsx";

export const nodeTypes = Object.fromEntries(["seed", "trunk", "branch", "coconut", "leaf", "dryfrond", "collision", "rotate", "scale", "subdivide", "randomize", "move", "trunkate", "output"].map((type) => [type, ParameterNode]));
const initial = [
    ["seed", { x: 80, y: 180 }, { seed: 1 }],
    ["trunk", { x: 300, y: 180 }, { trunklength: 50, trunkradius: 2 }],
    ["rotate", { x: 550, y: 100 }, { x: 0, y: 0, z: 0 }],
    ["scale", { x: 550, y: 280 }, { x: 1, y: 1, z: 1 }],
    ["subdivide", { x: 800, y: 180 }, { subdivisions: 5 }],
    ["randomize", { x: 1050, y: 180 }, { randomPercentage: 0, randomCoefficient: 1 }],
    ["move", { x: 1300, y: 180 }, { x: 0, y: 25, z: 0 }],
    ["trunkate", { x: 1550, y: 180 }, { trunkate: 30 }],
    ["collision", { x: 1800, y: 180 }, { collisionSegments: 8, collisionRadiusScale: 1.08 }],
];
export const nodes = initial.map(([type, position, data], index) => ({ id: String(index + 1), type, position, data }));
export const edges = nodes.slice(1).map((node, index) => ({ id: `e${index + 1}-${index + 2}`, source: String(index + 1), target: node.id }));
