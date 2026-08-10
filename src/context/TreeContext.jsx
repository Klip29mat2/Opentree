import { createContext, useContext, useState } from "react";

const TreeContext = createContext(null);

export function TreeProvider({ children }) {

    const [tree, setTree] = useState({
        trunklength: 50,
        trunkradius: 2,

        rotation: {
            x: 0,
            y: 0,
            z: 0
        },

        scale: {
            x: 1,
            y: 1,
            z: 1
        }
    });

    return (
        <TreeContext.Provider value={{ tree, setTree }}>
            {children}
        </TreeContext.Provider>
    );
}

export function useTree() {
    return useContext(TreeContext);
}