const DEFAULT_TREE = {
    seed: 1,
    trunklength: 50,
    trunkradius: 2,
    trunkate: 30,
    subdivisions: 5,
    randomPercentage: 0,
    randomCoefficient: 1,
    collisionSegments: 8,
    collisionRadiusScale: 1.08,
    branches: [],
    coconuts: [],
    leaves: [],
    driedFronds: [],
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    move: { x: 0, y: 25, z: 0 },
};

const number = (value, fallback, min, max = Infinity) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

export default class TreeCompiler {
    compile(nodes = [], edges = []) {
        const byId = new Map(nodes.map((node) => [node.id, node]));
        const incoming = new Map(nodes.map((node) => [node.id, 0]));
        const outgoing = new Map(nodes.map((node) => [node.id, []]));
        edges.forEach(({ source, target }) => {
            if (byId.has(source) && byId.has(target)) {
                incoming.set(target, incoming.get(target) + 1);
                outgoing.get(source).push(target);
            }
        });

        const ready = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id);
        const ordered = [];
        while (ready.length) {
            const id = ready.shift();
            ordered.push(byId.get(id));
            for (const target of outgoing.get(id)) {
                incoming.set(target, incoming.get(target) - 1);
                if (incoming.get(target) === 0) ready.push(target);
            }
        }
        const errors = ordered.length === nodes.length ? [] : ["Le graphe contient une boucle."];
        const reachable = new Set();
        const visit = (id) => {
            if (reachable.has(id)) return;
            reachable.add(id);
            for (const target of outgoing.get(id) ?? []) visit(target);
        };
        nodes.filter((node) => node.type === "seed").forEach((node) => visit(node.id));
        const activeNodes = ordered.filter((node) => reachable.has(node.id));
        if (nodes.length && activeNodes.length === 0) errors.push("Ajoutez un nœud Seed pour démarrer le graphe.");
        const tree = structuredClone(DEFAULT_TREE);
        for (const node of activeNodes) {
            const data = node.data ?? {};
            switch (node.type) {
                case "seed": tree.seed = number(data.seed, tree.seed, 0, 2147483647); break;
                case "trunk":
                    tree.trunklength = number(data.trunklength, tree.trunklength, 0.1, 500);
                    tree.trunkradius = number(data.trunkradius, tree.trunkradius, 0.05, 20);
                    break;
                case "trunkate": tree.trunkate = number(data.trunkate, tree.trunkate, 0, 100); break;
                case "collision":
                    tree.collisionSegments = number(data.collisionSegments, tree.collisionSegments, 1, 24);
                    tree.collisionRadiusScale = number(data.collisionRadiusScale, tree.collisionRadiusScale, 0.75, 1.5);
                    break;
                case "subdivide": tree.subdivisions = number(data.subdivisions, tree.subdivisions, 1, 100); break;
                case "randomize":
                    tree.randomPercentage = number(data.randomPercentage, tree.randomPercentage, 0, 100);
                    tree.randomCoefficient = number(data.randomCoefficient, tree.randomCoefficient, 0, 100);
                    break;
                case "branch":
                    tree.branches.push({
                        count: number(data.branchCount, 6, 1, 40),
                        length: number(data.branchLength, 12, 0.5, 100),
                        radius: number(data.branchRadius, Math.max(0.1, tree.trunkradius * 0.18), 0.03, 10),
                        angle: number(data.branchAngle, 38, -20, 85),
                        startHeight: number(data.branchStartHeight, 0.25, 0, 0.85),
                    });
                    break;
                case "coconut":
                    tree.coconuts.push({
                        count: number(data.coconutCount, 3, 1, 12),
                        size: number(data.coconutSize, 1.2, 0.25, 5),
                        height: number(data.coconutHeight, 0.9, 0.5, 0.99),
                        color: data.coconutColor === "yellow" ? "yellow" : "mature",
                    });
                    break;
                case "leaf":
                    tree.leaves.push({
                        count: number(data.leafCount, 8, 1, 24),
                        length: number(data.leafLength, 18, 2, 60),
                        width: number(data.leafWidth, 0.55, 0.08, 2),
                        droop: number(data.leafDroop, 0.85, 0, 1.8),
                        height: number(data.leafHeight, 0.94, 0.65, 0.99),
                        color: ["green", "lime", "yellow"].includes(data.leafColor) ? data.leafColor : "green",
                    });
                    break;
                case "dryfrond":
                    tree.driedFronds.push({
                        count: number(data.dryFrondCount, 7, 1, 20),
                        length: number(data.dryFrondLength, 6, 2, 16),
                        thickness: number(data.dryFrondThickness, 0.12, 0.03, 0.35),
                        droop: number(data.dryFrondDroop, 1, 0.2, 2.2),
                        color: ["golden", "brown", "mixed"].includes(data.dryFrondColor) ? data.dryFrondColor : "mixed",
                    });
                    break;
                case "rotate":
                    tree.rotation = Object.fromEntries(["x", "y", "z"].map((axis) => [axis, number(data[axis], tree.rotation[axis], -360, 360)]));
                    break;
                case "scale":
                    tree.scale = Object.fromEntries(["x", "y", "z"].map((axis) => [axis, number(data[axis], tree.scale[axis], 0.01, 100)]));
                    break;
                case "move":
                    tree.move = Object.fromEntries(["x", "y", "z"].map((axis) => [axis, number(data[axis], tree.move[axis], -1000, 1000)]));
                    break;
            }
        }
        return { tree, errors };
    }
}
