
import { createContext, useContext, useState } from "react";

const TreeContext = createContext(null);

export function TreeProvider({ children }) {

    const [tree, setTree] = useState({
        trunklength: 150,
        trunkradius: 2
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