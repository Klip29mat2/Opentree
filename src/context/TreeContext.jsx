import { createContext, useContext, useState } from "react";

const TreeContext = createContext(null);
export const DEFAULT_TREE = {
    seed: 1, trunklength: 50, trunkradius: 2, trunkate: 30, subdivisions: 5,
    randomPercentage: 0, randomCoefficient: 1,
    collisionSegments: 8, collisionRadiusScale: 1.08,
    windStrength: 0.4, windSpeed: 0.8, windDirection: 0, windGust: 0.2,
    branches: [],
    coconuts: [],
    leaves: [],
    driedFronds: [],
    rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, move: { x: 0, y: 25, z: 0 },
};

export function TreeProvider({ children }) {
    const [tree, setTree] = useState(DEFAULT_TREE);
    return <TreeContext.Provider value={{ tree, setTree }}>{children}</TreeContext.Provider>;
}
export function useTree() {
    const context = useContext(TreeContext);
    if (!context) throw new Error("useTree doit être utilisé dans TreeProvider");
    return context;
}
