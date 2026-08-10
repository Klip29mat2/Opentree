import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { TreeProvider } from "./context/TreeContext.jsx";

createRoot(document.getElementById("root")).render(

    <React.StrictMode>

        <TreeProvider>

            <App />

        </TreeProvider>

    </React.StrictMode>

);